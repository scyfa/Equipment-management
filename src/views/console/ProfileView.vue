<script setup>
import { computed, reactive, ref } from 'vue'
import { authApi } from '@/api'
import { authState, setUser } from '@/stores/auth'
import { toast } from '@/composables/useToast'
import { formatDate, ROLE_LABEL } from '@/utils/format'

const user = computed(() => authState.user)

const form = reactive({
  name: user.value?.name || '',
  license: user.value?.license || '',
  contact: user.value?.contact || '',
  phone: user.value?.phone || '',
  email: user.value?.email || '',
  address: user.value?.address || '',
  intro: user.value?.intro || ''
})
const saving = ref(false)

const pwd = reactive({ oldPwd: '', newPwd: '', confirm: '' })
const pwdErrors = reactive({})
const pwdSaving = ref(false)

const isEnterprise = computed(() => user.value?.role !== 'admin')

async function save() {
  if (!form.name.trim()) {
    toast.error('名称不能为空')
    return
  }
  if (form.phone && !/^[0-9\-+() ]{7,20}$/.test(form.phone)) {
    toast.error('联系电话格式不正确')
    return
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    toast.error('邮箱格式不正确')
    return
  }
  saving.value = true
  try {
    const updated = await authApi.updateProfile(user.value.id, { ...form })
    setUser(updated)
    toast.success('资料已保存')
  } catch (e) {
    toast.error(e.message)
  } finally {
    saving.value = false
  }
}

async function changePwd() {
  Object.keys(pwdErrors).forEach((k) => delete pwdErrors[k])
  if (!pwd.oldPwd) pwdErrors.oldPwd = '请输入原密码'
  if (pwd.newPwd.length < 6) pwdErrors.newPwd = '新密码至少 6 位'
  if (pwd.confirm !== pwd.newPwd) pwdErrors.confirm = '两次输入不一致'
  if (Object.keys(pwdErrors).length) return

  pwdSaving.value = true
  try {
    await authApi.changePassword(user.value.id, pwd.oldPwd, pwd.newPwd)
    toast.success('密码已修改')
    pwd.oldPwd = ''
    pwd.newPwd = ''
    pwd.confirm = ''
  } catch (e) {
    pwdErrors.oldPwd = e.message
  } finally {
    pwdSaving.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>账号资料</h1>
        <p class="sub">维护企业基本信息与登录密码，资料将展示在平台相关页面</p>
      </div>
    </div>

    <div class="layout">
      <aside class="card side">
        <div class="avatar">{{ user?.name?.slice(0, 1) }}</div>
        <h3>{{ user?.name }}</h3>
        <span class="role">{{ ROLE_LABEL[user?.role] }}</span>
        <ul class="meta">
          <li><span>登录账号</span><strong>{{ user?.username }}</strong></li>
          <li><span>注册时间</span><strong>{{ formatDate(user?.createdAt) }}</strong></li>
          <li><span>账号状态</span><strong class="ok">正常</strong></li>
        </ul>
      </aside>

      <div class="main">
        <section class="card block">
          <h2 class="block-title">基本资料</h2>
          <div class="grid2">
            <div class="field" :class="{ span2: !isEnterprise }">
              <label class="label">{{ isEnterprise ? '企业名称' : '名称' }}<span class="req">*</span></label>
              <input v-model="form.name" class="input" />
            </div>
            <div v-if="isEnterprise" class="field">
              <label class="label">统一社会信用代码</label>
              <input v-model="form.license" class="input" maxlength="18" />
            </div>
            <div class="field">
              <label class="label">联系人</label>
              <input v-model="form.contact" class="input" />
            </div>
            <div class="field">
              <label class="label">联系电话</label>
              <input v-model="form.phone" class="input" />
            </div>
            <div class="field">
              <label class="label">电子邮箱</label>
              <input v-model="form.email" class="input" />
            </div>
            <div class="field">
              <label class="label">地址</label>
              <input v-model="form.address" class="input" />
            </div>
          </div>
          <div v-if="isEnterprise" class="field">
            <label class="label">企业简介</label>
            <textarea v-model="form.intro" class="textarea"></textarea>
            <span class="hint">简介会展示在厂家信息 / 招标单位信息中，建议 60–150 字</span>
          </div>
          <div class="foot">
            <button class="btn btn-primary" :disabled="saving" @click="save">
              {{ saving ? '保存中…' : '保存资料' }}
            </button>
          </div>
        </section>

        <section class="card block">
          <h2 class="block-title">修改密码</h2>
          <div class="grid3">
            <div class="field">
              <label class="label">原密码<span class="req">*</span></label>
              <input
                v-model="pwd.oldPwd"
                type="password"
                class="input"
                :class="{ 'is-error': pwdErrors.oldPwd }"
              />
              <span v-if="pwdErrors.oldPwd" class="err-msg">{{ pwdErrors.oldPwd }}</span>
            </div>
            <div class="field">
              <label class="label">新密码<span class="req">*</span></label>
              <input
                v-model="pwd.newPwd"
                type="password"
                class="input"
                :class="{ 'is-error': pwdErrors.newPwd }"
              />
              <span v-if="pwdErrors.newPwd" class="err-msg">{{ pwdErrors.newPwd }}</span>
            </div>
            <div class="field">
              <label class="label">确认新密码<span class="req">*</span></label>
              <input
                v-model="pwd.confirm"
                type="password"
                class="input"
                :class="{ 'is-error': pwdErrors.confirm }"
              />
              <span v-if="pwdErrors.confirm" class="err-msg">{{ pwdErrors.confirm }}</span>
            </div>
          </div>
          <div class="foot">
            <button class="btn btn-soft" :disabled="pwdSaving" @click="changePwd">
              {{ pwdSaving ? '提交中…' : '修改密码' }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 274px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.side {
  padding: 24px 22px;
  text-align: center;
  position: sticky;
  top: 84px;
}

.avatar {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2c63ac, #123a72);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 600;
  margin: 0 auto 14px;
}

.side h3 {
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.5;
}

.role {
  display: inline-block;
  margin-top: 7px;
  font-size: 11.5px;
  color: var(--brand);
  background: var(--brand-50);
  padding: 2px 9px;
  border-radius: 5px;
}

.meta {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
  text-align: left;
}

.meta li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12.5px;
}

.meta span {
  color: var(--text-3);
}

.meta strong {
  font-weight: 500;
}

.meta .ok {
  color: var(--ok);
}

.main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block {
  padding: 22px 24px;
}

.block-title {
  font-size: 14.5px;
  font-weight: 600;
  padding-left: 10px;
  border-left: 3px solid var(--brand);
  line-height: 1.15;
  margin-bottom: 20px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}

.grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 18px;
}

.span2 {
  grid-column: span 2;
}

.foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

@media (max-width: 1080px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
  }
  .grid2,
  .grid3 {
    grid-template-columns: 1fr;
  }
  .span2 {
    grid-column: auto;
  }
}
</style>
