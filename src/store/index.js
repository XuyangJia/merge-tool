import Vue from 'vue'
import Vuex from 'vuex'
import merge from './modules/merge'
import createLogger from '../plugins/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV === 'development'

export default new Vuex.Store({
  modules: {
    merge
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
