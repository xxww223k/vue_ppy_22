<template>
    <div>
        <a-card>
            <!-- <div slot="extra">
                <router-link :to="`/form${this.$route.path}`">
                    <a-button type="primary">新建</a-button>
                </router-link>
            </div> -->

            <div v-if="tabKey=='1'&&role!='client'&&role!='collect'" slot="extra">
                <a-button type="primary" @click="$refs.userDialog.showModal()">新账目</a-button>
            </div>
            <div v-if="tabKey=='3'&&role!='client'&&role!='collect'" slot="extra">
                <a-button type="primary" @click="$refs.creditDialog.showModal()">新信用</a-button>
            </div>
            <div v-if="tabKey=='4'" slot="extra">
                <a-button type="primary" @click="report_form()">生成报表</a-button>
            </div>

            <a-tabs tabPosition="right" :activeKey="tabKey" @change="changeTabKey">
                <a-tab-pane key="1" tab="用户">
                    <user-list ref="userList" />
                </a-tab-pane>
                <a-tab-pane v-if="role!='client' && role!='collect'" key="2" tab="平台">
                    <platform-list />
                </a-tab-pane>
                <a-tab-pane v-if="role!='client'" key="3" tab="信用">
                    <credit-list ref="creditList" />
                </a-tab-pane>
                <a-tab-pane key="4" tab="统计">
                    <collect-list ref="collect" />
                </a-tab-pane>
            </a-tabs>
        </a-card>

        <user-dialog ref="userDialog" @close="$refs.userList.get()"></user-dialog>
        <credit-dialog ref="creditDialog" @close="$refs.creditList.get()"></credit-dialog>
    </div>
</template>

<script>
    import UserList from './user/List.vue'
    import PlatformList from './platform/List.vue'
    import CollectList from '@/pages/report/collect/List.vue'
    import CreditList from '@/pages/credit/List.vue'

    import { request, METHOD } from "@/utils/request";
    import { COLLECT_REPORT as URL } from "@/services/api";

    import UserDialog from './user/Dialog.vue'
    import CreditDialog from '@/pages/credit/Dialog.vue'

    export default {
        components: { UserList, PlatformList, CollectList, CreditList, UserDialog, CreditDialog },
        data() {
            return {
                tabKey: "1",
                role: null,
            }
        },
        methods: {
            openUser() {

            },
            report_form() {
                request(URL, METHOD.POST).then((res) => {
                    console.log(res)
                    this.$refs.collect.get();
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {

                })
            },
            changeTabKey(val) {
                // console.log(val)                
                this.tabKey = val;
            }
        },
        created() {
            this.role = sessionStorage.getItem('user_role')
        },
    }
</script>