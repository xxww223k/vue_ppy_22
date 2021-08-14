<template>
    <div>
        <a-modal title="设置密码" :visible="visible" :confirm-loading="confirmLoading" @ok="onSubmit"
            @cancel="handleCancel">
            <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
                <a-form-item style="display: none;">
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="密码">
                            <a-input allowClear placeholder="请输入 密码" v-decorator="decorator.password"
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
    import { USER as URL } from "@/services/api";

    export default {
        data() {
            return {
                visible: false,
                confirmLoading: false,
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
                    password: [
                        "password",
                        {
                            rules: [
                                { required: true, message: "密码 不能为空", whitespace: true }
                            ]
                        }
                    ]
                }
            }
        },
        methods: {
            showModal() {
                this.visible = true;
                this.form.resetFields();
                this.$nextTick(() => {
                    this.form.setFieldsValue({
                        id: sessionStorage.getItem('ui')
                    })
                })
            },
            handleOk() {

            },
            handleCancel() {
                this.visible = false;
            },
            onSubmit(e) {
                e.preventDefault()
                this.form.validateFields((err) => {
                    if (!err) {
                        this.saving = true
                        const fields = this.form.getFieldsValue()
                        // const method = fields.id === undefined ? METHOD.POST : METHOD.PUT
                        // const url = fields.id === undefined ? URL : `${URL}/${fields.id}`
                        request(URL + '/' + fields.id + '?action=repass', METHOD.PUT, fields).then(this.afterSubmit).catch(() => {
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
                    // this.$emit('close');
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

<style lang="less">
    div.actions {
        padding: 0 20px;
        text-align: right;
    }

    .ant-card-actions {
        background: none !important;
    }
</style>