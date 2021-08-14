<template>
    <div>
        <a-card>
            <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
                <a-form-item>
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 6 }" v-show="user_role != 'collect'">
                        <a-form-item label="供应商">
                            <a-select placeholder="请选择 供应商" v-decorator="decorator.user_id">
                                <a-select-option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                                    {{ supplier.full_name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="监控">
                            <a-select placeholder="请选择 监控" v-decorator="decorator.watch_id">
                                <a-select-option v-for="watch in watchs" :key="watch.id" :value="watch.id">
                                    {{ watch.username }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="银行">
                            <a-select placeholder="请选择 银行" show-search :filter-option="filterOption"
                                v-decorator="decorator.bank_id">
                                <a-select-option v-for="bank in banks" :key="bank.id" :value="bank.id"
                                    :disabled="!bank.status">
                                    {{ bank.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="户名">
                            <a-input allowClear placeholder="请输入 户名" v-decorator="decorator.name" autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="卡号">
                            <a-input allowClear placeholder="请输入 卡号" v-decorator="decorator.number"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="日限额">
                            <a-tooltip>
                                <template slot="title">每天的收款额度</template>
                                <a-input-number style="width: 100%;" allowClear placeholder="请输入 每日最限额"
                                    :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                    v-decorator="decorator.maximum_daily_payment" autocomplete="off" />
                            </a-tooltip>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }" v-show="user_role != 'collect'">
                        <a-form-item label="日笔数">
                            <a-tooltip>
                                <template slot="title">每天的收款笔数</template>
                                <a-input-number allowClear placeholder="请输入 日笔数"
                                    v-decorator="decorator.maximum_number_of_receipts_per_day" autocomplete="off"
                                    style="width: 100%" />
                            </a-tooltip>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }" v-show="user_role != 'collect'">
                    <a-col :md="{ span: 6 }" v-show="user_role != 'collect'">
                        <a-form-item label="最小订单金额">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 最小接单金额"
                                v-decorator="decorator.minimum_payment"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }" v-show="user_role != 'collect'">
                        <a-form-item label="最大订单金额">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 最大接单金额"
                                v-decorator="decorator.maximum_payment"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <footer-tool-bar>
                    <a-button type="primary" html-type="submit" :loading="saving">保存</a-button>
                </footer-tool-bar>
            </a-form>
        </a-card>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { BANK_ACCOUNT as URL, USER, WATCH, BANK } from "@/services/api";

    export default {
        data() {
            return {
                user_role: null,
                banks: [],
                suppliers: [],
                watchs: [],
                types: [
                    { id: 0, title: '停止收款' },
                    { id: 1, title: '可收款' },
                ],
                saving: false,
                formLayout: "vertical",
                labelCol: {
                    md: {
                        span: 6
                    }
                },
                wrapperCol: {
                    md: {
                        span: 6
                    }
                },
                form: this.$form.createForm(this),
                decorator: {
                    id: [
                        "id",
                        {
                            rules: []
                        }
                    ],
                    bank_id: [
                        "bank_id",
                        {
                            rules: [
                                { required: true, message: "银行ID 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    user_id: [
                        "user_id",
                        {
                            rules: [
                                { required: true, message: "供应商ID 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    watch_id: [
                        "watch_id",
                        {
                            rules: [
                                { required: true, message: "监控ID 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    name: [
                        "name",
                        {
                            rules: [
                                { required: true, message: "户名 不能为空" }
                            ]
                        }
                    ],

                    number: [
                        "number",
                        {
                            rules: [
                                { required: true, message: "卡号 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    maximum_daily_payment: [
                        "maximum_daily_payment",
                        {
                            rules: [
                                { required: true, message: "日限额 不能为空" }
                            ]
                        }
                    ],

                    minimum_payment: [
                        "minimum_payment",
                        {
                            rules: [
                                { required: true, message: "最小订单金额 不能为空" }
                            ]
                        }
                    ],
                    maximum_payment: [
                        "maximum_payment",
                        {
                            rules: [
                                { required: true, message: "最大订单金额 不能为空" }
                            ]
                        }
                    ],
                    maximum_number_of_receipts_per_day: [
                        "maximum_number_of_receipts_per_day",
                        {
                            rules: [
                                { required: true, message: "日笔数 不能为空" }
                            ]
                        }
                    ],
                }
            }
        },
        methods: {
            filterOption(input, option) {
                return (
                    option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
                );
            },
            onSubmit(e) {
                e.preventDefault()
                this.form.validateFields((err) => {
                    if (!err) {
                        this.saving = true
                        const fields = this.form.getFieldsValue()
                        const method = fields.id === undefined ? METHOD.POST : METHOD.PUT
                        const url = fields.id === undefined ? URL : `${URL}/${fields.id}`
                        request(url, method, fields).then(this.afterSubmit).catch(() => {
                            this.$message.error('系统出错了~')
                        }).finally(() => {
                            this.saving = false
                        })
                    }
                });
            },
            afterSubmit(res) {
                if (res.status === 422) {
                    this.requestErrorHandle(res.data.errors)
                }
                if (res.data.code < 0) {
                    this.$message.error(res.data.message)
                }
                if (res.data.code >= 0) {
                    this.$message.success(res.data.message)
                    this.$router.push('/bank_account')
                }
            },
            requestErrorHandle(responseErrors) {
                let errors = {},
                    errorsInfo
                for (let attr in responseErrors) {
                    errorsInfo = []
                    responseErrors[attr].forEach(val => {
                        errorsInfo.push(new Error(val))
                    })
                    errors[attr] = {
                        value: this.form.getFieldValue(attr),
                        errors: errorsInfo
                    }
                }
                this.form.setFields(errors)
            },
            get(id) {
                request(`${URL}/${id}`, METHOD.GET).then((res) => {
                    const { data, code, message } = res.data
                    if (code < 0) {
                        this.$message.error(message)
                    }
                    this.form.setFieldsValue({
                        id: data.id,
                        bank_id: data.bank_id,
                        user_id: data.user_id,
                        watch_id: data.watch_id,
                        // receivable: data.receivable,
                        name: data.name,
                        number: data.number,
                        // balance: data.balance,
                        maximum_daily_payment: data.yuan_maximum_daily_payment,
                        minimum_payment: data.yuan_minimum_payment,
                        maximum_payment: data.yuan_maximum_payment,
                        maximum_number_of_receipts_per_day: data.maximum_number_of_receipts_per_day,
                    })
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },

            getSuppliers() {
                const query = {
                    search: { role: 'collect' },
                    limit: 10000,
                    page: 1,
                }
                request(USER, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.suppliers.splice(0, this.suppliers.length)
                    this.suppliers.push(...list.data)
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                }).finally(() => {

                })
            },
            getBank() {
                const query = {
                    search: null,
                    limit: 10000,
                    page: 1,
                }
                request(BANK, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.banks.splice(0, this.banks.length)
                    this.banks.push(...list.data)
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                }).finally(() => {

                })
            },
            getWatch() {
                const query = {
                    search: null,
                    limit: 10000,
                    page: 1,
                }
                request(WATCH, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.watchs.splice(0, this.watchs.length)
                    this.watchs.push(...list.data)
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                }).finally(() => {

                })
            },

        },
        created() {
            this.user_role = sessionStorage.getItem('user_role')
            // 代收不显示 供应商 日笔数 最小订单金额 最大订单金额
            if (this.user_role == 'collect') {
                this.decorator.user_id[1].rules[0].required = false;// 供应商
                this.decorator.minimum_payment[1].rules[0].required = false;// 最小订单金额
                this.decorator.maximum_payment[1].rules[0].required = false;// 最大订单金额
                this.decorator.maximum_number_of_receipts_per_day[1].rules[0].required = false;// 日笔数
            } else {
                this.decorator.user_id[1].rules[0].required = true;// 供应商
                this.decorator.minimum_payment[1].rules[0].required = true;// 最小订单金额
                this.decorator.maximum_payment[1].rules[0].required = true;// 最大订单金额
                this.decorator.maximum_number_of_receipts_per_day[1].rules[0].required = true;// 日笔数
            }

            this.getWatch();
            this.getSuppliers();
            this.getBank();
            if (this.$route.params.id !== undefined) {
                this.get(this.$route.params.id)
            } else {
                this.$nextTick(() => {
                    this.form.setFieldsValue({
                        maximum_daily_payment: 40000,
                        minimum_payment: 0,
                        maximum_payment: 99999,
                        maximum_number_of_receipts_per_day: 100,
                    })
                })
            }

        }
    }
</script>