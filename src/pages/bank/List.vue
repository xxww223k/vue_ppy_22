<template>
    <div>
        <a-card>
            <div slot="extra">
                <!-- <router-link :to="`/form${this.$route.path}`"> -->
                <a-button type="primary" @click="openBankDialog()">新建</a-button>
                <!-- </router-link> -->
            </div>
            <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
                @refresh="onRefresh" @search="onSearch" :title="title" :row-selection="rowSelection"
                :pagination="pagination" @change="onPageChange" :scroll="{ x: true }">
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
                        <!-- <router-link :to="`/form${$route.path}/${row.record.id}`"> -->
                        <a-button type="link" size="small" @click="openBankDialog(row)">编辑</a-button>
                        <!-- </router-link> -->
                        <a-popconfirm title="确认要删除这条数据吗？" ok-text="确认" cancel-text="取消" @confirm="del(row)">
                            <a-button type="link" size="small">删除</a-button>
                        </a-popconfirm>
                    </a-button-group>
                </template>
            </advance-table>
        </a-card>
        <bank-dialog ref="bankDialog" @close="get"></bank-dialog>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { BANK as URL } from "@/services/api";
    import BankDialog from './BankDialog.vue'

    const columns = [
        {
            dataIndex: "name",
            key: "name",
            title: "银行",
            searchAble: true,
        },
        {
            dataIndex: "number",
            key: "number",
            title: "号码",
            searchAble: true,
        },
        {
            dataIndex: "status",
            key: "status",
            title: "启用",
            searchAble: true,
            dataType: "boolean",
            scopedSlots: { customRender: "status" },
        },
        {
            title: "",
            dataIndex: "operation",
            scopedSlots: { customRender: "operation" },
            align: "right"
        },
    ]
    export default {
        components: {
            BankDialog
        },
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
            openBankDialog(item) {
                this.$refs.bankDialog.showModal(item);
            },
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