<template>
  <div id="app">
    <Header v-if="$route.path !== '/'"/>
    <router-view></router-view>
  </div>
</template>

<script>
import Header from './Header.vue'
export default {
  name: 'app',
  components: {
    Header
  }
}
</script>
