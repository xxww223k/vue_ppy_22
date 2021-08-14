<template>
    <div>
        <a-modal title="付款" :visible="visible" :confirm-loading="confirmLoading" @ok="onSubmit" @cancel="handleCancel">
            <a-form :form="form" :colon="false" :layout="formLayout">
                <a-form-item style="display: none">
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-form-item style="display: none">
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.status" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="付款金额">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 订单金额"
                                v-decorator="decorator.yuan_amount"
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
    import { ORDER as URL } from "@/services/api";

    export default {
        data() {
            return {
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
                    status: [
                        "status",
                        {
                            rules: []
                        }
                    ],
                    yuan_amount: [
                        "yuan_amount",
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
            showModal(item) {
                console.log(item)
                this.visible = true;
                this.$nextTick(() => {
                    this.form.setFieldsValue({
                        id: item.record.id,
                        status: 2,
                        yuan_amount: item.record.yuan_amount
                    })
                })
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
            onSubmit(e) {
                e.preventDefault()
                this.form.validateFields((err) => {
                    if (!err) {
                        this.confirmLoading = true;
                        const fields = this.form.getFieldsValue()
                        fields.payment_amount = fields.yuan_amount;
                        // const method = fields.id === undefined ? METHOD.POST : METHOD.PUT
                        // const url = fields.id === undefined ? URL : `${URL}/${fields.id}`
                        request(URL + '/' + fields.id, METHOD.PUT, fields).then(this.afterSubmit).catch(() => {
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
        },
    }
</script>

<style scoped>

</style>