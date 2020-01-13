<template>
  <div>
    <el-row class="header">
      <el-col :span="2">
        <el-button type="warning" @click="backToHome"><i class="el-icon-s-home el-icon--left">主页</i></el-button>
      </el-col>
      <el-col :span="18">
      </el-col>
      <el-col :span="2">
        <el-button type="info" @click="openDialog">影响的区<i class="el-icon-search el-icon--right"></i></el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="success" @click="exportPlans">导出<i class="el-icon-download el-icon--right"></i></el-button>
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
export default {
  data: function () {
    return {
      dialogVisible: false,
      content: ''
    }
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
      this.$router.push('/')
    },
    openDialog: function () {
      this.dialogVisible = true
      const planData = R.map(R.prop('to_zone'))(this.getExportPlans())
      const oriZones = R.keys(planData).sort()
      const mergeZones = [...new Set(R.values(planData))].sort()
      const str = JSON.stringify(oriZones.concat(mergeZones))
      this.content = str.substring(1, str.length - 1)
    },
    getExportPlans: function () {
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
      return R.reduce(R.merge, {})(plans)
    },
    exportPlans: function () {
      const data = this.getExportPlans()
      const keys = Object.keys(data)
      const obj = {}
      R.forEach(key => { obj[key] = 0 })(keys)
      let str = JSON.stringify(obj, null, 2)
      str = str.replace(/"([^"]+)": 0/gm, (match, key) => {
        return `${key}: ${JSON.stringify(data[key])}`
      })
      const blob = new Blob([str], { type: 'text/plain;charset=utf-8' })
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
