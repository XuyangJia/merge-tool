<template>
  <div>
    <el-switch v-model="showConfig"/>
    <el-row v-if="notRequest">
      <el-col :span="10" :offset="1">
        <JsonEditor v-if="showConfig"/>
      </el-col>
      <el-col :span="showConfig ? 12 : 24" :offset="showConfig ? 1 : 0">
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
import * as R from 'ramda'
import crypto from 'crypto'
import getConfig from '../js/config'
import { getLocalKey } from '../js/storageKey'
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
        { name: '三国 韩国', value: 'http://kr.ptkill.com', dev: '/kr' },
        { name: '三国 繁体', value: 'http://hk.ptkill.com', dev: '/hk' },
        { name: '三国 日本', value: 'http://jpn.ptkill.com', dev: '/jpn' },
        { name: '警戒 简体', value: 'http://war.ptkill.com', dev: '/war' },
        { name: '警戒 37', value: 'http://war37.ptkill.com', dev: '/war37' },
        { name: '本地128', value: 'http://192.168.1.128:8888', dev: '/local' }
      ],
      serverIndex: 0,
      startId: '',
      endId: '',
      showConfig: false,
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
      const sign = crypto.createHash('md5').update(`zones=${JSON.stringify(zones)}yWSExXmzgwCYNlUVRfIMTtoHpcPvkhBn`).digest('hex')
      this.axios.post(`${this.api}/get_zone_country_data/`, JSON.stringify({ zones, sign })).then((response) => {
        // response.data = JSON.parse('{"start_zone": "h1_1251", "data": [["6317", 42, 0, 4, 169, 4, 20, 111239, 2842936, 20034029, 38716, 57046, 0, 421349, 9414, 31370014, 1039223], ["6317", 42, 1, 3, 136, 4, 22, 119180, 2953604, 20912158, 30442, 36634, 0, 253477, 8526, 23578521, 993432], ["6317", 42, 2, 2, 90, 2, 16, 68665, 1995121, 12677669, 18214, 25968, 0, 211626, 5591, 13267492, 584851], ["6318", 42, 0, 3, 126, 4, 11, 61360, 2976144, 14288852, 35932, 43260, 0, 507711, 7823, 16312125, 932338], ["6318", 42, 1, 3, 120, 2, 26, 79723, 2077232, 20972284, 11936, 24338, 0, 225651, 6916, 15869779, 691659], ["6318", 42, 2, 3, 149, 4, 22, 145310, 2652565, 27664501, 82969, 127202, 0, 681560, 12092, 30213065, 1060586], ["6319", 42, 0, 0, 18, 0, 6, 17050, 736875, 2739162, 3018, 3838, 0, 211840, 1497, 2495935, 287070], ["6319", 42, 1, 2, 157, 4, 16, 102240, 3092118, 17310373, 53768, 65796, 0, 283039, 9219, 21081750, 885458], ["6319", 42, 2, 7, 220, 6, 21, 155829, 3120554, 25630771, 31986, 48758, 0, 453753, 11052, 27695583, 848634], ["6320", 42, 0, 2, 89, 1, 15, 64202, 2079126, 12574747, 18514, 26300, 0, 138224, 5605, 14804060, 858024], ["6320", 42, 1, 4, 184, 2, 18, 104848, 3630749, 21413492, 93362, 135970, 0, 712341, 12971, 19339237, 1137317], ["6320", 42, 2, 3, 122, 6, 14, 89932, 3237911, 19227913, 61671, 76486, 0, 455161, 9652, 23202902, 899981]]}')
        // console.log(JSON.stringify(response.data))
        let startZone = response.data.start_zone
        const matchs = startZone.match(/^h(\d+)_(\d+)$/)
        const mergeTimes = parseInt(matchs[1]) - 1
        const configStr = localStorage.getItem(`MergToolSaveKey2_${mergeTimes}`)
        const config = configStr ? JSON.parse(configStr) : getConfig(mergeTimes)
        localStorage.setItem(getLocalKey(), JSON.stringify(config))
        console.log(response.data.data)
        const origindata = response.data.data.map(item => {
          const result = {}
          config.keys.forEach((key, i) => {
            result[key] = item[i]
          })
          result.top1 = item[item.length - 1] // 单将最高战力永远取最后一位
          result.normalNum = item[item.length - 2] * 0.5 // 活跃低战
          return result
        })
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
      const obj = {}
      R.forEachObjIndexed((v, k) => {
        obj[v.to_zone] = obj[v.to_zone] || []
        obj[v.to_zone].push(k)
      })(planObj)
      function getCompareNum (str) {
        const reg = /(h(\d+)_)?(\d+)/
        const result = str.match(reg)
        if (result[2]) {
          return parseInt(result[2]) * 10000 + parseInt(result[3])
        } else {
          return parseInt(result[3])
        }
      }
      const zones = Object.keys(planObj).sort((a, b) => getCompareNum(a) - getCompareNum(b))
      let lastPlans = []
      R.forEachObjIndexed((v, k) => {
        const plan = R.compose(R.flatten, R.map(item => planObj[item].country))(v)
        lastPlans.push([
          [[0, plan]],
          zones.indexOf(v[0]),
          v.length
        ])
      })(obj)
      this.$store.dispatch('merge/setLastPlanObj', Object.freeze(planObj))
      this.$store.dispatch('merge/setLastPlans', lastPlans)
      this.getCountryData(zones)
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
