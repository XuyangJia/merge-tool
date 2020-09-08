<template>
  <el-collapse-item>
    <template slot="title"> <h2>{{ title }}</h2> </template>
    <el-divider></el-divider>
    <div v-if="!error">
      <el-row :gutter="20">
        <el-col :xs="{span: 7, offset: 1}" :sm="{span: 6, offset: 1}" :md="{span: 5, offset: 1}" :lg="{span: 4, offset: 1}" :xl="{span: 3, offset: 1}">
          <el-select v-model="planIndex">
            <el-option v-for="(item, index) in planArr[0]" :key="index" :label="`方案${index + 1} 方差：${item[0]}`" :value="index"></el-option>
          </el-select>
        </el-col>
        <el-col :xs="4" :sm="4" :md="3" :lg="3" :xl="2">
          <div>
            <el-button :type=" planChanged ? 'danger' : 'success'" @click="refresh">重算方差{{` ${varianceDIY ? varianceDIY : ''}`}}</el-button>
          </div>
        </el-col>
        <el-col :xs="12" :sm="10" :md="8" :lg="7" :xl="4">
          <el-input placeholder="请输入内容" v-model="zoneNum">
            <template slot="prepend">自定义区数量：</template>
            <el-button slot="append" icon="el-icon-s-promotion" @click="handleChange"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table
        v-if="planIndex >= 0"
        :data="currntPlan"
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
        :cell-style="setCellStyle2"
        show-summary
        size="mini"
        fit
        border>
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
    </div>
  </el-collapse-item>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import { getConfig } from '../js/config'
import { variance } from '../js/variance'
import { CONSTANT, toZoneName } from '../js/mergeUtil'
export default {
  props: [ 'planObj' ],
  data () {
    return {
      palanId: 0,
      palanArr: [],
      zoneNum: '',
      error: false,
      title: '',
      serverIndex: '',
      servers: [1, 2, 3],
      variance: 0,
      varianceDIY: 0,
      currntPlan: null,
      planIndex: -1,
      countryData: null,
      top3Index: null,
      useOld: false,
      planInited: false,
      planChanged: false
    }
  },
  created: function () {
    this.initPlan()
  },
  watch: {
    planObj: {
      immediate: true,
      handler () {
        this.planArr && this.initPlan()
      }
    },
    planIndex: {
      immediate: true,
      handler (val) {
        val >= 0 && this.planArr && this.initPlanData(val)
      }
    },
    currntPlan: {
      immediate: true,
      handler (val) {
        if (this.currntPlan) {
          if (this.planInited) {
            this.planChanged = true
          } else {
            this.planInited = true
          }
        }
      }
    }
  },
  methods: {
    initPlan: function () {
      this.planId = this.planObj[0]
      const planArr = this.planArr = this.planObj[1]
      if (Array.isArray(planArr[0])) {
        this.startZone = planArr[1]
        this.endZone = planArr[1] + planArr[2]
        this.countryData = this.countries.slice(this.startZone * 3, this.endZone * 3)
        if (this.adjustPlans[this.planId]) {
          this.useOld = true
        }
        const sortWithPower = R.sortWith([R.descend(R.prop('potentialS'))])
        const top3 = R.compose(R.take(3), sortWithPower)(this.countryData.concat())
        this.top3Index = R.map(x => this.countryData.indexOf(x))(top3)
        this.error = false
        const arr = [this.countries[this.startZone * 3]]
        arr.push(this.countries[this.endZone * 3 - 1])
        this.title = arr.map(x => x.zone).join(' - ') + ` 区 --> ${this.targetZone(this.planId)}区`
        this.planIndex = 0
        this.initPlanData(0)
      } else {
        this.error = true
        this.title = planArr[0].msg
      }
    },
    initPlanData: function (index) {
      this.varianceDIY = null
      const plan = this.planArr[0][index]
      if (plan) {
        this.planChanged = this.planInited = false
        this.setPlan(this.useOld ? this.adjustPlans[this.planId] : plan)
        this.useOld = false
      }
    },
    targetZone: function (i) {
      if (this.planArr) {
        return toZoneName(this.startIndex, this.zoneRange, this.mergeTimes, i)
      } else {
        return this.lastPlanObj[this.countries[this.startZone * 3].zone].to_zone
      }
    },
    setPlan (plan) {
      this.variance = plan[0]
      this.currntPlan = plan[1].concat()
      this.$store.dispatch('mergeOld/setBestPlan', [this.planId, plan])
    },
    getTableHead (key) {
      return CONSTANT.titles[key]
    },
    setCellStyle ({ column, rowIndex }) {
      const arr = this.countryData
      const topIndex = this.top3Index.indexOf(rowIndex)
      if (arr && arr[rowIndex] && column && column.property === 'country') {
        return { color: ['#409EFF', '#67C23A', '#F56C6C'][arr[rowIndex].country] }
      } else if (arr && arr[rowIndex] && column && column.property === 'potentialS' && topIndex >= 0) {
        return { 'background-color': ['#000000', '#606266', '#909399'][topIndex], color: '#fff' }
      }
    },
    setCellStyle2 ({ column, rowIndex }) {
      if (column.property === 'country') {
        return { color: ['#409EFF', '#67C23A', '#F56C6C'][rowIndex] }
      }
    },
    dataFormat (row, column, cellValue, index, sum = false) {
      const arr = sum ? this.currntPlanSum : this.countryData
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
      this.varianceDIY = variance(this.currntPlan, this.countryData, getConfig(this.mergeTimes))
      this.$store.dispatch('mergeOld/setBestPlan', [this.planId, [this.varianceDIY, this.currntPlan]])
      this.$store.dispatch('mergeOld/setAdjustPlans', [this.planId, this.varianceDIY, this.currntPlan])
      this.planChanged = false
    },
    handleChange () {
      const num = +this.zoneNum
      if (!Number.isInteger(num) || num < 2) {
        this.$message({
          message: '数据格式错误，要求至少是2个区',
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
          this.$message.info(`区数量${num} 重新计算`)
          this.$store.dispatch('mergeOld/refreshPlans', [this.planId, num])
        }
      }
    }
  },
  computed: {
    countryNames: function () {
      return ['魏', '蜀', '吴']
    },
    options: function () {
      const result = CONSTANT.keys.concat(this.planArr ? 'potentialS' : [])
      let index = result.indexOf('country')
      result.splice(index + 1, 0, 'target')

      index = result.indexOf('normalNum')
      result.splice(index, 1)

      index = result.indexOf('activeNum')
      result.splice(index + 1, 0, 'normalNum')
      return result
    },
    options2: function () {
      const result = R.without(['days', 'target', 'rankScore', 'capitalNum', 'cityNum', 'top20'], this.options)
      let index = result.indexOf('country')
      result.splice(index + 1, 0, 'countryNum')
      return result
    },
    ...mapGetters(['countries', 'mergeTimes', 'startIndex', 'zoneRange']),
    ...mapGetters('mergeOld', ['adjustPlans', 'lastPlanObj']),
    currntPlanSum: function () {
      if (!this.currntPlan) return []
      const keys = this.options2
      const diff = (a, b) => { return a - b }
      return [0, 1, 2].map(countryId => {
        const arr = this.countryData.filter((item, index) => {
          return this.currntPlan[index] === countryId
        }, this)
        const result = {}
        keys.forEach(key => {
          result[key] = R.compose(R.sum, R.map(R.prop(key)))(arr)
        })
        result.zone = this.targetZone(this.planId)
        result.country = countryId
        result.countryNum = arr.length
        result.top1 = R.compose(R.nth(-1), R.sort(diff), R.map(R.prop('top1')))(arr)
        return result
      }, this)
    }
  }
}
</script>

<style scoped>
  .el-col {
    border-radius: 4px;
  }
  .el-divider {
    margin: 0 0 5px 0 !important;
  }
</style>
