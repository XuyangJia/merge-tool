import Vue from 'vue'
import VueRouter from 'vue-router'
import About from './components/About'
import Index from './components/Index'
import Merge from './components/Merge'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes: [
    { path: '/', component: Index },
    { path: '/about', component: About },
    { path: '/merge', component: Merge }
  ]
})
