<template>
    <div>
        <a-card>
            <div slot="extra">
                <router-link :to="`/form${this.$route.path}`">
                    <a-button type="primary">新建</a-button>
                </router-link>
            </div>
            <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
                @refresh="onRefresh" @search="onSearch" :title="title" :row-selection="rowSelection"
                :pagination="pagination" @change="onPageChange" :scroll="{ x: true }">
                <!-- 信息 -->
                <template slot="info" slot-scope="row">
                    <a-popover v-if="row.record.user&&user_role != 'collect'">
                        <template slot="content">
                            <a target="_blank" :href="row.record.user.telegram">Telegram</a>
                        </template>
                        <a-tag color="blue" style="cursor: pointer">{{ row.record.user.full_name }}</a-tag>
                    </a-popover>
                    <a-tag color="#2db7f5">{{ row.record.bank.name }}</a-tag>
                    <a-tag color="blue">{{ row.record.name }}</a-tag>
                    <a-tag color="pink">{{ row.record.number }}</a-tag>
                </template>
                <!-- 订单 -->
                <template slot="payment_amount" slot-scope="row">
                    <a-tag color="#87d068">{{ row.record.format_minimum_payment }}</a-tag>
                    <a-tag color="#2db7f5">{{ row.record.format_maximum_payment }}</a-tag>
                </template>
                <!-- 存款 -->
                <template slot="format_balance" slot-scope="row">
                    <a-tag color="#f50">{{ row.record.format_balance }}</a-tag>
                </template>
                <!-- 笔数 -->
                <template slot="maximum_number_of_receipts_per_day" slot-scope="row">
                    <a-tag color="purple">{{ row.record.orders_count }} / {{
                        row.record.maximum_number_of_receipts_per_day }}</a-tag>
                </template>
                <!-- 转出 -->
                <template slot="format_maximum_daily_payment" slot-scope="row">
                    <a-tag color="green">{{ row.record.today_amount }}</a-tag>
                    <a-tag color="red">{{ row.record.format_maximum_daily_payment }}</a-tag>
                </template>
                <!-- 状态列 -->
                <template slot="status" slot-scope="row">
                    <a-switch v-model="row.record.bool_receivable" default-checked @change="statusChange(row.record)">
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
        </a-card>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { BANK_ACCOUNT as URL, USER } from "@/services/api";

    const userSelectOptions = []

    const columns = [
        {
            dataIndex: "name",
            key: "name",
            title: "户名",
            searchAble: true,
            hideConfig: true,
            visible: false,
        },
        {
            dataIndex: "user_id",
            key: "user_id",
            title: "用户",
            searchAble: true,
            hideConfig: true,
            visible: false,
            dataType: "select",
            search: {
                selectOptions: userSelectOptions
            },
        },
        {
            dataIndex: "info",
            key: "info",
            title: "信息",
            scopedSlots: { customRender: "info" },
        },
        {
            dataIndex: "payment_amount",
            key: "payment_amount",
            title: "订单",
            hideConfig: true,
            scopedSlots: { customRender: "payment_amount" },
        },
        {
            dataIndex: "maximum_number_of_receipts_per_day",
            key: "maximum_number_of_receipts_per_day",
            title: "笔数",
            hideConfig: true,
            scopedSlots: { customRender: "maximum_number_of_receipts_per_day" },
        },
        {
            dataIndex: "format_balance",
            key: "format_balance",
            title: "存款",
            scopedSlots: { customRender: "format_balance" },
        },
        {
            dataIndex: "format_maximum_daily_payment",
            key: "format_maximum_daily_payment",
            title: "日限额",
            scopedSlots: { customRender: "format_maximum_daily_payment" },
        },
        {
            dataIndex: "watch.username",
            key: "watch.username",
            title: "监控",
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
            // 查用户
            getUsers() {
                const query = {
                    search: { role: 'collect' },
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
            statusChange(record) {
                request(`${URL}/${record.id}`, METHOD.PUT, { receivable: record.bool_receivable }).then((res) => {
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
            this.user_role = sessionStorage.getItem('user_role')
            // 代收不显示 用户 查询 和 列 
            //           笔数 订单 列
            if (this.user_role == 'collect') {
                for (const item of this.columns) {
                    // maximum_number_of_receipts_per_day
                    if (item.key == 'maximum_number_of_receipts_per_day') {
                        item.visible = false;
                    }
                    // payment_amount
                    if (item.key == 'payment_amount') {
                        item.visible = false;
                    }
                    if (item.key == 'user_id') {
                        item.searchAble = false;
                    }
                }
            } else {
                for (const item of this.columns) {
                    // maximum_number_of_receipts_per_day
                    if (item.key == 'maximum_number_of_receipts_per_day') {
                        item.visible = true;
                    }
                    // payment_amount
                    if (item.key == 'payment_amount') {
                        item.visible = true;
                    }
                    if (item.key == 'user_id') {
                        item.searchAble = true;
                    }
                }
            }
            this.getUsers()
            this.get()
        }
    }
</script>

<style lang="less" scoped>
</style>