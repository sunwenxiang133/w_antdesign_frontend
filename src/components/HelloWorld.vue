<template>
  <a-layout style="height: 100vh">
    <a-card
      :title="allData.name"
      :bordered="false"
      style="width: 100%; padding: 30px; background-color: #e0e0e0"
    >
      <a-row>
        <a-col :span="8">
          <a-statistic title="设备类型" :value="allData.deviceType" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="ip地址" :value="allData.ip" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="状态" :value="allData.status" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="执行中任务" :value="allData.runningTask" />
        </a-col>
      </a-row>
    </a-card>
    <a-layout-content
      style="padding: 24px; display: flex; flex-wrap: wrap; gap: 24px"
    >
      <div
        v-for="chart in charts"
        :key="chart.key"
        style="flex: 1 1 300px; min-width: 300px"
      >
        <div :id="chart.id" style="width: 100%; height: 400px"></div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import { useRouter, useRoute } from 'vue-router'

// 定义响应式变量
const selectedChart = ref('cpu')
const chartData = ref({
  cpu: { used: 0, free: 0 },
  gpu: { used: 0, free: 0 },
  npu: { used: 0, free: 0 }
})

const router = useRouter()
const route = useRoute()

const charts = [
  { key: 'cpu', id: 'cpuChart', title: 'CPU Usage' },
  { key: 'gpu', id: 'gpuChart', title: 'GPU Usage' },
  { key: 'npu', id: 'npuChart', title: 'NPU Usage' }
]

// 获取数据函数
const fetchData = async () => {
  try {
    chartData.value = {
      cpu: {
        used: 30,
        free: 70
      },
      gpu: {
        used: 45,
        free: 55
      },
      npu: {
        used: 60,
        free: 40
      }
    }

    renderCharts()
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
  }
}

const allData = ref({
  id: 4,
  name: 'jetson-nx',
  deviceType: 'jetson',
  serialNumber: '1424823233219',
  ip: '192.168.1.103',
  status: 0,
  cpu: 24.346826630473295,
  gpu: 0,
  npu: 0,
  networkUpload: 298.24,
  networkDownload: 30.528,
  memoryUsed: 3419.20703125,
  memoryTotal: 15388.46484375,
  runningTask: 0,
  metrics: '',
  lastSeen: '',
  createAt: '',
  updatedAt: ''
})

// 渲染图表函数
const renderCharts = () => {
  charts.forEach(chart => {
    const chartInstance = echarts.init(document.getElementById(chart.id))
    const data = chartData.value[chart.key]

    const option = {
      title: {
        text: chart.title,
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: chart.title,
          type: 'pie',
          radius: '50%',
          data: [
            { value: data.used, name: 'Used' },
            { value: data.free, name: 'Free' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }

    chartInstance.setOption(option)
  })
}

// 初次加载数据
onMounted(() => {
  console.log(route.query, route)

  fetchData()
})
</script>

<style>
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
