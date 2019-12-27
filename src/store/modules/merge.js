
import * as R from 'ramda'
import config from '../../js/config'
import { getMergePlans } from '../../js/mergeUtil'

// initial state
const state = {
  countries: [],
  items: [],
  bestPlans: [],
  config: null,
  logs: null
}

// getters
const getters = {
  countries: state => state.countries,
  plans: state => state.items,
  bestPlans: state => state.bestPlans,
  config: state => state.config,
  logs: state => state.logs
}

function calculatePlans (state, planIndex, zoneNum) {
  let plans = null
  if (zoneNum) {
    console.log(planIndex, zoneNum)
    const currentPlan = state.items[planIndex]
    plans = state.items.slice(0, planIndex)
    const cursor = currentPlan[1]
    const startPos = cursor * 3
    const endPos = startPos + zoneNum * 3
    const plan = getMergePlans(state.countries.slice(startPos, endPos), cursor, true)
    plans.push(plan)
    if (state.countries.length > endPos) {
      const remainPlans = getMergePlans(state.countries.slice(endPos), cursor + zoneNum)
      plans = plans.concat(remainPlans)
    }
  } else {
    plans = getMergePlans(state.countries)
  }
  state.items = Object.freeze(plans)
}

// mutations
const mutations = {
  setCountries (state, countries) {
    // state.logs = ['拿到国家数据，开始计算合服方案']
    const maxDay = R.reduce((a, b) => Math.max(a, b.days), 0)(countries)
    state.countries = Object.freeze(R.map(obj => {
      const rewards = R.map(x => {
        const equalizeDay = maxDay + (1000 / x.coin)
        return R.map(y => y * (equalizeDay - obj.days))(x)
      })(state.config.reward)
      obj.reward = R.mergeWith(R.add, ...rewards)
      return obj
    })(countries))
    calculatePlans(state)
  },
  setConfig (state, data) {
    state.config = Object.assign(config, data)
  },
  refreshPlans (state, data) {
    calculatePlans(state, ...data)
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
  changeZoneNum ({ commit }, data) {
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
