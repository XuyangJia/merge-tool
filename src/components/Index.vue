<template>
  <div>
    <el-row v-if="notRequest" :gutter="20">
      <el-col :span="8" :offset="2">
        <JsonEditor/>
      </el-col>
      <el-col :span="14">
        <div class="input-container">
          <el-divider content-position="center">选择服务器</el-divider>
          <el-form :inline="true" class="demo-form-inline">
              <el-select v-model="serverIndex"  placeholder="请选择服务器">
                <el-option v-for="(item, index) in serverOptions" :key="index" :label="item.name" :value="index"></el-option>
              </el-select>
          </el-form>
          <el-divider content-position="center">选择合区段</el-divider>
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="起始ID">
              <el-input v-model="startId" clearable placeholder="Start ID"></el-input>
            </el-form-item>
            <el-form-item label="结束ID">
              <el-input v-model="endId" clearable placeholder="End ID"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
          </el-form>
          <el-divider content-position="center">还原合服计划（需要选择对应的服务器）</el-divider>
          <div v-if="!inputData">
            <input ref="json-upload-input" class="json-upload-input" type="file" accept=".json" @change="handleClick">
            <div class="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
              将导出文件拖拽至此处，或者
              <el-button :loading="loading" style="margin-left:16px;" size="mini" type="primary" @click="handleUpload">
                选择文件
              </el-button>
            </div>
          </div>
          <div v-if="inputData">
            <el-input
              type="textarea"
              disabled
              size="mini"
              :rows="30"
              :value="inputData"/>
            <el-button type="primary" @click="restore">还原合服计划</el-button>
        </div>
          </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import JsonEditor from './JsonEditor.vue'
export default {
  components: {
    JsonEditor
  },
  data: function () {
    return {
      notRequest: true,
      serverOptions: [
        { name: '三国 简体', value: 'http://sg3.ptkill.com', dev: '/sg3' },
        { name: '三国 360', value: 'http://qh.ptkill.com', dev: '/qh' },
        { name: '三国 韩国', value: 'http://kr.ptkill.com' },
        { name: '三国 繁体', value: 'http://hk.ptkill.com' },
        { name: '三国 日本', value: 'http://jpn.ptkill.com' },
        { name: '警戒 简体', value: 'http://war.ptkill.com' },
        { name: '警戒 37', value: 'http://war37.ptkill.com' }
      ],
      serverIndex: 0,
      startId: '251',
      endId: '259',
      loading: false,
      inputData: null
    }
  },
  computed: {
    api: function () {
      return this.serverOptions[this.serverIndex][process.env.NODE_ENV === 'development' ? 'dev' : 'value']
    }
  },
  methods: {
    onSubmit: function (event) {
      const reg = /(h\d+_)?(\d+)$/
      const prefix = this.startId.match(reg)[1] || ''
      const start = parseInt(this.startId.match(reg)[2])
      const end = parseInt(this.endId.match(reg)[2])
      const zones = Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`)
      this.$store.dispatch('merge/setLastPlans', [])
      this.getCountryData(zones)
    },
    getCountryData (zones) {
      this.notRequest = false
      this.axios.post(`${this.api}/get_zone_country_data/`, JSON.stringify({ zones })).then((response) => {
        // console.log(JSON.stringify(response.data))
        // response.data = JSON.parse('[["13",45,0,6,175,4,21,139917,3332653,21899997,60151,87680,0,904888,11655,32925227,1341326],["13",45,1,1,123,1,10,28352,1214286,4015585,318,360,0,98639,3147,5107294,472857],["13",45,2,2,97,5,10,98805,3250568,16841285,60013,97862,0,290858,9680,29365759,1271864],["14",44,0,9,322,7,7,103732,3218234,12489268,46292,78062,0,612982,11754,6942136,1275082],["14",44,1,0,33,0,3,18305,493386,1098330,602,3110,0,70139,1153,1024168,174522],["14",44,2,0,40,1,6,37312,794675,2178029,224,2692,0,170287,1764,2545995,337412],["15",44,0,0,79,2,8,49295,2095274,6051651,16448,29942,0,266746,4768,5026309,724119],["15",44,1,3,105,2,8,64240,2407705,8444682,19474,37180,0,485617,6281,7576352,740920],["15",44,2,6,211,5,6,87292,3503241,14515368,62615,110308,0,451354,11636,13301601,1009915],["16",43,0,2,76,2,6,48265,1544581,5087218,30277,45696,0,283445,4767,2055895,790675],["16",43,1,2,60,0,7,33125,725093,2688641,0,7962,0,70376,2233,1258891,213608],["16",43,2,5,259,7,12,131191,1963868,17345272,75697,132000,0,1443705,12126,9296632,883962]]')
        const config = JSON.parse(localStorage.getItem('merge-tool-config'))
        const origindata = response.data.data.map(item => {
          const result = {}
          config.keys.forEach((key, i) => {
            result[key] = item[i]
          })
          return result
        })
        let startZone = response.data.start_zone
        if (/None/.test(startZone)) {
          startZone.replace(/None/, 0)
          console.error('后端回传的起始ID有误')
        }
        this.$store.dispatch('merge/setStartZone', startZone)
        this.$store.dispatch('merge/setCountryData', origindata)
        this.$router.push('merge')
      }).catch(console.error)
    },
    handleDrop (e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.loading) return
      const files = e.dataTransfer.files
      if (files.length !== 1) {
        this.$message.error('Only support uploading one file!')
        return
      }
      const rawFile = files[0] // only use files[0]

      if (!this.isJSON(rawFile)) {
        this.$message.error('Only supports upload .json suffix files')
        return false
      }
      this.upload(rawFile)
      e.stopPropagation()
      e.preventDefault()
    },
    handleDragover (e) {
      e.stopPropagation()
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    handleUpload () {
      this.$refs['json-upload-input'].click()
    },
    handleClick (e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      this.upload(rawFile)
    },
    upload (rawFile) {
      this.$refs['json-upload-input'].value = null // fix can't select the same json

      if (!this.beforeUpload) {
        this.readerData(rawFile)
        return
      }
      const before = this.beforeUpload(rawFile)
      if (before) {
        this.readerData(rawFile)
      }
    },
    readerData (rawFile) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          this.inputData = e.target.result
          this.loading = false
          resolve()
        }
        reader.readAsText(rawFile, 'utf-8')
      })
    },
    isJSON (file) {
      return /\.(json|js)$/.test(file.name)
    },
    restore () {
      const planObj = JSON.parse(this.inputData)
      const zones = Object.keys(planObj).sort()
      const newPlanObj = {}
      zones.forEach(key => {
        const newZone = planObj[key].to_zone
        if (newPlanObj[newZone]) {
          newPlanObj[newZone] = newPlanObj[newZone].concat(planObj[key].country)
        } else {
          newPlanObj[newZone] = [].concat(planObj[key].country)
        }
      })
      const newZones = Object.keys(newPlanObj).sort()
      const plans = newZones.map(newZone => newPlanObj[newZone])
      let startIndex = 0
      let lastPlans = []
      plans.forEach(arr => {
        const zoneNum = arr.length / 3
        lastPlans.push([
          [[0, arr]],
          startIndex,
          zoneNum
        ])
        startIndex += zoneNum
      })
      this.$store.dispatch('merge/setLastPlans', lastPlans)
      this.getCountryData(zones)
      console.log(zones, planObj, lastPlans)
    }
  }
}
</script>

<style scoped>
.input-container {
  text-align: center;
}
.server-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.el-col {
  padding: 3px 0;
}
.json-upload-input{
  display: none;
  z-index: -9999;
}
.drop{
  border: 2px dashed #bbb;
  width: 600px;
  height: 160px;
  line-height: 160px;
  margin: 0 auto;
  font-size: 24px;
  border-radius: 5px;
  text-align: center;
  color: #bbb;
  position: relative;
}
</style>
