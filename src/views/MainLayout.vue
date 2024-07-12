<template>
  <div class="container">
    <a-menu
      mode="inline"
      :default-selected-keys="selectedKeys"
      :default-open-keys="openKeys"
      @select="handleSelect"
      class="left-side"
      style="height: 100vh"
    >
      <a-menu-item key="project">项目</a-menu-item>
      <a-menu-item key="model">模型</a-menu-item>
      <!-- <a-sub-menu key="model" title="模型">
        <a-menu-item key="model1">模型1</a-menu-item>
        <a-menu-item key="model2">模型2</a-menu-item>
      </a-sub-menu> -->
      <a-sub-menu key="device" title="设备">
        <a-menu-item-group key="device-group" title="在线设备">
          <a-menu-item key="device-online1">设备1</a-menu-item>
          <a-menu-item key="device-online2">设备2</a-menu-item>
        </a-menu-item-group>
        <a-menu-item-group key="device-group" title="离线设备">
          <a-menu-item key="device-offline1">设备1</a-menu-item>
          <a-menu-item key="device-offline2">设备2</a-menu-item>
        </a-menu-item-group>
      </a-sub-menu>
      <a-menu-item key="deploy">部署</a-menu-item>
    </a-menu>
    <div style="flex: 1">
      <router-view class="right-side" style="flex: initial"></router-view>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { Menu } from 'ant-design-vue'
import { useRouter } from 'vue-router'

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

    const handleSelect = ({ key }) => {
      console.log('selected key:', key)
      router.push(key)
    }

    return {
      selectedKeys,
      openKeys,
      handleSelect
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
