import * as R from 'ramda'
import { variance } from './variance'
import config from './config'
const { Cright1, Cright2, Cright3, Cright4, Cright5, Cright6, ratio } = config.Cright
const minNum = config.numRight[0][0]
const maxNum = config.maxNum

const STATUS_OK = -1
const STATUS_ZONE_SHORT = 0
const STATUS_NOT_ENOUGH = 1
const STATUS_TOO_MUCH = 2
const STATUS_NOT_EXIST = 3

const filed = (status, msg) => ({ status, msg })
const success = data => ({ status: STATUS_OK, data })

let tempVariances = null

function getSingleMergePlan (data) {
  const zoneNum = data.length / 3
  const sum = countPlayers(data)
  if (zoneNum < 2) {
    return filed(STATUS_ZONE_SHORT, '区数量不足')
  } else if (sum < minNum) {
    return filed(STATUS_NOT_ENOUGH, '人数不足')
  } else if (sum > maxNum) {
    return filed(STATUS_TOO_MUCH, '人数过多')
  } else {
    console.log(`尝试${zoneNum}个区进行合并，当前总人数${sum}`)
    return calculate(data)
  }
}

function allocateTop3 (top3) {
  const result = []
  const countrys = R.map(R.prop('country'))(top3)
  result[countrys[0]] = 0
  if (countrys[1] !== countrys[0]) {
    result[countrys[1]] = 1
    result[3 - countrys[0] - countrys[1]] = 2
  } else if (countrys[1] !== countrys[0]) {
    result[countrys[2]] = 2
    result[3 - countrys[0] - countrys[2]] = 1
  } else {
    result[(countrys[0] + 1) % 3] = 1
    result[(countrys[0] + 2) % 3] = 2
  }
  return result
}

function calculate (data) {
  const sortByPower = R.sortBy(R.prop('topPower'))
  const temp = sortByPower(data.concat()) // 按照尖端战力排序后取前三
  const top3 = R.take(3)(temp)
  const base = allocateTop3(top3).map(i => data.indexOf(temp[i]))

  const Crights = R.map(x => {
    return Cright1 * x.topPower + Cright2 * x.activePowerSum + Cright3 * (x.activePay + x.activePayFake) + Cright4 * x.activePay30 + Cright5 * x.powerfulNum + Cright6 * x.activeNum
  })(data)
  const criticalCright = Math.floor(R.sum(Crights) * ratio)
  console.log(Crights, criticalCright)

  // 列出所有方案
  const plans = getAllPlans(base, temp.length)

  const variances = R.map(R.compose(variance, R.map(item => R.map(i => data[i], item))), plans)
  const exist = R.any(R.flip(R.lte)(config.idealS), variances)
  const result = success([R.sortBy(R.prop('0'), R.zip(variances, plans)), data])
  if (exist) {
    return result
  } else {
    tempVariances.push(result)
    return filed(STATUS_NOT_EXIST, `所有组合的方差都大于${config.idealS}`)
  }
}

/**
 * 计算总人数
 * @param {Array} arr
 */
function countPlayers (arr) {
  return R.reduce((acc, elem) => {
    return acc + elem.powerfulNum + elem.activeNum
  }, 0, arr)
}

function getAllPlans (arr, num = 0) {
  function insert (item, pos, array) {
    const result = R.clone(array)
    result[pos].push(item)
    return result
  }

  let result = [R.map(x => [x])(arr)]
  if (num <= 3) return result
  Array(num).fill('').forEach((item, i) => {
    if (!arr.includes(i)) {
      const curriedInsert = R.curry(insert)(i)
      result = R.ap([curriedInsert(0), curriedInsert(1), curriedInsert(2)])(result)
    }
  })
  return result
}

function chooseBest () {
  const sortByFirstItem = R.sortBy(R.prop(0))
  const minVariances = R.map(obj => sortByFirstItem(obj.data[0])[0])(tempVariances)
  const index = minVariances.findIndex(x => x === sortByFirstItem(minVariances)[0])
  return tempVariances[index]
}

function testMerge (zoneNum, countries) {
  zoneNum++
  const current = countries.slice(0, zoneNum * 3)
  const testData = getSingleMergePlan(current)
  if (testData.status === STATUS_TOO_MUCH || (testData.status === STATUS_NOT_EXIST && countries.length < (zoneNum + 1) * 3)) {
    return chooseBest()
  } else if (testData.status !== STATUS_OK && countries.length >= (zoneNum + 1) * 3) {
    if (testData.status === STATUS_NOT_ENOUGH || testData.status === STATUS_NOT_EXIST) {
      return testMerge(zoneNum, countries)
    }
  }
  return testData
}

function getAllMergePlan (countries, plans) {
  tempVariances = [] // 清空临时记录
  const plan = testMerge(1, countries)
  plans.push(plan)
  if (plan.status === STATUS_OK) {
    countries.splice(0, plan.data[1].length)
    if (countries.length) {
      return getAllMergePlan(countries, plans)
    }
  }
  return plans
}

export function getMergePlans (countries, single) {
  if (single) {
    return getSingleMergePlan(countries)
  }
  return getAllMergePlan(countries, [])
}
