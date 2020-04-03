const cfg = [
  { // 一次合服
    Right1: [32, 30, 28, 26, 24, 0],
    Right2: 30,
    Right3: 40,
    Right4: 60,
    Right5: 20,
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
    Right5: 15,
    Right6: 70,
    idealS: 500, // 理想比较方差
    maxNum: 250, // 人数上限
    queryTimes: 100, // 查找次数
    busyRatio: 1.005, // 幂系数
    freeRatio: 1.02 // 未分标力系数
  }
]

export default function (mergeTimes) {
  return Object.assign({
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
      { coin: 200, item036: 10 }
    ],
    titles: {
      zone: '区服',
      days: '开服天数',
      country: '国家',
      capitalNum: '都城数',
      cityNum: '城池总数',
      powerfulNum: '活跃高战',
      activeNum: '活跃中坚',
      rankScore: '排名积分',
      topPower: '活跃尖端战力',
      activePowerSum: '活跃总战力',
      activePay30: '30日充值',
      activePay: '活跃实际充值',
      activePayFake: '活跃虚拟充值',
      activeCoin: '活跃Coin',
      multiplePower: '综合国力',
      top20: 'Top20',
      top1: '单将最高战力',
      target: '目标国家',
      countryNum: '原国家数',
      coinSum: '总coin',
      potentialS: '标准化潜力'
    },
    keys: ['zone', 'days', 'country', 'capitalNum', 'cityNum', 'powerfulNum', 'activeNum', 'rankScore', 'topPower', 'activePowerSum', 'activePay30', 'activePay', 'activePayFake', 'activeCoin', 'multiplePower', 'top20', 'top1']
  }, cfg[mergeTimes])
}
