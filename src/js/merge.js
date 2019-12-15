import * as R from 'ramda'
import { variance } from './variance'
import config from './config'
const minNum = config.numRight[0][0]
const maxNum = config.maxNum

const STATUS_OK = -1
const STATUS_NOT_ENOUGH = 0
const STATUS_TOO_MUCH = 1
const STATUS_NOT_EXIST = 2

const filed = (status, msg) => ({ status, msg })
const success = data => ({ status: STATUS_OK, data })

function getSingleMergePlan (data) {
  const zoneNum = data.length / 3
  const sum = countPlayers(data)
  if (sum < minNum) {
    return filed(STATUS_NOT_ENOUGH, '人数不足')
  } else if (sum > maxNum) {
    return filed(STATUS_TOO_MUCH, '人数过多')
  } else {
    console.log(`尝试${zoneNum}个区进行合并，当前总人数${sum}`)
    return calculate(data)
  }
}

function calculate (data) {
  const sortByPower = R.sortBy(R.prop('topPower'))
  const top3 = R.compose(R.take(3), sortByPower)(data.concat()) // 按照尖端战力排序后取前三
  const base = R.map(x => data.indexOf(x))(top3)

  // 列出所有方案
  const plans = getAllPlans(base, data.length)
  const variances = R.map(R.compose(variance, R.map(item => R.map(i => data[i], item))), plans)
  const exist = R.any(R.flip(R.lte)(config.idealS), variances)
  if (exist) {
    return success([R.sortBy(R.prop('0'), R.zip(variances, plans)), data])
  } else {
    return filed(STATUS_NOT_EXIST, '方差不满足')
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

function getAllMergePlan (countries, plans) {
  let current = countries.splice(0, 6)
  const plan = getSingleMergePlan(current)
  switch (plan.status) {
    case STATUS_OK:
      break
    case STATUS_NOT_ENOUGH:
      break
    case STATUS_TOO_MUCH:
      break
    case STATUS_NOT_EXIST:
      break
  }
}

export function getMergePlans (countries, single) {
  if (single) {
    return getSingleMergePlan(countries)
  }
  if (countries.length < 6) {
    return filed(3, '一个区就别合了')
  }
  return getAllMergePlan(countries, [])
}
