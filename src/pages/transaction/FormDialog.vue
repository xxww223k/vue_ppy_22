<template>
    <div>
        <a-form :form="form" :colon="false" :layout="formLayout">
            <a-modal title="交易" width="600px" :visible="visible" :confirm-loading="saving" @ok="onSubmit"
                @cancel="handleCancel">
                <a-form-item style="display: none">
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-divider style="font-weight: 700;font-size:18px">交易信息</a-divider>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="交易类型">
                            <a-select style="width: 100%;" placeholder="请选择 交易类型" v-decorator="decorator.type" allowClear showSearch optionFilterProp="children">
                                <a-select-option v-for="(type,index) in types" :key="index" :value="type.id">
                                    {{ type.title }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="交易金额">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 订单金额"
                                v-decorator="decorator.amount"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="备注信息">
                            <a-input allowClear placeholder="请输入 备注信息" v-decorator="decorator.remark"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-divider style="font-weight: 700;font-size:18px">付款方</a-divider>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="用户">
                            <a-select style="width: 100%;" allowClear showSearch optionFilterProp="children" placeholder="请选择 用户" @change="setPayer"
                                v-decorator="decorator.payer_id">
                                <template v-for="(user,index) in payer_User">
                                    <a-select-option :disabled="user.selected" :key="index" :value="user.id">
                                        {{ user.full_name }}
                                    </a-select-option>
                                </template>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="银行">
                            <a-select style="width: 100%;" placeholder="请选择 银行" v-decorator="decorator.payer_bank_id" allowClear showSearch optionFilterProp="children">
                                <a-select-option v-for="(bank,index) in banks" :key="index" :value="bank.id">
                                    {{ bank.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="银行卡户名">
                            <a-input allowClear placeholder="请输入 银行卡户名" v-decorator="decorator.payer_account_name"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="银行卡号">
                            <a-input allowClear placeholder="请输入 银行卡号" v-decorator="decorator.payer_account_number"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-divider style="font-weight: 700;font-size:18px">收款方</a-divider>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="用户">
                            <a-select style="width: 100%;" placeholder="请选择 用户" @change="setPayee" allowClear showSearch optionFilterProp="children" v-decorator="decorator.payee_id">
                                <template v-for="(user,index) in payee_User">
                                    <a-select-option :disabled="user.selected" :key="index" :value="user.id">
                                        {{ user.full_name }}
                                    </a-select-option>
                                </template>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="银行">
                            <a-select style="width: 100%;" placeholder="请选择 银行" v-decorator="decorator.payee_bank_id" allowClear showSearch optionFilterProp="children">
                                <a-select-option v-for="(bank,index) in banks" :key="index" :value="bank.id">
                                    {{ bank.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="银行卡户名">
                            <a-input allowClear placeholder="请输入 银行卡户名" v-decorator="decorator.payee_account_name"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 12 }">
                        <a-form-item label="银行卡号">
                            <a-input allowClear placeholder="请输入 银行卡号" v-decorator="decorator.payee_account_number"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-modal>
        </a-form>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { TRANSACTION as URL, BANK, USER } from "@/services/api";

    export default {
        data() {
            return {
                payer_User: [],
                payee_User: [],
                banks: [],
                types: [
                    { id: 2, title: '上分' },
                    // { id: 3, title: '普通交易' },
                ],
                saving: false,
                visible: false,
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
                    payer_id: [
                        "payer_id",
                        {
                            rules: [
                                { required: true, message: "付款方ID 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    payee_id: [
                        "payee_id",
                        {
                            rules: [
                                { required: true, message: "收款方ID 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],

                    payer_account_name: [
                        "payer_account_name",
                        {
                            rules: [
                                // { required: true, message: "付款户名 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    payer_account_number: [
                        "payer_account_number",
                        {
                            rules: [
                                // { required: true, message: "付款卡号 不能为空", whitespace: true }
                            ]
                        }
                    ],

                    payer_bank_id: [
                        "payer_bank_id",
                        {
                            rules: [
                                // { required: true, message: "付款银行 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    payee_account_name: [
                        "payee_account_name",
                        {
                            rules: [
                                // { required: true, message: "收款户名 不能为空", whitespace: true }
                            ]
                        }
                    ],

                    payee_account_number: [
                        "payee_account_number",
                        {
                            rules: [
                                // { required: true, message: "收款卡号 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    payee_bank_id: [
                        "payee_bank_id",
                        {
                            rules: [
                                // { required: true, message: "收款银行 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],

                    remark: [
                        "remark",
                        {

                        }
                    ],
                    type: [
                        "type",
                        {
                            rules: [
                                { required: true, message: "交易类型 不能为空" }
                            ]
                        }
                    ],
                    amount: [
                        "amount",
                        {
                            rules: [
                                { required: true, message: "交易金额 不能为空" }
                            ]
                        }
                    ],
                }
            }
        },
        methods: {
            showModal() {
                this.visible = true;
                this.form.resetFields();
                this.getBank();
                this.getUser();
                this.$nextTick(() => {
                    this.form.setFieldsValue({
                        type: 2
                    })
                })
            },
            handleCancel() {
                this.visible = false
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
                    this.$emit('close')
                    this.saving = false;
                    this.visible = false;
                    // this.$router.push('/user')
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
            getUser() {
                const query = {
                    search: null,
                    limit: 10000,
                    page: 1,
                }
                request(USER, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    list.data.forEach(item => {
                        item.selected = false
                    })
                    this.payer_User.splice(0, this.payer_User.length)
                    this.payer_User = JSON.parse(JSON.stringify(list.data));
                    this.payee_User.splice(0, this.payer_User.length)
                    this.payee_User = JSON.parse(JSON.stringify(list.data));
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            setPayer(id) {
                console.log('payer')
                this.payee_User.forEach(item => {
                    item.selected = false
                    if (id == item.id) {
                        item.selected = true
                    }
                })

                console.log(this.payee_User)
                console.log(this.payer_User)
            },
            setPayee(id) {
                console.log('payee')
                this.payer_User.forEach(item => {
                    item.selected = false
                    if (id == item.id) {
                        item.selected = true
                    }
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
            get(id) {
                request(`${URL}/${id}`, METHOD.GET).then((res) => {
                    const { data, code, message } = res.data
                    if (code < 0) {
                        this.$message.error(message)
                    }
                    this.form.setFieldsValue({
                        id: data.id,
                        firstname: data.firstname,
                        lastname: data.lastname,
                        username: data.username,
                        role: data.role
                    })

                    this.getParentUser(data.role)
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            created() {
                if (this.$route.params.id !== undefined) {
                    this.get(this.$route.params.id)
                }

            }
        }
    }
</script>

<style scoped>
    .title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 10px;
        /* background-color: #fafafa; */
        /* border-bottom: 1px solid #1890ff;
        border-left: 4px solid #1890ff; */
        padding-left: 20px;
        padding-bottom: 10px;
        /* color: #1890ff; */
    }
</style>