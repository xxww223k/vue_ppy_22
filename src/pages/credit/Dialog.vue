<template>
    <div>
        <a-modal title="代收信用" :visible="visible" :confirm-loading="confirmLoading" @ok="onSubmit"
            @cancel="handleCancel">
            <a-form @submit="onSubmit" :form="form" :colon="false" :layout="formLayout">
                <a-form-item style="display: none;">
                    <a-input type="hidden" disabled autocomplete="off" v-decorator="decorator.id" />
                </a-form-item>
                <a-row :gutter="{ md: 40 }">
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="用户">
                            <a-select placeholder="请选择 用户" v-decorator="decorator.user_id">
                                <a-select-option v-for="user in users" :key="user.id" :value="user.id">
                                    {{ user.full_name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="金额">
                            <a-input-number style="width: 100%;"
                                :formatter="value=> `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')" allowClear
                                placeholder="请输入 金额" v-decorator="decorator.amount" autocomplete="off" />
                        </a-form-item>
                    </a-col>
                    <a-col :md="{ span: 24 }">
                        <a-form-item label="备注">
                            <a-textarea allowClear placeholder="请输入 备注" v-decorator="decorator.remark"
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
    import { USER as URL, CREDIT } from "@/services/api";

    export default {
        data() {
            return {
                visible: false,
                confirmLoading: false,
                saving: false,
                formLayout: "vertical",
                types: [
                    { id: 5, name: '普通' }
                ],
                users: [],
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
                    user_id: [
                        "user_id",
                        {
                            rules: [
                                { required: true, message: "用户 不能为空" }
                            ]
                        }
                    ],
                    amount: [
                        "amount",
                        {
                            rules: [
                                { required: true, message: "金额 不能为空" }
                            ]
                        }
                    ],
                    remark: [
                        "remark",
                        {
                            rules: [

                            ]
                        }
                    ]
                }
            }
        },
        methods: {
            showModal() {
                this.visible = true;
                this.users = [];
                this.$nextTick(() => {
                    this.getUser();
                    this.form.resetFields();
                })
            },
            handleCancel() {
                this.visible = false;
            },
            getUser() {
                const query = {
                    limit: 9999,
                    page: 1,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    for (const item of list.data) {
                        if (item.role.slug == "collect") {
                            this.users.push(item)
                        }
                    }
                    console.log(this.users)
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
                        this.saving = true
                        const fields = this.form.getFieldsValue()
                        const method = fields.id === undefined ? METHOD.POST : METHOD.PUT
                        // const url = fields.id === undefined ? URL : `${URL}/${fields.id}`
                        request(CREDIT, method, fields).then(this.afterSubmit).catch(() => {
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
                    this.$emit('close');
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
        background: none !important;
    }
</style>