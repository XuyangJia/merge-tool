<template>
  <div>
    <div class="input" v-if="notRequest">
      <!-- <h1>请选择服务器</h1>
      <el-form :inline="true" class="demo-form-inline">
          <el-select v-model="serverIndex"  placeholder="请选择服务器">
            <el-option v-for="(item, index) in servers" :key="index" :label="item.name" :value="index"></el-option>
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
    <el-card v-if="!notRequest">
      <p v-for="(item, index) in logs" :key="index">{{ item }}</p>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import config from '../js/config'
import { getCright } from '../js/mergeUtil'
export default {
  components: {
  },
  data: function () {
    return {
      notRequest: true,
      serverIndex: 0,
      servers: [
        { name: '线上简体' },
        { name: '360' }
      ],
      steps: null,
      startId: '13',
      endId: '16'
    }
  },
  computed: {
    ...mapGetters('merge', {
      logs: 'logs'
    })
  },
  methods: {
    onSubmit: function (event) {
      const reg = /(h\d+_)?(\d+)$/
      const prefix = this.startId.match(reg)[1] || ''
      const start = parseInt(this.startId.match(reg)[2])
      const end = parseInt(this.endId.match(reg)[2])
      const zones = Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`)
      this.notRequest = false
      this.axios.post('/api/get_zone_country_data/', JSON.stringify({ zones })).then((response) => {
        response.data = JSON.parse('[["13",41,0,5,153,4,21,137764,3540936,20569794,67492,86848,0,879733,11362,19896912,1309256],["13",41,1,1,99,1,8,27196,1073101,3455581,348,360,0,95945,2703,3436846,443804],["13",41,2,3,143,5,10,104182,3294215,16681405,66857,97808,0,266372,10280,17921492,1271591],["14",40,0,9,248,8,8,117798,2934896,13037324,56035,79836,0,625420,10915,7380220,1247180],["14",40,1,0,67,0,3,17918,418281,954823,564,3012,0,54816,1391,1075534,151389],["14",40,2,0,79,1,4,30660,739834,1881749,218,760,0,109935,1949,2338805,314982],["15",40,0,0,66,2,7,47062,1957464,5505202,19802,29942,0,264506,4433,5077541,662927],["15",40,1,3,138,2,11,69693,2333297,8312244,21714,37504,0,494878,6565,7712296,682387],["15",40,2,6,191,5,6,86603,3478629,13793073,77829,110182,0,383955,11298,13347609,994667],["16",39,0,2,84,2,7,48108,1450529,4840851,35167,45518,0,263077,4712,3048473,790675],["16",39,1,1,60,0,8,40132,662443,2852815,1332,7980,0,53139,2114,1524131,190965],["16",39,2,6,251,7,13,132706,2845304,17719360,85214,130972,3064,1471874,13086,11752966,883962]]')
        const origindata = response.data.map(item => {
          const result = {}
          config.keys.forEach((key, i) => {
            result[key] = item[i]
          })
          result.right = getCright(result)
          return result
        })
        this.$store.dispatch('merge/setCountryData', origindata)
        this.$router.push('merge')
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
