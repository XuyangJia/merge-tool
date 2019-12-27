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
  </div>
</template>

<script>
import vueJsonEditor from 'vue-json-editor'
import * as R from 'ramda'
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
    this.$store.dispatch('merge/setConfigData', this.jsonData)
    console.log(this.$store.getters.config)
  },
  components: {
    vueJsonEditor
  },

  methods: {
    onJsonChange (value) {
      console.log('value:', value)
    },
    onJsonSave (value) {
      localStorage.setItem(storageKey, JSON.stringify(value))
      this.$store.dispatch('merge/setConfigData', value)
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
