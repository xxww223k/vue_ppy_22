<template>
    <div>
        <a-card>
            <a-row :gutter="{ md: 40 }">
                <a-col :md="{ span: 24 }">
                    <div id="main" style="height: 400px;"></div>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>

<script>
    import * as echarts from 'echarts';
    import { request, METHOD } from "@/utils/request";
    import { DASHBOARD as URL } from "@/services/api";

    export default {
        data() {
            return {
                x_title: [],
                x_data: [],
            }
        },
        mounted() {

            this.get();
        },
        methods: {
            get() {
                request(URL, METHOD.GET).then((res) => {
                    const { data } = res.data
                    for (const item of data) {
                        this.x_title.push(item.date)
                        let json = {
                            value: item.yuan_success_amount,
                            itemStyle: {
                                color: '#3AA1FF' 
                            }
                        }
                        this.x_data.push(json)
                    }
                    this.init();
                }).catch((e) => {
                    console.log(e)
                    this.$message.error('系统出错了~')
                }).finally(() => {

                })
            },
            init() {
                // 基于准备好的dom，初始化echarts实例
                var myChart = echarts.init(document.getElementById('main'));
                // 绘制图表
                myChart.setOption({
                    tooltip: {},
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    title: {
                        text: '营业额',
                    },
                    xAxis: {
                        type: 'category',
                        data: [...this.x_title]
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: [...this.x_data],
                        type: 'bar'
                    }]
                });
            }
        },
    }
</script>