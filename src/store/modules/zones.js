
import * as R from 'ramda'
import config from '../../js/config'
import { getMergePlans } from '../../js/mergeUtil'

// initial state
const state = {
  countries: [],
  items: []
}

// getters
const getters = {
  plans: state => state.items
}

// mutations
const mutations = {
  setCountries (state, countries) {
    const maxDay = R.reduce((a, b) => Math.max(a, b.days), 0)(countries)
    state.countries = R.map(obj => {
      const rewards = R.map(x => {
        const equalizeDay = maxDay + (1000 / x.coin)
        return R.map(y => y * (equalizeDay - obj.days))(x)
      })(config.reward)
      obj.extraCoin = R.prop('coin', R.mergeWith(R.add, ...rewards))
    })(countries)
    const plans = getMergePlans(countries)
    state.items = plans
  }
}

// actions
const actions = {
  getCountryData ({ commit }, origindata) {
    commit('setCountries', origindata)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
