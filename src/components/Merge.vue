<template>
  <div>
    <el-collapse v-if="items && items.length">
      <MyCollapse v-for="(item, index) in items" :key="index" :planId="index" />
    </el-collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MyCollapse from './MyCollapse.vue'
export default {
  data: function () {
    return {
      items: null
    }
  },
  mounted () {
    if (this.plans && this.plans.length) {
      this.items = this.plans
    } else {
      this.items = this.lastPlans
    }
    console.log(this.items)
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
