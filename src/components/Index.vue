<template>
  <div>
    <el-switch v-model="showConfig"/>
    <el-row
    v-loading.fullscreen.lock="loading">
      <el-col :span="10" :offset="1">
        <JsonEditor v-if="showConfig"/>
      </el-col>
      <el-col :span="showConfig ? 12 : 24" :offset="showConfig ? 1 : 0">
        <div class="input-container">
          <el-divider content-position="center">选择服务器</el-divider>
          <el-select v-model="serverIndex"  placeholder="请选择服务器">
            <el-option v-for="(item, index) in serverOptions" :key="index" :label="item.name" :value="index"></el-option>
          </el-select>
          <el-divider content-position="center">选择合区段</el-divider>
          <el-row>
            <el-col :xs="2" :sm="5" :md="7" :lg="8" :xl="9"/>
            <el-col :xs="20" :sm="16" :md="12" :lg="10" :xl="8">
              <el-table
                :data="mergeIds"
                stripe
                size="mini"
                :show-header="false"
                :border="false">
                <el-table-column
                  prop="0"
                  align="center">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model.trim="scope.row['0']" clearable placeholder="起始ID"></el-input>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="1"
                  align="center">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model.trim="scope.row['1']" clearable placeholder="结束ID"></el-input>
                  </template>
                </el-table-column>
                <el-table-column
                  align="left">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="danger"
                      @click="handleDelete(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-tooltip content="点击添加合区段" placement="right">
            <el-button type="success" @click="addZone" plain icon="el-icon-plus" circle></el-button>
          </el-tooltip>
          <el-divider content-position="center">使用新的合服算法</el-divider>
          <el-switch v-model="newTool" active-color="#13ce66"></el-switch>
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
import { changeServerData } from '../js/mergeUtil'
import JsonEditor from './JsonEditor.vue'
export default {
  components: {
    JsonEditor
  },
  data: function () {
    return {
      loading: false,
      serverOptions: [
        { name: '三国 简体', value: 'http://sg3.ptkill.com', dev: '/sg3' },
        { name: '三国 360', value: 'http://qh.ptkill.com', dev: '/qh' },
        { name: '三国 韩国', value: 'http://kr.ptkill.com', dev: '/kr' },
        { name: '三国 繁体', value: 'http://hk.ptkill.com', dev: '/hk' },
        { name: '三国 日本', value: 'http://jpn.ptkill.com', dev: '/jpn' },
        { name: '三国 越南', value: 'http://vn.ptkill.com', dev: '/vn' },
        { name: '37 日本', value: 'http://ea37sg.37games.com', dev: '/ea37' },
        { name: '37 港台', value: 'http://tw37sg.gm99.com', dev: '/tw37' },
        { name: '警戒 简体', value: 'http://war.ptkill.com', dev: '/war' },
        { name: '警戒 37', value: 'http://war37.ptkill.com', dev: '/war37' },
        { name: '本地128', value: 'http://192.168.1.128:8888', dev: '/local' }
      ],
      serverIndex: 0,
      mergeIds: [['h2_1', 'h2_10']],
      newTool: true,
      showConfig: false,
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
      const zones = this.mergeIds.map(([startId, endId]) => {
        const prefix = startId.match(reg)[1] || ''
        const start = parseInt(startId.match(reg)[2])
        const end = parseInt(endId.match(reg)[2])
        return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`)
      }).flat()
      this.getCountryData(zones)
    },
    addZone () {
      this.mergeIds.push([])
    },
    handleDelete (index) {
      this.mergeIds.splice(index, 1)
    },
    getCountryData (zones) {
      this.loading = true
      const sign = crypto.createHash('md5').update(`zones=${JSON.stringify(zones)}yWSExXmzgwCYNlUVRfIMTtoHpcPvkhBn`).digest('hex')
      // if (this.serverIndex === this.serverOptions.length - 1) {
      //   this.axios.defaults.headers.post['Content-Type'] = 'application/json'
      // }
      this.axios.post(`${this.api}/get_zone_country_data/`, { zones, sign }).then((response) => {
        let { data: countries, start_zone: startZone, zone_range: zoneRange } = response.data
        if (/None/.test(startZone)) {
          startZone.replace(/None/, 0)
          console.error('后端回传的起始ID有误')
          return
        }

        // /**
        //  * 测试数据
        //  */
        // const mockData = require('../js/mockData.json')
        // let { data: countries, start_zone: startZone, zone_range: zoneRange } = mockData

        zoneRange = zoneRange || [[1, 10 ** 6]]
        countries = changeServerData(countries)
        
        this.$store.dispatch('initStore', { zoneRange, startZone, countries, lastPlan: JSON.parse(this.inputData || 'null') })

        this.$router.push({ path: `merge/${this.newTool}` })
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
      function getCompareNum (str) {
        const reg = /(h(\d+)_)?(\d+)/
        const result = str.match(reg)
        if (result[2]) {
          return parseInt(result[2]) * 10000 + parseInt(result[3])
        } else {
          return parseInt(result[3])
        }
      }
      const lastPlan = JSON.parse(this.inputData)
      const zones = Object.keys(lastPlan).sort((a, b) => getCompareNum(a) - getCompareNum(b))
      this.newTool = Array.isArray(lastPlan[zones[0]])
      // console.log(lastPlan, zones)
      // return
      // const obj = {}
      // R.forEachObjIndexed((v, k) => {
      //   obj[v.to_zone] = obj[v.to_zone] || []
      //   obj[v.to_zone].push(k)
      // })(lastPlan)
      // let lastPlans = []
      // R.forEachObjIndexed((v, k) => {
      //   const plan = R.compose(R.flatten, R.map(item => lastPlan[item].country))(v)
      //   lastPlans.push([
      //     [[0, plan]],
      //     zones.indexOf(v[0]),
      //     v.length
      //   ])
      // })(obj)
      // this.$store.dispatch('mergeOld/setLastPlanObj', Object.freeze(lastPlan))
      // this.$store.dispatch('mergeOld/setLastPlans', lastPlans)
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
.el-table {
  /* padding: 0 100px; */
  text-align: center;
  /* width: 60em; */
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
