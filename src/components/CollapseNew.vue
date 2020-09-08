<template>
  <el-collapse-item>
    <template slot="title"> <h2>{{ title }}</h2> </template>
    <el-divider></el-divider>
    <el-dialog
      title="选择目标合服区"
      :visible.sync="dialogVisible"
      center
      width="50%">
      <el-button v-for="(item, i) in plans" v-show="i !== planId" :key="i" @click="chooseZone(i)">{{ targetZone(i) }}</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="moveTo()">确 定</el-button>
      </span>
    </el-dialog>
    <div>
      <el-table
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
          <template v-if="item.match(/target/)" v-slot:default="slotProps">
            <el-select v-if="item == 'target'" @change="savePlan" v-model="currntPlan[slotProps.$index]" size="mini">
              <el-option v-for="(item, index) in countryNames" :key="index" :label="item" :value="index"></el-option>
            </el-select>
            <el-button v-if="item == 'targetZone'" @click="handleEdit(slotProps.$index)" type="info" size="mini">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-table
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
import { CONSTANT, toZoneName } from '../js/mergeUtil'
export default {
  props: [ 'planIndex' ],
  data () {
    return {
      planId: 0,
      currntPlan: null,
      countryData: null,
      title: '',
      editIndex: null,
      toZone: 0,
      dialogVisible: false
    }
  },
  mounted () {
    this.initPlan()
  },
  methods: {
    initPlan: function () {
      this.planId = this.planIndex
      const plan = this.plans[this.planId]
      this.currntPlan = plan.map((arr, i) => arr.slice().fill(i)).flat()
      this.countryData = plan.flat().map(i => this.countries[i])
      this.title = ` ${this.targetZone(this.planId)}区`
      const sortWithPower = R.sortWith([R.descend(R.prop('potentialS'))])
      const top3 = R.compose(R.take(3), sortWithPower)(this.countryData.concat())
      this.top3Index = R.map(x => this.countryData.indexOf(x))(top3)
    },
    targetZone: function (i) {
      return toZoneName(this.startIndex, this.zoneRange, this.mergeTimes, i)
    },
    handleEdit (index) {
      this.editIndex = index
      this.toZone = -1
      this.dialogVisible = true
    },
    chooseZone (i) {
      this.toZone = i
    },
    moveTo () {
      this.dialogVisible = false
      if (this.toZone === -1) {
        console.log('未选中目标区.')
        return
      }
      const { zone, country } = this.countryData[this.editIndex]
      this.$store.dispatch('mergeNew/moveTo', [this.planId, this.toZone, [zone, country]])
    },
    savePlan () {
      const plan = [[], [], []]
      this.countryData.forEach((item, index) => {
        const i = this.countries.indexOf(item)
        plan[this.currntPlan[index]].push(i)
      })
      this.$store.dispatch('mergeNew/savePlan', [plan, this.planId])
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
    }
  },
  watch: {
    plans: {
      handler (val) {
        val && val.length && this.initPlan()
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

      index = result.indexOf('zone')
      result.splice(index + 1, 0, 'targetZone')

      index = result.indexOf('normalNum')
      result.splice(index, 1)

      index = result.indexOf('activeNum')
      result.splice(index + 1, 0, 'normalNum')
      return result
    },
    options2: function () {
      const result = R.without(['targetZone', 'days', 'target', 'rankScore', 'capitalNum', 'cityNum', 'top20'], this.options)
      let index = result.indexOf('country')
      result.splice(index + 1, 0, 'countryNum')
      return result
    },
    ...mapGetters(['countries', 'mergeTimes', 'startIndex', 'zoneRange']),
    ...mapGetters('mergeNew', ['plans']),
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
