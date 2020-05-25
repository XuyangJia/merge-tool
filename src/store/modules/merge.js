
import { getMergePlans } from '../../js/mergeUtil'

// initial state
const state = {
  mergeTimes: 0, // 拿到的这些国家的当前合服次数
  startIndex: 0, // 起始位置
  lastPlanObj: {},
  countries: [],
  items: [],
  lastPlans: [],
  bestPlans: [],
  adjustPlans: []
}

// getters
const getters = {
  mergeTimes: state => state.mergeTimes,
  startIndex: state => state.startIndex,
  lastPlanObj: state => state.lastPlanObj,
  countries: state => state.countries,
  plans: state => state.items,
  lastPlans: state => state.lastPlans,
  bestPlans: state => state.bestPlans,
  adjustPlans: state => state.adjustPlans
}

function calculatePlans (state, planIndex, zoneNum) {
  let plans = null
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
    state.adjustPlans = []
    plans = getMergePlans(state.countries)
  }
  state.items = Object.freeze(plans)
}

// mutations
const mutations = {
  setCountries (state, countries) {
    state.countries = Object.freeze(countries)
    if (state.lastPlans.length === 0) {
      calculatePlans(state)
    } else {
      state.items = state.bestPlans = []
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
  },
  setAdjustPlans (state, data) {
    const [planId, varianceDIY, plan] = data
    state.adjustPlans[planId] = [varianceDIY, plan]
  },
  setLastPlanObj (state, data) {
    state.lastPlanObj = data
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
  },
  setAdjustPlans ({ commit }, data) {
    commit('setAdjustPlans', data)
  },
  setLastPlanObj ({ commit }, data) {
    commit('setLastPlanObj', data)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
