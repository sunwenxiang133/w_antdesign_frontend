<template>
  <a-layout style="height: 100vh">
    <a-card
      :bordered="false"
      style="width: 100%; padding: 30px; background-color: #e0e0e0"
    >
      <div v-if="!isEditing" style="display: flex;align-items: center;flex-direction: row;">
        <span  style="font-size: 24px;margin-right: 5px;">{{ tmpName }}</span>
        <EditOutlined @click="isEditing = true" style="font-size:  16px"/>
      </div>
      <div v-else>
        <a-input
        v-model:value="tmpName"
        @blur="handleBlur()"
        @pressEnter="HandleDeviceUpdate(tmpName)"
        />
      </div>
      
      <a-row :gutter="[16, 16]">
        <a-col :span="8">
          <a-statistic title="设备类型" :value="allData.deviceType" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="ip地址" :value="allData.ip" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="执行中任务" :value="allData.runningTask" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="内存占用" :value="memoryData[0].value" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="剩余内存" :value="memoryData[1].value" />
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
        {{ chart.id }}
        <div :id="chart.id" style="width: 100%; height: 400px"></div>
      </div>
      <div key="network" style="flex: 1 1 100%; min-width: 300px">
        <div id="network" style="width: 100%; height: 400px"></div>
      </div>
    </a-layout-content>
    <a-table
      style="margin-top: 2vh"
      :columns="columns"
      :data-source="deployLists"
      :pagination="pagination"
      >
      <!-- :show-total="total => `一共${pagination.value.total}`" -->
      <template #headerCell="{ column }">
        <template v-if="column.key === 'deviceName'">
          <span>
            <smile-outlined />
            设备
          </span>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a>
            <template v-if="record.status === 0">
              下载代码 ({{ record.progress }}%)
            </template>
            <template v-if="record.status === 1">
              下载模型 ({{ record.progress }}%)
            </template>
            <template v-if="record.status === 2"> 已部署 </template>
            <template v-if="record.status === 3"> 部署失败 </template>
            <template v-if="record.status === 4"> 设备离线 </template>
            <template v-if="record.status === 5"> 未运行 </template>
          </a>
        </template>

        <!-- <template v-if="column.key === 'progress'">
          <a-progress :percent="record.progress" />
        </template> -->

        <template v-else-if="column.key === 'action'">
          <a-button
            style="margin-right: 1vw"
            @click="deployRestartClicked(record.deployId)"
            >重启</a-button
          >
          <a-button @click="deployStopClicked(record.deployId)">停止</a-button>
          <a-button @click="deployDeleteClicked(record.deployId)"
            >删除</a-button
          >
        </template>
      </template>
    </a-table>
    <a-modal
      v-model:open="isModalVisible"
      title="确定删除吗"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>点击删除此项</p>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import { useRouter, useRoute } from 'vue-router'
import { DeviceList, DeployListDevice,DeviceUpdate } from '../api/api'
import { useAllStore } from '../store/allStore.js'
import { EditOutlined } from '@ant-design/icons-vue';
// import { log } from 'echarts/types/src/util/log.js'

const allStore = useAllStore()

const isEditing = ref(false)

// 定义响应式变量
const selectedChart = ref('cpu')
const chartData = ref({
  cpu: { used: 0, free: 0 },
  gpu: { used: 0, free: 0 },
  npu: { used: 0, free: 0 }
})

const handleBlur =() =>{
      // 在 `blur` 事件中更新 `isEditing` 的逻辑，防止干扰 v-model
      // this.$nextTick(() => {
        isEditing.value = false;
      // });

    }

const HandleDeviceUpdate=async(name)=>{
  console.log('123123123',name);
  
  let tmp=await DeviceUpdate({
    id:Number(route.path.slice(7)),
    name:name
  })
  console.log(tmp.data);
  isEditing = true
}

const memoryData = ref([
  { value: 298.24, name: 'memoryUsed' },
  { value: 30.528, name: 'memoryFree' }
])

const columns = [
  {
    name: '设备',
    dataIndex: 'deviceName',
    key: 'deviceName'
  },
  {
    title: '项目',
    dataIndex: 'projectName',
    key: 'projectName'
  },
  {
    title: '模型',
    dataIndex: 'modelName',
    key: 'modelName'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    key: 'deviceType'
  },
  {
    title: '部署时间',
    dataIndex: 'deployAt',
    key: 'deployAt'
  }

  // {
  //   title: 'Action',
  //   key: 'action'
  // }
]

const deployLists = ref([])

const networkUploadData = ref([0, 0, 0, 0, 0, 0, 0])
const networkDownloadData = ref([0, 0, 0, 0, 0, 0, 0])

let pagination = ref({
  // 数据总数
  total: 10,
  // 当前页数
  current: 1,
  // 每页条数
  pageSize: 4,
  // 展示总数
  showTotal: total => `共 ${total} 条`,
  // 是否可以改变 pageSize
  showSizeChanger: true,
  // 设置每页可以展示多少条的选项
  pageSizeOptions: ['2', '5', '8', '4'],
  // 改变 pageSize 后触发
  showSizeChange: (current, pageSize) => (
    (pagination.value.current = current), (pagination.value.pageSize = pageSize)
  ),
  // 小尺寸分页
  size: 'small',
  // 是否可以快速跳转至某页
  showQuickJumper: true,
  //默认条数
  defaultPageSize: 4
})

const router = useRouter()
const route = useRoute()

const charts = [
  { key: 'cpu', id: 'cpuChart', title: 'CPU Usage' },
  { key: 'gpu', id: 'gpuChart', title: 'GPU Usage' },
  { key: 'npu', id: 'npuChart', title: 'NPU Usage' },
  // { key: 'memory', id: 'memory', title: 'Memory Usage' },
  //{ key: 'network', id: 'network', title: 'Network Usage' }
]

const chartsRender = [
  { key: 'cpu', id: 'cpuChart', title: 'CPU Usage' },
  { key: 'gpu', id: 'gpuChart', title: 'GPU Usage' },
  { key: 'npu', id: 'npuChart', title: 'NPU Usage' },
  // { key: 'memory', id: 'memory', title: 'Memory Usage' },
  { key: 'network', id: 'network', title: 'Network Usage' },
  { key: 'gpuPic', id: 'gpuPic', title: 'GPU Pic' },
  { key: 'cpuPic', id: 'cpuPic', title: 'CPU Pic' },
]

const deviceType = ref('')
// 获取数据函数
const fetchData = async () => {
  try {
    chartData.value = {
      cpu: 70,
      gpu: 0,
      npu: 0
    }
    let tmp = await DeviceList()
    tmp.data.onlineList.forEach(element => {
      console.log(
        route.params.id + '',
        element.id,
        element.id + '' === route.params.id
      )
      tmpName.value=element.name
      if (element.id + '' === route.params.id + '') {
        console.log('道爷，我成了')
        deviceType.value = element.deviceType
        chartData.value.cpu = element.cpu.toFixed(2)
        chartData.value.gpu = element.gpu
        chartData.value.npu = element.npu
        allData.value.ip = element.ip
        console.log('###',element.memoryTotal ,element.memoryUsed);
        
        memoryData.value[0].value = element.memoryUsed
        memoryData.value[1].value = element.memoryTotal - element.memoryUsed
        let tmp = [...networkUploadData.value]
        tmp.push((element.networkUpload*100).toFixed(6))
        tmp.shift()
        
        networkUploadData.value = [...tmp]
        console.log('####',tmp,networkUploadData.value);
        let tmp2 = [...networkDownloadData.value]
        tmp.push((element.networkDownload*100).toFixed(6))
        tmp.shift()
        networkDownloadData.value = [...tmp2]
      }
    })

    renderCharts()
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
  }
}

const tmpName=ref('')

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
  chartsRender.forEach(chart => {
    console.log('testtest', chart.id)
    if (deviceType.value === 'jetson') {
      if (chart.key === 'npu') {
        return
      }
    }
    if (deviceType.value === 'ascend') {
      if (chart.key === 'gpu') {
        return
      }
    }
    if (deviceType.value === 'zk') {
      if (chart.key === 'npu') {
        return
      }
    }
    const chartInstance = echarts.init(document.getElementById(chart.id))
    const data = chartData.value[chart.key]

    const option1 = {
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
          type: 'gauge',
          progress: {
            show: true,
            width: 18
          },
          axisLine: {
            lineStyle: {
              width: 18
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: '#999'
            }
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 16
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10
            }
          },
          data: [
            {
              value: chartData.value[chart.key]
            }
          ]
        }
      ]
    }

    const option2 = {
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
          name: 'Access From',
          type: 'pie',
          radius: '50%',
          data: [
            { value: memoryData.value[0].value, name: 'Memory Used' },
            { value: memoryData.value[1].value, name: 'Memory Free' }
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
    const option3 = {
      title: {
        text: chart.title,
        left: 'center'
      },
      tooltip: {
    trigger: 'axis',
     //formatter: networkHandleFunc(params)
  },
    legend: {
    data: [`'上行占用 (%)' , '下行占用 (%)'`]
  },
      xAxis: {
        type: 'category',
        data: [
          '-6s',
          '-5s',
          '-4s',
          '-3s',
          '-2s',
          '-1s',
          '0'
        ]
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '上行占用 (%)',
          type: 'line',
          //stack: 'Total',
          data: networkUploadData.value,
          
        },
        {
          name: '下行占用 (%)',
          type: 'line',
          //stack: 'Total',
          data: networkDownloadData.value,
        
        }
      ]
    }

    if (chart.key === 'gpu' || chart.key === 'npu' || chart.key === 'cpu') {
      chartInstance.setOption(option1)
    }
    if (chart.key === 'memory') {
      chartInstance.setOption(option2)
    }
    if (chart.key === 'network') {
      chartInstance.setOption(option3)
    }
    if (chart.key === 'gpuPic') {
      chartInstance.setOption(option3)
    }
    if (chart.key === 'cpuPic') {
      chartInstance.setOption(option3)
    }
  })
}

let fastRequest = true

const getCurrentTime = (num) => {
  let currentDateTime = new Date()
  let hours = currentDateTime.getHours().toString().padStart(2, '0')
  let minutes = currentDateTime.getMinutes().toString().padStart(2, '0')
  let seconds = currentDateTime.getSeconds().toString().padStart(2, '0')-1

  return `${hours}:${minutes}:${seconds}`
}

const memoryHandleData=(num)=>{
  return (num/1024).toFixed(2) + 'GB'
}

const startExecution = () => {
  let interval = 1000
  let timerId

  const executeFunction = async () => {
    let tmp = await DeviceList()

    if (route.path !== allStore.currentUrl) {
      fastRequest = false
    }

    tmp.data.onlineList.forEach(element => {
      if (element.id + '' === route.params.id + '') {
        console.log('123 道爷，我成了')
        chartData.value.cpu = element.cpu.toFixed(2)
        chartData.value.gpu = element.gpu
        chartData.value.npu = element.npu
        allData.value.ip = element.ip

        memoryData.value[0].value = memoryHandleData(element.memoryUsed)
        memoryData.value[1].value = memoryHandleData(element.memoryTotal - element.memoryUsed)
        let tmp = [...networkUploadData.value]
        tmp.push((element.networkUpload*100).toFixed(6))
        tmp.shift()
        networkUploadData.value = [...tmp]
        console.log('####',tmp,networkUploadData.value);
        let tmp2 = [...networkDownloadData.value]
        tmp2.push((element.networkDownload*100).toFixed(6))
        tmp2.shift()
        networkDownloadData.value = [...tmp2]
      }
      if (!fastRequest) {
        clearInterval(timerId)
        interval = 600000000
        timerId = setInterval(executeFunction, interval)
      }
    })

    renderCharts()
  }

  timerId = setInterval(executeFunction, interval)
}

const networkHandleFunc=(speed)=>{
  if(speed>1000){
    return (speed/1000).toFixed(2) + 'Mb/s'
  }else{
    return speed.toFixed(2) + 'Kb/s'
  }
}

// 初次加载数据
onMounted(async () => {
  console.log('123', route.path)
  
  let tmp = await DeployListDevice({
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize,
    deviceId: Number(route.path.slice(7))
  })
  pagination.value.total = tmp.data.total
  deployLists.value = tmp.data.list
  console.log(route, route.path)
  
  allStore.saveCurrentUrl(route.path)
  fetchData()
  // NOTE: 停止执行请求可以通过检测当前的 url 啊
  startExecution()
})
</script>

<style>
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
