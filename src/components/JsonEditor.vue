<template>
  <div>
    <el-form :inline="true">
      <el-form-item label="选择配置">
        <el-select v-model="configIndex">
            <el-option v-for="(item, index) in configs" :key="index" :label="item.name" :value="index"></el-option>
          </el-select>
      </el-form-item>
    </el-form>
    <vue-json-editor v-model="jsonData"
      :show-btns="true"
      :mode="'tree'"
      lang="zh"
      @json-save="onJsonSave"
      @has-error="onError">
    </vue-json-editor>
    <div v-html="note" />
  </div>
</template>

<script>
import vueJsonEditor from 'vue-json-editor'
import * as R from 'ramda'
import * as marked from 'marked'
import getConfig from '../js/config'
import { getLocalKey } from '../js/storageKey'
const storageKey = `edit_${getLocalKey()}`
export default {
  data () {
    return {
      jsonData: null,
      configIndex: 0,
      configs: [
        { name: '一次合服', value: 0 },
        { name: '二次合服', value: 1 },
        { name: '三次合服', value: 2 }
      ]
    }
  },
  created: function () {
    this.refresh()
  },
  components: {
    vueJsonEditor
  },
  watch: {
    configIndex: function (val, oldVal) {
      this.refresh()
    }
  },
  computed: {
    note () {
      const config = getConfig(this.configIndex)
      const noteStr = `#### 合并之后三个国家对应属性所占的权重
  | 属性              | 权重                             |
  | ----------------- | -------------------------------- |
  | 尖端战力          | Right1 默认值 ${JSON.stringify(config.Right1)} |
  | 活跃总战力        | Right2 默认值 ${config.Right2}          |
  | 充值(真实+虚拟)   | Right3 默认值 ${config.Right3}          |
  | 30日充值          | Right4 默认值 ${config.Right4}          |
  | 玩家数(高战+中坚)  | Right5 默认值 ${config.Right5}         |
  | 活跃coin          | Right6 默认值 ${config.Right6}          |
  | 期望方差          | idealS 默认值 ${config.idealS}          |
  | 最大人数          | maxNum 默认值 ${config.maxNum}          |
  | 查找次数          | queryTimes 默认值 ${config.queryTimes}  |
  | 幂系数            | busyRatio 默认值 ${config.busyRatio}    |
  | 未分配标力系数    | freeRatio 默认值 ${config.freeRatio}     |`
      return marked(noteStr)
    }
  },
  methods: {
    refresh () {
      const config = getConfig(this.configIndex)
      const configStr = localStorage.getItem(storageKey + this.configIndex)
      let localConfig = configStr ? JSON.parse(localStorage.getItem(storageKey + this.configIndex)) : {}
      delete localConfig.titles
      delete localConfig.keys
      localConfig = Object.assign({}, ...[config, localConfig])
      localConfig = R.pick(Object.keys(config))(localConfig)
      this.jsonData = R.compose(R.clone, R.omit(['titles', 'keys']))(localConfig)
      localStorage.setItem(storageKey + this.configIndex, JSON.stringify(Object.assign(config, localConfig)))
    },
    onJsonChange (value) {
      console.log('value:', value)
    },
    onJsonSave (value) {
      const config = getConfig(this.configIndex)
      localStorage.setItem(storageKey + this.configIndex, JSON.stringify(Object.assign(config, value)))
      this.$notify({
        title: '成功',
        message: '配置已成功保存至本地',
        position: 'top-left',
        type: 'success',
        duration: 1500
      })
    },
    onError (value) {
      alert('格式错误')
      console.log('value:', value)
    }
  }
}
</script>
