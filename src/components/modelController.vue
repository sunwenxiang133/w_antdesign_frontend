<template>
  <div style="background: #ececec; padding: 30px; height: 100vh">
    <div style="font-size: 30px; font-weight: 600">模型</div>
    <a-input-search
      v-model:value="searchText"
      placeholder="input search text"
      enter-button
      @search="onSearch"
    />
    <div style="margin: 1.5vh 0 5vh">模型管理中心</div>
    <div>
      <a-row :gutter="16">
        <!-- <a-col :span="8">
          <a-card title="Card title" :bordered="false">
            <p>card content</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="Card title" :bordered="false">
            <p>card content</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="Card title" :bordered="false">
            <p>card content</p>
          </a-card>
        </a-col> -->
        <a-col :span="8">
          <a-card
            :onclick="setModalVisible"
            hoverable
            style="
              height: calc(100% - 3vh);
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <div style="padding: 4vh 5vw">添加模型</div>
          </a-card>
        </a-col>
        <a-col
          :span="8"
          v-for="(item, index) in cardInfos"
          :key="index"
          style="margin-bottom: 3vh"
        >
          <a-card :title="item.name" hoverable>
            <p>{{ item.desc }}</p>
            <template #actions>
              <div
                style="
                  display: flex;
                  padding: 0 !important;
                  margin: 0 !important;
                  height: 100%;
                "
              >
                <div
                  style="flex: 1"
                  @click="modelUpdateButtonPanelClicked(item)"
                >
                  编辑
                </div>
                <div style="flex: 1" @click="modelDeleteClicked(item)">
                  删除
                </div>
              </div>
            </template>
            <a-btn @click="downloadModel">下载模型</a-btn>
            <!-- <template #actions>
              <a-space style="display: flex">
                <a-button type="primary" block style="flex: 1">按钮 1</a-button>
                <a-button block style="flex: 1">按钮 2</a-button>
              </a-space>
            </template> -->
          </a-card>
        </a-col>
      </a-row>
    </div>
    <a-pagination
      v-model:current="currentPage"
      show-quick-jumper
      :pageSize="pageSize"
      :pageSizeOptions="pageSizeOptions"
      :total="totalPage"
      @change="handlePageChange"
      @show-size-change="handleSizeChange"
    />

    <a-modal
      v-model:open="modelUpdatePanel"
      ok-text="确认"
      cancel-text="取消"
      title="模型修改"
      @ok="updateModelButton"
      centered
    >
      <div>模型名称</div>
      <a-input v-model:value="cardInfo.name" placeholder="请输入" allow-clear />
      <br />
      <br />
      <div>模型描述</div>
      <a-textarea
        v-model:value="cardInfo.desc"
        placeholder="请输入至少五个字符"
        allow-clear
        style="margin-bottom: 1.5vh"
      />
      <!-- <div>模型名称</div>
      <a-textarea
        v-model:value="cardInfo.fileName"
        placeholder="请输入"
        allow-clear
        style="margin-bottom: 1.5vh"
      />  -->
    </a-modal>

    <a-modal
      v-model:open="inputButtonVisible"
      ok-text="确认"
      cancel-text="取消"
      title="模型添加"
      @ok="createModelButton"
      centered
    >
      <div>模型名称</div>
      <a-input
        v-model:value="createModelInfo.name"
        placeholder="请输入"
        allow-clear
      />
      <br />
      <br />
      <div>模型描述</div>
      <a-textarea
        v-model:value="createModelInfo.desc"
        placeholder="请输入至少五个字符"
        allow-clear
        style="margin-bottom: 1.5vh"
      />
      <!-- <div>模型文件名称</div>
      <a-textarea
        v-model:value="createModelInfo.modelFileName"
        placeholder="请输入"
        allow-clear
        style="margin-bottom: 1.5vh"
      /> -->
      <a-upload
        :customRequest="handleUpload"
        :before-upload="handleAction"
        :maxCount="1"
        method="PUT"
      >
        <a-button>
          <upload-outlined></upload-outlined>
          上传
        </a-button>
      </a-upload>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  ModelCreate,
  PresignUrl,
  ModelList,
  ModelDelete,
  ModelUpdate
} from '../api/api.js'
import requests from '../api/request.js'

const searchText = ref('')
watch(searchText, filterCards)

const modelUpdatePanel = ref(false)

const onSearch = () => {
  filterCards()
}
const filterCards = () => {
  console.log('执行搜索')

  const searchLower = this.searchText.toLowerCase()
  this.filteredCards = this.cardInfos.filter(card =>
    card.name.toLowerCase().includes(searchLower)
  )
}

const cardInfo = ref({
  id: 23,
  name: '',
  desc: '',
  fileName: ''
})

const modelUpdateButtonPanelClicked = item => {
  console.log('测试 111', item.value, item, item.id, item.name)
  modelUpdatePanel.value = true
  cardInfo.value.id = item.id
  cardInfo.value.name = item.name
  cardInfo.value.desc = item.desc
  cardInfo.value.fileName = item.fileName
  console.log('测试 111', item.value, item, item.id, cardInfo.value.name)
}

const modelDeleteClicked = async item => {
  let tmp = await ModelDelete({
    id: item.id
  })
  message.info(tmp.msg)
  //window.location.reload()
}

const currentPage = ref(1)
const totalPage = ref(20)
const pageSizeOptions = ref(['10', '20', '30', '40'])
const pageSize = ref(5)
const handlePageChange = async page => {
  console.log('当前页：', page)
  currentPage.value = page
  let tmp = await ModelList({
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
  totalPage.value = tmp.data.total
  console.log('DeviceList 为', tmp)
  cardInfos.value = tmp.data.list
}

const handleSizeChange = totalPage => {
  console.log('每页显示条目数：', totalPage)
  totalPage.value = totalPage
}

onMounted(async () => {
  let tmp = await ModelList({
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
  console.log('模型列表获取', tmp.data.total)
  totalPage.value = tmp.data.total
  cardInfos.value = tmp.data.list
})

const downloadModel = () => {
  console.log('下载模型')
}

const uploadFileList = ref()

const handleChange = ({ file, fileList }) => {
  console.log('###handleChange', file, fileList, file.name)
  uploadFileList.value = file.name
  console.log('123', uploadFileList.value)
}

const handleAction1 = async file => {
  await setTimeout(handleAction, 1000)
  console.log('handleAction 的 file', file.name)
}

// 自定义上传
const customRequest = async file => {
  const form = new FormData()
  form.append('file', file.file)
  form.append('filename', formState.value.filename)
}

// 定义上传处理函数
const handleUpload = async ({ file, onProgress, onSuccess, onError }) => {
  // 创建二进制数据
  console.log('erjbvi', file.type)
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

const uploadUrlForAction = ref('')

const handleAction = async file => {
  // // 定义要执行的函数
  // function doSomething() {
  //   console.log('这段代码将在 5 秒后执行')
  // }

  // // 使用 setTimeout 等待 5 秒（5000 毫秒）
  // setTimeout(doSomething, 1000)
  let tmpFileName = file.name + Math.ceil(Math.random() * 10000)
  try {
    const data = await PresignUrl({
      // modelName: createModelInfo.name,
      fileName: tmpFileName
    })
    createModelInfo.modelFileName = tmpFileName
    console.log(
      '###执行了 handleAction',
      data.data.url,
      createModelInfo.modelFileName
    )
    uploadUrlForAction.value = data.data.url
    return data.presignedUrl
  } catch (error) {
    console.log(error)
    throw error
  }
}

const createModelButton = async () => {
  let tmp = await ModelCreate({
    name: createModelInfo.name,
    desc: createModelInfo.desc,
    fileName: createModelInfo.modelFileName
  })
  console.log('tmp', tmp)
  inputButtonVisible.value = false
  // window.location.reload()
}

const updateModelButton = async () => {
  let tmp = await ModelUpdate({
    id: cardInfo.value.id,
    name: cardInfo.value.name,
    desc: cardInfo.value.desc,
    fileName: cardInfo.value.fileName
  })
  modelUpdatePanel.value = false
  // window.location.reload()
}

const createModelInfo = reactive({
  name: '',
  desc: '',
  modelFileName: ''
})

const cardInfos = ref([])
const inputButtonVisible = ref(false)
const setModalVisible = () => {
  inputButtonVisible.value = true
}
</script>

<style scoped>
/* #app
  > div
  > div
  > div
  > div:nth-child(3)
  > div
  > div:nth-child(3)
  > div
  > ul
  > li {
  margin: 0 !important;
} */
</style>
