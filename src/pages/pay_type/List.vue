<template>
    <div>
        <a-card>
            <div slot="extra">
                <a-button type="primary" @click="openFormDialog()">新建</a-button>
            </div>
            <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading"
                @refresh="onRefresh" @search="onSearch" :title="title" :row-selection="rowSelection"
                :pagination="pagination" @change="onPageChange" :scroll="{ x: true }">
                <!-- 通道名 -->
                <template slot="name" slot-scope="row">
                    <a-tag color="blue" v-if="row.record.type == 1">{{ row.record.name }}</a-tag>
                    <a-tag color="green" v-else-if="row.record.type == 2">{{ row.record.name }}</a-tag>
                </template>
                <!-- 类型 -->
                <template slot="type" slot-scope="row">
                    <a-tag color="blue" v-if="row.text == 1">平台</a-tag>
                    <a-tag color="green" v-else-if="row.text == 2">第三方</a-tag>
                </template>
                <!-- url -->
                <template slot="post" slot-scope="row">
                    <a>{{ row.text }}</a>
                </template>
                <template slot="get" slot-scope="row">
                    <a>{{ row.text }}</a>
                </template>
                <!-- 商户号 -->
                <template slot="appid" slot-scope="row">
                    <a-tag v-show="row.text" color="purple">{{ row.text }}</a-tag>
                </template>
                <!-- 操作列 -->
                <template slot="operation" slot-scope="row">
                    <a-button-group size="small">
                        <!-- <router-link :to="`/form${$route.path}/${row.record.id}`"> -->
                        <a-button type="link" size="small" @click="openFormDialog(row.record.id)">编辑</a-button>
                        <!-- </router-link> -->
                        <a-popconfirm title="确认要删除这条数据吗？" ok-text="确认" cancel-text="取消" @confirm="del(row)">
                            <a-button type="link" size="small">删除</a-button>
                        </a-popconfirm>
                    </a-button-group>
                </template>
            </advance-table>
        </a-card>
        <form-dialog ref="formDialog" @get="get()"></form-dialog>
    </div>
</template>

<script>
    import { request, METHOD } from "@/utils/request";
    import { PAY_TYPE as URL } from "@/services/api";
    import FormDialog from './FormDialog.vue'

    const columns = [
        {
            dataIndex: "name",
            key: "name",
            title: "通道名",
            searchAble: true,
            dataType: "string",
            scopedSlots: { customRender: "name" },
        },
        {
            dataIndex: "post",
            key: "post",
            title: "下单地址",
            scopedSlots: { customRender: "post" },
            searchAble: true,
            dataType: "string",
        },
        {
            dataIndex: "get",
            key: "get",
            title: "查单地址",
            scopedSlots: { customRender: "get" },
            searchAble: true,
            dataType: "string",
        },
        {
            dataIndex: "appid",
            key: "appid",
            title: "商户号",
            scopedSlots: { customRender: "appid" },
            searchAble: true,
            dataType: "string",
        },
        {
            dataIndex: "type",
            key: "type",
            title: "归属",
            searchAble: true,
            dataType: "select",
            search: {
                selectOptions: [
                    { value: 1, title: '平台' },
                    { value: 2, title: '第三方' },
                ]
            },
            scopedSlots: { customRender: "type" },
        },
        {
            title: "",
            dataIndex: "operation",
            scopedSlots: { customRender: "operation" },
            align: "right"
        },
    ]
    export default {
        components: { FormDialog },
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
            openFormDialog(id = null) {
                this.$refs.formDialog.showModal(id);
            },
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