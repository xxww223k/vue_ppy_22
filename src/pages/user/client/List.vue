<template>
    <div>
        <advance-table row-key="id" :defaultExpandAllRows="true" :data-source="dataSource" :columns="columns"
            size="middle" :loading="loading" @refresh="onRefresh" @search="onSearch" :title="title"
            :row-selection="rowSelection" :pagination="pagination" @change="onPageChange" :scroll="{ x: true }">
            <!-- 名称 -->
            <template slot="name" slot-scope="row">
                <a-tag color="#108ee9" v-if="row.record.parent">{{ row.record.parent.full_name }}</a-tag>
                <a-tag color="blue">{{ row.record.full_name }}</a-tag>
            </template>
            <!-- 登录名 -->
            <template slot="username" slot-scope="row">
                <a-tag color="green">{{ row.record.username }}</a-tag>
            </template>
            <!-- 钱包 -->
            <template slot="balance" slot-scope="row">
                <a-tag color="#f50">{{ row.record.balance }}</a-tag>
            </template>
            <!-- 费率 -->
            <template slot="rate" slot-scope="row">
                <div v-for="payTypeUser in row.record.pay_type_users" :key="payTypeUser.id">
                    <a-tag color="blue">{{ payTypeUser.pay_type.name }}</a-tag>
                    <a-tag color="green">{{ payTypeUser.rate }}</a-tag>
                </div>
            </template>
            <!-- 商户号 -->
            <template slot="appid" slot-scope="row">
                <a-tag color="purple">{{ row.record.appid }}</a-tag>
            </template>
            <!-- 状态列 -->
            <template slot="status" slot-scope="row">
                <a-switch v-model="row.record.bool_status" default-checked @change="statusChange(row.record)">
                    <a-icon slot="checkedChildren" type="check" />
                    <a-icon slot="unCheckedChildren" type="close" />
                </a-switch>
            </template>
            <!-- 操作列 -->
            <template slot="operation" slot-scope="row">
                <a-button-group size="small">
                    <router-link :to="`/form${$route.path}/${row.record.id}`">
                        <a-button type="link" size="small">编辑</a-button>
                    </router-link>
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
    import { USER as URL } from "@/services/api";

    const columns = [
        {
            dataIndex: "appid",
            key: "appid",
            title: "商户号",
            scopedSlots: { customRender: "appid" },
        },
        {
            dataIndex: "name",
            key: "name",
            title: "名称",
            scopedSlots: { customRender: "name" },
        },
        {
            dataIndex: "username",
            key: "username",
            title: "登录名",
            searchAble: true,
            scopedSlots: { customRender: "username" },
        },
        {
            dataIndex: "balance",
            key: "balance",
            title: "钱包",
            scopedSlots: { customRender: "balance" },
        },
        {
            dataIndex: "rate",
            key: "rate",
            title: "费率",
            scopedSlots: { customRender: "rate" },
        },
        {
            dataIndex: "status",
            key: "status",
            title: "启用",
            dataType: "boolean",
            scopedSlots: { customRender: "status" },
        },
        {
            dataIndex: "created_at",
            key: "created_at",
            title: "新建于",
        },
        {
            title: "",
            dataIndex: "operation",
            scopedSlots: { customRender: "operation" },
            align: "right"
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
                    search: { ...this.conditions, role: 'client' },
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
            this.get()
        }
    }
</script>

<style lang="less" scoped>
</style>