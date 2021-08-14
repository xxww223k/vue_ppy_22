<template>
    <div>
        <a-card>
            <a-card-grid v-for="user in dataSource" :key="user.id" style="width:10%; text-align:center">
                <a-tag>{{ user.full_name }}</a-tag>
                <div style="height: 10px;"></div>
                <a-tag>{{ user.format_credit }}</a-tag>
            </a-card-grid>
        </a-card>
    </div>
</template>

<script>
import { request, METHOD } from "@/utils/request";
import { USER as URL } from "@/services/api";

export default {
    data() {
        return {
            dataSource: [],
        }
    },
    methods: {
        // 查
        get() {
            const query = {
                limit: 9999,
                search: { role: 'collect' },
            }
            request(URL, METHOD.GET, query).then((res) => {
                const { list } = res.data.data
                this.dataSource.splice(0, this.dataSource.length)
                this.dataSource.push(...list.data)
                console.log(this.dataSource)
            }).catch((e) => {
                console.log(e)
                this.$message.error('系统出错了~')
            })
        },
    },
    created() {
        this.get()
    }
}
</script>

<style lang="less">
</style>