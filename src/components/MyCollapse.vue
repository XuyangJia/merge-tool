<template>
  <el-collapse-item>
    <template slot="title"> <h2>{{ title }}</h2> </template>
    <el-divider></el-divider>
    <el-form  v-if="plans" :inline="true" class="demo-form-inline">
      <el-form-item label="合服方案">
        <el-input v-if="varianceDIY" :placeholder="`自定义方案 方差：${varianceDIY}`" :disabled="true"></el-input>
        <el-select v-model="planIndex">
          <el-option v-for="(item, index) in plans" :key="index" :label="`方案${index + 1} 方差：${plans[index][0]}`" :value="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="区数量：">
        <el-input-number v-model="zoneNum" @change="handleChange" :min="2" :max="6"></el-input-number>
        <el-button type="warning">计算方案</el-button>
      </el-form-item>
      <el-button type="primary" @click="refresh">重算方差</el-button>
    </el-form>
    <el-table
      v-if="tableData"
      :data="tableData"
      border
      stripe
      style="width: 100%">
      <el-table-column
        prop="zone"
        label="区服">
      </el-table-column>
      <el-table-column
        prop="days"
        label="开服天数">
      </el-table-column>
      <el-table-column
        prop="country"
        label="国家">
        <template slot-scope="scope">
        <el-tag
          :type="['primary', 'success', 'danger'][scope.row.country]"
          disable-transitions>{{['魏','蜀','吴'][scope.row.country]}}</el-tag>
      </template>
      </el-table-column>
      <el-table-column
        prop="target"
        label="目标国家">
        <template slot-scope="scope">
        <el-select v-model="scope.row.target">
          <el-option v-for="(item, index) in options" :key="index" :label="item" :value="index"></el-option>
        </el-select>
      </template>
      </el-table-column>
      <el-table-column
        prop="capitalNum"
        label="都城数">
      </el-table-column>
      <el-table-column
        prop="cityNum"
        label="城池总数">
      </el-table-column>
      <el-table-column
        prop="powerfulNum"
        label="高战玩家数">
      </el-table-column>
      <el-table-column
        prop="activeNum"
        label="中坚玩家数">
      </el-table-column>
      <el-table-column
        prop="rankScore"
        label="排名积分">
      </el-table-column>
      <el-table-column
        prop="topPower"
        label="尖端战力">
      </el-table-column>
      <el-table-column
        prop="activePowerSum"
        label="总战力">
      </el-table-column>
      <el-table-column
        prop="activePay30"
        label="30日充值">
      </el-table-column>
      <el-table-column
        prop="activePay"
        label="实际充值">
      </el-table-column>
      <el-table-column
        prop="activePayFake"
        label="虚拟充值">
      </el-table-column>
      <el-table-column
        prop="activeCoin"
        label="Coin">
      </el-table-column>
      <el-table-column
        prop="multiplePower"
        label="综合国力">
      </el-table-column>
      <el-table-column
        prop="powerTop20"
        label="前20战功">
      </el-table-column>
      <el-table-column
        prop="topPower1"
        label="单将最高战力">
      </el-table-column>
    </el-table>
    <el-table
      v-if="tableData"
      :data="table2Data"
      border
      stripe
      style="width: 100%">
      <el-table-column
        prop="zone"
        label="合区区服">
      </el-table-column>
      <el-table-column
        prop="country"
        label="国家">
        <template slot-scope="scope">
        <el-tag
          :type="['primary', 'success', 'danger'][scope.row.country]"
          disable-transitions>{{['魏','蜀','吴'][scope.row.country]}}</el-tag>
      </template>
      </el-table-column>
      <el-table-column
        prop="powerfulNum"
        label="高战玩家数">
      </el-table-column>
      <el-table-column
        prop="activeNum"
        label="中坚玩家数">
      </el-table-column>
      <el-table-column
        prop="topPower"
        label="尖端战力">
      </el-table-column>
      <el-table-column
        prop="activePowerSum"
        label="总战力">
      </el-table-column>
      <el-table-column
        prop="activePay30"
        label="30日充值">
      </el-table-column>
      <el-table-column
        prop="activePay"
        label="实际充值">
      </el-table-column>
      <el-table-column
        prop="activePayFake"
        label="虚拟充值">
      </el-table-column>
      <el-table-column
        prop="activeCoin"
        label="Coin">
      </el-table-column>
      <el-table-column
        prop="extraCoin"
        label="补偿Coin">
      </el-table-column>
      <el-table-column
        prop="coinSum"
        label="补偿后Coin">
      </el-table-column>
      <el-table-column
        prop="multiplePower"
        label="综合国力">
      </el-table-column>
      <el-table-column
        prop="topPower1"
        label="单将最高战力">
      </el-table-column>
    </el-table>
  </el-collapse-item>
</template>

<script>
import * as R from 'ramda'
import { variance } from '../js/variance'
export default {
  props: [ 'initialPlan' ],
  data () {
    return {
      zoneNum: 2,
      errMsg: '',
      serverIndex: '',
      servers: [1, 2, 3],
      variance: 0,
      tableData: null,
      plans: null,
      planDIY: null,
      varianceDIY: null,
      countryData: null,
      options: ['魏国', '蜀国', '吴国'],
      planIndex: -1
    }
  },
  created: function () {
    if (this.initialPlan.status === -1) {
      this.plans = this.initialPlan.data[0].slice(0, 50)
      this.countryData = this.initialPlan.data[1]
      this.planIndex = 0
    } else {
      this.errMsg = this.initialPlan.msg
    }
  },
  watch: {
    planIndex: {
      immediate: true,
      handler (val) {
        val >= 0 && this.initPlanData(val)
      }
    }
  },
  methods: {
    initPlanData: function (index) {
      this.planDIY = this.varianceDIY = null
      const planData = this.plans[index]
      this.variance = planData[0]
      const temp = []
      planData[1].forEach((arr, i) => {
        arr.forEach(ranking => {
          const obj = Object.assign({}, this.countryData[ranking])
          obj.target = i
          temp.push(obj)
        })
      })
      this.tableData = temp.sort((a, b) => {
        if (a.zone !== b.zone) {
          return a.zone - b.zone
        } else {
          return a.country - b.country
        }
      })
    },
    refresh: function () {
      const countries0 = this.tableData.filter(item => item.target === 0)
      const countries1 = this.tableData.filter(item => item.target === 1)
      const countries2 = this.tableData.filter(item => item.target === 2)
      const countries = [countries0, countries1, countries2]
      this.planDIY = countries.map(arr => arr.map(obj => this.tableData.indexOf(obj)))

      this.varianceDIY = variance(countries)
    },
    handleChange (value) {
      console.log(value)
    }
  },
  computed: {
    title: function () {
      if (this.errMsg) {
        console.log(this.errMsg)
        return this.errMsg
      }
      const arr = this.countryData.slice(0, 1)
      arr.push(this.countryData[this.countryData.length - 1])
      return arr.map(x => x.zone).join('-') + '区'
    },
    table2Data: function () {
      const keys = Object.keys(this.tableData[0])
      const diff = (a, b) => { return a - b }
      return [0, 1, 2].map(countryId => {
        const arr = this.tableData.filter(item => item.target === countryId)
        const result = {}
        keys.forEach(key => {
          result[key] = R.compose(R.sum, R.map(R.prop(key)))(arr)
        })
        result.country = countryId
        result.extraCoin = 100
        result.coinSum = result.activeCoin + result.extraCoin
        result.topPower1 = R.compose(R.nth(-1), R.sort(diff), R.map(R.prop('topPower1')))(arr)
        return result
      })
    }
  }
}
</script>
