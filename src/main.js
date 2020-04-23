import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from './components/App.vue'
import store from './store'
import router from './router'
import './plugins/element.js'

// axios.defaults.headers.post['Content-Type'] = 'application/json'
Vue.use(VueAxios, axios)
Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
