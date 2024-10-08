import requests from './request.js'

export const testApiParams = params =>
  requests.get('/v1/deploy/create', { params })

export const testApiData = data => requests.post('/v1/deploy/create', data)

// NOTE: 部署任务创建
export const DeployCreate = data => requests.post('/v1/deploy/create', data)

// NOTE: 部署任务列表
export const DeployList = data => requests.post('/v1/deploy/list', data)

// NOTE: 部署任务重启
export const DeployRestart = data => requests.post('/v1/deploy/restart', data)

// NOTE: 部署任务重新下载并启动

export const DeployRestartDownload = data =>
  requests.post('/v1/deploy/redeploy', data)

// NOTE: 部署任务状态
export const DeployStatus = data => requests.post('/v1/deploy/status', data)

// NOTE: 部署任务停止
export const DeployStop = data => requests.post('/v1/deploy/stop', data)

// NOTE: 部署任务列表 (设备)
export const DeployListDevice = data =>
  requests.post('/v1/deploy/list/device', data)

// NOTE: 部署任务删除
export const DeployDelete = data => {
  requests.post('/v1/deploy/delete', data)
}

// NOTE: 获取设备列表
export const DeviceList = data => requests.post('/v1/device/list', data)

// NOTE: 模型添加
export const ModelCreate = data => requests.post('/v1/model/create', data)

// NOTE: 预签名 URL(模型)
export const PresignUrl = data => requests.post('/v1/model/presignedUrl', data)

// NOTE:模型列表
export const ModelList = data => requests.post('/v1/model/list', data)

// NOTE: 模型修改
export const ModelUpdate = data => requests.post('/v1/model/update', data)

// NOTE: 模型删除
export const ModelDelete = data => requests.post('/v1/model/delete', data)

// NOTE: 预签名 URL
export const PresignedUrl = data =>
  requests.post('/v1/project/presignedUrl', data)

// NOTE: 项目列表
export const ProjectListReq = data => requests.post('/v1/project/list', data)

// NOTE: 项目搜索
export const ProjectListSearch = data =>
  requests.post('/v1/project/list/search', data)

// NOTE: 项目更新
export const ProjectUpdate = data => requests.post('/v1/project/update', data)

// NOTE: 项目删除
export const ProjectDelete = data => requests.post('/v1/project/delete', data)

// NOTE: 项目添加
export const ProjectCreate = data => requests.post('/v1/project/create', data)

// 模型搜索
export const ModelSearch = data => requests.post('/v1/model/listByName', data)

// 更改设备名称
export const DeviceUpdate = data => requests.post('/v1/device/update', data)

// 单个在线设备查询
export const onlineListDeviceReq = data =>
  requests.post('/v1/device/info', data)

export const allOnlineListDeviceReq = data =>
  requests.post('/v1/device/onlineList', data)

// NOTE: 部署任务搜索
export const DeploySearch = data => requests.post('/v1/deploy/search', data)
