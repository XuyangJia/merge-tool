import { getMergePlans } from '../../js/planGenerator'
import { getConfig } from '../../js/config'

const state = {
  lastPlanObj: {},
  countries: [],
  mergeTimes: 1,
  plans: [],
  lastPlans: [],
  bestPlans: [],
  adjustPlans: []
}

const getters = {
  lastPlanObj: state => state.lastPlanObj,
  countries: state => state.countries,
  mergeTimes: state => state.mergeTimes,
  plans: state => state.plans,
  lastPlans: state => state.lastPlans,
  bestPlans: state => state.bestPlans,
  adjustPlans: state => state.adjustPlans
}

function calculatePlans (state, planIndex, zoneNum) {
  let plans = null
  const config = getConfig(state.mergeTimes)
  if (zoneNum) {
    const currentPlan = state.plans[planIndex]
    plans = state.plans.slice(0, planIndex)
    state.plans = []
    state.bestPlans = []
    const cursor = currentPlan[1]
    const startPos = cursor * 3
    const endPos = startPos + zoneNum * 3
    const plan = getMergePlans(state.countries.slice(startPos, endPos), cursor, true, config)
    plans.push([plan, cursor, zoneNum])
    if (state.countries.length > endPos) {
      const remainPlans = getMergePlans(state.countries.slice(endPos), cursor + zoneNum, false, config)
      plans = plans.concat(remainPlans)
    }
  } else {
    state.adjustPlans = []
    plans = getMergePlans(state.countries, 0, false, config)
  }
  state.plans = plans
}

const mutations = {
  setCountries (state, [countries, mergeTimes]) {
    state.countries = countries
    state.mergeTimes = mergeTimes
    if (state.lastPlans.length === 0) {
      calculatePlans(state)
    } else {
      state.plans = state.bestPlans = []
    }
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

const actions = {
  merge ({ commit, rootState }) {
    commit('setCountries', [rootState.countries, rootState.mergeTimes])
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
