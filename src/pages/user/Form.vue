<template>
    <div>
        <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
            <a-card>
                <a-form-item>
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="姓">
                            <a-input allowClear placeholder="请输入 姓" v-decorator="decorator.lastname"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="名">
                            <a-input allowClear placeholder="请输入 名" v-decorator="decorator.firstname"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="登录名">
                            <a-input allowClear placeholder="请输入 登录名" v-decorator="decorator.username"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="密码">
                            <a-input allowClear placeholder="请输入 密码" v-decorator="decorator.password"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="Telegram">
                            <a-input allowClear placeholder="请输入 Telegram 群组链接" v-decorator="decorator.telegram"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="角色">
                            <a-select placeholder="请选择 角色" @change="getParentUser" v-decorator="decorator.role"
                                allowClear showSearch optionFilterProp="children">
                                <a-select-option v-for="(role,index) in roles" :key="index" :value="role.slug">
                                    {{ role.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }" v-show="parentShow">
                        <a-form-item label="上级">
                            <a-select placeholder="请选择 上级" v-decorator="decorator.parent_id" allowClear showSearch
                                optionFilterProp="children">
                                <a-select-option v-for="parent in parentList" :key="parent.id" :value="parent.id">
                                    {{ parent.full_name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="权重" v-show="amountShow">
                            <a-popover>
                                <template slot="content">
                                    权重越大接单优先级越高
                                </template>
                                <a-input allowClear placeholder="请输入 权重" v-decorator="decorator.weight"
                                    autocomplete="off" />
                            </a-popover>
                        </a-form-item>
                    </a-col>
                </a-row>
                <!-- <a-row :gutter="{ md: 40 }" >
                    
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="最小金额">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 最小金额"
                                v-decorator="decorator.min_amount"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 6 }">
                        <a-form-item label="最大金额">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 最小金额"
                                v-decorator="decorator.max_amount"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </a-form-item>
                    </a-col>
                </a-row> -->
            </a-card>
            <a-card style="margin-top: 10px" v-if="parentShow">
                <div slot="extra">
                    <a-button-group>
                        <a-button type="primary" @click="addRow">新建</a-button>
                    </a-button-group>
                </div>
                <a-table :data-source="payTypeRate" row-key="id" :pagination="false">
                    <a-table-column title="通道" data-index="pay_type_id">
                        <template slot-scope="text, record">
                            <a-select style="min-width: 200px; width: 100%;" placeholder="请选择 通道"
                                @change="setPayTypesSelected" v-model="record.pay_type_id" allowClear showSearch
                                optionFilterProp="children">
                                <template v-for="(payType,index) in payTypes">
                                    <a-select-option :key="index" :value="payType.id" :disabled="payType.selected">
                                        {{ payType.name }}
                                    </a-select-option>
                                </template>
                            </a-select>
                        </template>
                    </a-table-column>
                    <a-table-column title="费率" data-index="rate">
                        <template slot-scope="text, record">
                            <a-input allowClear placeholder="请输入 费率" v-model="record.rate" autocomplete="off" />
                        </template>
                    </a-table-column>
                    <a-table-column title="最小金额" data-index="min_amount">
                        <template slot-scope="text, record">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 最小金额"
                                v-model="record.min_amount"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </template>
                    </a-table-column>
                    <a-table-column title="最大金额" data-index="max_amount">
                        <template slot-scope="text, record">
                            <a-input-number style="width: 100%;" allowClear placeholder="请输入 最大金额"
                                v-model="record.max_amount"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                                autocomplete="off" />
                        </template>
                    </a-table-column>
                    <!-- <a-table-column title="权重" data-index="weight" >
                        <template slot-scope="text, record">
                            <a-popover>
                                <template slot="content">
                                    权重越大接单优先级越高
                                </template>
                                <a-input allowClear placeholder="请输入 权重" v-model="record.weight" autocomplete="off" />
                            </a-popover>
                        </template>
                    </a-table-column> -->
                    <a-table-column align="right">
                        <template slot-scope="text, record, index">
                            <a-button type="link" @click="delRow(index)">删除</a-button>
                        </template>
                    </a-table-column>
                </a-table>
            </a-card>
            <footer-tool-bar>
                <a-button type="primary" html-type="submit" :loading="saving">保存</a-button>
            </footer-tool-bar>
        </a-form>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { USER as URL, ROLE, PAY_TYPE } from "@/services/api";

    export default {
        data() {
            return {
                payTypes: [], // 所有通道类型
                payTypeRate: [], // 通道和费率的配置
                saving: false,
                roles: [],
                parentList: [],
                parentShow: false,
                amountShow: false,
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
                        "parent_id",
                        {
                            rules: [

                            ]
                        }
                    ],
                    telegram: [
                        'telegram', {

                        }
                    ],
                    weight: [
                        'weight', {
                            rules: [
                                { required: true, message: "权重 不能为空" }
                            ]
                        }
                    ],
                    // min_amount: [
                    //     'min_amount', {
                    //         rules: [
                    //             { required: true, message: "最小金额 不能为空" }
                    //         ]
                    //     }
                    // ],
                    // max_amount: [
                    //     'max_amount', {
                    //         rules: [
                    //             { required: true, message: "最大金额 不能为空" }
                    //         ]
                    //     }
                    // ]
                }
            }
        },
        methods: {
            onSubmit(e) {
                e.preventDefault()
                console.log(this.payTypeRate)
                if (!this.checkRate()) {
                    this.$message.error('请选择通道/费率！');
                    return false;
                }
                this.form.validateFields((err) => {
                    if (!err) {
                        this.saving = true
                        const fields = this.form.getFieldsValue()
                        fields.pay_types = this.payTypeRate;
                        fields.role = this.roleId(fields.role);
                        // console.log(fields)
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
            checkRate() {
                let flag = true;
                for (const item of this.payTypeRate) {
                    if (item.rate == null
                        || item.pay_type_id == null
                        // || item.weight == null
                        || item.min_amount == null
                        || item.max_amount == null) {
                        flag = false;
                    }
                }
                return flag;
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
                        role: data.role.slug,
                        telegram: data.telegram,
                        weight: data.weight
                    })

                    this.payTypeRate = data.pay_type_users;

                    this.getParentUser(null, data)
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                })
            },

            roleId(slug) {
                let id = null;
                for (const item of this.roles) {
                    if (item.slug == slug) {
                        id = item.id;
                        break;
                    }
                }
                return id;
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
            setAmountRole() {
                // this.decorator.weight[1].rules[0] = { required: true, message: "权重 不能为空" }
                // this.decorator.min_amount[1].rules[0] = { required: true, message: "最小金额 不能为空" }
                // this.decorator.max_amount[1].rules[0] = { required: true, message: "最大金额 不能为空" }
                this.decorator.weight[1].rules[0].required = true
                // this.decorator.min_amount[1].rules[0].required = true
                // this.decorator.max_amount[1].rules[0].required = true
            },
            // 查上级
            getParentUser(value, data) {
                let role = (data.role ? data.role.slug : null) || value;
                if (role != 'collect' && role != 'client') {
                    this.parentShow = false;
                    return false;
                }
                this.parentShow = true;
                if (role == 'collect') {
                    this.decorator.weight[1].rules[0].required = true
                    this.amountShow = true;
                } else {
                    this.decorator.weight[1].rules[0].required = false
                    this.amountShow = false;
                }
                // let role_arr = ['', 'development', 'administrator', 'client', 'collect'];
                const query = {
                    search: { ...this.conditions, role: role },
                    limit: 10000,
                    page: 1,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    this.parentList = [];
                    const { list } = res.data.data
                    for (const index in list.data) {
                        if (list.data[index].id == this.$route.params.id) {
                            list.data.splice(index, 1)
                        }
                    }
                    this.parentList.push(...list.data)
                    this.form.setFieldsValue({
                        parent_id: data.parent_id != 0 ? data.parent_id : null,
                    })

                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {

                })
            },
            // 查通道
            getPayTypes() {
                const query = {
                    limit: 9999,
                }
                request(PAY_TYPE, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    list.data.forEach(item => {
                        item.selected = false;
                    })
                    this.payTypes.splice(0, this.payTypes.length)
                    this.payTypes.push(...list.data)
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                })
            },
            setPayTypesSelected() {
                for (const type of this.payTypes) {
                    type.selected = false;
                    for (const rate of this.payTypeRate) {
                        if (type.id == rate.pay_type_id) {
                            type.selected = true;
                        }
                    }
                }
            },
            addRow() {
                if (!this.checkRate()) {
                    this.$message.error('请选择通道/费率/最小金额/最大金额/权重！');
                    return false;
                }
                for (const type of this.payTypes) {
                    if (!type.selected) {
                        this.payTypeRate.push({
                            id: this.payTypeRate.length,
                            pay_type_id: null,
                            rate: null,
                            // weight: 0,
                            min_amount: 0,
                            max_amount: 99999
                        })
                        break;
                    }
                }
            },
            delRow(index) {
                this.payTypeRate.splice(index, 1);
                this.setPayTypesSelected();
            },
        },
        mounted() {

        },
        created() {
            if (this.$route.params.id !== undefined) {
                this.get(this.$route.params.id)
                this.decorator.password[1].rules[0] = {}
            } else {
                this.$nextTick(() => {
                    this.form.setFieldsValue({ weight: 0 })
                })
            }

            this.getRoles();
            this.getPayTypes()
        }
    }
</script>