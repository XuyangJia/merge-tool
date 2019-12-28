<template>
  <div>
    <h1>dfgsdfgsjgljsdlgjlks</h1>
    <el-card>
      <p v-for="(item, index) in logs" :key="index">{{ item }}</p>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: function () {
    return {}
  },
  mounted () {
    const { data } = this.$route.params
    this.$store.dispatch('merge/refreshPlans', data)
  },
  watch: {
    calculateing: {
      immediate: true,
      handler (val) {
        val && this.$router.push('merge')
      }
    }
  },
  computed: {
    ...mapGetters('merge', {
      calculateing: 'calculateing',
      logs: 'logs'
    })
  }
}
</script>
