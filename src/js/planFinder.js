// import * as R from 'ramda'
const R = require('ramda')
let config = null
const mapIndexed = R.addIndex(R.map)

function sortByProp (prop) {
  return R.sortWith([R.descend(R.prop(prop))])
}

function allocateTop6 (top3) {
  const top3Pos = []
  const countrys = R.map(R.prop('country'))(top3)
  top3Pos[0] = countrys[0]
  if (countrys[1] !== countrys[0]) {
    top3Pos[1] = countrys[1]
    top3Pos[2] = 3 - countrys[0] - countrys[1]
  } else if (countrys[2] !== countrys[0]) {
    top3Pos[2] = countrys[2]
    top3Pos[1] = 3 - countrys[0] - countrys[2]
  } else {
    top3Pos[1] = (countrys[0] + 1) % 3
    top3Pos[2] = (countrys[0] + 2) % 3
  }
  let result = [[]]
  for (let i = 0; i < 3; ++i) {
    for (let len = result.length - 1; len >= 0; --len) {
      const temp = result[len].slice(0, i)
      const arr = R.map(id => {
        const temp2 = temp.concat()
        temp2[i] = id
        return temp2
      })([3, 4, 4])
      result.splice(len, 1, ...arr)
    }
  }
  return R.map(item => top3Pos.concat(item))(result)
}

function getPlans (countries) {
  if (!config) {
    config = JSON.parse(localStorage.getItem('merge-tool-config'))
  }
  const sortWithPower = sortByProp('topPower')
  // 按照尖端战力排序
  let dataSorted = sortWithPower(countries.concat())
  // 计算所有国家潜力
  const { Right2, Right3, Right4, Right5, Right6 } = config
  mapIndexed((item, i) => {
    const right1 = config.Right1[Math.floor(i / 3)] || 0
    item.potential = item.topPower * right1 +
    item.activePowerSum * Right2 +
    (item.activePay + item.activePayFake) * Right3 +
    item.activePay30 * Right4 +
    (item.powerfulNum + item.activeNum) * Right5 +
    item.activeCoin * Right6
  })(dataSorted)
  const sortWithPotential = sortByProp('potential')
  // 按照国家潜力排序
  dataSorted = sortWithPotential(dataSorted)
  const top3 = dataSorted.slice(0, 3)
  const top6 = allocateTop6(top3)
  console.log(top6)
}
