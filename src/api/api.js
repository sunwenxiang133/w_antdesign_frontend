import requests from './request.js'

export const testApiParams = params =>
  requests.get('/v1/deploy/create', { params })

export const testApiData = data => requests.post('/v1/deploy/create', data)

export const DeployCreate = data => requests.post('/v1/deploy/create', data)

export const DeployList = data => requests.post('/v1/deploy/list', data)

export const DeployRestart = data => requests.post('/v1/deploy/restart', data)

export const DeployStatus = data => requests.post('/v1/deploy/status', data)

export const DeployStop = data => requests.post('/v1/deploy/stop', data)

export const DeviceList = data => requests.post('/v1/device/list', data)

export const ProjectCreate = data => requests.post('/v1/project/create', data)

export const ModelCreate = data => requests.post('/v1/model/create', data)

export const PresignUrl = data => requests.post('/v1/model/presignUrl', data)

export const PresignedUrl = data =>
  requests.post('/v1/project/presignedUrl', data)

export const ModelList = data => requests.post('/v1/model/list', data)

export const ProjectListReq = data => requests.post('/v1/project/list', data)
