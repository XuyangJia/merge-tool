<template>
  <el-row class="header">
    <el-col :span="2">
      <el-button type="warning" @click="backToHome"><i class="el-icon-s-home el-icon--left">主页</i></el-button>
    </el-col>
    <el-col :span="20">
    </el-col>
    <el-col :span="2">
      <el-button type="success" @click="exportPlans">导出<i class="el-icon-download el-icon--right"></i></el-button>
    </el-col>
  </el-row>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { saveAs } from 'file-saver'
export default {
  data: function () {
    return {}
  },
  computed: {
    ...mapGetters('merge', {
      mergeTimes: 'mergeTimes',
      startIndex: 'startIndex',
      countries: 'countries',
      bestPlans: 'bestPlans'
    })
  },
  methods: {
    backToHome: function () {
      this.$router.push('/index')
    },
    exportPlans: function () {
      const mapIndexed = R.addIndex(R.map)
      const getZone = index => `h${this.mergeTimes}_${this.startIndex + index}`
      let cursor = 0 // 计算进度
      const plans = mapIndexed((plan, index) => {
        const result = {}
        const toZone = getZone(index)
        let countryArr = this.countries.slice(cursor, cursor + plan.length)
        mapIndexed((country, i) => {
          const data = countryArr[i]
          const zone = data.zone
          result[zone] || (result[zone] = { to_zone: toZone, reward: data.reward, country: [] })
          result[zone].country[data.country] = country
        })(plan)
        cursor += plan.length // 移动游标
        return result
      })(this.bestPlans)
      const masterPlan = R.reduce(R.merge, {})(plans)
      const blob = new Blob([JSON.stringify(masterPlan)], { type: 'text/plain;charset=utf-8' })
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
