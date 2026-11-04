<script setup>
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'

const router = useRouter()
</script>

<template>
  <div class="nf">
    <router-link to="/"><BrandLogo /></router-link>
    <div class="code">404</div>
    <h1>页面不存在</h1>
    <p>您访问的页面可能已被移除，或链接地址有误。</p>
    <div class="acts">
      <button class="btn btn-primary" @click="router.push('/')">返回首页</button>
      <button class="btn btn-ghost" @click="router.push('/tenders')">浏览招标公告</button>
    </div>
  </div>
</template>

<style scoped>
.nf {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #fbfcfe;
  padding: 40px;
  text-align: center;
}

.code {
  margin-top: 34px;
  font-size: 92px;
  font-weight: 800;
  letter-spacing: -4px;
  background: linear-gradient(135deg, #1b4b8f, #7fa8d8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
}

h1 {
  font-size: 22px;
  font-weight: 600;
  margin-top: 10px;
}

p {
  font-size: 13.5px;
  color: var(--text-3);
  margin-top: 8px;
}

.acts {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
</style>
