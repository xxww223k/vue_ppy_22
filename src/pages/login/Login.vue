<template>
    <common-layout>
        <a-card class="box">
            <div class="top">
                <div class="header">
                    <span class="title">{{ systemName }}</span>
                </div>
                <div class="desc">海内存知已，天涯若比邻。</div>
            </div>

            <div class="login">
                <a-form @submit="onSubmit" :form="form">
                    <a-form-item>
                        <a-input placeholder="登录名" autocomplete="off" v-decorator="decorator.username" />
                    </a-form-item>
                    <a-form-item>
                        <a-input placeholder="登录密码" autocomplete="off" v-decorator="decorator.password" />
                    </a-form-item>
                    <a-form-item>
                        <a-button :loading="logging" style="width: 100%" htmlType="submit" type="primary">登录</a-button>
                    </a-form-item>
                </a-form>
            </div>
        </a-card>
    </common-layout>
</template>

<script>
    import CommonLayout from "@/layouts/CommonLayout";
    import { login, getRoutesConfig } from '@/services/user'
    import { setAuthorization } from '@/utils/request'
    import { mapMutations } from 'vuex'
    import { loadRoutes } from '@/utils/routerUtil'

    export default {
        name: "Login",
        components: { CommonLayout },
        data() {
            return {
                form: this.$form.createForm(this),
                logging: false,
                decorator: {
                    username: ["username", {
                        rules: [
                            { required: true, message: '请输入登录名', whitespace: true },
                        ]
                    }],
                    password: ["password", {
                        rules: [
                            { required: true, message: '请输入登录密码', whitespace: true }
                        ]
                    }]
                }
            }
        },
        computed: {
            systemName() {
                return this.$store.state.setting.systemName;
            },
        },
        methods: {
            ...mapMutations('account', ['setUser', 'setPermissions', 'setRoles']),
            onSubmit(e) {
                e.preventDefault()
                this.form.validateFields((err) => {
                    if (!err) {
                        this.logging = true
                        const username = this.form.getFieldValue('username')
                        const password = this.form.getFieldValue('password')
                        login(username, password).then(this.afterLogin).finally(() => {
                            this.logging = false
                        })
                    }
                });
            },
            afterLogin(res) {
                if (res.status === 422) {
                    this.requestErrorHandle(res.data.errors)
                }
                if (res.data.code < 0) {
                    this.$message.error(res.data.message)
                }
                if (res.data.code >= 0) {
                    // console.log(res.data)
                    sessionStorage.setItem('user_role', res.data.data.roles.id)
                    // 登录成功
                    const { user, permissions } = res.data.data
                    this.setUser(user)
                    sessionStorage.setItem('ui', user.id)
                    this.setPermissions(permissions)
                    setAuthorization({ token: res.data.data.access_token })
                    this.$router.push('/dashboard')
                    // 路由配置
                    getRoutesConfig().then(res => {
                        const routesConfig = res.data.data
                        loadRoutes(routesConfig)
                    })
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
            }
        }
    };
</script>

<style lang="less" scoped>
    .common-layout {
        .box {
            max-width: 580px;
            margin: 0 auto;
        }

        .top {
            text-align: center;

            .header {
                height: 44px;
                line-height: 44px;

                a {
                    text-decoration: none;
                }

                .logo {
                    height: 44px;
                    vertical-align: top;
                    margin-right: 16px;
                }

                .title {
                    font-size: 33px;
                    color: @title-color;
                    font-family: "Myriad Pro", "Helvetica Neue", Arial, Helvetica,
                        sans-serif;
                    font-weight: 600;
                    position: relative;
                    top: 2px;
                }
            }

            .desc {
                font-size: 14px;
                color: @text-color-second;
                margin-top: 12px;
                margin-bottom: 40px;
            }
        }

        .login {
            width: 368px;
            margin: 0 auto;

            @media screen and (max-width: 576px) {
                width: 95%;
            }

            @media screen and (max-width: 320px) {
                .captcha-button {
                    font-size: 14px;
                }
            }

            .icon {
                font-size: 24px;
                color: @text-color-second;
                margin-left: 16px;
                vertical-align: middle;
                cursor: pointer;
                transition: color 0.3s;

                &:hover {
                    color: @primary-color;
                }
            }
        }
    }
</style>