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
      ></router-view>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, provide } from 'vue'
import { Menu } from 'ant-design-vue'
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

    watch(
      () => route.params.id,
      (newId, oldId) => {
        if (newId !== oldId) {
          // 当 id 变化时，刷新页面
          window.location.reload()
        }
      }
    )

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

    const updateMenuMethod = async () => {
      console.log('执行更新动态路由')

      let tmp = await allOnlineListDeviceReq()
      // console.log('testtest', tmp.data, tmp.data.onlineList)
      if (tmp.data.list !== undefined) {
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
