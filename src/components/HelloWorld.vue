<template>
  <a-layout style="height: 100vh">
    <a-button @click="handleMethod">路由更新</a-button>
    <a-card
      id="test"
      :bordered="false"
      style="width: 100%; padding: 30px; background-color: #e0e0e0"
    >
      <div
        v-if="!isEditing"
        style="display: flex; align-items: center; flex-direction: row"
      >
        <span style="font-size: 24px; margin-right: 5px">{{ tmpName }}</span>
        <EditOutlined @click="isEditing = true" style="font-size: 16px" />
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
          <a-statistic title="总内存" :value="memoryData[1].value" />
        </a-col>
      </a-row>
    </a-card>
    <a-layout-content
      style="padding: 12px; display: flex; flex-wrap: wrap; gap: 3px"
    >
      <div
        v-for="chart in charts"
        :key="chart.key"
        style="flex: 1 1 300px; min-width: 300px"
      >
        <div :id="chart.id" style="width: 100%; height: 400px"></div>
      </div>
      <div style="flex-basis: 100%">
        <a-select
          v-model:value="chartsPicNum"
          :size="size"
          style="width: 200px; margin-left: 20px"
          :options="chartsPicNumOptions"
        ></a-select>
      </div>
      <div style="margin-bottom: 30px">
        <div
          key="network"
          v-show="chartsPicNum === 0"
          style="flex: 1 1 100%; width: 76vw"
        >
          <div id="network" style="width: 76vw; height: 400px"></div>
        </div>
        <div
          key="gpuPic"
          v-show="chartsPicNum === 1"
          style="flex: 1 1 100%; min-width: 76vw"
        >
          <div id="gpuPic" style="width: 76vw; height: 400px"></div>
        </div>
        <div
          key="cpuPic"
          v-show="chartsPicNum === 2"
          style="flex: 1 1 100%; min-width: 76vw"
        >
          <div id="cpuPic" style="width: 76vw; height: 400px"></div>
        </div>
        <div
          key="npuPic"
          v-show="chartsPicNum === 3"
          style="flex: 1 1 100%; min-width: 76vw"
        >
          <div id="npuPic" style="width: 76vw; height: 400px"></div>
        </div>
      </div>
      <a-table
        style="margin-top: 4vh; width: 100%"
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
              @click="handleReStartButtonClicked(record.deployId)"
              >重启</a-button
            >
            <a-button @click="handleStopButtonClicked(record.deployId)"
              >停止</a-button
            >
            <a-button @click="handleDeleteButtonClicked(record.deployId)"
              >删除</a-button
            >
            <a-button @click="handleReStartDeployButtonClicked(record.deployId)"
              >重新部署</a-button
            >
          </template>
        </template>
      </a-table>
    </a-layout-content>
    <a-modal
      v-model:open="isReStartModalVisible"
      title="确定重启吗"
      @ok="handleReStartOk"
      @cancel="handleReStartCancel"
    >
      <p>点击重启</p>
    </a-modal>
    <a-modal
      v-model:open="isStopModalVisible"
      title="确定停止吗"
      @ok="handleStopOk"
      @cancel="handleStopCancel"
    >
      <p>点击停止</p>
    </a-modal>
    <a-modal
      v-model:open="isDeleteModalVisible"
      title="确定删除吗"
      @ok="handleDeleteOk"
      @cancel="handleDeleteCancel"
    >
      <p>点击删除</p>
    </a-modal>
    <a-modal
      v-model:open="isReStartDeployModalVisible"
      title="确定重新部署吗"
      @ok="handleReStartDeployOk"
      @cancel="handleReStartDeployCancel"
    >
      <p>点击重新部署</p>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, nextTick, inject } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import { useRouter, useRoute } from 'vue-router'
import {
  DeviceList,
  DeployListDevice,
  DeviceUpdate,
  DeployDelete,
  DeployStop,
  DeployRestart,
  DeployRestartDownload,
  onlineListDeviceReq
} from '../api/api'
import { useAllStore } from '../store/allStore.js'
import { EditOutlined } from '@ant-design/icons-vue'
// import { log } from 'echarts/types/src/util/log.js'
// const isReStartModalVisible=ref(false)
// const isStopModalVisible=ref(false)
// const isDeleteModalVisible=ref(false)
// const isReStartDeployModalVisible=ref(false)

const tmpRestartId = ref()
const tmpDeleteId = ref()
const tmpStopId = ref()
const tmpReStartDeployId = ref()

const handleMethod = () => {
  console.log('获取动态路由')

  inject('updateMenuMethod')
}

// const handleReStartButtonClicked=(id)=>{
//   tmpRestartId.value=id
//   isReStartModalVisible.value=true
// }

// const handleStopButtonClicked=(id)=>{
//   tmpStopId.value=id
//   isStopModalVisible.value=true
// }

// const handleDeleteButtonClicked=(id)=>{
//   tmpDeleteId.value=id
//   isDeleteModalVisible.value=true
// }

// const handleReStartDeployButtonClicked=(id)=>{
//   tmpReStartDeployId.value=id
//   isReStartDeployModalVisible.value=true
// }

// const handleReStartOk=()=>{
//   deployRestartClicked(tmpRestartId.value)
//   isReStartModalVisible.value=false
// }

// const handleReStartCancel=()=>{
//   isReStartModalVisible.value=false
// }

// const handleStopOk=()=>{
//   deployStopClicked(tmpStopId.value)
//   isStopModalVisible.value=false
// }
// const handleStopCancel=()=>{
//   isStopModalVisible.value=false
// }
// const handleDeleteOk=()=>{
//   deployDeleteClicked(tmpDeleteId.value)
//   isDeleteModalVisible.value=false
// }

// const handleDeleteCancel=()=>{
//   isDeleteModalVisible.value=false
// }

// const handleReStartDeployOk=()=>{
//   redeployClicked(tmpReStartDeployId.value)
//   isReStartDeployModalVisible.value=false
// }

// const handleReStartDeployCancel=()=>{
//   isReStartDeployModalVisible.value=false
// }

// const reDeployButtonClicked = () => {
//   console.log('点击了重新部署按钮')
// }

// const redeployClicked = async id =>{
//   let tmp = DeployRestartDownload({
//     deployId: id
//   })
//   message.info(tmp.data.msg)
//   window.location.reload()
// }
// const deployRestartClicked = async id => {
//   let tmp = DeployRestart({
//     deployId: id
//   })
//   message.info(tmp.data.msg)
//   window.location.reload()
// }

// const deployStopClicked = async id => {
//   let tmp = DeployStop({
//     deployId: id
//   })
//   message.info(tmp.data.msg)
//   window.location.reload()
// }
// const deployDeleteClicked = async id => {
//   let tmp1 = DeployDelete({
//     deployId: id
//   })
//   // message.info(tmp1.data.msg)
//   // let tmp = await DeployList({
//   //   pageNum: pagination.value.current,
//   //   pageSize: pagination.value.pageSize
//   // })
//   // deployLists.value = tmp.data.list
//   // pagination.value.total = tmp.data.total
//   // deployOverview.value[0] = tmp.data.total
//   // deployOverview.value[1] = tmp.data.runningNum
//   //window.location.reload()
//   isModalVisible.value = true
// }
const isModalVisible = ref(false)

const allStore = useAllStore()

const isEditing = ref(false)

const chartsPicNumOptions = ref([
  {
    value: 0,
    label: 'network'
  },
  {
    value: 1,
    label: 'gpu'
  },
  {
    value: 2,
    label: 'cpu'
  },
  {
    value: 3,
    label: 'npu'
  }
])

const chartsPicNum = ref(2)

// 定义响应式变量
const selectedChart = ref('cpu')
const chartData = ref({
  cpu: { used: 0, free: 0 },
  gpu: { used: 0, free: 0 },
  npu: { used: 0, free: 0 }
})

const handleBlur = () => {
  // 在 `blur` 事件中更新 `isEditing` 的逻辑，防止干扰 v-model
  // this.$nextTick(() => {
  isEditing.value = false
  // });
}

const HandleDeviceUpdate = async name => {
  console.log('123123123', name)

  let tmp = await DeviceUpdate({
    id: Number(route.path.slice(7)),
    name: name
  })
  console.log(tmp.data)
  isEditing.value = true
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
const gpuPicData = ref([0, 0, 0, 0, 0, 0, 0])
const cpuPicData = ref([0, 0, 0, 0, 0, 0, 0])
const npuPicData = ref([0, 0, 0, 0, 0, 0, 0])

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
  { key: 'npu', id: 'npuChart', title: 'NPU Usage' }
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
  { key: 'npuPic', id: 'npuPic', title: 'NPU Pic' }
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
    if (tmp.data.onlineList !== undefined) {
      tmp.data.onlineList.forEach(element => {
        console.log(
          route.params.id + '',
          element.id,
          element.id + '' === route.params.id
        )
        if (element.id + '' === route.params.id + '') {
          tmpName.value = element.name
          deviceType.value = element.deviceType

          if (deviceType.value === 'jetson') {
            chartsPicNumOptions.value = [
              {
                value: 0,
                label: 'network'
              },
              {
                value: 1,
                label: 'gpu'
              },
              {
                value: 2,
                label: 'cpu'
              }
            ]
          }

          if (deviceType.value === 'ascend') {
            chartsPicNumOptions.value = [
              {
                value: 0,
                label: 'network'
              },
              {
                value: 3,
                label: 'npu'
              },
              {
                value: 2,
                label: 'cpu'
              }
            ]
          }

          if (deviceType.value === 'zk') {
            chartsPicNumOptions.value = [
              {
                value: 0,
                label: 'network'
              },
              {
                value: 1,
                label: 'gpu'
              },
              {
                value: 2,
                label: 'cpu'
              }
            ]
          }

          console.log('道爷，我成了 FUCKK', chartsPicNumOptions.value)

          chartData.value.cpu = element.cpu.toFixed(2)
          chartData.value.gpu = element.gpu
          chartData.value.npu = element.npu
          allData.value.ip = element.ip
          tmpName.value = element.name
          console.log('###', element.memoryTotal, element.memoryUsed)

          memoryData.value[0].value = element.memoryUsed
          memoryData.value[1].value = element.memoryTotal

          let tmp = [...networkUploadData.value]
          tmp.push((element.networkUpload * 100).toFixed(6))
          tmp.shift()

          networkUploadData.value = [...tmp]
          console.log('####', tmp, networkUploadData.value)
          let tmp2 = [...networkDownloadData.value]
          tmp.push((element.networkDownload * 100).toFixed(6))
          tmp.shift()
          networkDownloadData.value = [...tmp2]

          let tmp3 = [...gpuPicData.value]
          tmp3.push(element.gpu.toFixed(2))
          tmp3.shift()
          gpuPicData.value = [...tmp3]

          let tmp4 = [...cpuPicData.value]
          tmp4.push(element.cpu.toFixed(2))
          tmp4.shift()
          cpuPicData.value = [...tmp4]

          let tmp5 = [...npuPicData.value]
          tmp5.push(element.npu.toFixed(2))
          tmp5.shift()
          npuPicData.value = [...tmp5]

          console.log('WTFF', tmp3, tmp4, cpuPicData.value, gpuPicData.value)
        }
      })
    }
    renderCharts()
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
  }
}

const tmpName = ref('')

const allData = ref({
  id: 4,
  name: '',
  deviceType: '',
  serialNumber: '1424823233219',
  ip: '',
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
        // setDivWidthToZero(npu)
        return
      }
    }
    if (deviceType.value === 'ascend') {
      if (chart.key === 'gpu') {
        // setDivWidthToZero(gpu)
        return
      }
    }
    if (deviceType.value === 'zk') {
      if (chart.key === 'npu') {
        // setDivWidthToZero(npu)
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
        trigger: 'axis'
        //formatter: networkHandleFunc(params)
      },
      legend: {
        data: [`'上行占用 (%)' , '下行占用 (%)'`]
      },
      xAxis: {
        type: 'category',
        data: ['-6s', '-5s', '-4s', '-3s', '-2s', '-1s', '0']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '上行占用 (%)',
          type: 'line',
          //stack: 'Total',
          data: networkUploadData.value
        },
        {
          name: '下行占用 (%)',
          type: 'line',
          //stack: 'Total',
          data: networkDownloadData.value
        }
      ]
    }
    const option4 = {
      title: {
        text: chart.title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
        //formatter: networkHandleFunc(params)
      },
      legend: {
        data: [`'占用 (%)' `]
      },
      xAxis: {
        type: 'category',
        data: ['-6s', '-5s', '-4s', '-3s', '-2s', '-1s', '0']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '占用 (%)',
          type: 'line',
          //stack: 'Total',
          data: gpuPicData.value
        }
      ]
    }
    const option5 = {
      title: {
        text: chart.title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: [`'占用 (%)'`]
      },
      xAxis: {
        type: 'category',
        data: ['-6s', '-5s', '-4s', '-3s', '-2s', '-1s', '0']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '占用 (%)',
          type: 'line',
          //stack: 'Total',
          data: cpuPicData.value
        }
      ]
    }

    const option6 = {
      title: {
        text: chart.title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: [`'占用 (%)' `]
      },
      xAxis: {
        type: 'category',
        data: ['-6s', '-5s', '-4s', '-3s', '-2s', '-1s', '0']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '占用 (%)',
          type: 'line',
          //stack: 'Total',
          data: npuPicData.value
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
      chartInstance.setOption(option4)
    }
    if (chart.key === 'cpuPic') {
      chartInstance.setOption(option5)
    }
    if (chart.key === 'npuPic') {
      chartInstance.setOption(option6)
    }
  })
}

let fastRequest = true

const getCurrentTime = num => {
  let currentDateTime = new Date()
  let hours = currentDateTime.getHours().toString().padStart(2, '0')
  let minutes = currentDateTime.getMinutes().toString().padStart(2, '0')
  let seconds = currentDateTime.getSeconds().toString().padStart(2, '0') - 1

  return `${hours}:${minutes}:${seconds}`
}

const memoryHandleData = num => {
  return num
}

function setDivWidthToZero(id) {
  const element = document.getElementById(id)
  if (element) {
    const parentElement = element.parentElement
    if (parentElement && parentElement.tagName.toLowerCase() === 'div') {
      parentElement.style.width = '0'
      parentElement.style.display = 'none'
    } else {
      console.warn(`Parent element is not a div or does not exist.`)
    }
  } else {
    console.warn(`Element with id ${id} not found.`)
  }
}

const startExecution = () => {
  let interval = 1000
  let timerId

  const executeFunction = async () => {
    let tmp = await DeviceList()

    if (route.path !== allStore.currentUrl) {
      fastRequest = false
    }

    console.log('woc', tmp.data.onlineList, tmp.data)

    if (tmp.data.onlineList !== undefined) {
      tmp.data.onlineList.forEach(element => {
        if (element.id + '' === route.params.id + '') {
          console.log('123 道爷，我成了')
          chartData.value.cpu = element.cpu.toFixed(2)
          chartData.value.gpu = element.gpu
          chartData.value.npu = element.npu
          allData.value.ip = element.ip
          allData.value.deviceType = element.deviceType

          memoryData.value[0].value = element.memoryUsed
          memoryData.value[1].value = element.memoryTotal

          let tmp = [...networkUploadData.value]
          tmp.push((element.networkUpload * 100).toFixed(6))
          tmp.shift()
          networkUploadData.value = [...tmp]
          console.log('####', tmp, networkUploadData.value)
          let tmp2 = [...networkDownloadData.value]
          tmp2.push((element.networkDownload * 100).toFixed(6))
          tmp2.shift()
          networkDownloadData.value = [...tmp2]

          let tmp3 = [...gpuPicData.value]
          tmp3.push(element.gpu.toFixed(2))
          tmp3.shift()
          gpuPicData.value = [...tmp3]

          let tmp4 = [...cpuPicData.value]
          tmp4.push(element.cpu.toFixed(2))
          tmp4.shift()
          cpuPicData.value = [...tmp4]

          let tmp5 = [...npuPicData.value]
          tmp5.push(element.npu.toFixed(2))
          tmp5.shift()
          npuPicData.value = [...tmp5]

          console.log('WTFF', tmp3, tmp4, cpuPicData.value, gpuPicData.value)
        }
        if (!fastRequest) {
          clearInterval(timerId)
          interval = 600000000
          timerId = setInterval(executeFunction, interval)
        }
      })
    }
    renderCharts()
  }

  timerId = setInterval(executeFunction, interval)
}

const networkHandleFunc = speed => {
  if (speed > 1000) {
    return (speed / 1000).toFixed(2) + 'Mb/s'
  } else {
    return speed.toFixed(2) + 'Kb/s'
  }
}

// 初次加载数据
onMounted(async () => {
  let deviceInfoReq = await onlineListDeviceReq({
    id: Number(route.path.slice(7))
  })
  console.log('修改识别码', deviceInfoReq.data)
  allData.value.deviceType = deviceInfoReq.data.info.deviceType
  allData.value.ip = deviceInfoReq.data.info.ip
  tmpName.value = deviceInfoReq.data.info.name

  fetchData()
  console.log()
  let tmp = await DeployListDevice({
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize,
    deviceId: Number(route.path.slice(7))
  })
  pagination.value.total = tmp.data.total
  deployLists.value = tmp.data.list
  console.log(route, route.path)

  let tmp1 = await DeviceList()

  nextTick(() => {
    console.log('DOM is fully rendered and updated')
    // 在这里执行你需要在页面全部渲染完毕后运行的代码
    tmp1.data.onlineList.forEach(element => {
      if (element.id + '' === route.params.id + '') {
        if (element.deviceType === 'jetson') {
          setDivWidthToZero('npuChart')
        }
        if (element.deviceType === 'ascend') {
          console.log('sywfxl')
          setDivWidthToZero('gpuChart')
        }
      }
    })
  })

  allStore.saveCurrentUrl(route.path)
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
