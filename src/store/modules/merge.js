
import * as R from 'ramda'
import { getMergePlans } from '../../js/mergeUtil'

// initial state
const state = {
  mergeTimes: 0, // 拿到的这些国家的当前合服次数
  startIndex: 0, // 起始位置
  countries: [],
  calculateing: false,
  items: [],
  lastPlans: [],
  bestPlans: []
}

// getters
const getters = {
  mergeTimes: state => state.mergeTimes,
  startIndex: state => state.startIndex,
  countries: state => state.countries,
  calculateing: state => state.calculateing,
  plans: state => state.items,
  lastPlans: state => state.lastPlans,
  bestPlans: state => state.bestPlans
}

function calculatePlans (state, planIndex, zoneNum) {
  let plans = null
  state.calculateing = false
  if (zoneNum) {
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
    const maxDay = R.reduce((a, b) => Math.max(a, b.days), 0)(countries)
    state.countries = Object.freeze(R.map(obj => {
      const config = JSON.parse(localStorage.getItem('merge-tool-config'))
      const rewardCfg = config.reward[state.mergeTimes - 1]
      const equalizeDay = maxDay + (1000 / rewardCfg.coin)
      obj.reward = R.map(y => y * (equalizeDay - obj.days))(rewardCfg)
      obj.extraCoin = obj.reward.coin
      return obj
    })(countries))
    if (state.lastPlans.length === 0) {
      calculatePlans(state)
    } else {
      state.items = state.bestPlans = []
      state.calculateing = true
    }
  },
  setStartZone (state, startId) {
    const matchs = startId.match(/^h(\d+)_(\d+)$/)
    state.mergeTimes = parseInt(matchs[1])
    state.startIndex = parseInt(matchs[2])
  },
  refreshPlans (state, data) {
    data && calculatePlans(state, ...data)
  },
  setBestPlan (state, data) {
    const [planIndex, plan] = data
    state.bestPlans[planIndex] = plan[1]
  },
  setLastPlans (state, data) {
    state.lastPlans = data
  }
}

// actions
const actions = {
  setStartZone ({ commit }, data) {
    commit('setStartZone', data)
  },
  setCountryData ({ commit }, origindata) {
    commit('setCountries', origindata)
  },
  refreshPlans ({ commit }, data) {
    commit('refreshPlans', data)
  },
  setBestPlan ({ commit }, data) {
    commit('setBestPlan', data)
  },
  setLastPlans ({ commit }, data) {
    commit('setLastPlans', data)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
