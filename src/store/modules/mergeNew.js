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
  setCountries (state, [countries, mergeTimes, lastPlan]) {
    state.countries = countries
    state.mergeTimes = mergeTimes
    if (lastPlan) {
      const zones = Object.keys(lastPlan)
      const planObj = {}
      zones.forEach(zone => {
        lastPlan[zone].forEach(({to_zone, to_country}, country) => {
          if (!planObj[to_zone]) planObj[to_zone] = []
          if (!planObj[to_zone][to_country]) planObj[to_zone][to_country] = []
          planObj[to_zone][to_country].push(countries.findIndex(item => {
            return item.zone === zone && item.country === country
          }))
        })
      })
      const reg = /h\d_(\d+)/
      state.plans = Object.keys(planObj).sort((a, b) => {
        return parseFloat(a.match(reg)[1]) - parseFloat(b.match(reg)[1])
      }).map(key => planObj[key])
    } else {
      state.plans = calculatePlans(countries)
    }
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
  savePlan (state, [[a, b, c], i]) {
    const plan = state.plans[i]
    plan.splice(0, 3, a, b, c)
  }
}

const actions = {
  merge ({ commit, rootState }) {
    commit('setCountries', [rootState.countries, rootState.mergeTimes, rootState.lastPlan])
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
