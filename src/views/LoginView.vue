<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import { authApi } from '@/api'
import { consoleHome, setUser } from '@/stores/auth'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const errors = reactive({})
const loading = ref(false)
const showPwd = ref(false)

const demos = [
  { role: '设备厂家', username: 'huayuan', password: '123456' },
  { role: '招标单位', username: 'jiangnan', password: '123456' },
  { role: '管理员', username: 'admin', password: '123456' }
]

function fill(demo) {
  form.username = demo.username
  form.password = demo.password
  Object.keys(errors).forEach((k) => delete errors[k])
}

async function submit() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.username.trim()) errors.username = '请输入登录账号'
  if (!form.password) errors.password = '请输入密码'
  if (Object.keys(errors).length) return

  loading.value = true
  try {
    const user = await authApi.login({
      username: form.username.trim(),
      password: form.password
    })
    setUser(user)
    toast.success(`欢迎回来，${user.name}`)
    const redirect = route.query.redirect
    router.replace(redirect || consoleHome(user.role))
  } catch (e) {
    errors.password = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth">
    <aside class="panel">
      <div class="panel-grid"></div>
      <router-link to="/" class="p-logo"><BrandLogo light :size="34" /></router-link>

      <div class="p-copy">
        <span class="eyebrow">SIGN IN</span>
        <h1>登录后，<br />开始一次规范的招投标</h1>
        <p>
          设备厂家可检索公告并在线投标；招标单位可发布与管理招标信息、查看投标情况；
          管理员负责平台用户与留言维护。
        </p>
        <ul class="p-list">
          <li><span>1</span>招标过程全程留痕，信息可追溯</li>
          <li><span>2</span>厂家与招标单位分权管理，数据隔离</li>
          <li><span>3</span>留言答疑统一答复，公开透明</li>
        </ul>
      </div>

      <p class="p-foot">软件工程课程设计 · 003 机电设备在线招投标系统</p>
    </aside>

    <main class="form-side">
      <div class="form-box">
        <router-link to="/" class="back">← 返回首页</router-link>
        <h2>账号登录</h2>
        <p class="sub">请输入平台分配的登录账号与密码</p>

        <form @submit.prevent="submit">
          <div class="field">
            <label class="label">登录账号</label>
            <input
              v-model="form.username"
              class="input"
              :class="{ 'is-error': errors.username }"
              placeholder="请输入账号"
              autocomplete="username"
            />
            <span v-if="errors.username" class="err-msg">{{ errors.username }}</span>
          </div>

          <div class="field">
            <label class="label">登录密码</label>
            <div class="pwd-wrap">
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                class="input"
                :class="{ 'is-error': errors.password }"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
              <button type="button" class="eye" @click="showPwd = !showPwd">
                {{ showPwd ? '隐藏' : '显示' }}
              </button>
            </div>
            <span v-if="errors.password" class="err-msg">{{ errors.password }}</span>
          </div>

          <button class="btn btn-primary btn-block btn-lg" type="submit" :disabled="loading">
            {{ loading ? '登录中…' : '登 录' }}
          </button>
        </form>

        <div class="demo">
          <div class="demo-head">
            <span>演示账号（点击自动填充）</span>
          </div>
          <div class="demo-chips">
            <button v-for="d in demos" :key="d.username" class="chip" @click="fill(d)">
              <strong>{{ d.role }}</strong>
              <span>{{ d.username }} / {{ d.password }}</span>
            </button>
          </div>
        </div>

        <p class="reg-line">
          还没有账号？
          <router-link to="/register">注册设备厂家</router-link>
          <span>·</span>
          <router-link to="/register?role=tenderer">注册招标单位</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: #fff;
}

/* 左侧品牌面板 */
.panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #0b2549, #123a72 55%, #1b4b8f);
  color: #fff;
  padding: 38px 52px 34px;
  display: flex;
  flex-direction: column;
}

.panel-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at 30% 30%, #000, transparent 75%);
  -webkit-mask-image: radial-gradient(circle at 30% 30%, #000, transparent 75%);
}

.panel::after {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  right: -140px;
  bottom: -160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 154, 43, 0.2), transparent 65%);
}

.p-logo {
  position: relative;
  z-index: 2;
}

.p-copy {
  position: relative;
  z-index: 2;
  margin-top: auto;
  margin-bottom: auto;
  max-width: 460px;
}

.eyebrow {
  font-size: 10.5px;
  letter-spacing: 2.6px;
  color: rgba(255, 255, 255, 0.45);
}

.p-copy h1 {
  margin-top: 16px;
  font-size: 34px;
  line-height: 1.32;
  font-weight: 650;
  letter-spacing: -0.8px;
}

.p-copy > p {
  margin-top: 18px;
  font-size: 13.5px;
  line-height: 1.95;
  color: rgba(255, 255, 255, 0.66);
}

.p-list {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.p-list li {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
}

.p-list span {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #f0c071;
  flex-shrink: 0;
}

.p-foot {
  position: relative;
  z-index: 2;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.32);
}

/* 右侧表单 */
.form-side {
  display: grid;
  place-items: center;
  padding: 40px 24px;
  background: #fbfcfe;
}

.form-box {
  width: 100%;
  max-width: 372px;
}

.back {
  font-size: 12.5px;
  color: var(--text-3);
}
.back:hover {
  color: var(--brand);
}

.form-box h2 {
  margin-top: 22px;
  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.4px;
}

.sub {
  margin-top: 7px;
  margin-bottom: 26px;
  font-size: 13px;
  color: var(--text-3);
}

.pwd-wrap {
  position: relative;
}

.eye {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  font-size: 11.5px;
  color: var(--brand);
  cursor: pointer;
  padding: 4px 7px;
  border-radius: 5px;
}
.eye:hover {
  background: var(--brand-50);
}

.demo {
  margin-top: 24px;
  border-top: 1px dashed var(--line);
  padding-top: 18px;
}

.demo-head {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 10px;
}

.demo-chips {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.chip:hover {
  border-color: var(--brand-400);
  background: var(--brand-50);
}

.chip strong {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
}

.chip span {
  font-size: 11.5px;
  color: var(--text-3);
  font-family: Consolas, monospace;
}

.reg-line {
  margin-top: 22px;
  text-align: center;
  font-size: 12.5px;
  color: var(--text-3);
}

.reg-line a {
  color: var(--brand);
  font-weight: 500;
  margin: 0 3px;
}
.reg-line a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .panel {
    padding: 26px 24px 30px;
  }
  .p-copy {
    margin: 30px 0 0;
  }
  .p-copy h1 {
    font-size: 26px;
  }
  .p-foot {
    margin-top: 24px;
  }
}
</style>
