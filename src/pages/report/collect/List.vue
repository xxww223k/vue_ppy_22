<template>
    <div>
        <!-- <a-card> -->
        <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
            @refresh="onRefresh" @search="onSearch" :title="title" :pagination="pagination" @change="onPageChange"
            :scroll="{ x: true }">
            <!-- 总金额 -->
            <template slot="format_total_amount" slot-scope="row">
                <a-tag color="#108ee9">{{ row.record.format_total_amount }}</a-tag>
            </template>
            <!-- 成功金额 -->
            <template slot="format_success_amount" slot-scope="row">
                <a-tag color="green">{{ row.record.format_success_amount }}</a-tag>
            </template>
            <!-- 用户 -->
            <template slot="user" slot-scope="row">
                <a-tag color="#f50" v-if="row.record.user_id == 0">平台</a-tag>
                <a-tag color="#2db7f5" v-else-if="row.record.user">{{ row.record.user.full_name }}</a-tag>
            </template>
            <!-- 笔数 -->
            <template slot="count" slot-scope="row">
                <a-tag color="blue">{{ row.record.number }}</a-tag>
            </template>
            <!-- 成功率 -->
            <template slot="probability_of_success" slot-scope="row">
                <a-tag color="green">{{ row.record.probability_of_success }}</a-tag>
            </template>
            <!-- 手续费 -->
            <template slot="format_handling_fee" slot-scope="row">
                <a-tag v-if="row.record.handling_fee > 0" color="green">{{ row.record.format_handling_fee }}</a-tag>
                <a-tag v-else-if="row.record.handling_fee < 0" color="red">{{ row.record.format_handling_fee }}</a-tag>
                <a-tag v-else>{{ row.record.format_handling_fee }}</a-tag>
            </template>
        </advance-table>
        <!-- </a-card> -->
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { COLLECT_REPORT as URL, USER } from "@/services/api";

    const userSelectOptions = [];

    const columns = [
        {
            dataIndex: "date",
            key: "date",
            title: "日期",
        },
        {
            dataIndex: "user",
            key: "user",
            title: "用户",
            scopedSlots: { customRender: "user" },
            hideConfig: true,
            searchAble: true,
            dataType: "select",
            search: {
                selectOptions: userSelectOptions
            },
        },
        {
            dataIndex: "format_total_amount",
            key: "format_total_amount",
            title: "总金额",
            scopedSlots: { customRender: "format_total_amount" },
        },
        {
            dataIndex: "format_success_amount",
            key: "format_success_amount",
            title: "成功金额",
            scopedSlots: { customRender: "format_success_amount" },
        },
        {
            dataIndex: "number",
            key: "number",
            title: "笔数",
            scopedSlots: { customRender: "count" },
        },
        {
            dataIndex: "probability_of_success",
            key: "probability_of_success",
            title: "成功率",
            scopedSlots: { customRender: "probability_of_success" },
        },
        {
            dataIndex: "format_handling_fee",
            key: "format_handling_fee",
            title: "手续费",
            scopedSlots: { customRender: "format_handling_fee" },
        },
    ]
    export default {
        data() {
            return {
                dataSource: [],
                columns,
                loading: false,
                conditions: {},
                title: " ",
                selectedRowKeys: [], // 选中的行
                pagination: {
                    total: 0, // 总条数
                    current: 1, // 当前页码
                    pageSize: 10, // 每页默认条数
                    showSizeChanger: true, // 允许选择每页条数
                    pageSizeOptions: ["10", "20", "50", "100"], // 可选的每页条数
                },
            }
        },
        methods: {
            // 删
            del(row) {
                request(`${URL}/${row.record.id}`, METHOD.DELETE).then(res => {
                    const { message, code } = res.data
                    code >= 0 ? this.$message.success(message) : this.$message.error(message)
                    this.get()
                }).catch(() => {
                    this.$message.error('系统出错了~')
                })
            },
            // 查
            get() {
                this.loading = true
                const query = {
                    search: this.conditions,
                    limit: this.pagination.pageSize,
                    page: this.pagination.current,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.dataSource.splice(0, this.dataSource.length)
                    this.dataSource.push(...list.data)
                    this.pagination.total = list.total
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            // 刷新
            onRefresh() {
                this.get()
            },
            // 过滤
            onSearch(conditions) {
                this.conditions = conditions
                this.get();
            },
            // 分页事件
            onPageChange(pagination) {
                this.pagination.pageSize = pagination.pageSize
                this.pagination.current = pagination.current
                this.get()
            },
            // 选中行触发的事件
            onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys;
            },
            getUsers() {
                const query = {
                    limit: 9999,
                }
                request(USER, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    userSelectOptions.splice(0, userSelectOptions.length)
                    list.data.forEach((user) => {
                        userSelectOptions.push({
                            value: user.id,
                            title: user.full_name
                        })
                    })
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            setSearchAble() {
                if (this.user_role == 'administrator') {
                    for (const item of this.columns) {
                        if (item.key == 'user') {
                            item.searchAble = true;
                        }
                    }
                } else if (this.user_role == 'client') {
                    for (const item of this.columns) {
                        if (item.key == 'user') {
                            item.searchAble = false;
                        }
                    }
                } else if (this.user_role == 'collect') {
                    for (const item of this.columns) {
                        if (item.key == 'user') {
                            item.searchAble = false;
                        }
                    }
                }
            }
        },
        computed: {
            // 行选择器配置
            rowSelection() {
                return {
                    selectedRowKeys: this.selectedRowKeys,
                    onChange: this.onSelectChange,
                    fixed: true,
                    hideDefaultSelections: true,
                    selections: [
                        {
                            key: "delete",
                            text: "删除",
                            onSelect: () => {
                                if (!this.selectedRowKeys.length) {
                                    this.$message.error('未选中任何记录')
                                    return false
                                }
                                request(`${URL}/${this.selectedRowKeys[0]}`, METHOD.DELETE, { data: { batch_delete: this.selectedRowKeys } }).then(res => {
                                    const { message, code } = res.data
                                    code >= 0 ? this.$message.success(message) : this.$message.error(message)
                                    this.get()
                                    this.selectedRowKeys.splice(0, this.selectedRowKeys.length)
                                }).catch(() => {
                                    this.$message.error('系统出错了~')
                                })
                            },
                        },
                    ],
                };
            },
        },
        created() {
            this.user_role = sessionStorage.getItem('user_role');
            this.setSearchAble();
            this.get()
            this.getUsers();
        }
    }
</script>

<style lang="less" scoped>
</style>