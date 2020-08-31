<template>
  <div>
    <el-row class="header">
      <el-col :xs="6" :sm="4" :md="3" :lg="2" :xl="2">
        <el-button size="mini" type="warning" @click="backToHome"><i class="el-icon-s-home el-icon--left">主页</i></el-button>
      </el-col>
      <el-col :xs="6" :sm="4" :md="3" :lg="2" :xl="2">
        <el-button size="mini" type="success" @click="exportConfirm">导出<i class="el-icon-download el-icon--right"></i></el-button>
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
      const exportObj = {}
      const plans = mapIndexed((plan, i) => {
        const result = {}
        const to_zone = this.targetZone(i)
        const countryArr = this.countries.slice(cursor, cursor + plan.length)
        const maxDay = R.reduce((a, b) => Math.max(a, b.days), 0)(countryArr)
        const { reward: rewardCfg, rewardExtra} = getConfig(this.mergeTimes)
        const equalizeDay = maxDay + (1000 / rewardCfg.coin)
        mapIndexed((to_country, i) => {
          const { zone, country, days } = countryArr[i]
          const reward = R.map(y => y * (equalizeDay - days))(rewardCfg)
          for (const key in rewardExtra) {
            if (reward.hasOwnProperty(key)) {
              reward[key] += rewardExtra[key]              
            } else {
              reward[key] = rewardExtra[key]              
            }
          }
          exportObj[zone] = exportObj[zone] || []
          exportObj[zone][country] = { to_zone, to_country, reward }
        })(plan)
        cursor += plan.length // 移动游标
        return result
      })(this.getPlans())
      return exportObj
      
      // const data = R.reduce(R.merge, {})(plans)
      // const keys = Object.keys(data)
      // const obj = {}
      // R.forEach(key => { obj[key] = 0 })(keys)
      return JSON.stringify(obj, null, 2).replace(/"([^"]+)": 0/gm, (match, key) => {
        return `"${key}": ${JSON.stringify(data[key])}`
      })
    },
    exportPlansNew: function () {
      const plans = this.getPlans()
      const exportObj = {}
      const rewardCfg = getConfig(this.mergeTimes).reward
      plans.forEach((arr, i) => {
        const to_zone = this.targetZone(i)
        const countryArr = arr.flat().map(i => this.countries[i])
        const maxDay = R.reduce((a, b) => Math.max(a, b.days), 0)(countryArr)
        const equalizeDay = maxDay + (1000 / rewardCfg.coin)
        arr.forEach((arr2, to_country) => {
          arr2.forEach(index => {
            const { zone, country, days } = this.countries[index]
            const reward = R.map(y => y * (equalizeDay - days))(rewardCfg)
            exportObj[zone] = exportObj[zone] || []
            exportObj[zone][country] = { to_zone, to_country, reward }
          })
        })
      })
      return exportObj
    },
    exportConfirm: function () {
      this.$confirm('请选择导出结构', '提示', {
          confirmButtonText: '新',
          cancelButtonText: '旧',
          type: 'info',
          center: true
        }).then(() => {
          this.exportPlans(false)
        }).catch(() => {
          this.exportPlans(true)
        })
    },
    exportPlans: function (old) {
      const exportObj = this.mergeTimes < 3 ? this.exportPlansOld() : this.exportPlansNew()
      if (old) {
        for (const key in exportObj) {
          const element = exportObj[key]
          const country = element.map(item => item.to_country)
          const { to_zone, reward } = element[0]
          exportObj[key] = { to_zone, reward, country }
        }
      }
      const txt = JSON.stringify(exportObj, null, 2)
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
