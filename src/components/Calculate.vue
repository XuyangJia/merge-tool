<template>
  <div>
    <h1>正在进行合区。。。</h1>
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
    if (this.lastPlans && this.lastPlans.length) {
      // console.log(this.lastPlans)
    } else {
      this.$store.dispatch('merge/refreshPlans', data)
    }
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
      lastPlans: 'lastPlans'
    })
  }
}
</script>
