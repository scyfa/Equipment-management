<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import { authState, consoleHome, logout } from '@/stores/auth'
import { ROLE_LABEL } from '@/utils/format'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const user = computed(() => authState.user)

const navs = [
  { to: '/', label: '首页', match: (p) => p === '/' },
  { to: '/tenders', label: '招标公告', match: (p) => p.startsWith('/tenders') },
  { to: '/messages', label: '在线留言', match: (p) => p.startsWith('/messages') },
  { to: '/help', label: '操作指南', match: (p) => p.startsWith('/help') }
]

function isActive(nav) {
  return nav.match(route.path)
}

function goConsole() {
  router.push(consoleHome(user.value.role))
}

function doLogout() {
  logout()
  menuOpen.value = false
  toast.info('已退出登录')
  router.push('/')
}

function onDocClick(e) {
  if (!e.target.closest('.user-area')) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="shell">
    <header class="site-head">
      <div class="container head-inner">
        <router-link to="/" class="logo"><BrandLogo /></router-link>

        <nav class="nav">
          <router-link
            v-for="nav in navs"
            :key="nav.to"
            :to="nav.to"
            class="nav-item"
            :class="{ on: isActive(nav) }"
          >
            {{ nav.label }}
          </router-link>
        </nav>

        <div class="user-area">
          <template v-if="user">
            <button class="btn btn-soft btn-sm console-btn" @click="goConsole">进入控制台</button>
            <button class="avatar-btn" @click.stop="menuOpen = !menuOpen">
              <span class="avatar">{{ user.name.slice(0, 1) }}</span>
              <span class="uname">{{ user.name }}</span>
              <span class="caret">▾</span>
            </button>
            <transition name="fade">
              <div v-if="menuOpen" class="dropdown">
                <div class="dd-head">
                  <strong>{{ user.name }}</strong>
                  <span class="dd-role">{{ ROLE_LABEL[user.role] }}</span>
                </div>
                <router-link to="/console/profile" class="dd-item" @click="menuOpen = false">
                  账号资料
                </router-link>
                <button class="dd-item" @click="goConsole">我的工作台</button>
                <div class="dd-sep"></div>
                <button class="dd-item danger" @click="doLogout">退出登录</button>
              </div>
            </transition>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-ghost btn-sm">登录</router-link>
            <router-link to="/register" class="btn btn-primary btn-sm">免费注册</router-link>
          </template>
        </div>
      </div>
    </header>

    <main class="site-main">
      <router-view />
    </main>

    <footer class="site-foot">
      <div class="container foot-inner">
        <div class="foot-brand">
          <BrandLogo light :size="30" />
          <p>面向机电设备制造与采购的在线招投标平台</p>
        </div>
        <div class="foot-links">
          <div>
            <h4>平台服务</h4>
            <router-link to="/tenders">招标公告</router-link>
            <router-link to="/messages">在线答疑</router-link>
            <router-link to="/help">操作指南</router-link>
          </div>
          <div>
            <h4>账户</h4>
            <router-link to="/register">厂家注册</router-link>
            <router-link to="/register?role=tenderer">招标单位注册</router-link>
            <router-link to="/login">登录平台</router-link>
          </div>
          <div>
            <h4>联系我们</h4>
            <p>0571-8800 1234</p>
            <p>service@mesbid.cn</p>
            <p>工作日 9:00 - 17:30</p>
          </div>
        </div>
      </div>
      <div class="copyright">
        软件工程课程设计 · 003 机电设备在线招投标系统的设计与实现 · 本站为教学演示项目，数据均为模拟数据
      </div>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-head {
  position: sticky;
  top: 0;
  z-index: 900;
  height: var(--header-h);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--line);
}

.head-inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 34px;
}

.logo {
  flex-shrink: 0;
}

.nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-item {
  position: relative;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14.5px;
  color: var(--text-2);
  transition: color 0.16s, background 0.16s;
}

.nav-item:hover {
  color: var(--brand);
  background: var(--brand-50);
}

.nav-item.on {
  color: var(--brand);
  font-weight: 600;
}

.nav-item.on::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--brand);
}

.user-area {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.console-btn {
  font-weight: 500;
}

.avatar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 10px 0 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.16s;
}
.avatar-btn:hover {
  border-color: var(--brand-400);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2c63ac, #123a72);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: grid;
  place-items: center;
}

.uname {
  font-size: 13.5px;
  color: var(--text);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.caret {
  font-size: 10px;
  color: var(--text-3);
}

.dropdown {
  position: absolute;
  right: 0;
  top: 50px;
  width: 210px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 950;
}

.dd-head {
  padding: 10px 12px 9px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.dd-head strong {
  font-size: 13.5px;
  font-weight: 600;
}
.dd-role {
  font-size: 11.5px;
  color: var(--brand);
  background: var(--brand-50);
  padding: 1px 7px;
  border-radius: 5px;
  align-self: flex-start;
}

.dd-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border: none;
  background: transparent;
  border-radius: 7px;
  font-size: 13.5px;
  color: var(--text-2);
  cursor: pointer;
}
.dd-item:hover {
  background: #f4f6fa;
  color: var(--text);
}
.dd-item.danger:hover {
  background: var(--danger-50);
  color: var(--danger);
}
.dd-sep {
  height: 1px;
  background: var(--line-soft);
  margin: 5px 8px;
}

.site-main {
  flex: 1;
}

.site-foot {
  margin-top: 64px;
  background: #14213a;
  color: rgba(255, 255, 255, 0.72);
}

.foot-inner {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding-top: 42px;
  padding-bottom: 34px;
  flex-wrap: wrap;
}

.foot-brand p {
  margin-top: 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  max-width: 280px;
}

.foot-links {
  display: flex;
  gap: 64px;
  flex-wrap: wrap;
}

.foot-links h4 {
  font-size: 13px;
  color: #fff;
  margin-bottom: 12px;
  font-weight: 600;
}

.foot-links a,
.foot-links p {
  display: block;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 2;
  transition: color 0.15s;
}

.foot-links a:hover {
  color: #fff;
}

.copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 24px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }
  .uname {
    display: none;
  }
  .foot-inner {
    gap: 26px;
  }
  .foot-links {
    gap: 34px;
  }
}
</style>
