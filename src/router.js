import Vue from 'vue'
import VueRouter from 'vue-router'
import About from './components/About'
import Index from './components/Index'
import Merge from './components/Merge'
import Calculate from './components/Calculate'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/index', component: Index },
    { path: '/about', component: About },
    { path: '/merge', component: Merge },
    { path: '/calculate', name: 'Calculate', component: Calculate }
  ]
})
