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
      startId: '6782',
      endId: '6909',
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
      if (this.serverIndex === 7) {
        this.axios.defaults.headers.post['Content-Type'] = 'application/json'
      }
      this.axios.post(`${this.api}/get_zone_country_data/`, JSON.stringify({ zones, sign })).then((response) => {
        let startZone = response.data.start_zone
        const matchs = startZone.match(/^h(\d+)_(\d+)$/)
        const mergeTimes = parseInt(matchs[1]) - 1
        const configStr = localStorage.getItem(`edit_${getLocalKey()}`)
        const config = configStr ? JSON.parse(configStr) : getConfig(mergeTimes)
        localStorage.setItem(getLocalKey(), JSON.stringify(config))
        const origindata = response.data.data.map(item => {
          const result = {}
          if (Array.isArray(item)) { // 列表
            config.keys.forEach((key, i) => {
              result[key] = item[i]
            })
            result.top1 = item[item.length - 1] // 单将最高战力永远取最后一位
            if (item.length === 17) {
              result.normalNum = 0
            } else {
              result.normalNum = item[item.length - 2] * 0.5 // 活跃低战
            }
          } else { // 字典
            for (const key in config.keyMap) {
              const newKey = config.keyMap[key]
              result[newKey] = item[key]
            }
          }
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
