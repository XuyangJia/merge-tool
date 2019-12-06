<template>
<div>
  <div class="input" v-if="tableData === null">
    <img alt="Vue logo" src="../assets/logo.png">
    <h1>请输入待合区的起始ID和结束ID</h1>
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="起始ID">
        <el-input v-model="startId" placeholder="Start ID"></el-input>
      </el-form-item>
      <el-form-item label="结束ID">
        <el-input v-model="endId" placeholder="End ID"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div v-if="tableData">
    <el-table
      :data="tableData"
      border
      stripe
      height="520"
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
        label="活跃高战玩家数">
      </el-table-column>
      <el-table-column
        prop="activeNum"
        label="活跃中坚玩家数">
      </el-table-column>
      <el-table-column
        prop="rankScore"
        label="排名积分">
      </el-table-column>
      <el-table-column
        prop="topPower"
        label="活跃尖端战力">
      </el-table-column>
      <el-table-column
        prop="activePowerSum"
        label="活跃总战力">
      </el-table-column>
      <el-table-column
        prop="activePay"
        label="活跃实际充值">
      </el-table-column>
      <el-table-column
        prop="activePayFake"
        label="活跃虚拟充值">
      </el-table-column>
      <el-table-column
        prop="activeCoin"
        label="活跃Coin">
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
  </div>
</div>

</template>

<script>
import { mergePlan } from '../js/mergePlan'
export default {
  name: 'MergeTool',
  data: function () {
    return {
      startId: '1',
      endId: '3',
      dataKeys: ['zone', 'days', 'country', 'capitalNum', 'cityNum', 'powerfulNum', 'activeNum', 'rankScore', 'topPower', 'activePowerSum', 'activePay', 'activePayFake', 'activeCoin', 'multiplePower', 'powerTop20', 'topPower1'],
      tableData: null
    }
  },
  methods: {
    onSubmit: function (event) {
      const reg = /(h\d+_)?(\d+)$/
      const prefix = this.startId.match(reg)[1] || ''
      const start = parseInt(this.startId.match(reg)[2])
      const end = parseInt(this.endId.match(reg)[2])
      const zones = Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`)
      this.axios.post('/api/get_zone_country_data/', JSON.stringify({ zones })).then((response) => {
        this.tableData = response.data.map(item => {
          const result = {}
          this.dataKeys.forEach((key, i) => {
            result[key] = item[i]
          })
          return result
        })
        mergePlan(this.tableData)
      }).catch(console.log)
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
