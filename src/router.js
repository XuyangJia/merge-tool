import Vue from 'vue'
import VueRouter from 'vue-router'
import About from './components/About.vue'
import Index from './components/Index.vue'
import Merge from './components/Merge.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: Index },
    { path: '/merge', component: Merge },
    { path: '/about', component: About }
  ]
})
