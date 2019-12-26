
import * as R from 'ramda'
import config from '../../js/config'
import { getMergePlans } from '../../js/mergeUtil'

// initial state
const state = {
  countries: [],
  items: [],
  bestPlans: [],
  logs: null
}

// getters
const getters = {
  countries: state => state.countries,
  plans: state => state.items,
  bestPlans: state => state.bestPlans,
  logs: state => state.logs
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
      })(config.reward)
      obj.reward = R.mergeWith(R.add, ...rewards)
      return obj
    })(countries))
    console.time('计算所有方案及其方差')
    const plans = getMergePlans(countries)
    console.timeEnd('计算所有方案及其方差')
    state.items = Object.freeze(plans)
    state.bestPlans = R.compose(R.map(item => item[0][1]), R.filter(Array.isArray))(plans)
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
