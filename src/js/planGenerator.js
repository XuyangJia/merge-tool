import * as R from 'ramda'
import { getPlans } from './planFinder'
import { variance } from './variance'
let config = null

const STATUS_ZONE_SHORT = 0
const STATUS_NOT_ENOUGH = 1
const STATUS_TOO_MUCH = 2
const STATUS_NOT_EXIST = 3

let tempVariances = null
let cursor = 0
let zoneNum = 0
const filed = (status, msg) => ({ status, msg })

function sendMsg (msg) {
  console.log(msg)
}

function getSingleMergePlan (data, force) {
  const minNum = config.numRight[0][0]
  const maxNum = config.maxNum

  const num = data.length / 3
  const sum = countPlayers(data)
  const zonesStr = ` (${data[0].zone}区-${data[data.length - 1].zone}区) `
  if (num < 2) {
    zoneNum = num
    return filed(STATUS_ZONE_SHORT, `区数量不足${zonesStr}`)
  } else if (sum < minNum) {
    return filed(STATUS_NOT_ENOUGH, `人数不足: ${sum} < ${minNum}${zonesStr}`)
  } else if (sum > maxNum && force !== true && num > 2) {
    return filed(STATUS_TOO_MUCH, `人数过多: ${sum} > ${maxNum}${zonesStr}`)
  } else {
    sendMsg(`尝试${zonesStr} 共计${num}个区进行合并，当前总人数${sum}`)
    return calculate(data)
  }
}

function calculate (data) {
  // 列出所有方案
  const plans = getPlans(data, config)

  const variances = R.map(plan => variance(plan, data, config), plans)
  const exist = R.any(R.flip(R.lte)(config.idealS), variances)
  const result = R.sortBy(R.prop('0'), R.zip(variances, plans))
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
    return acc + elem.powerfulNum + elem.activeNum + elem.normalNum
  }, 0, arr)
}

function chooseBest () {
  const sortByFirstItem = R.sortBy(R.prop(0))
  const minVariances = R.map(obj => sortByFirstItem(obj)[0])(tempVariances)
  const index = minVariances.findIndex(x => x === sortByFirstItem(minVariances)[0])
  const result = tempVariances[index]
  zoneNum = result[0][1].length / 3
  return result
}

function testMerge (countries) {
  zoneNum++
  const current = countries.slice(0, zoneNum * 3)
  const testData = getSingleMergePlan(current)
  if ((testData.status === STATUS_TOO_MUCH && R.flatten(tempVariances).length) || (testData.status === STATUS_NOT_EXIST && countries.length < (zoneNum + 1) * 3)) {
    return chooseBest()
  } else if (!Array.isArray(testData) && countries.length >= (zoneNum + 1) * 3) {
    if (testData.status === STATUS_NOT_ENOUGH || testData.status === STATUS_NOT_EXIST) {
      return testMerge(countries)
    }
  }
  return testData
}

function getAllMergePlan (countries, plans) {
  tempVariances = [] // 清空临时记录
  zoneNum = 1
  let plan = testMerge(countries)
  if (Array.isArray(plan)) {
    plan = plan.slice(0, 200)
  }
  plans.push([plan, cursor, zoneNum])
  if (Array.isArray(plan)) {
    cursor += zoneNum
    countries.splice(0, zoneNum * 3)
    if (countries.length) {
      return getAllMergePlan(countries, plans)
    }
  }
  return plans
}

export function getMergePlans (countries, progress, single, cfg) {
  config = cfg
  cursor = progress || 0
  countries = countries.concat()
  if (single) {
    tempVariances = []
    const plan = getSingleMergePlan(countries, true)
    return tempVariances[0] || plan
  }
  return getAllMergePlan(countries, [])
}
