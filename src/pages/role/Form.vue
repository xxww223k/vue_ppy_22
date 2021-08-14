<template>
    <div>
        <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
            <a-card>
                <a-form-item>
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="角色">
                            <a-input allowClear placeholder="请输入 角色" v-decorator="decorator.name" autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="标识">
                            <a-input allowClear placeholder="请输入 标识" v-decorator="decorator.slug" autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col :md="{ span: 12 }">
                        <a-tree v-model="role_menus" :tree-data="menus" :replaceFields="replaceFields" checkable>
                            <a-icon slot="switcherIcon" type="down" />
                        </a-tree>
                    </a-col>
                    <a-col :md="{ span: 12 }">
                        <a-tree v-model="permissions" :tree-data="tree" :replaceFields="replaceFields" checkable>
                            <a-icon slot="switcherIcon" type="down" />
                        </a-tree>
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
    import { ROLE as URL, PERMISSION, MENU } from "@/services/api";

    export default {
        data() {
            return {
                tree: [],
                permissions: [],
                menus: [],
                role_menus: [],
                replaceFields: {
                    key: "id",
                    title: "name",
                },
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
                                { required: true, message: "角色 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    slug: [
                        "slug",
                        {
                            rules: [
                                { required: true, message: "标识 不能为空", whitespace: true }
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
                        fields.permissions = this.permissions // 额外逻辑
                        fields.role_menu = this.role_menus // 额外逻辑
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
                    // this.$router.push('/role')
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
                        slug: data.slug
                    })
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            getPermissions() {
                const query = {
                    search: {
                        role: this.$route.params.id
                    }
                }
                request(PERMISSION, METHOD.GET, query).then((res) => {
                    const { tree, role_permissions } = res.data.data
                    this.tree.splice(0, this.tree.length)
                    this.tree.push(...tree)
                    this.permissions.splice(0, this.permissions.length)
                    this.permissions.push(...role_permissions)
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },
            getMenus() {
                const query = {
                    search: {
                        role: this.$route.params.id
                    }
                }
                request(MENU, METHOD.GET, query).then((res) => {
                    const { tree, role_menus } = res.data.data
                    this.menus.splice(0, this.menus.length)
                    this.menus.push(...tree)
                    this.role_menus.splice(0, this.role_menus.length)
                    this.role_menus.push(...role_menus)
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            }

        },
        created() {
            this.getPermissions()
            this.getMenus();
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
        background: none !important;
    }
</style>