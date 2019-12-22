<template>
  <el-collapse-item>
    <template slot="title"> <h2>{{ title }}</h2> </template>
    <el-divider></el-divider>
    <el-form  v-if="plans" :inline="true" class="demo-form-inline">
      <el-form-item label="合服方案">
        <el-select v-model="planIndex">
          <el-option v-for="(item, index) in plans" :key="index" :label="'方案'+(index+1)+' 方差：'+item[0]" :value="index"></el-option>
        </el-select>
        改变区数量：<el-input-number v-model="zoneNum" @change="handleChange" :min="2" :max="8"></el-input-number>
      </el-form-item>
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
        prop="activeCoin"
        label="补偿Coin">
      </el-table-column>
      <el-table-column
        prop="activeCoin"
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
      countryData: null,
      options: ['魏国', '蜀国', '吴国'],
      planIndex: -1
    }
  },
  created: function () {
    if (this.initialPlan.status === -1) {
      this.plans = this.initialPlan.data[0]
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
      return this.tableData.slice(0, 3)
    }
  }
}
</script>
