<template>
  <div>
    <el-collapse v-if="items && items.length">
      <MyCollapse v-for="(item, index) in items" :key="index" :planId="index" @reMerge="reMerge"/>
    </el-collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MyCollapse from './MyCollapse.vue'
export default {
  data: function () {
    return {
      refresh: false,
      items: null
    }
  },
  mounted () {
    this.items = this.plans.length ? this.plans : this.lastPlans
  },
  methods: {
    reMerge: function (arr) {
      console.log('重新合区', arr)
      this.items = []
      this.refresh = true
      setTimeout(this.refreshPlans, 200, arr)
    },
    refreshPlans: function (arr) {
      this.$store.dispatch('merge/refreshPlans', arr)
    }
  },
  watch: {
    plans: {
      immediate: true,
      handler (val) {
        this.refresh && val && val.length && (this.items = val)
      }
    },
    lastPlans: {
      immediate: true,
      handler (val) {
        this.refresh && val && val.length && (this.items = val)
      }
    }
  },
  computed: {
    ...mapGetters('merge', {
      plans: 'plans',
      lastPlans: 'lastPlans'
    })
  },
  components: {
    MyCollapse
  }
}
</script>
