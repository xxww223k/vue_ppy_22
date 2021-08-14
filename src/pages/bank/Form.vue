<template>
    <div>
        <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
            <a-card>
                    <a-form-item>
                        <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                    </a-form-item>
                    <a-row :gutter="{ md: 40 }">
                        <a-col :md="{ span: 6 }">
                            <a-form-item label="银行">
                                <a-input allowClear placeholder="请输入 银行" v-decorator="decorator.name" autocomplete="off"/>
                            </a-form-item>
                        </a-col>
                        <a-col :md="{ span: 6 }">
                            <a-form-item label="号码">
                                <a-input allowClear placeholder="请输入 号码" v-decorator="decorator.number" autocomplete="off"/>
                            </a-form-item>
                        </a-col>
                    </a-row>
            </a-card>
            <footer-tool-bar>
                <a-button type="primary" html-type="submit" :loading="saving">保存</a-button>
            </footer-tool-bar>
        </a-form>
    </div>
</template>

<script>
import { request, METHOD } from "@/utils/request";
import { BANK as URL } from "@/services/api";

export default {
    data() {
        return {
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
                name: [
                    "name",
                    {
                        rules: [
                            { required: true, message: "银行 不能为空", whitespace: true }
                        ]
                    }
                ],
                number: [
                    "number",
                    {
                        rules: [
                            { required: true, message: "号码 不能为空", whitespace: true }
                        ]
                    }
                ],
            }
        }
    },
    methods: {
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
                this.$router.push('/bank')
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
                    name: data.name,
                    number: data.number
                })
            }).catch((e) => {
                console.log(e)
                this.$message.error('系统出错了~')
            })
        }
    },
    created() {
        if (this.$route.params.id !== undefined) {
            this.get(this.$route.params.id)
        }
    }
}
</script>

<style lang="less">
div.actions {
    padding: 0 20px;
    text-align: right;
}
.ant-card-actions {
    background: none!important;
}
</style>