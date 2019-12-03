<template>
  <div id="app">
    <MergeTool/>
  </div>
</template>

<script>
import MergeTool from './components/MergeTool.vue'

export default {
  name: 'app',
  components: {
    MergeTool
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
  margin-top: 60px;
}
</style>
