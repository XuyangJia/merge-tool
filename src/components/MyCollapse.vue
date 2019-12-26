<template>
  <el-collapse-item>
    <template slot="title"> <h2>{{ title }}</h2> </template>
    <el-divider></el-divider>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-select v-model="planIndex">
          <el-option v-for="(item, index) in plans" :key="index" :label="`方案${index + 1} 方差：${plans[index][0]}`" :value="index"></el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
        <!-- <el-input placeholder="请输入内容" v-model="zoneNum">
          <template slot="prepend">自定义区数量：</template>
          <el-button type="warning" slot="append" icon="el-icon-s-promotion" @click="handleChange"></el-button>
        </el-input> -->
      </el-col>
      <el-col :span="8">
        <div>
          <el-button type="primary" @click="refresh">重算方差</el-button>
          <el-tag v-if="varianceDIY" type="danger" effect="dark">自定义方差:{{varianceDIY}}</el-tag>
        </div>
      </el-col>
    </el-row>
    <el-table
      v-if="tableData"
      :data="tableData"
      header-cell-class-name="my-header"
      cell-class-name="my-cell"
      size="mini"
      fit
      border
      stripe>
      <el-table-column
        prop="zone"
        width="60"
        label="区服">
      </el-table-column>
      <el-table-column
        prop="country"
        width="50"
        label="国家">
        <template slot-scope="scope">
          <span :class="`country${scope.row.country}`">{{['魏','蜀','吴'][scope.row.country]}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="days"
        width="80"
        label="开服天数">
      </el-table-column>
      <el-table-column
        prop="target"
        label="目标国家">
        <template slot-scope="scope">
          <el-select v-model="scope.row.target" size="mini">
            <el-option v-for="(item, index) in options" :key="index" :label="item" :value="index"></el-option>
          </el-select>
      </template>
      </el-table-column>
      <el-table-column
        prop="capitalNum"
        width="70"
        label="都城数">
      </el-table-column>
      <el-table-column
        prop="cityNum"
        width="80"
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
        prop="extraCoin"
        label="补偿Coin">
        <template slot-scope="scope">
          <span>{{ scope.row.reward.coin }}</span>
        </template>
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
      <el-table-column
        prop="right"
        label="Cright">
      </el-table-column>
    </el-table>
    <el-table
      v-if="tableData"
      :data="table2Data"
      header-cell-class-name="my-header"
      cell-class-name="my-cell"
      border
      stripe
      size="mini"
      fit>
      <el-table-column
        prop="zone"
        width="60"
        label="区服">
      </el-table-column>
      <el-table-column
        prop="country"
        width="50"
        label="国家">
        <template slot-scope="scope">
          <span :class="`country${scope.row.country}`">{{['魏','蜀','吴'][scope.row.country]}}</span>
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
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import { variance } from '../js/variance'
export default {
  props: [ 'plans' ],
  data () {
    return {
      zoneNum: 2,
      errMsg: '',
      serverIndex: '',
      servers: [1, 2, 3],
      variance: 0,
      tableData: null,
      planDIY: null,
      varianceDIY: null,
      countryData: null,
      options: ['魏国', '蜀国', '吴国'],
      planIndex: -1
    }
  },
  created: function () {
    if (Array.isArray(this.plans)) {
      this.planIndex = 0
    } else {
      this.errMsg = this.plans.msg
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
      this.variance = this.plans[index][0]
      console.log(this.plans)
    },
    refresh: function () {
      const countries0 = this.tableData.filter(item => item.target === 0)
      const countries1 = this.tableData.filter(item => item.target === 1)
      const countries2 = this.tableData.filter(item => item.target === 2)
      const countries = [countries0, countries1, countries2]
      this.planDIY = countries.map(arr => arr.map(obj => this.tableData.indexOf(obj)))

      this.varianceDIY = variance(countries)
    },
    handleChange () {
      console.log(this.zoneNum)
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
    ...mapGetters('merge', {
      countries: 'countries'
    }),
    table2Data: function () {
      const keys = Object.keys(this.tableData[0])
      const diff = (a, b) => { return a - b }
      return [0, 1, 2].map(countryId => {
        const arr = this.tableData.filter(item => item.target === countryId)
        const result = {}
        keys.forEach(key => {
          result[key] = R.compose(R.sum, R.map(R.prop(key)))(arr)
        })
        result.zone = 123
        result.country = countryId
        result.coinSum = result.activeCoin + result.extraCoin
        result.topPower1 = R.compose(R.nth(-1), R.sort(diff), R.map(R.prop('topPower1')))(arr)
        return result
      })
    }
  }
}
</script>

<style>
  .my-header {
    padding: 5px 0 !important;
    color: #303133;
    text-align: center !important;
  }
  .my-cell {
    padding: 1px 0 !important;
    text-align: center !important;
  }
  .country0 {
    color: #409EFF;
  }
  .country1 {
    color: #67C23A;
  }
  .country2 {
    color: #F56C6C;
  }
  .el-col {
    border-radius: 4px;
  }
</style>
