<template>
    <div>
        <a-card>
            <div slot="extra">
                <!-- <router-link :to="`/form${this.$route.path}`">
                    <a-button type="primary">新建</a-button>
                </router-link> -->
                <a-button type="primary" @click="openFormDialog()">新建</a-button>
            </div>
            <!-- :row-selection="rowSelection" -->
            <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
                @refresh="onRefresh" @search="onSearch" :title="title" :pagination="pagination" @change="onPageChange"
                :scroll="{ x: true }">
                <!-- 付款方 -->
                <template slot="payer" slot-scope="row">
                    <a-tag v-if="row.record.payer_user" color="#f50">{{ row.record.payer_user.full_name }}</a-tag>
                    <a-tag v-if="row.record.payer_bank" color="#2db7f5">{{ row.record.payer_bank.name }}</a-tag>
                    <a-tag v-if="row.record.payer_account_name" color="blue">{{ row.record.payer_account_name }}</a-tag>
                    <a-tag v-if="row.record.payer_account_number" color="pink">{{ row.record.payer_account_number }}
                    </a-tag>
                </template>
                <!-- 收款方 -->
                <template slot="payee" slot-scope="row">
                    <a-tag v-if="row.record.payee_user" color="#f50">{{ row.record.payee_user.full_name }}</a-tag>
                    <a-tag v-if="row.record.payee_bank" color="#2db7f5">{{ row.record.payee_bank.name }}</a-tag>
                    <a-tag v-if="row.record.payee_account_name" color="blue">{{ row.record.payee_account_name }}</a-tag>
                    <a-tag v-if="row.record.payee_account_number" color="pink">{{ row.record.payee_account_number }}
                    </a-tag>
                </template>
                <!-- 类别 -->
                <template slot="type" slot-scope="row">
                    <a-tag v-if="row.text == 2">上分</a-tag>
                    <a-tag v-if="row.text == 3">转账</a-tag>
                </template>
                <!-- 交易金额 -->
                <template slot="format_amount" slot-scope="row">
                    <!-- <a-tag v-if="row.text == 2">上分</a-tag>
                    <a-tag v-if="row.text == 3">转账</a-tag> -->
                    <a-tag color="blue">{{ row.record.format_amount }}</a-tag>
                    <a-tag v-if="row.record.remark">{{ row.record.remark }}</a-tag>
                </template>
                <!-- 状态 -->
                <template slot="status" slot-scope="row">
                    <a-tag v-if="row.text == 1" color="blue">交易中</a-tag>
                    <a-tag v-else-if="row.text == 2" color="green">交易成功</a-tag>
                    <a-tag v-else-if="row.text == 3" color="red">取消</a-tag>
                </template>
                <!-- 操作列 -->
                <template slot="operation" slot-scope="row">
                    <a-button-group size="small">
                        <a-popconfirm title="确认要完成这次交易吗？" :disabled="row.record.status==2||row.record.status==3"
                            ok-text="确认" cancel-text="取消" @confirm="confirm(row)">
                            <a-button type="link" size="small" :disabled="row.record.status==2||row.record.status==3">确认
                            </a-button>
                        </a-popconfirm>
                        <a-popconfirm title="确认要取消这次交易吗？" :disabled="row.record.status==2||row.record.status==3"
                            ok-text="确认" cancel-text="取消" @confirm="del(row)">
                            <a-button type="link" size="small" :disabled="row.record.status==2||row.record.status==3">取消
                            </a-button>
                        </a-popconfirm>
                    </a-button-group>
                </template>
            </advance-table>
        </a-card>
        <form-dialog ref="formDialog" @close="get()"></form-dialog>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { TRANSACTION as URL } from "@/services/api";
    import FormDialog from './FormDialog.vue'

    const columns = [
        {
            dataIndex: "trade_no",
            key: "trade_no",
            title: "交易编号",
        },
        {
            dataIndex: "payer",
            key: "payer",
            title: "付款方",
            scopedSlots: { customRender: "payer" },
        },
        {
            dataIndex: "payee",
            key: "payee",
            title: "收款方",
            scopedSlots: { customRender: "payee" },
        },
        {
            dataIndex: "type",
            key: "type",
            title: "类别",
            scopedSlots: { customRender: "type" },
        },
        {
            dataIndex: "format_amount",
            key: "format_amount",
            title: "交易金额",
            scopedSlots: { customRender: "format_amount" },
        },
        {
            dataIndex: "status",
            key: "status",
            title: "状态",
            scopedSlots: { customRender: "status" },
        },
        // {
        //     dataIndex: "remark",
        //     key: "remark",
        //     title: "备注",
        //     searchAble: true,
        //     dataType: "string"
        // },
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
        components: { FormDialog },
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
            openFormDialog() {
                this.$refs.formDialog.showModal();
            },
            // 完成交易
            confirm(row) {
                const fields = {
                    status: 2,
                }
                request(`${URL}/${row.record.id}`, METHOD.PUT, fields).then(res => {
                    const { message, code } = res.data
                    code >= 0 ? this.$message.success(message) : this.$message.error(message)
                    this.get()
                }).catch(() => {
                    this.$message.error('系统出错了~')
                })
            },
            // 删
            del(row) {
                // const fields = {
                //     status: 3,
                // }
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