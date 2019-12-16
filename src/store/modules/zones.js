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
    state.countries = countries
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
