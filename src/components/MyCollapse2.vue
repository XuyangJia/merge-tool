<template>
  <el-collapse-item>
    <template slot="title"> <h2>{{ title }}</h2> </template>
    <el-divider></el-divider>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-select v-model="planIndex">
          <el-option v-for="(item, index) in variances" :key="index" :label="`方案${index + 1} 方差：${item[0]}`" :value="index"></el-option>
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
      v-if="planIndex >= 0"
      :data="currntPlan"
      header-cell-class-name="my-header"
      :cell-style="setCellStyle"
      size="mini"
      fit
      border
      stripe>
      <el-table-column
        v-for="(item, index) in options"
        :key="index"
        :label="getTitle(item)"
        :prop="item"
        :formatter="dataFormat"
        header-align="center"
        align="center">
        <!-- <template slot-scope="scope">
          <el-select v-if="scope.column.property === 'target'" v-model="scope.row.target" size="mini">
            <el-option v-for="(item, index) in countryNames" :key="index" :label="item" :value="index"></el-option>
          </el-select>
        </template> -->
      </el-table-column>
    </el-table>
    <el-table
      v-if="planIndex >= 0"
      :data="currntPlanSum"
      header-cell-class-name="my-header"
      :cell-style="setCellStyle2"
      size="mini"
      fit
      border
      stripe>
      <el-table-column
        v-for="(item, index) in options2"
        :key="index"
        :label="getTitle(item)"
        :prop="item"
        :formatter="dataFormat2"
        header-align="center"
        align="center">
      </el-table-column>
    </el-table>
  </el-collapse-item>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import config from '../js/config'
import { variance } from '../js/variance'
export default {
  props: [ 'planId' ],
  data () {
    return {
      zoneNum: 2,
      errMsg: '',
      serverIndex: '',
      servers: [1, 2, 3],
      variance: 0,
      varianceDIY: null,
      currntPlan: null,
      planIndex: -1
    }
  },
  created: function () {
    const planArr = this.plans[this.planId]
    if (Array.isArray(planArr)) {
      this.startZone = planArr[1]
      this.endZone = planArr[2]
      this.planIndex = 0
    } else {
      this.errMsg = planArr.msg
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
      this.varianceDIY = null
      const plan = this.variances[index]
      this.variance = plan[0]
      this.currntPlan = []
      for (let i = 0, len = plan[1].length; i < len; ++i) {
        for (let j = 0, len2 = plan[1][i].length; j < len2; ++j) {
          const countryIndex = plan[1][i][j]
          this.currntPlan[countryIndex] = i
        }
      }
    },
    getTitle (key) {
      return config.titles[key]
    },
    setCellStyle ({ column, rowIndex }) {
      const arr = this.countries.slice(this.startZone * 3)
      if (!this.arr) return []
      if (column.property === 'country') {
        return { color: ['#409EFF', '#67C23A', '#F56C6C'][arr[rowIndex].country] }
      }
    },
    setCellStyle2 ({ column, rowIndex }) {
      if (column.property === 'country') {
        return { color: ['#409EFF', '#67C23A', '#F56C6C'][rowIndex] }
      }
    },
    dataFormat (row, column, cellValue, index, sum = false) {
      const arr = sum ? this.currntPlanSum : this.countries.slice(this.startZone * 3)
      const obj = arr[index]
      if (!obj) return ''
      let content = ''
      switch (column.property) {
        case 'country':
          content = this.countryNames[obj[column.property]]
          break
        case 'target':
          content = this.countryNames[this.currntPlan[index]]
          break
        default:
          content = obj[column.property]
          break
      }
      return content
    },
    dataFormat2 () {
      return this.dataFormat(...arguments, true)
    },
    refresh () {
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
      const arr = this.countries.slice(this.startZone * 3, 1)
      arr.push(this.countries[this.endZone * 3 - 1])
      return arr.map(x => x.zone).join('-') + ' 区'
    },
    variances: function () {
      return this.plans[this.planId][0]
    },
    countryNames: function () {
      return ['魏', '蜀', '吴']
    },
    options: function () {
      const arr = config.keys.concat()
      arr.splice(3, 0, 'target')
      return arr
    },
    options2: function () {
      return R.without(['days', 'rankScore', 'capitalNum', 'cityNum', 'top20'], config.keys)
    },
    ...mapGetters('merge', {
      countries: 'countries',
      plans: 'plans'
    }),
    currntPlanSum: function () {
      if (!this.currntPlan) return []
      const keys = config.keys
      const diff = (a, b) => { return a - b }
      const countryData = this.countries.slice(this.startZone * 3, this.endZone * 3)
      return [0, 1, 2].map(countryId => {
        const arr = countryData.filter((item, index) => {
          return this.currntPlan[index] === countryId
        }, this)
        const result = {}
        keys.forEach(key => {
          result[key] = R.compose(R.sum, R.map(R.prop(key)))(arr)
        })
        result.zone = 123
        result.country = countryId
        // result.coinSum = result.activeCoin + result.extraCoin
        result.coinSum = result.activeCoin
        result.topPower1 = R.compose(R.nth(-1), R.sort(diff), R.map(R.prop('topPower1')))(arr)
        return result
      }, this)
    }
  },
  components: {
    // MyTableColumn
  }
}
</script>

<style>
  .my-header {
    padding: 5px 0 !important;
    color: #303133;
    text-align: center !important;
  }
  .el-col {
    border-radius: 4px;
  }
</style>
