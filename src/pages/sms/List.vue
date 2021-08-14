<template>
    <div>
        <a-card>
            <!-- <div slot="extra">
                <router-link :to="`/form${this.$route.path}`">
                    <a-button type="primary">新建</a-button>
                </router-link>
            </div> -->
            <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
                @refresh="onRefresh" @search="onSearch" :title="title" :row-selection="rowSelection"
                :pagination="pagination" @change="onPageChange" :scroll="{ x: true }">
                <!-- 已方 -->
                <template slot="self" slot-scope="row">
                    <a-tag color="blue" v-show="row.record.bank_account">{{ row.record.bank_account ?
                        row.record.bank_account.name : '无' }}</a-tag>
                    <a-tag color="pink" v-show="row.record.bank_account">{{ row.record.bank_account ?
                        row.record.bank_account.number : '无' }}</a-tag>
                    <a-tag v-show="row.record.self_number" color="green">{{ row.record.self_number }}</a-tag>
                </template>
                <!-- 对方 -->
                <template slot="other_party" slot-scope="row">
                    <a-tag v-show="row.record.other_party_name" color="cyan">{{ row.record.other_party_name }}</a-tag>
                    <a-tag v-show="row.record.other_party_number" color="cyan">{{ row.record.other_party_number }}
                    </a-tag>
                </template>
                <!-- 处理结果 -->
                <template slot="result" slot-scope="row">
                    <a-tag v-if="row.text">{{row.text}}</a-tag>
                </template>
                <!-- 类别 -->
                <template slot="type" slot-scope="row">
                    <a-tag v-if="row.text == 1" color="green">入帐</a-tag>
                    <a-tag v-if="row.text == 2" color="red">出帐</a-tag>
                    <a-tag v-if="row.text == 3" color="blue">验证码</a-tag>
                    <a-tag v-if="row.text == 4" color="blue">短信服务</a-tag>
                    <a-tag v-if="row.text == 5">其他</a-tag>
                </template>
                <!-- 信息 -->
                <template slot="content" slot-scope="row">
                    <a-tag>{{ row.record.content }}</a-tag>
                    <template v-if="row.record.remark">
                        <div style="height: 8px;"></div>
                        <a-tag color="red">{{ row.record.remark }}</a-tag>
                    </template>
                </template>
                <!-- 资金 -->
                <template slot="amount" slot-scope="row">
                    <a-tag color="green" v-if="row.record.type == 1">{{ row.record.format_amount }}</a-tag>
                    <a-tag color="red" v-if="row.record.type == 2">{{ row.record.format_amount }}</a-tag>
                    <a-tag v-show="row.record.format_balance !== '0.00'">{{ row.record.format_balance }}</a-tag>
                </template>
                <!-- 时间 -->
                <template slot="transfer_at" slot-scope="row">
                    <a-tag color="blue" v-show="row.record.transfer_at_text">{{ row.record.transfer_at_text }}</a-tag>
                    <a-tag color="green" v-show="row.record.transfer_at">{{ row.record.transfer_at }}</a-tag>
                </template>
            </advance-table>
        </a-card>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { SMS as URL } from "@/services/api";

    const columns = [
        {
            dataIndex: "type",
            key: "type",
            title: "类别",
            scopedSlots: { customRender: "type" },
        },
        {
            dataIndex: "result",
            key: "result",
            title: "处理结果",
            scopedSlots: { customRender: "result" },
        },
        {
            dataIndex: "self",
            key: "self",
            title: "已方",
            scopedSlots: { customRender: "self" },
        },
        {
            dataIndex: "other_party",
            key: "other_party",
            title: "对方",
            visible: false,
            scopedSlots: { customRender: "other_party" },
        },
        {
            dataIndex: "amount",
            key: "amount",
            title: "资金",
            scopedSlots: { customRender: "amount" },
        },
        {
            dataIndex: "transfer_at",
            key: "transfer_at",
            title: "时间",
            scopedSlots: { customRender: "transfer_at" },
        },
        {
            dataIndex: "content",
            key: "content",
            title: "信息",
            searchAble: true,
            dataType: "string",
            scopedSlots: { customRender: "content" },
        },
        // {
        //     dataIndex: "bank.name",
        //     key: "bank.name",
        //     title: "银行",
        // },
        // {
        //     dataIndex: "bank_account",
        //     key: "bank_account",
        //     title: "账户",
        //     scopedSlots: { customRender: "bank_account" },
        // },
        // {
        //     dataIndex: "remark",
        //     key: "remark",
        //     title: "备注",
        //     searchAble: true,
        //     dataType: "string"
        // },
        {
            dataIndex: "created_at",
            key: "created_at",
            title: "新建于"
        }
    ]
    export default {
        data() {
            return {
                dataSource: [],
                columns,
                loading: false,
                conditions: {},
                title: " ",
                selectedRowKeys: [], // 选中的行
                pagination: {
                    total: 0, // 总条数
                    current: 1, // 当前页码
                    pageSize: 10, // 每页默认条数
                    showSizeChanger: true, // 允许选择每页条数
                    pageSizeOptions: ["10", "20", "50", "100"], // 可选的每页条数
                },
            }
        },
        methods: {
            // 删
            del(row) {
                request(`${URL}/${row.record.id}`, METHOD.DELETE).then(res => {
                    const { message, code } = res.data
                    code >= 0 ? this.$message.success(message) : this.$message.error(message)
                    this.get()
                }).catch(() => {
                    this.$message.error('系统出错了~')
                })
            },
            // 查
            get() {
                this.loading = true
                const query = {
                    search: this.conditions,
                    limit: this.pagination.pageSize,
                    page: this.pagination.current,
                }
                request(URL, METHOD.GET, query).then((res) => {
                    const { list } = res.data.data
                    this.dataSource.splice(0, this.dataSource.length)
                    this.dataSource.push(...list.data)
                    this.pagination.total = list.total
                }).catch(() => {
                    this.$message.error('系统出错了~')
                }).finally(() => {
                    this.loading = false
                })
            },
            // 刷新
            onRefresh() {
                this.get()
            },
            // 过滤
            onSearch(conditions) {
                this.conditions = conditions
                this.get();
            },
            // 分页事件
            onPageChange(pagination) {
                this.pagination.pageSize = pagination.pageSize
                this.pagination.current = pagination.current
                this.get()
            },
            // 选中行触发的事件
            onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys;
            },
        },
        computed: {
            // 行选择器配置
            rowSelection() {
                return {
                    selectedRowKeys: this.selectedRowKeys,
                    onChange: this.onSelectChange,
                    fixed: true,
                    hideDefaultSelections: true,
                    selections: [
                        {
                            key: "delete",
                            text: "删除",
                            onSelect: () => {
                                if (!this.selectedRowKeys.length) {
                                    this.$message.error('未选中任何记录')
                                    return false
                                }
                                request(`${URL}/${this.selectedRowKeys[0]}`, METHOD.DELETE, { data: { batch_delete: this.selectedRowKeys } }).then(res => {
                                    const { message, code } = res.data
                                    code >= 0 ? this.$message.success(message) : this.$message.error(message)
                                    this.get()
                                    this.selectedRowKeys.splice(0, this.selectedRowKeys.length)
                                }).catch(() => {
                                    this.$message.error('系统出错了~')
                                })
                            },
                        },
                    ],
                };
            },
        },
        created() {
            this.get()
        }
    }
</script>

<style lang="less" scoped>
</style>