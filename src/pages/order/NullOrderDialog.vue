<template>
    <div>
        <a-modal title="空单" :visible="visible" :confirm-loading="confirmLoading" @ok="onSubmit" @cancel="handleCancel">
            <a-form :form="form" :colon="false" :layout="formLayout">
                <a-form-item style="display: none">
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="通道">
                            <a-select placeholder="请选择 通道" v-decorator="decorator.pay_type_id">
                                <a-select-option v-for="(pay_type,index) in pay_types" :key="index"
                                    :value="pay_type.id">
                                    {{ pay_type.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="客户">
                            <a-select placeholder="请选择 客户" v-decorator="decorator.client_id">
                                <a-select-option v-for="(client,index) in clients" :key="index" :value="client.id">
                                    {{ client.full_name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="供应商">
                            <a-select placeholder="请选择 供应商" v-decorator="decorator.supplier_id">
                                <a-select-option v-for="(supplier,index) in suppliers" :key="index"
                                    :value="supplier.id">
                                    {{ supplier.full_name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="订单金额">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 订单金额"
                                v-decorator="decorator.amount"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-modal>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { USER as URL, PAY_TYPE, ORDER } from "@/services/api";

    export default {
        data() {
            return {
                accounts: [],
                pay_types: [],
                suppliers: [],
                clients: [],

                visible: false,
                confirmLoading: false,

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
                    pay_type_id: [
                        "pay_type_id",
                        {
                            rules: [
                                { required: true, message: "通道 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    supplier_id: [
                        "supplier_id",
                        {
                            rules: [
                                { required: true, message: "供应商 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    client_id: [
                        "client_id",
                        {
                            rules: [
                                { required: true, message: "客户 不能为空", whitespace: true, type: 'number' }
                            ]
                        }
                    ],
                    amount: [
                        "amount",
                        {
                            rules: [
                                { required: true, message: "订单金额 不能为空" }
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
                this.getPay_types();
                this.getSuppliers();
                this.getClients();
            },
            handleOk() {
                // this.ModalText = 'The modal will be closed after two seconds';
                // this.confirmLoading = true;
                // setTimeout(() => {
                //     this.visible = false;
                //     this.confirmLoading = false;
                // }, 2000);
            },
            handleCancel() {
                this.visible = false;
            },
            getPay_types() {
                const query = {
                    search: null,
                    limit: 10000,
                    page: 1,
                }
                request(PAY_TYPE, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.pay_types = [];
                    this.pay_types.push(...list.data)
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            getSuppliers() {
                const query = {
                    search: { role: 'collect' },
                    limit: 10000,
                    page: 1,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.suppliers.splice(0, this.suppliers.length)
                    this.suppliers.push(...list.data)
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            getClients() {
                const query = {
                    search: { role: 'client' },
                    limit: 10000,
                    page: 1,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.clients.splice(0, this.clients.length)
                    this.clients.push(...list.data)
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            onSubmit(e) {
                e.preventDefault()
                this.form.validateFields((err) => {
                    if (!err) {
                        this.confirmLoading = true;
                        const fields = this.form.getFieldsValue()
                        const method = fields.id === undefined ? METHOD.POST : METHOD.PUT
                        // const url = fields.id === undefined ? URL : `${URL}/${fields.id}`
                        request(ORDER, method, fields).then(this.afterSubmit).catch(() => {
                            this.$message.error('系统出错了~')
                        }).finally(() => {
                            this.confirmLoading = false
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
                    this.visible = false;
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
        },
    }
</script>

<style scoped>

</style>