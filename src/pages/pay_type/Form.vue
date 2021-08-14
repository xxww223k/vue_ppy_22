<template>
    <div>
        <a-card>
            <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
                <a-form-item>
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="归属">
                            <a-select allowClear showSearch optionFilterProp placeholder="请选择 归属" v-decorator="decorator.type">
                                <a-select-option v-for="type in types" :key="type.id" :value="type.id">
                                    {{ type.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="名称">
                            <a-input allowClear placeholder="请输入 名称" v-decorator="decorator.name" autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="下单地址">
                            <a-input allowClear placeholder="请输入 下单地址" v-decorator="decorator.post"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="查单地址">
                            <a-input allowClear placeholder="请输入 查单地址" v-decorator="decorator.get" autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="商户号">
                            <a-input allowClear placeholder="请输入 商户号" v-decorator="decorator.appid"
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
    import { PAY_TYPE as URL, ROLE } from "@/services/api";

    export default {
        data() {
            return {
                types: [
                    { id: "1", name: "平台" },
                    { id: "2", name: "第三方" },
                ],
                saving: false,
                roles: [],
                parentList: [],
                parentShow: false,
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
                    type: [
                        "type",
                        {
                            rules: [
                                { required: true, message: "归属 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    name: [
                        "name",
                        {
                            rules: [
                                { required: true, message: "通道名 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    post: [
                        "post",
                        {
                            rules: [
                                { required: true, message: "下单地址 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    get: [
                        "get",
                        {
                            rules: [
                                { required: true, message: "查单地址 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    appid: [
                        "appid",
                        {
                            rules: []
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
                    this.$router.push('/pay_type')
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
                        type: data.type,
                        name: data.name,
                        post: data.post,
                        get: data.get,
                        appid: data.appid
                    })

                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            // 查角色
            getRoles() {
                const query = {
                    limit: 9999,
                }
                request(ROLE, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.roles.splice(0, this.roles.length)
                    this.roles.push(...list.data)
                }).catch(() => {
                    this.$message.error('系统出错了~')
                })
            },
        },
        created() {
            if (this.$route.params.id !== undefined) {
                this.get(this.$route.params.id)
            }
        }
    }
</script>