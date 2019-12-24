import * as R from 'ramda'
import config from './config'

/**
 * 计算方差
 * @param {*} countries 国家数据
 */
function variance (countries) {
  // 1. 尖端战力
  const topPowers = getTopPowers(countries)

  // 2. 活跃总战力
  const activePowers = getActivePowers(countries)

  // 3. 充值
  const payMoneys = getPayMoneys(countries)

  // 4. 30日内充值
  const payMoneys30 = getPayMoneys30(countries)

  // 5. 玩家数
  const playerNums = getActivePlayerNums(countries)

  // 6. 活跃coin
  const activeCoins = getActiveCoins(countries)

  const totalNum = Math.floor(R.sum(playerNums) * 0.1) * 10
  let numRight = R.find(x => {
    return totalNum === x[0]
  })(config.numRight)
  numRight = numRight || config.numRight[config.numRight.length - 1]

  const potentials = getPotentials(topPowers, activePowers, payMoneys, payMoneys30, playerNums, activeCoins)
  const potentialAverage = average(potentials)
  return Math.round(R.compose(R.sum, R.map(num => Math.pow(num - potentialAverage, 2)))(potentials) / numRight[1])
}

/**
 * 计算国家潜力值 尖端战力
 */
function getTopPowers (countries) {
  let rank = countries.map((arr, i) => arr.map((item, j) => {
    return { id: `${i}_${j}`, power: item.topPower }
  }))
  rank = R.sort(R.descend(R.prop('power')), R.flatten(rank)) // 当前区服战力排行
  let topPowerArr = countries.map((arr, i) => arr.map((item, j) => {
    const rankIndex = R.findIndex(R.propEq('id', `${i}_${j}`), rank)
    if (rankIndex < config.Right1.length) {
      return item.topPower * config.Right1[rankIndex]
    }
    return 0
  }))
  const topPowers = R.map(R.sum, topPowerArr)
  return R.map(x => x / average(topPowers), topPowers)
}

/**
 * 计算国家潜力值 活跃战力
 */
function getActivePowers (countries) {
  const activePowers = R.map(R.compose(R.sum, R.map(R.prop('activePowerSum'))), countries)
  return R.map(x => x * config.Right2 / average(activePowers), activePowers)
}

/**
 * 计算国家潜力值 充值
 */
function getPayMoneys (countries) {
  const payMoneys = R.map(R.compose(R.sum, R.map(R.compose(R.sum, R.props(['activePay', 'activePayFake'])))), countries)
  return R.map(x => x * config.Right3 / average(payMoneys), payMoneys)
}

/**
 * 计算国家潜力值 30日充值
 */
function getPayMoneys30 (countries) {
  const payMoneys = R.map(R.compose(R.sum, R.map(R.prop('activePay30'))), countries)
  return R.map(x => x * config.Right4 / average(payMoneys), payMoneys)
}

/**
 * 计算国家潜力值 玩家数
 */
function getActivePlayerNums (countries) {
  const playNums = R.map(R.compose(R.sum, R.map(R.compose(R.sum, R.props(['powerfulNum', 'activeNum'])))), countries)
  return R.map(x => x * config.Right5 / average(playNums), playNums)
}

/**
 * 计算国家潜力值 活跃coin
 */
function getActiveCoins (countries) {
  const activeCoins = R.map(R.compose(R.sum, R.map(R.prop('activeCoin'))), countries)
  return R.map(x => x * config.Right6 / average(activeCoins), activeCoins)
}

/**
 * 计算国家潜力值
 */
function getPotentials (...args) {
  return R.map(R.sum)(R.transpose(args))
}

/**
 * 计算平均数
 * @param {Array} nums 数字组成的数组
 */
function average (nums) {
  const lengthOfArr = arr => arr.length
  return R.converge(R.divide, [R.sum, lengthOfArr])(nums)
}

export { variance }
