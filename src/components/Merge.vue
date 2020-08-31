<template>
  <div>
    <el-collapse>
      <CollapseNew v-for="(item, index) in newPlans" :key="index" :planIndex="index"/>
      <CollapseOld v-for="(item, index) in oldPlans" :key="index" :planObj="[index, item.slice(0, 150)]"/>
    </el-collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CollapseOld from './CollapseOld.vue'
import CollapseNew from './CollapseNew.vue'
export default {
  props: ['newTool'],
  data: function () {
    return {
      itemsOld: []
    }
  },
  mounted () {
    // 计算合服方案
    if (this.newTool === 'true') {
      this.mergeNew()
    } else {
      this.mergeOld()
    }
  },
  methods: {
    mergeOld: function () {
      this.$store.dispatch('mergeOld/merge')
    },
    mergeNew: function () {
      this.$store.dispatch('mergeNew/merge')
    }
  },
  watch: {
    oldPlans: {
      handler (val) {
        val && val.length && (this.itemsOld = val)
      }
    },
    lastOldPlans: {
      handler (val) {
        val && val.length && (this.itemsOld = val)
      }
    }
  },
  computed: {
    ...mapGetters(['countries']),
    ...mapGetters('mergeOld', {
      oldPlans: 'plans',
      lastOldPlans: 'lastPlans'
    }),
    ...mapGetters('mergeNew', {
      newPlans: 'plans'
    })
  },
  components: {
    CollapseOld,
    CollapseNew
  }
}
</script>
