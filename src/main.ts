import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import router from './router';
import pinia from './store';
import 'element-plus/dist/index.css';
import './style.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(ElementPlus).use(router).use(pinia).mount('#app')
