import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import moment from 'moment'
import VueSocketIO from 'vue-socket.io'
import 'moment/locale/zh-cn';
import '@mdi/font/css/materialdesignicons.css';
moment.locale('zh-cn');

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
    debug: true,
    connection: process.env.VUE_APP_WS_HOST, // socket 服务器所在地址
}))

new Vue({
    sockets: {
        // 可以用来测试 是否链接成功了
        connect: function () {
            console.log('vue-socket.io 链接成功！')
        },
    },
    vuetify,
    render: h => h(App)
}).$mount('#app')
