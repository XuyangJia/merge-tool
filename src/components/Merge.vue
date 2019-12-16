<template>
  <div>
    <Header/>
    <el-collapse>
      <MyCollapse v-for="(item, index) in plans" :key="index" :initialPlan="item" />
    </el-collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Header from './Header.vue'
import MyCollapse from './MyCollapse.vue'
export default {
  data: function () {
    return {}
  },
  computed: {
    ...mapGetters('zones', {
      plans: 'plans'
    })
  },
  components: {
    Header,
    MyCollapse
  }
}
</script>
