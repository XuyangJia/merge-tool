<template>
  <div>
    <el-row class="header">
      <el-col :xs="6" :sm="4" :md="3" :lg="2" :xl="2">
        <el-button size="mini" type="warning" @click="backToHome"><i class="el-icon-s-home el-icon--left">主页</i></el-button>
      </el-col>
      <el-col :xs="6" :sm="4" :md="3" :lg="2" :xl="2">
        <el-button size="mini" type="success" @click="exportPlans">导出<i class="el-icon-download el-icon--right"></i></el-button>
      </el-col>
      <el-col :xs="6" :sm="4" :md="3" :lg="2" :xl="2">
        <el-button size="mini" type="info" @click="showAffected">影响的区<i class="el-icon-search el-icon--right"></i></el-button>
      </el-col>
      <el-col :xs="6" :sm="4" :md="3" :lg="2" :xl="2">
        <el-tooltip class="item" effect="dark" :content="JSON.stringify(zoneRange)" placement="bottom">
          <el-button size="mini" type="info">合法区段</el-button>
        </el-tooltip>
      </el-col>
    </el-row>
    <el-dialog
      title="受影响的区"
      :visible.sync="dialogVisible"
      width="50%">
      <el-input
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 40}"
        :value="content">
      </el-input>
    </el-dialog>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { saveAs } from 'file-saver'
import { getConfig } from '../js/config'
import { toZoneName } from '../js/mergeUtil'
export default {
  data: function () {
    return {
      dialogVisible: false,
      content: ''
    }
  },
  computed: {
    ...mapGetters(['countries', 'mergeTimes', 'startIndex', 'zoneRange'])
  },
  methods: {
    backToHome: function () {
      this.$router.push('/')
    },
    targetZone: function (i) {
      return toZoneName(this.startIndex, this.zoneRange, this.mergeTimes, i)
    },
    getPlans: function () {
      if (this.mergeTimes < 3) {
        return this.$store.state.mergeOld.bestPlans
      } else {
        return this.$store.state.mergeNew.plans
      }
    },
    showAffected: function () {
      this.dialogVisible = true
      const plans = this.getPlans()
      const mergeNums = plans.flat(2).length / 3 // 合了多少个区 用来去掉因为去数量不足而未进行合并的区
      const originalZones = [...new Set(this.countries.map(item => item.zone))].slice(0, mergeNums)
      const targetZones = new Array(plans.length).fill(null).map((item, i) => this.targetZone(i))
      const str = JSON.stringify(originalZones.concat(targetZones))
      this.content = str.substring(1, str.length - 1)
    },
    exportPlansOld: function () {
      const mapIndexed = R.addIndex(R.map)
      let cursor = 0 // 计算进度
      const plans = mapIndexed((plan, i) => {
        const result = {}
        const toZone = this.targetZone(i)
        let countryArr = this.countries.slice(cursor, cursor + plan.length)
        const maxDay = R.reduce((a, b) => Math.max(a, b.days), 0)(countryArr)
        const rewardCfg = getConfig(this.mergeTimes).reward
        const equalizeDay = maxDay + (1000 / rewardCfg.coin)
        mapIndexed((country, i) => {
          const data = countryArr[i]
          const zone = data.zone
          result[zone] || (result[zone] = { to_zone: toZone, reward: R.map(y => y * (equalizeDay - data.days))(rewardCfg), country: [] })
          result[zone].country[data.country] = country
        })(plan)
        cursor += plan.length // 移动游标
        return result
      })(this.getPlans())
      
      const data = R.reduce(R.merge, {})(plans)
      const keys = Object.keys(data)
      const obj = {}
      R.forEach(key => { obj[key] = 0 })(keys)
      return JSON.stringify(obj, null, 2).replace(/"([^"]+)": 0/gm, (match, key) => {
        return `"${key}": ${JSON.stringify(data[key])}`
      })
    },
    exportPlansNew: function () {
      return JSON.stringify(this.getPlans())
    },
    exportPlans: function () {
      const txt = this.mergeTimes < 3 ? this.exportPlansOld() : this.exportPlansNew()
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, 'plans.json')
    }
  }
}
</script>

<style>
.header {
  background: #1d2838;
  margin-bottom: 20px;
  text-align: center;
  min-height: 36px;
}
.el-col {
  padding: 3px 0;
}
</style>
