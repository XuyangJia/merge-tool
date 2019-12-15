import { getMergePlans } from '../../js/merge'

// initial state
const state = {
  countries: [],
  plans: []
}

// getters
const getters = {}

// mutations
const mutations = {
  setCountries (state, countries) {
    state.countries = countries
    const plans = getMergePlans(countries.slice(0, 9), true)
    console.log(plans)
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
