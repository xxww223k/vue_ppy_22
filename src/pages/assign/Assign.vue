<template>
    <div>
        <a-row>
            <a-col :span="24">
                <a-select placeholder="请选择 商户" v-model="client" allowClear showSearch optionFilterProp="children" @change="selectChange" style="width: 100%">
                    <a-select-option v-for="client in clients" :key="client.id" :value="client.id">
                        {{ client.full_name }}
                    </a-select-option>
                </a-select>
            </a-col>
        </a-row>
        <a-row style="margin-top: 20px;">
            <a-col :span="24">
                <a-transfer :data-source="data" :render="item => item.title" :targetKeys="targetKeys" @change="change" :disabled="!client"></a-transfer>
            </a-col>
        </a-row>
    </div>
</template>

<script>
import { request, METHOD } from "@/utils/request";
import { USER as URL, ASSIGN } from "@/services/api";

export default {
    data() {
        return {
            users: [],
            data: [],
            targetKeys: [],
            client: null,
        }
    },
    computed: {
        clients() {
            return this.users.filter((user) => {
                return user.role.slug == 'client'
            })
        }
    },
    methods: {
        // 查
        getUser(id) {
            request(`${URL}/${id}`, METHOD.GET).then((res) => {
                this.targetKeys.splice(0, this.targetKeys.length)
                res.data.data.collects.forEach(val => {
                    this.targetKeys.push(val.toString())
                })
            }).catch((e) => {
                console.log(e)
                this.$message.error('系统出错了~')
            })
        },
        // 查
        getUsers() {
            const query = {
                limit: 9999,
            }
            request(URL, METHOD.GET, query).then((res) => {
                const { list } = res.data.data
                this.users.splice(0, this.users.length)
                this.users.push(...list.data)
                // 设置源数据
                this.data.splice(0, this.data.length)
                this.users.forEach(user => {
                    if (user.role.slug == 'collect') {
                        this.data.push({
                            key: user.id.toString(),
                            title: user.full_name,
                        });
                    }
                })
            }).catch((e) => {
                console.log(e)
                this.$message.error('系统出错了~')
            })
        },
        // 改变
        change(targetKeys) {
            this.targetKeys = targetKeys
            request(ASSIGN, METHOD.POST, { user_id: this.client, collects: this.targetKeys }).then((res) => {
                if (res.data.code == 0) {
                    this.$message.success(res.data.message)
                } else {
                    this.$message.error(res.data.message)
                }
            })
        },
        selectChange(val) {
            if (val !== undefined) {
                this.getUser(val)
            }
        }
    },
    created() {
        this.getUsers()
    }
}
</script>