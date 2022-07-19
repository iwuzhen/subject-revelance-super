import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import { store } from "./pinia";
import piniaPersist from "pinia-plugin-persist";
import router from "./router";

store.use(piniaPersist);

createApp(App).use(store).use(router).use(ElementPlus).mount("#app");
