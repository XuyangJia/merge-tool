<template>
  <div>
    <el-collapse v-if="plans && plans.length">
      <MyCollapse v-for="(item, index) in plans" :key="index" :planId="index" />
    </el-collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MyCollapse from './MyCollapse.vue'
export default {
  data: function () {
    return {}
  },
  computed: {
    ...mapGetters('merge', {
      plans: 'plans'
    })
  },
  components: {
    MyCollapse
  }
}
</script>
