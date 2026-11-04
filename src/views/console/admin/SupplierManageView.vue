<script setup>
import UserTable from '@/components/UserTable.vue'
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>机电设备厂家管理</h1>
        <p class="sub">维护厂家注册信息，核验企业资质，可停用违规账号或删除无效注册</p>
      </div>
    </div>
    <UserTable role="supplier" />
  </div>
</template>
