<template>
<div>
  <div class="input" v-if="data === null">
    <img alt="Vue logo" src="../assets/logo.png">
    <h1>请输入待合区的起始ID和结束ID</h1>
    <div>
      <label>起始ID</label>
      <input placeholder="12" v-model="startId">
      <br>
      <label>结束ID</label>
      <input placeholder="34" v-model="endId">
    </div>
    <button @click="fun1">提交</button>
  </div>
  <div v-if="data">
    <el-table
      :data="tableData"
      border
      style="width: 100%">
      <el-table-column
        prop="date"
        label="日期"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="address"
        label="地址">
      </el-table-column>
    </el-table>
    <el-button>Click Me</el-button>
  </div>
</div>

</template>

<script>
export default {
  name: 'MergeTool',
  data: function () {
    return {
      startId: '1',
      endId: '2',
      data: null,
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  },
  methods: {
    fun1: function (event) {
      console.log(this.startId, this.endId)
      // this.axios.post('http://192.168.1.128:8888/get_zone_country_data/', JSON.stringify({ zones: ['h1_1'] })).then((response) => {
      //   console.log(response.data)
      // })
      this.axios.get('http://cdn2.ptkill.com/static/h5/css/style.css').then((response) => {
        // console.log(response.data)
        this.data = [1, 3, 4, 5, 6, 7, 8, 9]
      })
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
