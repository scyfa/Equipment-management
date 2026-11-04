<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import { authState, logout } from '@/stores/auth'
import { ROLE_LABEL } from '@/utils/format'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const user = computed(() => authState.user)

const MENUS = {
  supplier: [
    { group: '投标业务', items: [
      { to: '/console/supplier/bids', label: '我的投标', icon: '📄' },
      { to: '/tenders', label: '招标大厅', icon: '🔎', external: true }
    ]},
    { group: '互动与账户', items: [
      { to: '/console/supplier/messages', label: '我的留言', icon: '💬' },
      { to: '/console/profile', label: '账号资料', icon: '⚙️' }
    ]}
  ],
  tenderer: [
    { group: '招标业务', items: [
      { to: '/console/tenderer/tenders', label: '招标信息管理', icon: '📋' },
      { to: '/console/tenderer/tenders/new', label: '发布招标信息', icon: '➕' },
      { to: '/console/tenderer/bids', label: '投标情况', icon: '📊' }
    ]},
    { group: '资源与账户', items: [
      { to: '/console/tenderer/suppliers', label: '厂家信息', icon: '🏭' },
      { to: '/console/profile', label: '账号资料', icon: '⚙️' }
    ]}
  ],
  admin: [
    { group: '平台概览', items: [
      { to: '/console/admin', label: '数据概览', icon: '📈' },
      { to: '/console/admin/tenders', label: '招标信息', icon: '📋' }
    ]},
    { group: '用户管理', items: [
      { to: '/console/admin/suppliers', label: '机电设备厂家', icon: '🏭' },
      { to: '/console/admin/tenderers', label: '招标单位', icon: '🏢' }
    ]},
    { group: '内容维护', items: [
      { to: '/console/admin/messages', label: '留言板管理', icon: '💬' },
      { to: '/console/profile', label: '账号资料', icon: '⚙️' }
    ]}
  ]
}

const menus = computed(() => MENUS[user.value?.role] || [])

function isOn(item) {
  if (item.to === '/console/tenderer/tenders') {
    return route.path === item.to || /\/console\/tenderer\/tenders\/.+\/edit/.test(route.path)
  }
  return route.path === item.to
}

function doLogout() {
  logout()
  toast.info('已退出登录')
  router.push('/')
}
</script>

<template>
  <div class="console">
    <aside class="side">
      <router-link to="/" class="side-logo"><BrandLogo :size="30" /></router-link>

      <div class="side-user">
        <span class="avatar">{{ user?.name?.slice(0, 1) }}</span>
        <div class="su-txt">
          <strong>{{ user?.name }}</strong>
          <span>{{ ROLE_LABEL[user?.role] }}</span>
        </div>
      </div>

      <nav class="side-nav">
        <div v-for="group in menus" :key="group.group" class="nav-group">
          <p class="group-title">{{ group.group }}</p>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ on: isOn(item) }"
          >
            <span class="ico">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            <span v-if="item.external" class="ext">↗</span>
          </router-link>
        </div>
      </nav>

      <div class="side-foot">
        <router-link to="/" class="btn btn-ghost btn-sm btn-block">返回门户首页</router-link>
        <button class="btn btn-ghost btn-sm btn-block" @click="doLogout">退出登录</button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="crumb">
          <span>控制台</span>
          <span class="sep">/</span>
          <span class="now">{{ ROLE_LABEL[user?.role] }}</span>
        </div>
        <div class="tb-right">
          <span class="date">{{ new Date().toLocaleDateString('zh-CN') }}</span>
          <router-link to="/tenders" class="btn btn-soft btn-sm">招标大厅</router-link>
        </div>
      </header>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.console {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.side {
  width: 238px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.side-logo {
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--line-soft);
}

.side-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2c63ac, #123a72);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}

.su-txt {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.su-txt strong {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.su-txt span {
  font-size: 11.5px;
  color: var(--brand);
}

.side-nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 12px;
}

.nav-group + .nav-group {
  margin-top: 12px;
}

.group-title {
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: 0.6px;
  padding: 10px 8px 6px;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 11px;
  border-radius: 8px;
  font-size: 13.5px;
  color: var(--text-2);
  margin-bottom: 2px;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: #f5f7fb;
  color: var(--text);
}

.nav-link.on {
  background: var(--brand-50);
  color: var(--brand);
  font-weight: 600;
}

.nav-link.on::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--brand);
}

.ico {
  font-size: 14px;
  opacity: 0.85;
  width: 16px;
  text-align: center;
}

.ext {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-3);
}

.side-foot {
  padding: 14px 16px 18px;
  border-top: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 26px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.crumb {
  font-size: 13px;
  color: var(--text-3);
  display: flex;
  gap: 7px;
  align-items: center;
}
.crumb .now {
  color: var(--text);
  font-weight: 500;
}
.sep {
  color: #c8d0dc;
}

.tb-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.date {
  font-size: 12.5px;
  color: var(--text-3);
}

.content {
  padding: 24px 26px 46px;
  max-width: 1320px;
  width: 100%;
}

@media (max-width: 980px) {
  .side {
    width: 66px;
  }
  .side-logo :deep(.txt),
  .su-txt,
  .group-title,
  .nav-link span:not(.ico):not(.ext),
  .side-foot {
    display: none;
  }
  .nav-link {
    justify-content: center;
    padding: 0;
  }
  .side-user {
    justify-content: center;
    padding: 14px 0;
  }
}
</style>
