import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'
import mergeOld from './modules/mergeOld'
import mergeNew from './modules/mergeNew'
import createLogger from '../plugins/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV === 'development2'

// 基础状态
const state = {
  mergeTimes: 0, // 拿到的这些国家的当前合服次数
  startIndex: 0, // 起始位置
  zoneRange: [], // 合法区段
  countries: [], // 国家数据
  lastPlan: null, // 将被还原的合服方案
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  modules: {
    mergeOld,
    mergeNew
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
