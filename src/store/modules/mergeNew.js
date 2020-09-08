import { calculatePlans, refreshPlan } from '../../js/planGeneratorNew'

const state = {
  countries: [],
  mergeTimes: 3,
  plans: []
}

const getters = {
  countries: state => state.countries,
  mergeTimes: state => state.mergeTimes,
  plans: state => state.plans
}

const mutations = {
  setCountries (state, [countries, mergeTimes]) {
    state.countries = countries
    state.mergeTimes = mergeTimes
    state.plans = calculatePlans(countries)
  },
  moveTo (state, [fromZone, toZone, [zone, cid]]) {
    const index = state.countries.findIndex(item => item.zone === zone && item.country === cid)
    
    // 移出原方案
    const arr = state.plans[fromZone].find(arr => arr.indexOf(index) !== -1)
    arr.splice(arr.indexOf(index), 1)
    
    // 加入新方案
    const newArr = state.plans[toZone].flat()
    newArr.push(index)
    const goal = state.plans[toZone]
    goal.splice(0, goal.length, ...refreshPlan(state.countries, newArr))
  },
  savePlan (state, [plan, i]) {
    state.plans[i] = plan
  }
}

const actions = {
  merge ({ commit, rootState }) {
    commit('setCountries', [rootState.countries, rootState.mergeTimes])
  },
  moveTo ({ commit }, data) {
    commit('moveTo', data)
  },
  savePlan ({ commit }, data) {
    commit('savePlan', data)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
