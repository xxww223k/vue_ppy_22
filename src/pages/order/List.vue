<template>
    <div>
        <a-card>
            <a-row>
                <a-col :xs="20" :md="4">
                    <a-statistic title="总金额" :value="turnover.total_amount" />
                </a-col>
                <a-col :xs="20" :md="4">
                    <a-statistic title="付款金额" :value="turnover.success_amount" />
                </a-col>
                <a-col :xs="20" :md="4">
                    <a-statistic title="付款中" :value="turnover.paying" />
                </a-col>
                <a-col :xs="20" :md="4">
                    <a-statistic title="笔数" :value="turnover.count" />
                </a-col>
                <a-col :xs="20" :md="4">
                    <a-statistic title="成功率" :value="turnover.probability_of_success" />
                </a-col>
            </a-row>
        </a-card>

        <!-- <credit-card style="margin-top: 10px;" /> -->

        <a-card style="margin-top: 10px;">
            <div slot="extra" v-if="user_role == 'administrator'">
                <a-button-group>
                    <a-button type="primary" @click="openNullOrderDialog()">空单</a-button>
                    <a-button type="primary" @click="assign">分配</a-button>
                </a-button-group>
            </div>
            <!-- :row-selection="rowSelection" -->
            <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
                @refresh="onRefresh" @search="onSearch" :title="title" :pagination="pagination" @change="onPageChange"
                :scroll="{ x: true }">
                <!-- 信息 -->
                <template slot="info" slot-scope="row">
                    <a-tag color="green">{{ row.record.pay_type.name }}</a-tag>
                    <template v-if="row.record.client">
                        <a-popover v-if="user_role == 'administrator'">
                            <template slot="content">
                                <a target="_blank" :href="row.record.client.telegram">Telegram</a>
                            </template>
                            <a-tag color="blue" style="cursor: pointer">{{ row.record.client.full_name }}</a-tag>
                        </a-popover>
                    </template>
                    <template v-if="row.record.supplier">
                        <a-popover v-if="user_role == 'administrator'">
                            <template slot="content">
                                <a target="_blank" :href="row.record.supplier.telegram">Telegram</a>
                            </template>
                            <a-tag color="blue" style="cursor: pointer">{{ row.record.supplier.full_name }}</a-tag>
                        </a-popover>
                        <template v-if="row.record.bank_account">
                            <a-tag color="#2db7f5">{{ row.record.bank_account.bank.name }}</a-tag>
                            <a-tag color="blue">{{ row.record.bank_account.name }}</a-tag>
                            <a-tag color="pink">{{ row.record.bank_account.number }}</a-tag>
                        </template>
                    </template>
                </template>
                <!-- 付款信息 -->
                <template slot="payment_info" slot-scope="row">
                    <a-tag color="green" v-show="row.record.format_payment_amount">{{ row.record.format_payment_amount}}
                    </a-tag>
                    <a-tag color="#2db7f5">{{ row.record.format_amount }}</a-tag>
                </template>
                <!-- 状态 -->
                <template slot="status" slot-scope="row">
                    <a-tag color="blue" v-if="row.text == '1'">新订单</a-tag>
                    <a-tag color="green" v-if="row.text == '2'">已支付</a-tag>
                    <a-tag v-if="row.text == '3'">已超时</a-tag>
                    <a-tag color="green" v-if="row.text == '4'">已通知</a-tag>
                    <a-tag color="red" v-if="row.text == '5'">拉单失败</a-tag>
                    <a-tag color="red" v-if="row.text == '5'&& row.record.failed_reason">{{ row.record.failed_reason }}
                    </a-tag>
                </template>
                <template slot="operation" slot-scope="row">
                    <a-button-group size="small">
                        <a-button type="link" size="small" @click="payment(row)"
                            :disabled="row.record.status == 4 || row.record.status == 2 || row.record.status == 5">确认
                        </a-button>
                    </a-button-group>
                    <a-button-group size="small">
                        <a-popconfirm title="确认要发送通知吗？"
                            :disabled="!row.record.notice_url || row.record.status == 5 || row.record.status == 1 || row.record.status == 3 ||row.record.last_notice_result == 'OK'"
                            ok-text="确认" cancel-text="取消" @confirm="notice(row)">
                            <a-button type="link" size="small"
                                :disabled="!row.record.notice_url || row.record.status == 5 || row.record.status == 1 || row.record.status == 3 ||row.record.last_notice_result == 'OK'">
                                通知
                            </a-button>
                        </a-popconfirm>
                    </a-button-group>
                </template>
            </advance-table>
        </a-card>

        <null-order-dialog ref="nullOrderDialog" @close="onRefresh()"></null-order-dialog>
        <payment-dialog ref="paymentDialog" @close="onRefresh()"></payment-dialog>
        <a-drawer width="700" title="分配" placement="right" :closable="false" @close="onClose" :visible="visible">
            <assign />
        </a-drawer>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { TURNOVER, ORDER as URL, PAY_TYPE, USER, BANK_ACCOUNT } from "@/services/api";
    import NullOrderDialog from './NullOrderDialog.vue'
    import PaymentDialog from './PaymentDialog.vue'
    import Assign from '@/pages/assign/Assign.vue'
    // import CreditCard from '@/pages/order/CreditCard.vue'

    const payTypeOptions = []; // 通道查询
    const collectUserSelectOptions = []; // 供应商
    const clientUserSelectOptions = []; // 商户
    const bankSelectOptions = []; // 卡

    const columns = [
        {
            dataIndex: "trade_no",
            key: "trade_no",
            title: "平台单号",
            searchAble: true,
            hideConfig: true,
            dataType: "string"
        },
        {
            dataIndex: "out_trade_no",
            key: "out_trade_no",
            title: "商户单号",
            searchAble: true,
            hideConfig: true,
            dataType: "string"
        },
        // -------- 查 ---------
        {
            dataIndex: "pay_type_id",
            key: "pay_type_id",
            title: "通道",
            searchAble: true,
            hideConfig: true,
            visible: false,
            dataType: "select",
            search: {
                selectOptions: payTypeOptions
            },
        },
        {
            dataIndex: "client_id",
            key: "client_id",
            title: "商户",
            searchAble: true,
            hideConfig: true,
            visible: false,
            dataType: "select",
            search: {
                selectOptions: clientUserSelectOptions
            },
        },
        {
            dataIndex: "collect_id",
            key: "collect_id",
            title: "供应商",
            searchAble: true,
            hideConfig: true,
            visible: false,
            dataType: "select",
            search: {
                selectOptions: collectUserSelectOptions
            },
        },
        {
            dataIndex: "account_id",
            key: "account_id",
            title: "银行卡",
            searchAble: true,
            hideConfig: true,
            visible: false,
            dataType: "select",
            search: {
                selectOptions: bankSelectOptions
            },
        },
        // -------- 查 ---------
        {
            dataIndex: "info",
            key: "info",
            title: "信息",
            scopedSlots: { customRender: "info" },
        },
        {
            dataIndex: "payment_info",
            key: "payment_info",
            title: "付款",
            scopedSlots: { customRender: "payment_info" },
        },
        {
            dataIndex: "status",
            key: "status",
            title: "状态",
            scopedSlots: { customRender: "status" },
            searchAble: true,
            dataType: "select",
            search: {
                selectOptions: [
                    { value: 1, label: '新订单' },
                    { value: 2, label: '已支付' },
                    { value: 3, label: '已超时' },
                    { value: 4, label: '已通知' },
                    { value: 5, label: '拉单失败' },
                ]
            },
        },
        {
            dataIndex: "created_at",
            key: "created_at",
            title: "下单时间",
            searchAble: true,
            dataType: "datetimeRange"
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
            NullOrderDialog, PaymentDialog, Assign
        },
        data() {
            return {
                user_role: sessionStorage.getItem('user_role'),
                visible: false,
                interval: null,
                first_id: null,
                turnover: {},
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
            // 卡
            getAccount() {
                const query = {
                    limit: 9999,
                }
                request(BANK_ACCOUNT, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    bankSelectOptions.splice(0, bankSelectOptions.length)
                    list.data.forEach((bank) => {
                        bankSelectOptions.push({
                            value: bank.id,
                            title: bank.number
                        })
                    })
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            // 商户client
            getClientUsers() {
                const query = {
                    search: { role: 'client' },
                    limit: 9999,
                }
                request(USER, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    clientUserSelectOptions.splice(0, clientUserSelectOptions.length)
                    list.data.forEach((user) => {
                        clientUserSelectOptions.push({
                            value: user.id,
                            title: user.full_name
                        })
                    })
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            // 供应商
            getCollectUsers() {
                const query = {
                    search: { role: 'collect' },
                    limit: 9999,
                }
                request(USER, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    collectUserSelectOptions.splice(0, collectUserSelectOptions.length)
                    list.data.forEach((user) => {
                        collectUserSelectOptions.push({
                            value: user.id,
                            title: user.full_name
                        })
                    })
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            // 通道
            getPayType() {
                const query = {
                    search: { role: 'collect' },
                    limit: 9999,
                }
                request(PAY_TYPE, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    payTypeOptions.splice(0, payTypeOptions.length)
                    list.data.forEach((user) => {
                        payTypeOptions.push({
                            value: user.id,
                            title: user.name
                        })
                    })
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            notice(item) {
                request(URL + '/' + item.record.id, METHOD.PUT, { status: 4 }).then(this.afterSubmit).catch(() => {
                    this.$message.error({
                        duration: 10,
                        content: '系统出错了~'
                    })
                }).finally(() => {
                    this.confirmLoading = false
                })
            },
            afterSubmit(res) {
                if (res.status === 422) {
                    this.requestErrorHandle(res.data.errors)
                }
                if (res.data.code < 0) {
                    this.$message.error({
                        duration: 10,
                        content: res.data.message
                    })
                }
                if (res.data.code >= 0) {
                    this.$message.success({
                        duration: 10,
                        content: res.data.message
                    })
                    this.onRefresh();
                    this.getTurnover();
                }
            },
            payment(item) {
                this.$refs.paymentDialog.showModal(item)
            },
            openNullOrderDialog() {
                this.$refs.nullOrderDialog.showModal();
            },
            // 删
            del(row) {
                request(`${URL}/${row.record.id}`, METHOD.DELETE).then(res => {
                    const { message, code } = res.data
                    code >= 0 ? this.$message.success(message) : this.$message.error(message)
                    this.onRefresh()
                }).catch(() => {
                    this.$message.error('系统出错了~')
                })
            },
            // 查
            get(isloading) {
                if (!isloading) this.loading = true
                const query = {
                    search: this.conditions,
                    limit: this.pagination.pageSize,
                    page: this.pagination.current,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    if (list.data.length > 0) {
                        if (this.first_id != list.data[0].id) {
                            this.dataSource.splice(0, this.dataSource.length)
                            this.first_id = list.data[0].id;
                            this.dataSource.push(...list.data)
                            this.pagination.total = list.total
                        }
                    }
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            // 刷新
            onRefresh() {
                this.getTurnover();
                this.loading = true
                const query = {
                    search: this.conditions,
                    limit: this.pagination.pageSize,
                    page: this.pagination.current,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.dataSource.splice(0, this.dataSource.length)
                    // if (this.first_id != list.data[0].id) {
                    // this.first_id = list.data[0].id;
                    this.dataSource.push(...list.data)
                    this.pagination.total = list.total
                    // }
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            // 过滤
            onSearch(conditions) {
                this.conditions = conditions
                this.onRefresh();
            },
            // 分页事件
            onPageChange(pagination) {
                this.pagination.pageSize = pagination.pageSize
                this.pagination.current = pagination.current
                this.onRefresh();
            },
            // 选中行触发的事件
            onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys;
            },
            // 营业额
            getTurnover() {
                request(TURNOVER, METHOD.GET).then((res) => {
                    const { data } = res.data
                    this.turnover = data
                }).catch((e) => {
                    console.log(e.getMessage())
                })
            },
            assign() {
                this.visible = true
            },
            onClose() {
                this.visible = false
            },
            showRow() {
                let role = sessionStorage.getItem('user_role');
                if (role == 'administrator') { // 管理员
                    for (const item of this.columns) {
                        if (item.key == 'client_id') { // 代收
                            item.searchAble = true;
                        }
                        if (item.key == 'collect_id') { // 商户
                            item.searchAble = true;
                        }
                        if (item.key == 'out_trade_no') { // 商户单号
                            item.searchAble = true;
                            item.visible = true;
                        }
                        if (item.key == 'pay_type_id') { // 通道
                            item.searchAble = true;
                        }
                        if (item.key == 'trade_no') { // 平台单号
                            item.title = '平台单号';
                        }
                        if (item.key == 'account_id') { // 银行卡
                            item.searchAble = true;
                        }
                    }
                } else if (role == 'client') {
                    // 商户  查询 不显示 client_id  collect_id  out_trade_no  pay_type_id
                    // trade_no 名称-》 单号
                    for (const item of this.columns) {
                        if (item.key == 'client_id') { // 代收
                            item.searchAble = false;
                        }
                        if (item.key == 'collect_id') { // 商户
                            item.searchAble = false;
                        }
                        // if (item.key == 'out_trade_no') { // 商户单号
                        //     item.searchAble = false;
                        // }
                        if (item.key == 'pay_type_id') { // 通道
                            item.searchAble = false;
                        }
                        if (item.key == 'trade_no') { // 平台单号
                            item.title = '平台单号';
                        }
                        if (item.key == 'account_id') { // 银行卡
                            item.searchAble = false;
                        }
                    }

                } else if (role == 'collect') {
                    // 代收  查询 不是显示  client_id collect_id account_id
                    for (const item of this.columns) {
                        if (item.key == 'client_id') { // 代收
                            item.searchAble = false;
                        }
                        if (item.key == 'collect_id') { // 商户
                            item.searchAble = false;
                        }
                        if (item.key == 'pay_type_id') { // 通道
                            item.searchAble = false;
                        }
                        if (item.key == 'out_trade_no') { // 商户单号
                            item.searchAble = false;
                            item.visible = false;
                        }
                        if (item.key == 'account_id') { // 银行卡
                            item.searchAble = true;
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
            // --------------------
            this.getPayType();
            this.getCollectUsers();
            this.getClientUsers();
            this.getAccount();
            // --------------------
            this.get();
            this.showRow();
            this.getTurnover();
            this.interval = setInterval(() => {
                this.get(true);
                this.getTurnover();
            }, 20 * 1000)
        },
        beforeDestroy() {
            clearInterval(this.interval)
        },
    }
</script>

<style lang="less" scoped>
    .alter-success {
        background: #f6ffed;
        border: 1px solid #b7eb8f
    }

    .alter-error {
        background: #fff1f0;
        border: 1px solid #ffa39e
    }
</style>