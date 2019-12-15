import Vue from 'vue'
import Vuex from 'vuex'
import zones from './modules/zones'
import createLogger from '../plugins/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    zones
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
