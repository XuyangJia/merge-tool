<template>
  <div>
    <h1>配置可编辑</h1>
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
import config from '../js/config'
const storageKey = 'merge-tool-config'
export default {
  data () {
    return {
      jsonData: null
    }
  },
  created: function () {
    const configStr = localStorage.getItem(storageKey)
    const localConfig = configStr ? JSON.parse(localStorage.getItem(storageKey)) : config
    this.jsonData = R.compose(R.clone, R.omit(['titles', 'keys']))(localConfig)
    localStorage.setItem(storageKey, JSON.stringify(Object.assign(config, localConfig)))
  },
  components: {
    vueJsonEditor
  },
  computed: {
    note () {
      const noteStr = `#### 合并之后三个国家对应属性所占的权重
  | 属性              | 权重                             |
  | ----------------- | -------------------------------- |
  | 尖端战力          | Right1 默认值 [50,40,30,20,10,0] |
  | 活跃总战力        | Right2 默认值 100                |
  | 充值(真实+虚拟)   | Right3 默认值 30                 |
  | 30日充值          | Right4 默认值 60                 |
  | 玩家数(高战+中坚)  | Right5 默认值 60                 |
  | 活跃coin          | Right6 默认值 50                 |
  | 期望方差          | idealS 默认值 500                |
  | 最大人数          | maxNum 默认值 250                 |`
      return marked(noteStr)
    }
  },
  methods: {
    onJsonChange (value) {
      console.log('value:', value)
    },
    onJsonSave (value) {
      localStorage.setItem(storageKey, JSON.stringify(Object.assign(config, value)))
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
