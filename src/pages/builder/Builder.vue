<template>
    <div>
        <a-form :colon="false" layout="vertical">
            <a-card>
                <a-form-item>
                    <a-radio-group v-model="type">
                        <a-radio-button value="table">表格</a-radio-button>
                        <a-radio-button value="form">表单</a-radio-button>
                    </a-radio-group>
                </a-form-item>
            </a-card>

            <a-card style="margin-top: 10px">
                <div slot="extra">
                    <a-button-group>
                        <a-button type="primary" @click="addRow">新建</a-button>
                        <a-button type="primary" @click="copy">复制</a-button>
                    </a-button-group>
                </div>
                <a-table :data-source="data" row-key="id" :pagination="false">
                    <a-table-column title="键" data-index="dataIndex">
                        <template slot-scope="text, record">
                            <a-input v-model="record.dataIndex"></a-input>
                        </template>
                    </a-table-column>
                    <a-table-column title="字段名" data-index="title">
                        <template slot-scope="text, record">
                            <a-input v-model="record.title"></a-input>
                        </template>
                    </a-table-column>
                    <a-table-column title="过滤" data-index="searchAble">
                        <template slot-scope="text, record">
                            <a-switch default-checked v-model="record.searchAble">
                                <a-icon slot="checkedChildren" type="check" />
                                <a-icon slot="unCheckedChildren" type="close" />
                            </a-switch>
                        </template>
                    </a-table-column>
                    <a-table-column title="数据类型" data-index="dataType">
                        <template slot-scope="text, record">
                            <a-select v-model="record.dataType">
                                <a-select-option value="string">string</a-select-option>
                                <a-select-option value="boolean">boolean</a-select-option>
                                <a-select-option value="select">select</a-select-option>
                                <a-select-option value="date">date</a-select-option>
                                <a-select-option value="time">time</a-select-option>
                                <a-select-option value="datetime">datetime</a-select-option>
                                <a-select-option value="datetimeRange">datetimeRange</a-select-option>
                            </a-select>
                        </template>
                    </a-table-column>
                    <a-table-column align="right">
                        <template slot-scope="text, record, index">
                            <a-button type="link" @click="delRow(index)">删除</a-button>
                        </template>
                    </a-table-column>
                </a-table>
            </a-card>
        </a-form>
    </div>
</template>

<script>

export default {
    data() {
        return {
            type: "",
            title: "", // 表格的标题
            data: [],
        }
    },
    computed: {
        columns() {
            let columns = `const columns = [`
            for (let i = 0; i < this.data.length; i++) {
                columns += `
    {
        dataIndex: "${this.data[i].dataIndex}",
        key: "${this.data[i].dataIndex}",
        title: "${this.data[i].title}",
        searchAble: ${this.data[i].searchAble},
        dataType: "${this.data[i].dataType}"
    },
`
            }
            columns += `
    {
        title: "",
        dataIndex: "operation",
        scopedSlots: { customRender: "operation" },
        align: "right"
    },
`
            columns += `]`
            return columns
        },
        table() {
            const code = `
<template>
    <div>
        <a-card>
            <div slot="extra">
                <router-link :to="\`/form\${this.$route.path}\`">
                    <a-button type="primary">新建</a-button>
                </router-link>
            </div>
            <advance-table row-key="id" :data-source="dataSource" :columns="columns" size="middle" :loading="loading" @refresh="onRefresh" @search="onSearch" :title="title" :row-selection="rowSelection" :pagination="pagination" @change="onPageChange" :scroll="{ x: true }">
                <!-- 操作列 -->
                <template slot="operation" slot-scope="row">
                    <a-button-group size="small">
                        <router-link :to="\`/form\${$route.path}/\${row.record.id}\`">
                            <a-button type="link" size="small">编辑</a-button>
                        </router-link>
                        <a-popconfirm title="确认要删除这条数据吗？" ok-text="确认" cancel-text="取消" @confirm="del(row)">
                            <a-button type="link" size="small">删除</a-button>
                        </a-popconfirm>
                    </a-button-group>
                </template>
            </advance-table>
        </a-card>
    </div>
</template>

<script>
import { request, METHOD } from "@/utils/request";
import { YOUR_URL as URL } from "@/services/api";

${this.columns}
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
            request(\`\${URL}/\${row.record.id}\`, METHOD.DELETE).then(res => {
                const { message, code } = res.data
                code >= 0 ? this.$message.success(message) : this.$message.error(message)
                this.get()
            }).catch(()=> {
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
                            request(\`\${URL}/\${this.selectedRowKeys[0]}\`, METHOD.DELETE, { data: { batch_delete: this.selectedRowKeys} }).then(res => {
                                const { message, code } = res.data
                                code >= 0 ? this.$message.success(message) : this.$message.error(message)
                                this.get()
                                this.selectedRowKeys.splice(0, this.selectedRowKeys.length)
                            }).catch(()=> {
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
<\\/script>

<style lang="less" scoped>
</style>
            `
            console.log(code)
            return code
        }
    },
    methods: {
        addRow() {
            this.data.push({ id: this.data.length, dataIndex: "", title: "" })
        },
        delRow(index) {
            this.data.splice(index, 1)
        },
        copy() {
            if (this.type == 'table') {
                console.log(this.table)
            } else if (this.type == 'form') {
                console.log(this.form)
            } else {
                console.log('请选择代码类型')
            }
        }
    }
}
</script>

<style lang="less" scoped>
</style>