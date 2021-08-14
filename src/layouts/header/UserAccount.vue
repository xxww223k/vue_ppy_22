<template>
    <div>

        <div style="overflow: hidden;">
            <div style="float: left;padding: 0 10px;" @click="get()">
                <a-icon :spin="spin" type="redo" />
            </div>
            <div style="float: left;padding: 0 10px;">
                钱包：<span style="font-weight: 600;">{{balance}}</span>
            </div>
            <div style="float: left;padding: 0 10px;">
                信用：<span style="font-weight: 600;">{{format_credit}}</span>
            </div>
        </div>

        <!-- <a-popover>
            <template slot="content">钱包</template>
            <a-tag color="pink">{{ balance }} </a-tag>
        </a-popover>


        <a-popover>
            <template slot="content">信用</template>
            <a-tag color="red">{{ format_credit }} </a-tag>
        </a-popover> -->
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { USER as URL } from "@/services/api";
    export default {
        data() {
            return {
                balance: null,
                format_credit: null,
                interval: null,
                spin: false
            }
        },
        created() {
            this.get();
            this.interval = setInterval(() => {
                this.get();
            }, 60 * 1000)
        },
        beforeDestroy() {
            clearInterval(this.interval)
        },
        methods: {
            // 查
            get() {
                this.spin = true;
                const query = {
                    limit: 999,
                    page: 1,
                }
                request(URL + '/' + sessionStorage.getItem('ui'), METHOD.GET, query).then((res) => {
                    const { data } = res.data
                    this.format_credit = data.format_credit;
                    this.balance = data.balance;
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.spin = false;
                })
            },
        },
    }
</script>

<style>

</style>