export default {
  initStore (state, { zoneRange, startZone, countries, lastPlan }) {
    const matchs = startZone.match(/^h(\d+)_(\d+)$/)
    state.mergeTimes = parseInt(matchs[1])
    state.startIndex = parseInt(matchs[2])
    state.zoneRange = zoneRange
    state.countries = countries
    state.lastPlan = lastPlan
    state.mergeOld.plans = []
  }
}
