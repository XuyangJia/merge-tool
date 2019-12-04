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
      style="width: 100%">

      <el-table-column
        prop="zone"
        label="区服"
        width="60">
      </el-table-column>
      <el-table-column
        prop="days"
        label="开服天数"
        width="120">
      </el-table-column>
      <el-table-column
        prop="country"
        label="国家"
        width="120">
      </el-table-column>
      <el-table-column
        prop="capitalNum"
        label="都城数"
        width="120">
      </el-table-column>
      <el-table-column
        prop="cityNum"
        label="城池总数"
        width="120">
      </el-table-column>
      <el-table-column
        prop="powerfulNum"
        label="活跃高战玩家数"
        width="120">
      </el-table-column>
      <el-table-column
        prop="activeNum"
        label="活跃中坚玩家数"
        width="120">
      </el-table-column>
      <el-table-column
        prop="rankScore"
        label="排名积分"
        width="120">
      </el-table-column>
      <el-table-column
        prop="topPower"
        label="活跃尖端战力"
        width="120">
      </el-table-column>
      <el-table-column
        prop="activePowerSum"
        label="活跃总战力"
        width="120">
      </el-table-column>
      <el-table-column
        prop="activePay"
        label="活跃实际充值"
        width="120">
      </el-table-column>
      <el-table-column
        prop="activePayFake"
        label="活跃虚拟充值"
        width="120">
      </el-table-column>
      <el-table-column
        prop="activeCoin"
        label="活跃Coin"
        width="120">
      </el-table-column>
      <el-table-column
        prop="multiplePower"
        label="综合国力"
        width="120">
      </el-table-column>
      <el-table-column
        prop="powerTop20"
        label="前20战功"
        width="120">
      </el-table-column>
      <el-table-column
        prop="topPower1"
        label="单将最高战力"
        width="120">
      </el-table-column>
    </el-table>
  </div>
</div>

</template>

<script>
export default {
  name: 'MergeTool',
  data: function () {
    return {
      startId: '1',
      endId: '3',
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
      this.axios.post('http://192.168.1.128:8888/get_zone_country_data/', JSON.stringify({ zones })).then((response) => {
        console.log(response.data)
      }).catch(console.log)
      const tempArr = [['1', 22, 0, 3, 66, 2, 6, 55369, 22116232, 52005770, 686093, 290987, 98913756919, 49508924, 2761489, 9602863], ['1', 22, 1, 3, 89, 2, 0, 17690, 10724787, 21205182, 153714, 400438, 571540709, 308509, 94669, 7613748], ['1', 22, 2, 0, 41, 2, 4, 36987, 12776880, 29540266, 715480, 268609, 6552821, 43752, 80375, 5782258], ['2', 23, 0, 1, 29, 1, 1, 10546, 2326262, 5164782, 9240, 128, 45606, 3586, 228405, 1748991], ['2', 23, 1, 0, 19, 1, 1, 11945, 497623, 4520293, 86130, 864, 497371, 4040, 302737, 1744026], ['2', 23, 2, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 360, 323356, 5782258], ['3', 37, 0, 1, 33, 0, 2, 15665, 3061026, 6298983, 38, 149168, 10000095058, 5005739, 56448, 1478857], ['3', 37, 1, 2, 53, 1, 1, 16441, 4215253, 10414749, 437073, 33600, 991886, 20013, 118665, 6500669], ['3', 37, 2, 0, 41, 1, 1, 14920, 3762233, 8105511, 201546, 1454, 492655, 11364, 54957, 5488647]]
      this.tableData = tempArr.map(item => {
        const [zone, days, country, capitalNum, cityNum, powerfulNum, activeNum, rankScore, topPower, activePowerSum, activePay, activePayFake, activeCoin, multiplePower, powerTop20, topPower1] = item
        return { zone, days, country, capitalNum, cityNum, powerfulNum, activeNum, rankScore, topPower, activePowerSum, activePay, activePayFake, activeCoin, multiplePower, powerTop20, topPower1 }
      })
      console.log(this.tableData)
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
