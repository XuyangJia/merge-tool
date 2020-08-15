import { sum, variance } from './util'
import { getPotential, getPlayerNum } from './mergeUtil'
import { getConfig } from './config'

export function calculatePlans (countries) {
  const potentials = countries.map((country, i) => {
    return { i, potential: getPotential(country) }
  }).sort((a, b) => b.potential - a.potential)
  const { maxNum } = getConfig(3)
  const playerNums = countries.map(getPlayerNum)
  const totalNum = sum(playerNums)
  const zoneNum = Math.floor(totalNum / maxNum)

  // 初始化基础区中的国家
  const plans = new Array(zoneNum).fill(null).map((item, i) => {
    const plan = [[i], [zoneNum * 2 - i - 1], [zoneNum * 2 + i]]
    const planPotential = plan.map(arr => sum(arr.map(i => potentials[i].potential)))
    return {
      plan,
      planPotential,
      variance: variance(planPotential)
    }
  })

  // 将剩余的国家插入分配好的方案中
  for (let i = zoneNum * 3, len = potentials.length; i < len; i++) {
    const set = new Set()
    plans.forEach(item => set.add(item.plan.flat().length))
    const numArr = [...set].sort((a, b) => a - b )
    const planArr = numArr.map(len => {
      return plans.filter(item => item.plan.flat().length === len )
    })[0]
    const plan = planArr.sort((a, b) => b.variance - a.variance )[0]
    const element = potentials[i]
    insertCountry(plan, element, i)
  }
  return plans.map(item => item.plan.map(arr => arr.map(index => potentials[index].i)))
}

function insertCountry (plan, element, i) {
  const minPotential = Math.min(...plan.planPotential)
  const index = plan.planPotential.indexOf(minPotential)
  plan.plan[index].push(i)
  plan.planPotential[index] += element.potential
  plan.variance = variance(plan.planPotential)
}

export function refreshPlan (countries, list) {
  const potentials = list.map(i => {
    return { i, potential: getPotential(countries[i]) }
  }).sort((a, b) => b.potential - a.potential)

  // 初始化基础的三个国家
  const base = potentials.slice(0, 3)
  const plan = {
    plan: base.map(item => [item.i]),
    planPotential: base.map(item => item.potential)
  }

  // 将剩余的国家插入分配好的方案中
  for (let i = 3, len = potentials.length; i < len; i++) {
    const element = potentials[i]
    insertCountry(plan, element, i)
  }
  return plan.plan
}
