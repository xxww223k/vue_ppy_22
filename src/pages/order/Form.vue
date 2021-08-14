<!-- <template>
    <div>
        <a-card>
            <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
                <a-form-item>
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="收款账号">
                            <a-input allowClear placeholder="请输入 名" v-decorator="decorator.firstname"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="付款方式">
                            <a-input allowClear placeholder="请输入 姓" v-decorator="decorator.lastname"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="供应商">
                            <a-input allowClear placeholder="请输入 登录名" v-decorator="decorator.username"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="客户">
                            <a-input allowClear placeholder="请输入 密码" v-decorator="decorator.password"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="订单金额">
                            <a-select placeholder="请选择 角色" @change="getParentUser" v-decorator="decorator.role">
                                <a-select-option v-for="(role,index) in roles" :key="index" :value="role.id">
                                    {{ role.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 10 }">
                        <a-form-item label="实际支付金额">
                            <a-select placeholder="请选择 介绍人" v-decorator="decorator.parent_id">
                                <a-select-option v-for="parent in parentList" :key="parent.id" :value="parent.id">
                                    {{ parent.full_name }}
                                </a-select-option>
                            </a-select>
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
    // import { USER as URL, ROLE, BANK_ACCOUNT } from "@/services/api";
    import { USER as URL, ROLE } from "@/services/api";

    export default {
        data() {
            return {
                accounts: [],
                pay_types: [],
                suppliers: [],
                clients: [],


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
                    firstname: [
                        "firstname",
                        {
                            rules: [
                                { required: true, message: "名 不能为空", whitespace: true }
                            ]
                        }
                    ],
                    lastname: [
                        "lastname",
                        {
                            rules: [
                                { required: true, message: "姓 不能为空", whitespace: true }
                            ]
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
                    role: [
                        "role",
                        {
                            rules: [
                                { required: true, message: "角色 不能为空" }
                            ]
                        }
                    ],
                    parent_id: [

                    ]
                }
            }
        },
        methods: {
            getAccounts() {

            },
            getPay_types() {

            },
            getSuppliers() {

            },
            getClients() {

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
                    this.$router.push('/user')
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
            getParentUser(role) {
                if (role != 3 && role != 4) {
                    this.parentShow = false;
                    return false;
                }
                this.parentShow = true;
                let role_arr = ['', 'development', 'administrator', 'client', 'collect'];
                const query = {
                    search: { ...this.conditions, role: role_arr[role] },
                    limit: 10000,
                    page: 1,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    this.parentList = [];
                    const { list } = res.data.data
                    this.parentList.push(...list.data)
                    console.log(this.parentList)
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {

                })
            }
        },
        created() {
            if (this.$route.params.id !== undefined) {
                this.get(this.$route.params.id)
                this.decorator.password[1].rules[0] = {}
            }
            this.getRoles();
        }
    }
</script> -->