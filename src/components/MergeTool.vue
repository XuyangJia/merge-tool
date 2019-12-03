<template>
  <div class="hello">
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
</template>

<script>
export default {
  name: 'HelloWorld',
  data: function () {
    return {
      startId: '1',
      endId: '2'
    }
  },
  methods: {
    fun1: function (event) {
      console.log(this.startId, this.endId)
      // this.axios.post('http://192.168.1.128:8888/get_zone_country_data/', JSON.stringify({ zones: ['h1_1'] })).then((response) => {
      //   console.log(response.data)
      // })
      this.axios.get('http://192.168.1.66/mergeTool').then((response) => {
        console.log(response.data)
      })
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
