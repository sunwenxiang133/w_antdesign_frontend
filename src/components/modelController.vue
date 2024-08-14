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
            <a-btn @click="downloadModel(item.url)">下载模型</a-btn>
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
      :show-total="total => `一共{totalPage}`"
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
        v-model:fileList="fileList"
        :itemRender="customItemRender"
        :maxCount="1"
        method="PUT"
      >
        <a-button>
          <upload-outlined></upload-outlined>
          上传
        </a-button>
      </a-upload>
    </a-modal>
    <a-modal
      v-model:open="isModalVisible"
      title="确定删除吗"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>点击删除此项</p>
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
  ModelUpdate,
  ModelSearch
} from '../api/api.js'
import requests from '../api/request.js'

const searchText = ref('')

const handleChange = info => {
  if (info.file.status === 'done') {
    // 上传成功后更新文件列表，确保文件状态为 "done"
    info.fileList = info.fileList.map(file => {
      if (file.response) {
        // 例如，你可以设置一个自定义的响应字段来判断上传成功
        file.url = file.response.url
      }
      return file
    })
    // 更新 fileList 状态
    fileList.value = [...info.fileList]
  }
}

const modelUpdatePanel = ref(false)

const customItemRender = ({ originNode }) => {
  // 返回自定义的文件项结构，originNode 是原始的文件项节点
  // 这里我们移除了 loading 的部分
  return originNode
}

const onSearch = () => {
  filterCards()
}

const filteredCards = ref('')
const filterCards = async () => {
  console.log('执行搜索')

  let tmp = await ModelSearch({
    name: searchText.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })

  totalPage.value = tmp.data.total
  cardInfos.value = tmp.data.list

  console.log('hashasdf', tmp)
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

const downloadMyUrl = myUrl => {
  const url = myUrl // 替换为你的文件 URL
  const a = document.createElement('a')
  a.href = url
  a.download = '' // 可以设置文件名，如果留空，将使用原始文件名
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const isModalVisible = ref(false)

const handleOk = async () => {
  isModalVisible.value = false
  let tmp = await ModelDelete({
    id: item.id
  })
  message.info(tmp.msg)

  let tmp2 = await ModelList({
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
  console.log('模型列表获取', tmp2.data.total)
  totalPage.value = tmp2.data.total
  cardInfos.value = tmp2.data.list
}

const handleCancel = () => {
  isModalVisible.value = false
}

const modelDeleteClicked = async item => {
  // let tmp = await ModelDelete({
  //   id: item.id
  // })
  // message.info(tmp.msg)
  // let tmp2 = await ModelList({
  //   pageNum: currentPage.value,
  //   pageSize: pageSize.value
  // })
  // console.log('模型列表获取', tmp2.data.total)
  // totalPage.value = tmp2.data.total
  // cardInfos.value = tmp2.data.list
  //window.location.reload()
  isModalVisible.value = true
}

const currentPage = ref(1)
const totalPage = ref(20)
const pageSizeOptions = ref(['2', '5', '8'])
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

const downloadModel = url => {
  console.log('下载模型')
  downloadMyUrl(url)
}

const uploadFileList = ref()

// const handleChange = ({ file, fileList }) => {
//   console.log('###handleChange', file, fileList, file.name)
//   uploadFileList.value = file.name
//   console.log('123', uploadFileList.value)
// }

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

const handleFileName = fileName => {
  console.log('asdfhasdfhasdflh')

  // 生成一个随机数（例如 0-999 之间的整数）
  let randomNumber = Math.floor(Math.random() * 1000)

  // 查找最后一个点的位置
  let lastDotPosition = fileName.lastIndexOf('.')

  // 如果找到了点，将随机数插入文件名中
  if (lastDotPosition !== -1) {
    let nameWithoutExtension = fileName.substring(0, lastDotPosition)
    let extension = fileName.substring(lastDotPosition)
    return `${nameWithoutExtension}${randomNumber}${extension}`
  }

  // 如果没有点，直接在末尾添加随机数
  return `${fileName}${randomNumber}`
}

const handleAction = async file => {
  // // 定义要执行的函数
  // function doSomething() {
  //   console.log('这段代码将在 5 秒后执行')
  // }

  // // 使用 setTimeout 等待 5 秒（5000 毫秒）
  // setTimeout(doSomething, 1000)
  //let tmpFileName = file.name + Math.ceil(Math.random() * 10000)

  let tmpFileName = handleFileName(file.name)

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

  let tmp2 = await ModelList({
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
  console.log('模型列表获取', tmp2.data.total)
  totalPage.value = tmp2.data.total
  cardInfos.value = tmp2.data.list

  cardInfo.value.name = ''
  cardInfo.value.desc = ''
  fileList.value = []
}

const updateModelButton = async () => {
  let tmp = await ModelUpdate({
    id: cardInfo.value.id,
    name: cardInfo.value.name,
    desc: cardInfo.value.desc,
    fileName: cardInfo.value.fileName
  })
  modelUpdatePanel.value = false

  message.info(tmp.msg)

  let tmp2 = await ModelList({
    pageNum: currentPage.value,
    pageSize: pageSize.value
  })
  console.log('模型列表获取', tmp2.data.total)
  totalPage.value = tmp2.data.total
  cardInfos.value = tmp2.data.list

  // cardInfo.name=''
  // cardInfo.desc=''
  // fileList.value=[]

  // window.location.reload()
}

const fileList = ref([])

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

watch(searchText, filterCards)
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

body
  > div:nth-child(4)
  > div
  > div.ant-modal-wrap.ant-modal-centered
  > div
  > div.ant-modal-content
  > div.ant-modal-body
  > span.ant-upload-wrapper.css-dev-only-do-not-override-19iuou
  > div.ant-upload-list.ant-upload-list-text
  > div
  > div
  > div.ant-upload-text-icon {
  display: none;
}

.ant-upload-text-icon {
  display: none !important;
}
</style>
