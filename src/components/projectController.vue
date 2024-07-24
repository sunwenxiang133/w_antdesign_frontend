<template>
  <div style="background: #ececec; padding: 30px; height: 100vh">
    <a-card title="项目管理" :bordered="false" style="width: 100%">
      <a-row>
        <a-col :span="8">
          <a-statistic title="我的项目" :value="projectOverview[0]" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="已部署项目" :value="projectOverview[1]" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="待部署项目" :value="projectOverview[2]" />
        </a-col>
      </a-row>
    </a-card>
    <a-card
      title="项目列表"
      :bordered="false"
      style="width: 100%; margin-top: 3vh"
    >
      <template #extra>
        <div style="display: flex">
          <div>
            <a-radio-group v-model:value="chooseProject">
              <a-radio-button value="a">全部</a-radio-button>
              <a-radio-button value="b">已部署</a-radio-button>
              <a-radio-button value="c">未部署</a-radio-button>
            </a-radio-group>
          </div>
          <div>
            <a-input-search
              v-model:value="value"
              placeholder="请输入"
              style="width: 200px; margin-left: 1vw"
              @search="onSearch"
            />
          </div>
        </div>
      </template>

      <a-row
        v-for="item in projectList"
        style="
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e8e8e8;
          padding: 3px 0 4px 0;
        "
      >
        <!-- <a-col :span="8">
            <a-statistic title="我的项目" :value="projectOverview[0]"  />
        </a-col>
        <a-col :span="8">
            <a-statistic title="已部署项目" :value="projectOverview[1]" />
        </a-col>
        <a-col :span="8">
            <a-statistic title="待部署项目" :value="projectOverview[2]" />
        </a-col> -->
        <div style="display: flex; padding: 3px 0; align-items: center">
          <a-avatar
            shape="square"
            size="large"
            style="margin-right: 1vw"
            src="http://162.14.78.140:8080/Scenery/1.jpg"
          ></a-avatar>
          <div
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-right: 0.8vw;
            "
          >
            <div style="font-size: 20px; font-weight: 600">
              {{ item.name }}
            </div>
            <div>{{ item.desc }}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center">
          <a-button type="primary" style="margin-right: 8px">编辑</a-button>
          <a-button @click="deployButton(item.id)">部署</a-button>
          <a-button @click="deleteProjectClicked(item.id)">删除</a-button>
        </div>
      </a-row>
      <a-row style="display: flex; align-items: end; flex-direction: column">
        <a-pagination
          v-model:current="currentPage"
          show-quick-jumper
          :pageSize="pageSize"
          :pageSizeOptions="pageSizeOptions"
          :total="totalPage"
          @change="handlePageChange"
          @show-size-change="handleSizeChange"
        />
      </a-row>
    </a-card>
    <a-button
      type="dashed"
      style="width: 100%; margin-top: 2vh"
      @click="addProjectButtonVisible = !addProjectButtonVisible"
      >添加</a-button
    >
    <a-modal
      v-model:open="inputButtonVisible"
      @ok="deployProjectClicked"
      ok-text="确认"
      cancel-text="取消"
      title="部署"
      centered
    >
      <div>命令</div>
      <a-textarea
        v-model:value="deployProjectInfo.cmd"
        placeholder="请输入命令"
        allow-clear
        style="margin-bottom: 1.5vh"
      />
      <br />
      <div>设备</div>
      <!-- <a-input v-model:value="value1" placeholder="请输入" allow-clear /> -->
      <!-- <div @click="modelVisible = !modelVisible">模型1</div> -->
      <a-select
        v-model:value="selectedDeviceItem"
        style="width: 300px"
        placeholder="请选择字段"
        :show-search="true"
        :filter-option="false"
        @search="onDeviceSearch"
      >
        <a-select-option
          v-for="item in filteredDeviceData"
          :key="item"
          :value="item"
        >
          {{ item }}
        </a-select-option>
      </a-select>
      <div>模型</div>
      <!-- <a-input v-model:value="value1" placeholder="请输入" allow-clear /> -->
      <!-- <div @click="modelVisible = !modelVisible">模型1</div> -->
      <a-select
        v-model:value="selectedItem"
        style="width: 300px"
        placeholder="请选择字段"
        :show-search="true"
        :filter-option="false"
        @search="onSearch"
      >
        <a-select-option v-for="item in filteredData" :key="item" :value="item">
          {{ item }}
        </a-select-option>
      </a-select>
    </a-modal>
    <a-modal
      v-model:open="addProjectButtonVisible"
      @ok="createProjectButton"
      title="项目添加"
      centered
      ok-text="确认"
      cancel-text="取消"
    >
      <div>项目名称</div>
      <a-input
        v-model:value="createProjectInfo.name"
        placeholder="请输入"
        allow-clear
      />
      <br />
      <br />
      <div>选择模型</div>

      <br />
      <br />
      <div>项目描述</div>
      <a-textarea
        v-model:value="createProjectInfo.desc"
        placeholder="请输入至少五个字符"
        allow-clear
        style="margin-bottom: 1.5vh"
      />
      <a-upload
        :customRequest="handleUpload"
        :before-upload="handleAction"
        accept=".zip,.rar,.7z"
        :maxCount="1"
        method="PUT"
      >
        <a-button>
          <upload-outlined></upload-outlined>
          上传
        </a-button>
      </a-upload>
    </a-modal>
    <!-- <a-button @click="test1">123123</a-button> -->
    <a-button @click="test2">部署任务创建</a-button>
    <a-button>部署任务添加</a-button>
    <a-button @click="ProjectCreateButton">项目添加</a-button>
    <a-button @click="ModelCreateButton">模型创建</a-button>
    <a-button @click="PresignUrlButton">预签名Url</a-button>
    <a-button @click="PresignedUrlButton">项目预签名Url</a-button>
    <a-button @click="DeployStatusButton">模型部署状态</a-button>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  testApiParams,
  testApiData,
  DeployCreate,
  DeployList,
  DeployStatus,
  DeviceList,
  ProjectCreate,
  ModelCreate,
  PresignUrl,
  PresignedUrl,
  ProjectListReq,
  ModelList,
  ProjectDelete
} from '../api/api.js'

const deleteProjectClicked = async id => {
  let tmp = await ProjectDelete(id)
  message.info(tmp.data.msg)
  window.location.reload()
}

const createProjectInfo = reactive({
  name: '',
  desc: '',
  modelFileName: ''
})

const createProjectButton = async () => {
  let tmp = await ProjectCreate({
    name: createProjectInfo.name,
    desc: createProjectInfo.desc,
    modelFileName: createProjectInfo.modelFileName
  })
  inputButtonVisible.value = false
  window.location.reload()
}

const deployProjectClicked = async () => {
  inputButtonVisible.value = !inputButtonVisible.value
  console.log('test', tmpDeviceLists.value)
  let tmpDeviceId
  let tmpModelId
  tmpDeviceLists.value.forEach(item => {
    console.log('#######', item)
    if (item.name === selectedDeviceItem.value) {
      console.log('终于', item.id)
      tmpDeviceId = item.id
    }
  })
  tmpModelLists.value.forEach(item => {
    if (item.name === selectedItem.value) {
      tmpModelId = item.id
      console.log('终于Model', tmpModelId)
    }
  })
  let tmp = await DeployCreate({
    deviceId: tmpDeviceId,
    projectId: selectedItemId.value,
    modelId: tmpModelId,
    cmd: deployProjectInfo.cmd
  })
}

const tmpNames = ref([])
const tmpDeviceNames = ref([])
const selectedItemId = ref()
const tmpModelLists = ref([])
const tmpDeviceLists = ref([])

const deployButton = async itemId => {
  selectedItemId.value = itemId
  let tmp = await ModelList({
    pageNum: 0,
    pageSize: 1000
  })
  let tmp2 = await DeviceList({
    pageNum: 0,
    pageSize: 1000
  })
  inputButtonVisible.value = !inputButtonVisible.value
  let tmpName = []
  let tmpList = tmp.data.list
  tmpModelLists.value = tmpList
  console.log('---', tmp.data.list)
  tmpList.forEach(item => {
    console.log('123123', item)
    tmpName.push(item.name)
  })
  filteredData.value = [...tmpName]
  tmpNames.value = [...tmpName]
  console.log('123123123', tmp)
  let tmpDeviceName = []
  let tmpDeviceList = tmp2.data.onlineList
  tmpDeviceLists.value = tmpDeviceList

  tmpDeviceList.forEach(item => {
    tmpDeviceName.push(item.name)
  })
  filteredDeviceData.value = [...tmpDeviceName]
  tmpDeviceNames.value = [...tmpDeviceName]

  console.log('######', filteredData.value, filteredDeviceData.value)
}

const deployProjectInfo = reactive({
  name: '',
  cmd: '',
  model: ''
})

const DeployStatusButton = async () => {
  let tmp = await DeployStatus({
    deployId: 3
  })
  console.log('deployId', tmp)
}

const uploadUrlForAction = ref('')
const handleAction = async file => {
  // // 定义要执行的函数
  // function doSomething() {
  //   console.log('这段代码将在5秒后执行')
  // }

  // // 使用setTimeout等待5秒（5000毫秒）
  // setTimeout(doSomething, 1000)
  let tmpFileName = file.name + Math.ceil(Math.random() * 10000)
  try {
    const data = await PresignUrl({
      modelName: createProjectInfo.name,
      fileName: tmpFileName
    })
    createProjectInfo.modelFileName = tmpFileName
    console.log(
      '###执行了handleAction',
      data.data.url,
      createProjectInfo.modelFileName
    )
    uploadUrlForAction.value = data.data.url
    return data.presignedUrl
  } catch (error) {
    console.log(error)
    throw error
  }
}

// 定义上传处理函数
const handleUpload = async ({ file, onProgress, onSuccess, onError }) => {
  // 创建二进制数据
  const binaryData = new Blob([file], { type: file.type })

  const config = {
    headers: {
      'Content-Type': file.type
    },
    onUploadProgress: progressEvent => {
      const percent = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100
      )
      onProgress({ percent })
    }
  }

  try {
    console.log(
      '执行到自定义上传',
      uploadUrlForAction.value,
      binaryData,
      config
    )
    const response = await requests.put(
      uploadUrlForAction.value,
      binaryData,
      config
    )
    console.log('#####', response)
    onSuccess(response.data)
  } catch (error) {
    onError(error)
  }
}

const PresignedUrlButton = async () => {
  let tmp = await PresignedUrl({
    fileName: '123',
    projectName: '132'
  })
  console.log('PresignedUrl', tmp)
}

const PresignUrlButton = async () => {
  let tmp = await PresignUrl({
    modelName: '123123',
    fileName: '132123'
  })
  console.log('PresignUrl', tmp)
}

const ProjectCreateButton = async () => {
  let tmp = await ProjectCreate({
    name: '123123',
    desc: '12312313',
    pojectFileName: '123'
  })
  console.log('ProjectCreate为', tmp)
}

const ModelCreateButton = async () => {
  let tmp = await ModelCreate({
    name: '123',
    desc: '123',
    modelFileName: '123'
  })
  console.log('模型创建', tmp)
}

onMounted(async () => {
  console.log('钩子函数')
  // let tmp = await DeployList({
  //   PageNum: 1,
  //   PageSize: 5,
  //   DeviceType: 1,
  //   DeviceId: 1,
  //   ProjectId: 1,
  //   Status: 1
  // })
  let tmp = await ProjectListReq({
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
  totalPage.value = tmp.data.total
  console.log('DeviceList为', tmp)
  projectList.value = tmp.data.list
})

const handleChange = info => {
  if (info.file.status !== 'uploading') {
    console.log(info.file, info.fileList)
  }
  if (info.file.status === 'done') {
    message.success(`${info.file.name} file uploaded successfully`)
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`)
  }
}
const fileList = ref([])
const headers = {
  authorization: 'authorization-text'
}

const test1 = async () => {
  let tmp = await testApiParams({})
  console.log('test1 clicked', tmp)
}

const test2 = async () => {
  let tmp = await testApiData({
    deviceId: 14,
    projectId: 9,
    modelId: 7,
    cmd: 'ls'
  })
  console.log('test2 clicked', tmp)
}

const projectOverview = [6, 5, 3]
const chooseProject = ref('a')
const inputButtonVisible = ref(false)
const addProjectButtonVisible = ref(false)
const setModalVisible = () => {
  inputButtonVisible.value = true
}
const modelVisible = ref(false)
const setModalModelVisible = () => {
  modelVisible.value = true
}
const projectList = ref([])
const currentPage = ref(1)
const totalPage = ref(20)
const pageSizeOptions = ref(['10', '20', '30', '40'])
const pageSize = ref(5)
const handlePageChange = async page => {
  console.log('当前页:', page)
  currentPage.value = page
  let tmp = await ProjectListReq({
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
  totalPage.value = tmp.data.total
  console.log('DeviceList为', tmp)
  projectList.value = tmp.data.list
}

const handleSizeChange = totalPage => {
  console.log('每页显示条目数:', totalPage)
  totalPage.value = totalPage
}

const searchQuery = ref('')
const selectedItem = ref(null)
const selectedDeviceItem = ref(null)
const allData = ref(['字段1', '字段2', '字段3', '字段4', '字段5'])

const filteredData = ref([...allData.value])
const filteredDeviceData = ref()

const onSearch = value => {
  filteredData.value = tmpNames.value.filter(item => item.includes(value))
}

const onDeviceSearch = value => {
  filteredDeviceData.value = tmpDeviceNames.value.filter(item =>
    item.includes(value)
  )
}
</script>

<style lang="scss" scoped></style>
