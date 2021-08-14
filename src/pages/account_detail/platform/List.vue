<template>
    <div>
        <!-- :row-selection="rowSelection" -->
        <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
            @refresh="onRefresh" @search="onSearch" :title="title" :pagination="pagination" @change="onPageChange"
            :scroll="{ x: true }">
            <!-- 账变 -->
            <template slot="format_amount" slot-scope="row">
                <a-tag v-if="row.record.amount > 0" color="green">{{ row.record.format_amount }}</a-tag>
                <a-tag v-else color="red">{{ row.record.format_amount }}</a-tag>
            </template>
            <!-- 类别 -->
            <template slot="type" slot-scope="row">
                <template v-if="row.text == '1'">
                    <a-tag>订单手续费</a-tag>
                    <a-tag v-if="row.record.order">{{ row.record.order.trade_no }}</a-tag>
                </template>
                <template v-if="row.text == '2'">
                    <a-tag>上分</a-tag>
                    <a-tag v-if="row.record.transaction">{{ row.record.transaction.trade_no }}</a-tag>
                </template>
                <template v-if="row.text == '6'">
                    <a-tag>结余</a-tag>
                </template>
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
    import { PLATFORM_ACCOUNT_DETAIL as URL } from "@/services/api";

    const columns = [
        {
            dataIndex: "format_amount",
            key: "format_amount",
            title: "账变",
            scopedSlots: { customRender: "format_amount" },
        },
        {
            dataIndex: "type",
            key: "type",
            title: "帐类",
            searchAble: true,
            dataType: "select",
            search: {
                selectOptions: [
                    { value: '1', title: '订单手续费' },
                    { value: '2', title: '上分' },
                    { value: '6', title: '结余' },
                ]
            },
            scopedSlots: { customRender: "type" },
        },
        {
            dataIndex: "created_at",
            key: "created_at",
            title: "新建于",
        },
        // {
        //     title: "",
        //     dataIndex: "operation",
        //     scopedSlots: { customRender: "operation" },
        //     align: "right"
        // },
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