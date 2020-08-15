import { sum } from './util'
export const CONSTANT = {
  keyMap: {
    zone: 'zone',
    open_days: 'days',
    country: 'country',
    capital_num: 'capitalNum',
    city_num: 'cityNum',
    powerful_num: 'powerfulNum',
    active_num: 'activeNum',
    normal_num: 'normalNum',
    rank_score: 'rankScore',
    top_power: 'topPower',
    active_power_sum: 'activePowerSum',
    thirty_pay_money: 'activePay30',
    active_pay: 'activePay',
    active_pay_fake: 'activePayFake',
    active_coin: 'activeCoin',
    multiple_power: 'multiplePower',
    top20_country_credit: 'top20',
    best_hero_power: 'top1'
  },
  titles: {
    zone: '区服',
    days: '开服天数',
    country: '国家',
    capitalNum: '都城数',
    cityNum: '城池总数',
    powerfulNum: '高战数',
    activeNum: '中坚数',
    normalNum: '低战数*0.5',
    rankScore: '排名积分',
    topPower: '尖端战力',
    activePowerSum: '活跃总战力',
    activePay30: '30日充值',
    activePay: '实际充值',
    activePayFake: '虚拟充值',
    activeCoin: 'Coin',
    multiplePower: '综合国力',
    top20: 'Top20',
    top1: '最高战力',
    target: '目标国家',
    countryNum: '原国家数',
    coinSum: '总coin',
    potentialS: '标准化潜力',
    targetZone: '目标区服'
  },
  keys: ['zone', 'days', 'country', 'capitalNum', 'cityNum', 'powerfulNum', 'activeNum', 'rankScore', 'topPower', 'activePowerSum', 'activePay30', 'activePay', 'activePayFake', 'activeCoin', 'multiplePower', 'top20', 'normalNum', 'top1']
}

export function changeServerData (list) {
  const { keys, keyMap } = CONSTANT
  return list.map(item => {
    const result = {}
    if (Array.isArray(item)) { // 列表
      keys.forEach((key, i) => {
        result[key] = item[i]
      })
      result.top1 = item[item.length - 1] // 单将最高战力永远取最后一位
      if (item.length === 17) {
        result.normalNum = 0
      } else {
        result.normalNum = item[item.length - 2] * 0.5 // 活跃低战
      }
    } else { // 字典
      for (const key in keyMap) {
        const newKey = keyMap[key]
        result[newKey] = item[key]
      }
    }
    return result
  })
}

/**
 * 计算一个国家的潜力值
 * @param {Array} item 国家数据
 */
export function getPotential (item) {
  const Right1 = 32
  const Right2 = 55
  const Right3 = 65
  const Right4 = 100
  const Right5 = 15
  const Right6 = 70
  return Right1 * item.topPower +
  Right2 * item.activePowerSum +
  Right3 * (item.activePay + item.activePayFake) +
  Right4 * item.activePay30 +
  Right5 * sum([item.powerfulNum, item.activeNum, item.normalNum]) +
  Right6 * item.activeCoin
}

export function getPlayerNum (item) {
  return sum([item.powerfulNum, item.activeNum, item.normalNum])
}

export function toZoneName (startIndex, zoneRange, mergeTimes, i) {
  let id = startIndex + i
  for (let i = 0, len = zoneRange.length; i < len; i++) {
    const arr = zoneRange[i]
    if (id <= arr[1]) {
      break
    } else {
      if (startIndex > arr[1]) {
        continue
      } else {
        id = id - (arr[1] + 1) + zoneRange[i + 1][0]
      }
    }
  }
  return `h${mergeTimes}_${id}`
}
