<template>
  <div style="background: #ececec; padding: 30px; height: 100vh">
    <div style="font-size: 30px; font-weight: 600">模型</div>
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
                <!-- <a-button style="flex: 1; min-height: 30px" key="编辑"
                  >编辑</a-button
                >
                <a-button style="flex: 1" key="删除">删除</a-button> -->
                <div style="flex: 1">编辑</div>
                <div style="flex: 1">删除</div>
              </div>
            </template>
            <!-- <template #actions>
              <a-space style="display: flex">
                <a-button type="primary" block style="flex: 1">按钮1</a-button>
                <a-button block style="flex: 1">按钮2</a-button>
              </a-space>
            </template> -->
          </a-card>
        </a-col>
      </a-row>
    </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ModelCreate, PresignUrl, ModelList } from '../api/api.js'
import requests from '../api/request.js'

onMounted(async () => {
  let tmp = await ModelList({
    pageNum: 0,
    pageSize: 100
  })
  console.log('模型列表获取', tmp)
  cardInfos.value = tmp.data.list
})

const uploadFileList = ref()

const handleChange = ({ file, fileList }) => {
  console.log('###handleChange', file, fileList, file.name)
  uploadFileList.value = file.name
  console.log('123', uploadFileList.value)
}

const handleAction1 = async file => {
  await setTimeout(handleAction, 1000)
  console.log('handleAction的file', file.name)
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
  //   console.log('这段代码将在5秒后执行')
  // }

  // // 使用setTimeout等待5秒（5000毫秒）
  // setTimeout(doSomething, 1000)
  try {
    const data = await PresignUrl({
      modelName: createModelInfo.name,
      fileName: file.name
    })
    createModelInfo.modelFileName = file.name
    console.log(
      '###执行了handleAction',
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
    modelFileName: createModelInfo.modelFileName
  })
  console.log('tmp', tmp)
  inputButtonVisible.value = false
  window.location.reload()
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
