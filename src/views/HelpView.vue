<script setup>
const steps = [
  {
    title: '一、账号注册与登录',
    items: [
      '设备生产厂家与招标单位分别注册，需填写企业全称、统一社会信用代码、联系人与联系电话。',
      '注册成功后自动登录，进入对应角色的控制台；下次访问使用注册账号与密码登录。',
      '管理员账号由平台分配，登录后可维护厂家、招标单位与留言内容。'
    ]
  },
  {
    title: '二、招标单位：发布与管理招标信息',
    items: [
      '进入「招标信息管理 → 发布招标信息」，填写项目编号、设备名称、型号、包装要求、数量、截止日期与投标保证金。',
      '已发布的公告可在列表中「编辑」修改，或「删除」下架（删除会同时移除该项目下的投标记录）。',
      '在「投标情况」中查看各项目收到的投标信息表单，支持按项目与单位检索。'
    ]
  },
  {
    title: '三、设备厂家：查询公告与在线投标',
    items: [
      '在「招标公告」页按设备名称、型号或项目编号检索，可按类别、状态筛选。',
      '进入公告详情查看技术要求与包装要求，点击「我要投标」填写投标信息表单并提交。',
      '同一项目仅可投标一次；提交后可在控制台「我的投标」查看或撤回。'
    ]
  },
  {
    title: '四、在线留言与答复',
    items: [
      '登录后可在「在线留言」页提交问题，留言需经管理员审核后公开显示。',
      '管理员可在「留言板管理」中审核、答复或删除留言；答复内容对所有投标人可见。'
    ]
  }
]

const faqs = [
  {
    q: '投标保证金是否需要在线缴纳？',
    a: '本系统仅记录保证金的金额与缴款日期，实际缴款按招标文件约定通过银行转账或保函方式线下办理，线上填写用于归档与比对。'
  },
  {
    q: '同一家企业能否同时注册厂家与招标单位？',
    a: '可以使用不同的登录账号分别注册两类角色，但统一社会信用代码不能重复注册。'
  },
  {
    q: '为什么提交的留言没有立即显示？',
    a: '为保证留言板内容质量，留言需经平台管理员审核，审核通过后才对其他用户公开。'
  },
  {
    q: '演示数据可以重置吗？',
    a: '可以。本前端使用浏览器本地存储模拟数据库，清除站点数据或在控制台执行重置即可恢复初始演示数据。'
  }
]
</script>

<template>
  <div class="help">
    <div class="page-hero">
      <div class="container">
        <h1>操作指南</h1>
        <p>三类角色使用流程与常见问题说明</p>
      </div>
    </div>

    <div class="container body">
      <div class="steps">
        <section v-for="s in steps" :key="s.title" class="card step">
          <h2>{{ s.title }}</h2>
          <ul>
            <li v-for="(i, idx) in s.items" :key="idx">
              <span class="no">{{ idx + 1 }}</span>
              <p>{{ i }}</p>
            </li>
          </ul>
        </section>
      </div>

      <section class="faq">
        <h2 class="sec-title">常见问题</h2>
        <div class="faq-grid">
          <article v-for="f in faqs" :key="f.q" class="card faq-item">
            <h4><span>Q</span>{{ f.q }}</h4>
            <p>{{ f.a }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-hero {
  background: linear-gradient(120deg, #143d75, #1b4b8f 65%, #2760a8);
  color: #fff;
  padding: 40px 0 44px;
}
.page-hero h1 {
  font-size: 28px;
  font-weight: 650;
  letter-spacing: -0.5px;
}
.page-hero p {
  margin-top: 9px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.65);
}

.body {
  padding-top: 26px;
  padding-bottom: 44px;
  max-width: 940px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  padding: 24px 26px;
}

.step h2 {
  font-size: 16px;
  font-weight: 600;
  padding-left: 11px;
  border-left: 3px solid var(--brand);
  line-height: 1.15;
  margin-bottom: 16px;
}

.step li {
  display: flex;
  gap: 11px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--line-soft);
}
.step li:last-child {
  border-bottom: none;
}

.no {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--brand-50);
  color: var(--brand);
  font-size: 11.5px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.step p {
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--text-2);
}

.faq {
  margin-top: 40px;
}

.sec-title {
  font-size: 22px;
  font-weight: 650;
  margin-bottom: 18px;
}

.faq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.faq-item {
  padding: 20px 22px;
}

.faq-item h4 {
  display: flex;
  gap: 9px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}

.faq-item h4 span {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: var(--brand);
  color: #fff;
  font-size: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.faq-item p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--text-2);
}

@media (max-width: 820px) {
  .faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>
