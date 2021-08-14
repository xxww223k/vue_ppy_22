<template>
    <div>
        <a-dropdown>
            <div class="header-avatar" style="cursor: pointer">
                <a-avatar class="avatar" size="small" shape="circle" :src="user.avatar" />
                <span class="name">{{user.name}}</span>
            </div>
            <a-menu :class="['avatar-menu']" slot="overlay">
                <a-menu-item @click="openPwd">
                    <a-icon type="user" />
                    <span>修改密码</span>
                </a-menu-item>
                <!-- <a-menu-item>
                    <a-icon type="setting" />
                    <span>提现</span>
                </a-menu-item> -->
                <a-menu-divider />
                <a-menu-item @click="logout">
                    <a-icon style="margin-right: 8px;" type="poweroff" />
                    <span>退出登录</span>
                </a-menu-item>
            </a-menu>
        </a-dropdown>
        <edit-password ref="editPassword"></edit-password>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { logout } from '@/services/user'
    import EditPassword from './EditPassword'

    export default {
        name: 'HeaderAvatar',
        components: {
            EditPassword
        },
        computed: {
            ...mapGetters('account', ['user']),
        },
        methods: {
            logout() {
                logout()
                this.$router.push('/login')
            },
            openPwd() {
                console.log(this.$refs)
                this.$refs.editPassword.showModal();
            }
        }
    }
</script>

<style lang="less">
    .header-avatar {
        display: inline-flex;

        .avatar,
        .name {
            align-self: center;
        }

        .avatar {
            margin-right: 8px;
        }

        .name {
            font-weight: 500;
        }
    }

    .avatar-menu {
        width: 150px;
    }
</style>