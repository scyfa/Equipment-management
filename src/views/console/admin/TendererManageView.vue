<script setup>
import UserTable from '@/components/UserTable.vue'
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>招标单位管理</h1>
        <p class="sub">维护招标单位注册信息，查看其发布的招标项目，可停用或删除账号</p>
      </div>
    </div>
    <UserTable role="tenderer" />
  </div>
</template>
