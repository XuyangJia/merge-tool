import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from './App.vue'
import './plugins/element.js'

Vue.use(VueAxios, axios)
Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) }
}).$mount('#app')
