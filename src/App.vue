<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const locale = zhCN
</script>

<template>
  <a-config-provider :locale="locale">
    <router-view /> 
  </a-config-provider>
</template>



<style scoped>
.ant-upload-text-icon{
  display: none !important;
}
</style>

