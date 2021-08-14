<template>
    <div>
        <!-- :row-selection="rowSelection" -->
        <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
            @refresh="onRefresh" @search="onSearch" :title="title" :pagination="pagination" @change="onPageChange"
            :scroll="{ x: true }">
            <!-- 用户 -->
            <template slot="user" slot-scope="row">
                <a-popover v-if="row.record.user">
                    <template slot="content">
                        <a target="_blank" :href="row.record.user.telegram">Telegram</a>
                    </template>
                    <a-tag color="blue" style="cursor: pointer">{{ row.record.user.full_name }}</a-tag>
                </a-popover>
            </template>
            <!-- 账变 -->
            <template slot="amount" slot-scope="row">
                <a-tag>{{ row.record.format_amount }}</a-tag>
            </template>
            <!-- 操作列 -->
            <template slot="operation" slot-scope="row">
                <a-button-group size="small">
                    <!-- <router-link :to="`/form${$route.path}/${row.record.id}`"> -->
                    <!-- </router-link> -->
                    <a-popconfirm title="确认要删除这条数据吗？" ok-text="确认" cancel-text="取消" @confirm="del(row)">
                        <a-button type="link" size="small">删除</a-button>
                    </a-popconfirm>
                </a-button-group>
            </template>
        </advance-table>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { CREDIT as URL, USER } from "@/services/api";

    const userSelectOptions = [];

    const columns = [
        {
            dataIndex: "user",
            key: "user",
            title: "用户",
            hideConfig: true,
            scopedSlots: { customRender: "user" },
            searchAble: true,
            dataType: "select",
            search: {
                selectOptions: userSelectOptions
            },
        },
        {
            dataIndex: "amount",
            key: "amount",
            title: "信用",
            scopedSlots: { customRender: "amount" },
        },
        {
            dataIndex: "created_at",
            key: "created_at",
            title: "新建于",
        }
    ]
    export default {
        data() {
            return {
                user_role: null,
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
                }).catch((e) => {
                    console.log(e)
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
            statusChange(record) {
                request(`${URL}/${record.id}`, METHOD.PUT, { status: record.bool_status }).then((res) => {
                    if (res.data.code < 0) {
                        this.$message.error(res.data.message)
                    }
                    if (res.data.code >= 0) {
                        this.$message.success(res.data.message)
                    }
                    this.get();
                }).catch(() => {
                    this.$message.error('系统出错了~')
                })
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