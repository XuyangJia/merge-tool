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
    <!-- <el-card>
      <p v-for="(item, index) in logs" :key="index">{{ item }}</p>
    </el-card> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getCright } from '../js/mergeUtil'
export default {
  components: {
  },
  data: function () {
    return {
      dataKeys: ['zone', 'days', 'country', 'capitalNum', 'cityNum', 'powerfulNum', 'activeNum', 'rankScore', 'topPower', 'activePowerSum', 'activePay', 'activePay30', 'activePayFake', 'activeCoin', 'multiplePower', 'powerTop20', 'topPower1'],
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
    ...mapGetters('zones', {
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
        const origindata = response.data.map(item => {
          const result = {}
          this.dataKeys.forEach((key, i) => {
            result[key] = item[i]
          })
          result.right = getCright(result)
          return result
        })
        this.$store.dispatch('zones/setCountryData', origindata)
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
