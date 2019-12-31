<template>
  <div>
    <el-row v-if="notRequest" :gutter="20">
      <el-col :span="9" :offset="2">
        <JsonEditor/>
      </el-col>
      <el-col :span="13">
        <div class="input">
          <h1>请选择服务器</h1>
          <el-form :inline="true" class="demo-form-inline">
              <el-select v-model="serverIndex"  placeholder="请选择服务器">
                <el-option v-for="(item, index) in serverOptions" :key="index" :label="item.name" :value="index"></el-option>
              </el-select>
          </el-form>
          <h2>请输入待合区的起始ID和结束ID</h2>
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import JsonEditor from './JsonEditor.vue'
import { getCright } from '../js/mergeUtil'
export default {
  components: {
    JsonEditor
  },
  data: function () {
    return {
      notRequest: true,
      serverIndex: 0,
      serverOptions: [
        { name: '三国 简体', value: 'http://sg3.ptkill.com', dev: '/sg3' },
        { name: '三国 360', value: 'http://qh.ptkill.com', dev: '/qh' },
        { name: '三国 韩国', value: 'http://kr.ptkill.com' },
        { name: '三国 繁体', value: 'http://hk.ptkill.com' },
        { name: '三国 日本', value: 'http://jpn.ptkill.com' },
        { name: '警戒 简体', value: 'http://war.ptkill.com' },
        { name: '警戒 37', value: 'http://war37.ptkill.com' }
      ],
      steps: null,
      startId: '',
      endId: ''
    }
  },
  methods: {
    onSubmit: function (event) {
      const reg = /(h\d+_)?(\d+)$/
      const prefix = this.startId.match(reg)[1] || ''
      const start = parseInt(this.startId.match(reg)[2])
      const end = parseInt(this.endId.match(reg)[2])
      const zones = Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`)
      this.notRequest = false
      let api = this.serverOptions[this.serverIndex].value
      if (process.env.NODE_ENV === 'development') {
        api = this.serverOptions[this.serverIndex].dev
      }
      this.axios.post(`${api}/get_zone_country_data/`, JSON.stringify({ zones })).then((response) => {
        // console.log(JSON.stringify(response.data))
        // response.data = JSON.parse('[["13",45,0,6,175,4,21,139917,3332653,21899997,60151,87680,0,904888,11655,32925227,1341326],["13",45,1,1,123,1,10,28352,1214286,4015585,318,360,0,98639,3147,5107294,472857],["13",45,2,2,97,5,10,98805,3250568,16841285,60013,97862,0,290858,9680,29365759,1271864],["14",44,0,9,322,7,7,103732,3218234,12489268,46292,78062,0,612982,11754,6942136,1275082],["14",44,1,0,33,0,3,18305,493386,1098330,602,3110,0,70139,1153,1024168,174522],["14",44,2,0,40,1,6,37312,794675,2178029,224,2692,0,170287,1764,2545995,337412],["15",44,0,0,79,2,8,49295,2095274,6051651,16448,29942,0,266746,4768,5026309,724119],["15",44,1,3,105,2,8,64240,2407705,8444682,19474,37180,0,485617,6281,7576352,740920],["15",44,2,6,211,5,6,87292,3503241,14515368,62615,110308,0,451354,11636,13301601,1009915],["16",43,0,2,76,2,6,48265,1544581,5087218,30277,45696,0,283445,4767,2055895,790675],["16",43,1,2,60,0,7,33125,725093,2688641,0,7962,0,70376,2233,1258891,213608],["16",43,2,5,259,7,12,131191,1963868,17345272,75697,132000,0,1443705,12126,9296632,883962]]')
        const origindata = response.data.data.map(item => {
          const result = {}
          this.$store.getters['merge/config'].keys.forEach((key, i) => {
            result[key] = item[i]
          })
          result.right = getCright(result)
          return result
        })
        let startZone = response.data.start_zone
        if (/None/.test(startZone)) {
          startZone.replace(/None/, 0)
          console.error('后端回传的起始ID有误')
        }
        this.$store.dispatch('merge/setStartZone', startZone)
        this.$store.dispatch('merge/setCountryData', origindata)
        this.$router.push({ name: 'Calculate' })
      }).catch(console.error)
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
