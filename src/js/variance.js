import * as R from 'ramda'
import config from './config'

const mapIndexed = R.addIndex(R.map)

/**
 * 计算方差
 * @param {*} countries 国家数据
 */
function variance (plan, countries) {
  // 1. 尖端战力
  const topPowers = getTopPowers(plan, countries)
  const activePowers = getSumByProp(plan, countries, config.Right2, ['activePowerSum']) // 计算国家潜力值 活跃战力
  const payMoneys = getSumByProp(plan, countries, config.Right3, ['activePay', 'activePayFake']) // 计算国家潜力值 充值
  const payMoneys30 = getSumByProp(plan, countries, config.Right4, ['activePay30']) // 计算国家潜力值 30日充值
  const playerNums = getSumByProp(plan, countries, config.Right5, ['powerfulNum', 'activeNum']) // 计算国家潜力值 玩家数
  const activeCoins = getSumByProp(plan, countries, config.Right6, ['activeCoin']) // 计算国家潜力值 活跃coin

  const totalNum = Math.floor(R.sum(playerNums) * 0.1) * 10
  let numRight = R.find(x => {
    return totalNum === x[0]
  })(config.numRight)
  numRight = numRight || config.numRight[config.numRight.length - 1]

  console.log({ topPowers, activePowers, payMoneys, payMoneys30, playerNums, activeCoins })
  const potentials = getPotentials(topPowers, activePowers, payMoneys, payMoneys30, playerNums, activeCoins)
  const potentialAverage = average(potentials)
  console.log(`potentials：${potentials}`)
  console.log(`平均潜力值：${potentialAverage}`)
  return Math.round(R.compose(R.sum, R.map(num => Math.pow(num - potentialAverage, 2)))(potentials) / numRight[1])
}

/**
 * 计算国家潜力值 尖端战力
 */
function getTopPowers (plan, countries) {
  console.log('getTopPowers')
  const rank = R.sort(R.descend(R.prop('topPower')))(countries) // 当前区服战力排行
  let arr = [[], [], []]
  let topPowerSum = 0
  mapIndexed((val, idx) => {
    const country = plan[countries.indexOf(val)]
    const right = config.Right1[arr[country].length]
    right && arr[country].push(val.topPower * right)
    topPowerSum += val.topPower
  })(rank)
  arr = R.map(R.sum)(arr)
  console.log('topPower', arr, topPowerSum)
  return R.map(x => x / (topPowerSum / 3), arr)
}

function getSumByProp (plan, countries, right, props) {
  const arr = [0, 0, 0]
  mapIndexed((val, idx) => {
    arr[plan[idx]] += R.compose(R.sum, R.map(prop => val[prop]))(props)
  }, countries)
  console.log(props.join('-'), arr)
  return R.map(x => x * right / average(arr), arr)
}

/**
 * 计算国家潜力值
 */
function getPotentials (...args) {
  return R.map(arr => {
    console.log(arr)
    return R.sum(arr)
  })(R.transpose(args))
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
