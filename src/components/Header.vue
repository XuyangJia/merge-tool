<template>
  <el-row class="header">
    <el-col :span="2">
      <el-button type="warning" @click="backToHome"><i class="el-icon-s-home el-icon--left">主页</i></el-button>
    </el-col>
    <el-col :span="3" :offset="1">
      <el-input placeholder="请输入方差" v-model="variance"><template slot="prepend">理想方差:</template></el-input>
    </el-col>
    <el-col :span="3">
      <el-button type="primary" @click="refresh">重新计算</el-button>
    </el-col>
    <el-col :span="13">
    </el-col>
    <el-col :span="2">
      <el-button type="success" @click="exportPlans">导出<i class="el-icon-download el-icon--right"></i></el-button>
    </el-col>
  </el-row>
</template>

<script>
import config from '../js/config'
export default {
  data: function () {
    return {
      variance: config.idealS
    }
  },
  methods: {
    backToHome: function () {
      this.$router.push('/')
    },
    refresh: function () {
      console.log('重新计算')
    },
    exportPlans: function () {
      console.log('导出合服方案')
    }
  }
}
</script>

<style>
.header {
  background: #1d2838;
  margin-bottom: 20px;
  text-align: center;
  min-height: 36px;
}
.el-col {
  padding: 3px 0;
}
</style>
