<template>
<div>
  <div class="input" v-if="tableData === null">
    <!-- <el-form :inline="true" class="demo-form-inline">
        <el-select v-model="serverIndex"  placeholder="请选择服务器">
          <el-option v-for="(item, index) in servers" :key="index" :label="item" :value="index"></el-option>
        </el-select>
    </el-form> -->
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
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="合服方案">
        <el-select v-model="planIndex" placeholder="切换方案">
          <el-option v-for="(item, index) in plans" :key="index" :label="'方案'+(index+1)+' 方差：'+item[0]" :value="index"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item>
        <el-button type="primary" @click="onChoose">切换方案</el-button>
        <el-button type="success" @click="onChoose">导出</el-button>
      </el-form-item> -->
    </el-form>
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
        <template slot-scope="scope">
        <el-tag
          :type="['primary', 'success', 'danger'][scope.row.country]"
          disable-transitions>{{['魏','蜀','吴'][scope.row.country]}}</el-tag>
      </template>
      </el-table-column>
      <el-table-column
        prop="target"
        label="目标国家">
        <template slot-scope="scope">
        <el-tag
          :type="['primary', 'success', 'danger'][scope.row.target]"
          disable-transitions>{{['魏','蜀','吴'][scope.row.target]}}</el-tag>
      </template>
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
export default {
  name: 'MergeTool',
  data: function () {
    return {
      serverIndex: '',
      servers: [1, 2, 3],
      variance: 0,
      tableData: null,
      countryData: null,
      planIndex: -1,
      plans: null
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
    onChoose: function (event) {
      this.initPlanData(this.planIndex)
    },
    onExport: function (event) {
      console.log('导出数据')
    },
    initPlanData: function (index) {
      const planData = this.plans[index]
      this.variance = planData[0]
      const temp = []
      planData[1].forEach((arr, i) => {
        arr.forEach(ranking => {
          const obj = Object.assign({}, this.countryData[ranking])
          obj.target = i
          temp.push(obj)
        })
      })
      this.tableData = temp.sort((a, b) => {
        if (a.zone !== b.zone) {
          return a.zone - b.zone
        } else {
          return a.country - b.country
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
