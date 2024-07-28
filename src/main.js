import { createApp } from 'vue'
// import './style.css'
// NOTE: 太坑了,官方文档给的是antd.css,但是没有,应该用的是reset.css
import 'ant-design-vue/dist/reset.css';
import App from './App.vue'
import Antd from 'ant-design-vue';
import router from './router/index'

// import App from './App';

const app=createApp(App)
// const app = createApp();
// app.config.productionTip = false;

app.use(Antd);
app.use(router);

app.mount('#app');
