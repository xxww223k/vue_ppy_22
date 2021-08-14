<template>
    <div>
        <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
            <a-card>
                    <a-form-item>
                        <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                    </a-form-item>
                    <a-row :gutter="{ md: 40 }">
                        <a-col :md="{ span: 6 }">
                            <a-form-item label="登录名">
                                <a-input allowClear placeholder="请输入 登录名" v-decorator="decorator.username" autocomplete="off"/>
                            </a-form-item>
                        </a-col>
                        <a-col :md="{ span: 6 }">
                            <a-form-item label="密码">
                                <a-input allowClear placeholder="请输入 密码" v-decorator="decorator.password" autocomplete="off"/>
                            </a-form-item>
                        </a-col>
                        <a-col :md="{ span: 6 }">
                            <a-form-item label="用户">
                                <a-select allowClear showSearch optionFilterProp placeholder="请选择 用户" v-decorator="decorator.user_id">
                                    <a-select-option v-for="user in users" :key="user.id" :value="user.id">
                                        {{ user.full_name }}
                                    </a-select-option>
                                </a-select>
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
import { WATCH as URL, USER } from "@/services/api";

export default {
    data() {
        return {
            users: [],
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
                username: [
                    "username",
                    {
                        rules: [
                            { required: true, message: "登录名 不能为空", whitespace: true }
                        ]
                    }
                ],
                password: [
                    "password",
                    {
                        rules: [
                            { required: true, message: "密码 不能为空", whitespace: true }
                        ]
                    }
                ],
                user_id: [
                    "user_id",
                    {
                        rules: [
                            { required: true, message: "用户 不能为空" }
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
                this.$router.push('/watch')
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
                    username: data.username,
                    user_id: data.user_id
                })
            }).catch((e) => {
                console.log(e)
                this.$message.error('系统出错了~')
            })
        },
        getUsers() {
            const query = {
                limit: 9999,
                role: 'collect'
            }
            request(USER, METHOD.GET, query).then((res) => {
                const { list } = res.data.data
                this.users.splice(0, this.users.length)
                this.users.push(...list.data)
            }).catch((e) => {
                console.log(e)
                this.$message.error('系统出错了~')
            })
        },
    },
    created() {
        this.getUsers()
        if (this.$route.params.id !== undefined) {
            this.get(this.$route.params.id)
            this.decorator.password[1].rules[0] = {}
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