<template>
  <div id="app">
    <Header v-if="$route.path !== '/index'"/>
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

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
