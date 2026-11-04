<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import { authApi } from '@/api'
import { consoleHome, setUser } from '@/stores/auth'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()

const role = ref(route.query.role === 'tenderer' ? 'tenderer' : 'supplier')
const loading = ref(false)
const agreed = ref(true)

const form = reactive({
  name: '',
  license: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  username: '',
  password: '',
  confirm: '',
  intro: ''
})

const errors = reactive({})

const roleInfo = computed(() =>
  role.value === 'tenderer'
    ? {
        title: '招标单位注册',
        desc: '发布并管理机电设备招标信息，查看投标情况与厂家资质。',
        nameLabel: '单位名称',
        rights: ['发布 / 修改 / 更新招标信息', '查看投标信息表单与报价', '检索机电设备厂家信息', '在线答复投标人疑问']
      }
    : {
        title: '设备厂家注册',
        desc: '检索招标公告并在线投标，展示企业资质与产品能力。',
        nameLabel: '企业名称',
        rights: ['浏览与检索全部招标公告', '在线提交投标信息表单', '管理本人投标记录', '在线留言并获得官方答复']
      }
)

watch(role, () => {
  Object.keys(errors).forEach((k) => delete errors[k])
})

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = `请填写${roleInfo.value.nameLabel}`
  if (!/^[0-9A-Z]{18}$/.test(form.license.trim())) {
    errors.license = '统一社会信用代码为 18 位数字或大写字母'
  }
  if (!form.contact.trim()) errors.contact = '请填写联系人'
  if (!/^[0-9\-+() ]{7,20}$/.test(form.phone.trim())) errors.phone = '请填写正确的联系电话'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = '邮箱格式不正确'
  }
  if (!form.address.trim()) errors.address = '请填写企业地址'
  if (!/^[a-zA-Z][a-zA-Z0-9_]{3,15}$/.test(form.username.trim())) {
    errors.username = '账号为 4–16 位字母、数字或下划线，需字母开头'
  }
  if (form.password.length < 6) errors.password = '密码至少 6 位'
  if (form.confirm !== form.password) errors.confirm = '两次输入的密码不一致'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) {
    toast.error('请检查表单填写')
    return
  }
  if (!agreed.value) {
    toast.error('请先阅读并同意平台服务条款')
    return
  }
  loading.value = true
  try {
    const user = await authApi.register({
      role: role.value,
      name: form.name.trim(),
      license: form.license.trim(),
      contact: form.contact.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      username: form.username.trim(),
      password: form.password,
      intro: form.intro.trim()
    })
    setUser(user)
    toast.success('注册成功，已为您自动登录')
    router.replace(consoleHome(user.role))
  } catch (e) {
    errors.username = e.message
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reg">
    <main class="form-side">
      <div class="form-box">
        <div class="top-line">
          <router-link to="/" class="back">← 返回首页</router-link>
          <span>已有账号？<router-link to="/login">直接登录</router-link></span>
        </div>

        <h2>{{ roleInfo.title }}</h2>
        <p class="sub">{{ roleInfo.desc }}</p>

        <div class="role-switch">
          <button
            class="role-btn"
            :class="{ on: role === 'supplier' }"
            type="button"
            @click="role = 'supplier'"
          >
            <strong>设备生产厂家</strong>
            <span>参与投标</span>
          </button>
          <button
            class="role-btn"
            :class="{ on: role === 'tenderer' }"
            type="button"
            @click="role = 'tenderer'"
          >
            <strong>招标单位</strong>
            <span>发布招标</span>
          </button>
        </div>

        <form @submit.prevent="submit">
          <div class="grid2">
            <div class="field span2">
              <label class="label">{{ roleInfo.nameLabel }}<span class="req">*</span></label>
              <input
                v-model="form.name"
                class="input"
                :class="{ 'is-error': errors.name }"
                placeholder="请填写营业执照上的企业全称"
              />
              <span v-if="errors.name" class="err-msg">{{ errors.name }}</span>
            </div>

            <div class="field">
              <label class="label">统一社会信用代码<span class="req">*</span></label>
              <input
                v-model="form.license"
                class="input"
                :class="{ 'is-error': errors.license }"
                placeholder="18 位代码"
                maxlength="18"
              />
              <span v-if="errors.license" class="err-msg">{{ errors.license }}</span>
            </div>

            <div class="field">
              <label class="label">联系人<span class="req">*</span></label>
              <input
                v-model="form.contact"
                class="input"
                :class="{ 'is-error': errors.contact }"
                placeholder="业务联系人姓名"
              />
              <span v-if="errors.contact" class="err-msg">{{ errors.contact }}</span>
            </div>

            <div class="field">
              <label class="label">联系电话<span class="req">*</span></label>
              <input
                v-model="form.phone"
                class="input"
                :class="{ 'is-error': errors.phone }"
                placeholder="手机号或固定电话"
              />
              <span v-if="errors.phone" class="err-msg">{{ errors.phone }}</span>
            </div>

            <div class="field">
              <label class="label">电子邮箱</label>
              <input
                v-model="form.email"
                class="input"
                :class="{ 'is-error': errors.email }"
                placeholder="用于接收通知"
              />
              <span v-if="errors.email" class="err-msg">{{ errors.email }}</span>
            </div>

            <div class="field span2">
              <label class="label">企业地址<span class="req">*</span></label>
              <input
                v-model="form.address"
                class="input"
                :class="{ 'is-error': errors.address }"
                placeholder="省 / 市 / 区 + 详细地址"
              />
              <span v-if="errors.address" class="err-msg">{{ errors.address }}</span>
            </div>

            <div class="field">
              <label class="label">登录账号<span class="req">*</span></label>
              <input
                v-model="form.username"
                class="input"
                :class="{ 'is-error': errors.username }"
                placeholder="字母开头，4–16 位"
                autocomplete="username"
              />
              <span v-if="errors.username" class="err-msg">{{ errors.username }}</span>
            </div>

            <div class="field">
              <label class="label">登录密码<span class="req">*</span></label>
              <input
                v-model="form.password"
                type="password"
                class="input"
                :class="{ 'is-error': errors.password }"
                placeholder="至少 6 位"
                autocomplete="new-password"
              />
              <span v-if="errors.password" class="err-msg">{{ errors.password }}</span>
            </div>

            <div class="field">
              <label class="label">确认密码<span class="req">*</span></label>
              <input
                v-model="form.confirm"
                type="password"
                class="input"
                :class="{ 'is-error': errors.confirm }"
                placeholder="再次输入密码"
                autocomplete="new-password"
              />
              <span v-if="errors.confirm" class="err-msg">{{ errors.confirm }}</span>
            </div>

            <div class="field">
              <label class="label">企业简介</label>
              <input v-model="form.intro" class="input" placeholder="一句话介绍主营业务（选填）" />
            </div>
          </div>

          <label class="agree">
            <input v-model="agreed" type="checkbox" />
            <span>我已阅读并同意《平台服务条款》与《信息真实承诺》，保证所填资料真实有效。</span>
          </label>

          <button class="btn btn-primary btn-block btn-lg" type="submit" :disabled="loading">
            {{ loading ? '提交中…' : '注册并登录' }}
          </button>
        </form>
      </div>
    </main>

    <aside class="panel">
      <div class="panel-grid"></div>
      <router-link to="/" class="p-logo"><BrandLogo light :size="32" /></router-link>
      <div class="p-body">
        <h3>注册后可享有的功能</h3>
        <ul>
          <li v-for="r in roleInfo.rights" :key="r">
            <span class="tick">✓</span>{{ r }}
          </li>
        </ul>
        <div class="p-tip">
          <strong>温馨提示</strong>
          <p>
            注册信息将提交至平台管理员核验，若企业资质信息与实际不符，管理员有权停用账号。
            演示环境下数据保存在浏览器本地。
          </p>
        </div>
      </div>
      <p class="p-foot">003 机电设备在线招投标系统的设计与实现</p>
    </aside>
  </div>
</template>

<style scoped>
.reg {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 0.72fr;
  background: #fbfcfe;
}

.form-side {
  display: flex;
  justify-content: center;
  padding: 34px 32px 50px;
  overflow-y: auto;
}

.form-box {
  width: 100%;
  max-width: 620px;
}

.top-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: var(--text-3);
}

.top-line a {
  color: var(--brand);
}

.form-box h2 {
  margin-top: 20px;
  font-size: 25px;
  font-weight: 650;
  letter-spacing: -0.5px;
}

.sub {
  margin-top: 7px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--text-3);
}

.role-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.role-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
  padding: 13px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.16s;
  text-align: left;
}

.role-btn strong {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}

.role-btn span {
  font-size: 11.5px;
  color: var(--text-3);
}

.role-btn:hover {
  border-color: var(--brand-400);
}

.role-btn.on {
  border-color: var(--brand);
  background: var(--brand-50);
  box-shadow: 0 0 0 3px rgba(27, 75, 143, 0.07);
}

.role-btn.on strong {
  color: var(--brand);
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}

.span2 {
  grid-column: span 2;
}

.agree {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  margin: 4px 0 18px;
  font-size: 12.5px;
  color: var(--text-2);
  line-height: 1.7;
  cursor: pointer;
}

.agree input {
  margin-top: 3px;
  accent-color: var(--brand);
}

/* 右侧 */
.panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #0b2549, #123a72 60%, #1b4b8f);
  color: #fff;
  padding: 34px 44px 30px;
  display: flex;
  flex-direction: column;
}

.panel-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(circle at 60% 20%, #000, transparent 72%);
  -webkit-mask-image: radial-gradient(circle at 60% 20%, #000, transparent 72%);
}

.p-logo {
  position: relative;
  z-index: 2;
}

.p-body {
  position: relative;
  z-index: 2;
  margin: auto 0;
}

.p-body h3 {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 18px;
}

.p-body ul {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.p-body li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.7;
}

.tick {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(86, 211, 160, 0.16);
  color: #56d3a0;
  font-size: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.p-tip {
  margin-top: 30px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 15px 16px;
}

.p-tip strong {
  font-size: 12.5px;
  color: #f0c071;
}

.p-tip p {
  margin-top: 7px;
  font-size: 12px;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.58);
}

.p-foot {
  position: relative;
  z-index: 2;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.32);
}

@media (max-width: 980px) {
  .reg {
    grid-template-columns: 1fr;
  }
  .panel {
    display: none;
  }
  .grid2 {
    grid-template-columns: 1fr;
  }
  .span2 {
    grid-column: auto;
  }
}
</style>
