<template>
    <div>
        <a-card>
            <div slot="extra">
                <router-link :to="`/form${this.$route.path}`">
                    <a-button type="primary">新建</a-button>
                </router-link>
            </div>
            <a-tabs tabPosition="right">
                <a-tab-pane key="1" tab="管理员">
                    <admin-list />
                </a-tab-pane>
                <a-tab-pane key="2" tab="商户">
                    <client-list />
                </a-tab-pane>
                <a-tab-pane key="3" tab="代收">
                    <collect-list />
                </a-tab-pane>
            </a-tabs>
        </a-card>
    </div>
</template>

<script>
import AdminList from './admin/List.vue'
import CollectList from './collect/List.vue'
import ClientList from './client/List.vue'


export default {
    components: { AdminList, CollectList, ClientList },
}
</script>