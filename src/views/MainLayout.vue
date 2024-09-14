<template>
  <div class="container">
    <a-menu
      mode="inline"
      :default-selected-keys="selectedKeys"
      :default-open-keys="['device']"
      @select="handleSelect"
      class="left-side"
      style="height: 100vh"
    >
      <template v-for="menu in menus" :key="menu.key">
        <a-menu-item v-if="!menu.children" :key="menu.key">
          {{ menu.title }}
        </a-menu-item>
        <!-- <a-sub-menu v-else :key="device" :title="menu.title">
          <template v-for="subMenu in menu.children" :key="subMenu.key">
            <a-menu-item-group
              v-if="subMenu.children"
              :key="subMenu.key"
              :title="subMenu.title"
            >
              <a-menu-item v-for="item in subMenu.children" :key="item.key">
                {{ item.title }}
              </a-menu-item>
            </a-menu-item-group>
            <a-menu-item v-else :key="subMenu.key">
              {{ subMenu.title }}
            </a-menu-item>
          </template>
        </a-sub-menu> -->
        <a-sub-menu v-else :key="device" :title="menu.title">
          <template v-for="subMenu in menu.children" :key="subMenu.key">
            <a-menu-item-group
              v-if="subMenu.children"
              :key="subMenu.key"
              :title="subMenu.title"
            >
              <a-menu-item v-for="item in subMenu.children" :key="item.key">
                {{ item.title }}
              </a-menu-item>
            </a-menu-item-group>
            <a-menu-item v-else :key="subMenu.key">
              {{ subMenu.title }}
            </a-menu-item>
          </template>
        </a-sub-menu>
      </template>
    </a-menu>
    <div style="flex: 1">
      <router-view
        class="right-side"
        style="flex: initial; overflow-y: auto"
        :key="$route.fullPath"
      ></router-view>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, provide } from 'vue'
import { Menu, message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { DeviceList, allOnlineListDeviceReq } from '../api/api'

export default defineComponent({
  components: {
    'a-menu': Menu,
    'a-menu-item': Menu.Item,
    'a-sub-menu': Menu.SubMenu,
    'a-menu-item-group': Menu.ItemGroup
  },
  setup() {
    const selectedKeys = ref(['project1'])
    const openKeys = ref(['project'])
    const router = useRouter()
    const route = useRoute()

    const routeId = route.params.id

    const menus = ref([
      {
        key: 'device',
        title: '设备',
        children: []
      },
      {
        key: 'project',
        title: '应用'
      },
      {
        key: 'model',
        title: '模型'
      },
      {
        key: 'deploy',
        title: '部署'
      }
    ])

    const handleSelect = ({ key }) => {
      console.log('selected key:', key)
      router.push(key)
    }

    let deviceBefore = ref([])
    let deviceNow = ref([])
    let deviceBeforeLength = 0

    function compareLists(oldList, newList) {
      const result = {
        added: [],
        removed: []
      }

      // 生成 oldList 中每个对象的唯一标识符的 Set，用于快速比较
      const oldSet = new Set(oldList.map(item => JSON.stringify(item)))
      const newSet = new Set(newList.map(item => JSON.stringify(item)))

      // 找出 newList 中不在 oldList 中的对象
      newList.forEach(item => {
        if (!oldSet.has(JSON.stringify(item))) {
          result.added.push(item)
        }
      })

      // 找出 oldList 中不在 newList 中的对象
      oldList.forEach(item => {
        if (!newSet.has(JSON.stringify(item))) {
          result.removed.push(item)
        }
      })

      return result
    }

    const updateDeviceBefore = async () => {
      let tmp = await allOnlineListDeviceReq()
    }

    const updateMenuMethod = async () => {
      console.log('执行更新动态路由')

      let tmp = await allOnlineListDeviceReq()
      let tmp2 = tmp.data.list.sort((a, b) => a.id - b.id)
      console.log('sunsunsun', deviceBeforeLength, tmp2, tmp.data.total)

      if (deviceBeforeLength !== tmp.data.total) {
        const result = compareLists(deviceBefore.value, tmp2)
        console.log('testtest3', tmp2, deviceBefore.value, result)
        console.log('123123123', result.added)

        let tmpString = ''
        if (deviceBeforeLength < tmp.data.total) {
          tmpString = ''
          tmpString += '设备上线\n'

          result.added.forEach(element => {
            tmpString += 'id号为:' + element.id + '\n'
          })
        }
        if (deviceBeforeLength > tmp.data.total) {
          tmpString = ''
          tmpString += '设备下线\n'

          result.removed.forEach(element => {
            tmpString += 'id号为:' + element.id + '\n'
          })
        }
        deviceBeforeLength = tmp.data.total

        deviceBefore.value = tmp2
        message.info(tmpString)
      }

      if (tmp.data.list !== undefined) {
        // console.log('testtest', tmp.data, tmp.data.onlineList)
        menus.value[0].children = []
        tmp.data.list.forEach(element => {
          menus.value[0].children.push({
            key: '/device' + element.id,
            title: element.name + '' + '(' + element.ip + ')'
          })
        })
      }
    }

    const startExecution = () => {
      let interval = 2000
      let timerId

      const executeFunction = async () => {
        // if (route.path !== allStore.currentUrl) {
        //   fastRequest = false
        // }
        updateMenuMethod()
      }

      timerId = setInterval(executeFunction, interval)
    }

    provide('updateMenuMethod', updateMenuMethod)

    onMounted(() => {
      updateMenuMethod()
      startExecution()
    })

    return {
      selectedKeys,
      openKeys,
      handleSelect,
      menus
    }
  }
})
</script>

<style scoped>
.container {
  display: flex; /* 使用 Flexbox 布局 */
  height: 100%; /* 填充父容器的高度 */
}

.left-side {
  width: 20vw; /* 左侧固定宽度为 200px */
  background-color: #f0f0f0; /* 左侧背景颜色 */
}

.right-side {
  flex: 1; /* 右侧自动填充剩余空间 */
  background-color: #e0e0e0; /* 右侧背景颜色 */
}
</style>
