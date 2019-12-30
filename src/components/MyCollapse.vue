<template>
  <el-collapse-item>
    <template slot="title"> <h2>{{ title }}</h2> </template>
    <el-divider></el-divider>
    <el-row v-if="errMsg === ''" :gutter="20">
      <el-col :span="3" :offset="2">
        <el-select v-model="planIndex">
          <el-option v-for="(item, index) in variances" :key="index" :label="`方案${index + 1} 方差：${item[0]}`" :value="index"></el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <div>
          <el-button type="primary" @click="refresh">重算方差{{` ${varianceDIY ? varianceDIY : ''}`}}</el-button>
        </div>
      </el-col>
      <el-col :span="4">
        <el-input placeholder="请输入内容" v-model="zoneNum">
          <template slot="prepend">自定义区数量：</template>
          <el-button slot="append" icon="el-icon-s-promotion" @click="handleChange"></el-button>
        </el-input>
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
        :label="getTableHead(item)"
        :prop="item"
        :formatter="dataFormat"
        header-align="center"
        align="center">
        <template v-if="index == 3" v-slot:default="slotProps">
          <el-select v-model="currntPlan[slotProps.$index]" size="mini">
            <el-option v-for="(item, index) in countryNames" :key="index" :label="item" :value="index"></el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-if="planIndex >= 0"
      :data="currntPlanSum"
      header-cell-class-name="my-header"
      :cell-style="setCellStyle2"
      show-summary
      size="mini"
      fit
      border
      stripe>
      <el-table-column
        v-for="(item, index) in options2"
        :key="index"
        :label="getTableHead(item)"
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
import { variance } from '../js/variance'
export default {
  props: [ 'planId' ],
  data () {
    return {
      zoneNum: '',
      errMsg: '',
      serverIndex: '',
      servers: [1, 2, 3],
      variance: 0,
      varianceDIY: 0,
      currntPlan: null,
      planIndex: -1
    }
  },
  created: function () {
    const planArr = this.plans[this.planId]
    if (Array.isArray(planArr[0])) {
      this.startZone = planArr[1]
      this.endZone = planArr[1] + planArr[2]
      this.planIndex = 0
    } else {
      this.errMsg = planArr[0].msg
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
      if (plan) {
        this.variance = plan[0]
        this.currntPlan = plan[1].concat()
        // this.currntPlan = [1, 2, 2, 1, 1, 1, 2, 2, 0, 0, 2, 0]
        this.$store.dispatch('merge/setBestPlan', [this.planId, plan])
      }
    },
    getTableHead (key) {
      return this.config.titles[key]
    },
    setCellStyle ({ column, rowIndex }) {
      const arr = this.countries.slice(this.startZone * 3)
      if (arr && arr[rowIndex] && column && column.property === 'country') {
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
      const countryData = this.countries.slice(this.startZone * 3, this.endZone * 3)
      this.varianceDIY = variance(this.currntPlan, countryData)
      this.$store.dispatch('merge/setBestPlan', [this.planId, [this.varianceDIY, this.currntPlan]])
    },
    handleChange () {
      const num = +this.zoneNum.match(/\d+/)[0]
      if (!Number.isInteger(num) || num < 2 || num > 6) {
        this.$message({
          message: '数据格式错误，要求输入2-6之间的数字',
          type: 'warning'
        })
      } else {
        if ((this.startZone + num) * 3 > this.countries.length) {
          this.$message({
            message: `区数量不足${num}个`,
            type: 'warning'
          })
        } else if (num === (this.endZone - this.startZone)) {
          this.$message({
            message: '区数量一致，无需重新计算',
            type: 'warning'
          })
        } else {
          this.$router.push({ path: 'calculate', params: { data: [this.planId, num] } })
        }
      }
    }
  },
  computed: {
    title: function () {
      if (this.errMsg) {
        return this.errMsg
      }
      const arr = [this.countries[this.startZone * 3]]
      arr.push(this.countries[this.endZone * 3 - 1])
      return arr.map(x => x.zone).join(' - ') + ' 区'
    },
    variances: function () {
      return this.plans[this.planId][0]
    },
    countryNames: function () {
      return ['魏', '蜀', '吴']
    },
    options: function () {
      const result = this.config.keys.concat()
      let index = result.indexOf('activeCoin')
      result.splice(index + 1, 0, 'extraCoin')
      index = result.indexOf('country')
      result.splice(index + 1, 0, 'target')
      return result
    },
    options2: function () {
      const result = R.without(['days', 'target', 'rankScore', 'capitalNum', 'cityNum', 'top20'], this.options)
      let index = result.indexOf('country')
      result.splice(index + 1, 0, 'countryNum')
      index = result.indexOf('extraCoin')
      result.splice(index + 1, 0, 'coinSum')
      return result
    },
    ...mapGetters('merge', {
      countries: 'countries',
      plans: 'plans',
      config: 'config'
    }),
    currntPlanSum: function () {
      if (!this.currntPlan) return []
      const keys = R.without(['coinSum'], this.options2)
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
        result.countryNum = arr.length
        result.coinSum = result.activeCoin + result.extraCoin
        result.top1 = R.compose(R.nth(-1), R.sort(diff), R.map(R.prop('top1')))(arr)
        return result
      }, this)
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
  .el-col {
    border-radius: 4px;
  }
</style>
