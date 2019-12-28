
import * as R from 'ramda'
import config from '../../js/config'
import { getMergePlans } from '../../js/mergeUtil'

// initial state
const state = {
  mergeTimes: 0, // 拿到的这些国家的当前合服次数
  countries: [],
  calculateing: false,
  items: [],
  bestPlans: [],
  config: null,
  logs: null
}

// getters
const getters = {
  mergeTimes: state => state.mergeTimes,
  countries: state => state.countries,
  calculateing: state => state.calculateing,
  plans: state => state.items,
  bestPlans: state => state.bestPlans,
  config: state => state.config,
  logs: state => state.logs
}

function calculatePlans (state, planIndex, zoneNum) {
  let plans = null
  state.calculateing = false
  if (zoneNum) {
    console.log(planIndex, zoneNum)
    const currentPlan = state.items[planIndex]
    plans = state.items.slice(0, planIndex)
    state.items = []
    state.bestPlans = []
    const cursor = currentPlan[1]
    const startPos = cursor * 3
    const endPos = startPos + zoneNum * 3
    const plan = getMergePlans(state.countries.slice(startPos, endPos), cursor, true)
    plans.push([plan, cursor, zoneNum])
    if (state.countries.length > endPos) {
      const remainPlans = getMergePlans(state.countries.slice(endPos), cursor + zoneNum)
      plans = plans.concat(remainPlans)
    }
  } else {
    plans = getMergePlans(state.countries)
  }
  state.items = Object.freeze(plans)
  state.calculateing = true
}

// mutations
const mutations = {
  setCountries (state, countries) {
    state.logs = ['拿到国家数据，开始计算合服方案']
    state.mergeTimes = 0
    const maxDay = R.reduce((a, b) => Math.max(a, b.days), 0)(countries)
    state.countries = Object.freeze(R.map(obj => {
      const rewardCfg = state.config.reward[state.mergeTimes]
      const equalizeDay = maxDay + (1000 / rewardCfg.coin)
      obj.reward = R.map(y => y * (equalizeDay - obj.days))(rewardCfg)
      obj.extraCoin = obj.reward.coin
      return obj
    })(countries))
    calculatePlans(state)
  },
  setConfig (state, data) {
    state.config = Object.assign(config, data)
  },
  refreshPlans (state, data) {
    data && calculatePlans(state, ...data)
  },
  setBestPlan (state, data) {
    const [planIndex, plan] = data
    state.bestPlans[planIndex] = plan[1]
  },
  addLog (state, log) {
    state.logs.push(log)
  }
}

// actions
const actions = {
  setCountryData ({ commit }, origindata) {
    commit('setCountries', origindata)
  },
  setConfigData ({ commit }, data) {
    commit('setConfig', data)
  },
  refreshPlans ({ commit }, data) {
    commit('refreshPlans', data)
  },
  setBestPlan ({ commit }, data) {
    commit('setBestPlan', data)
  },
  addLog ({ commit }, log) {
    commit('addLog', log)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
