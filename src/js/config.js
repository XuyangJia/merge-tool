import crypto from 'crypto'
const cfg = {
  right: [
    { // 一次合服
      Right1: [32, 30, 28, 26, 24, 0],
      Right2: 30,
      Right3: 40,
      Right4: 60,
      Right5: 35,
      Right6: 40,
      idealS: 500, // 理想比较方差
      maxNum: 250, // 人数上限
      queryTimes: 100, // 查找次数
      busyRatio: 1.005, // 幂系数
      freeRatio: 1.02 // 未分标力系数
    },
    { // 二次合服
      Right1: [32, 30, 28, 26, 24, 0],
      Right2: 55,
      Right3: 65,
      Right4: 100,
      Right5: 45,
      Right6: 70,
      idealS: 500, // 理想比较方差
      maxNum: 330, // 人数上限
      queryTimes: 100, // 查找次数
      busyRatio: 1.005, // 幂系数
      freeRatio: 1.02 // 未分标力系数
    },
    { // 三次合服
      Right1: 32,
      Right2: 55,
      Right3: 65,
      Right4: 100,
      Right5: 15,
      Right6: 70,
      maxNum: 250 // 人数上限
    }
  ],
  numRight: [
    [110, 0.6], // 人数下限
    [120, 0.7],
    [130, 0.75],
    [140, 0.8],
    [150, 0.9],
    [160, 1],
    [170, 0.9],
    [180, 0.8],
    [190, 0.75],
    [200, 0.7],
    [210, 0.65],
    [220, 0.6],
    [230, 0.55],
    [240, 0.5]
  ],
  reward: [
    { coin: 500, item036: 5 },
    { coin: 200, item036: 10 },
    { coin: 200, item036: 10 }
  ],
  rewardExtra: [
    { coin: 500, item036: 5 },
    { coin: 200, item036: 10 },
    { coin: 200, item036: 10 }
  ]
}

function getKey (mergeTimes) {
  return crypto.createHash('md5').update(JSON.stringify(cfg)).digest('hex') + mergeTimes
}

export function getConfig (mergeTimes) {
  const key = getKey(mergeTimes)
  const localData = JSON.parse(window.localStorage.getItem(key))
  if (localData) {
    return localData
  }
  console.log(cfg)
  const { right, numRight, reward, rewardExtra } = cfg
  const config = Object.assign({ numRight, reward: reward[mergeTimes - 1], rewardExtra: rewardExtra[mergeTimes - 1] }, right[mergeTimes - 1])
  mergeTimes === 3 && delete config.numRight
  return config
}

export function saveConfig (mergeTimes, data) {
  const key = getKey(mergeTimes)
  window.localStorage.setItem(key, JSON.stringify(data))
}
