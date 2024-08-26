<template>
  <div style="background: #ececec; padding: 30px; height: 100vh">
    <a-card title="部署管理" :bordered="false" style="width: 100%">
      <a-row>
        <a-col :span="12">
          <a-statistic title="总和" :value="deployOverview[0]" />
        </a-col>
        <a-col :span="12">
          <a-statistic title="运行数" :value="deployOverview[1]" />
        </a-col>
      </a-row>
    </a-card>
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
            <template v-if="record.status === 3"> 未运行 </template>
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
          <a-button @click="handleStopButtonClicked(record.deployId)">停止</a-button>
          <a-button @click="handleDeleteButtonClicked(record.deployId)"
            >删除</a-button
          >
          <a-button @click="handleReStartDeployButtonClicked(record.deployId)"
            >重新部署</a-button
          >
        </template>
      </template>
    </a-table>
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
  </div>
</template>

<script setup>
import { progressProps } from 'ant-design-vue/es/progress/props'
import { message } from 'ant-design-vue'
import {
  DeployList,
  DeployDelete,
  DeployStop,
  DeployRestart,
  DeployRestartDownload
} from '../api/api.js'
import { ref, onMounted } from 'vue'

const deployLists = ref([])
const isReStartModalVisible=ref(false)
const isStopModalVisible=ref(false)
const isDeleteModalVisible=ref(false)
const isReStartDeployModalVisible=ref(false)

const tmpRestartId=ref();
const tmpDeleteId=ref();
const tmpStopId=ref();
const tmpReStartDeployId=ref();


const handleReStartButtonClicked=(id)=>{
  tmpRestartId.value=id
  isReStartModalVisible.value=true
}

const handleStopButtonClicked=(id)=>{
  tmpStopId.value=id
  isStopModalVisible.value=true
}

const handleDeleteButtonClicked=(id)=>{
  tmpDeleteId.value=id
  isDeleteModalVisible.value=true
}

const handleReStartDeployButtonClicked=(id)=>{
  tmpReStartDeployId.value=id
  isReStartDeployModalVisible.value=true
}

const handleReStartOk=()=>{
  deployRestartClicked(tmpRestartId.value)
  isReStartModalVisible.value=false
}

const handleReStartCancel=()=>{
  isReStartModalVisible.value=false
}

const handleStopOk=()=>{
  deployStopClicked(tmpStopId.value)
  isStopModalVisible.value=false
}
const handleStopCancel=()=>{
  isStopModalVisible.value=false
}
const handleDeleteOk=()=>{
  deployDeleteClicked(tmpDeleteId.value)
  isDeleteModalVisible.value=false
}

const handleDeleteCancel=()=>{
  isDeleteModalVisible.value=false
}

const handleReStartDeployOk=()=>{
  redeployClicked(tmpReStartDeployId.value)
  isReStartDeployModalVisible.value=false
}

const handleReStartDeployCancel=()=>{
  isReStartDeployModalVisible.value=false
}

const reDeployButtonClicked = () => {
  console.log('点击了重新部署按钮')
}

const redeployClicked = async id =>{
  let tmp = DeployRestartDownload({
    deployId: id
  })
  message.info(tmp.data.msg)
  window.location.reload()
}
const deployRestartClicked = async id => {
  let tmp = DeployRestart({
    deployId: id
  })
  message.info(tmp.data.msg)
  window.location.reload()
}

const deployStopClicked = async id => {
  let tmp = DeployStop({
    deployId: id
  })
  message.info(tmp.data.msg)
  window.location.reload()
}

const isModalVisible = ref(false)

const handleOk = async () => {
  isModalVisible.value = false
  let tmp1 = DeployDelete({
    deployId: id
  })
  message.info(tmp1.data.msg)

  let tmp = await DeployList({
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize
  })
  deployLists.value = tmp.data.list
  pagination.value.total = tmp.data.total
  deployOverview.value[0] = tmp.data.total
  deployOverview.value[1] = tmp.data.runningNum
}

const handleCancel = () => {
  isModalVisible.value = false
}

const deployDeleteClicked = async id => {
  let tmp1 = DeployDelete({
    deployId: id
  })
  // message.info(tmp1.data.msg)
  // let tmp = await DeployList({
  //   pageNum: pagination.value.current,
  //   pageSize: pagination.value.pageSize
  // })
  // deployLists.value = tmp.data.list
  // pagination.value.total = tmp.data.total
  // deployOverview.value[0] = tmp.data.total
  // deployOverview.value[1] = tmp.data.runningNum
  //window.location.reload()
  isModalVisible.value = true
}

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

onMounted(async () => {
  let tmp = await DeployList({
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize
  })
  deployLists.value = tmp.data.list
  pagination.value.total = tmp.data.total
  deployOverview.value[0] = tmp.data.total
  deployOverview.value[1] = tmp.data.runningNum
  startExecution()
})

const startExecution = () => {
  let interval = 1000
  let timerId

  const executeFunction = async () => {
    let tmp = await DeployList({
      pageNum: 1,
      pageSize: 100
    })
    deployLists.value = tmp.data.list
    let fastRequest = true
    let allDeployed = false
    let deployedNum = 0
    deployLists.value.forEach(item => {
      if (item.status === 2) {
        deployedNum++
      }
    })
    if (deployedNum !== deployLists.value.length) {
      fastRequest = true
    } else {
      fastRequest = false
    }

    // if (!fastRequest) {
    //   clearInterval(timerId)
    //   interval = 600000 // 修改间隔为 60 min
    //   timerId = setInterval(executeFunction, interval)
    // }
  }

  timerId = setInterval(executeFunction, interval)
}

let deployOverview = ref([6, 5, 3])
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
  // {
  //   title: '进度',
  //   dataIndex: 'progress',
  //   key: 'progress'
  // },
  // {
  //   title: '进度',
  //   dataIndex: 'progress',
  //   key: 'progress',
  //   scopedSlots: { customRender: 'progress' }
  // },
  //   {
  //     title: 'Tags',
  //     key: 'tags',
  //     dataIndex: 'tags'
  //   },
  {
    title: 'Action',
    key: 'action'
  }
]

const projectList = [
  {
    projectName: '1',
    projectCode: 'hahaha',
    projectModel: 'model 名称',
    isDeploy: '123123123'
  },
  {
    projectName: '2',
    projectCode: 'hahaha',
    projectModel: 'model 名称',
    isDeploy: '123123123'
  },
  {
    projectName: '3',
    projectCode: 'hahaha',
    projectModel: 'model 名称',
    isDeploy: '123123123'
  },
  {
    projectName: '4',
    projectCode: 'hahaha',
    projectModel: 'model 名称',
    isDeploy: '123123123'
  }
]
const currentPage = ref(1)
const totalPage = ref(20)
const pageSizeOptions = ref(['10', '20', '30', '40'])
const pageSize = ref(5)
const handlePageChange = page => {
  console.log('当前页：', page)
  currentPage.value = page
}

const handleSizeChange = totalPage => {
  console.log('每页显示条目数：', totalPage)
  totalPage.value = totalPage
}
</script>

<style lang="scss" scoped></style>
