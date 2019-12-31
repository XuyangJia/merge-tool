export default {
  Right1: [50, 40, 30, 20, 10, 0],
  Right2: 200,
  Right3: 30,
  Right4: 60,
  Right5: 200,
  Right6: 50,
  idealS: 500, // 理想比较方差
  maxNum: 260, // 人数上限
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
  Cright: {
    Cright1: 100,
    Cright2: 100,
    Cright3: 50,
    Cright4: 100,
    Cright5: 80,
    Cright6: 60,
    ratio: 1.5 / 3
  },
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
    powerfulNum: '活跃高战玩家数',
    activeNum: '活跃中坚玩家数',
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
    extraCoin: '补偿coin',
    coinSum: '总coin'
  },
  keys: ['zone', 'days', 'country', 'capitalNum', 'cityNum', 'powerfulNum', 'activeNum', 'rankScore', 'topPower', 'activePowerSum', 'activePay30', 'activePay', 'activePayFake', 'activeCoin', 'multiplePower', 'top20', 'top1']
}
