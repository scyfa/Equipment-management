<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
  tone: { type: String, default: 'brand' }
})
</script>

<template>
  <div class="stat" :class="`tone-${tone}`">
    <div class="st-head">
      <span class="st-label">{{ label }}</span>
      <span v-if="icon" class="st-icon">{{ icon }}</span>
    </div>
    <strong class="st-value">{{ value }}</strong>
    <span v-if="hint" class="st-hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.stat {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.stat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--brand);
}

.tone-ok::before {
  background: var(--ok);
}
.tone-warn::before {
  background: var(--accent);
}
.tone-danger::before {
  background: var(--danger);
}

.st-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.st-label {
  font-size: 12.5px;
  color: var(--text-3);
}

.st-icon {
  font-size: 14px;
  opacity: 0.5;
}

.st-value {
  display: block;
  margin-top: 8px;
  font-size: 26px;
  font-weight: 650;
  letter-spacing: -0.6px;
  line-height: 1.15;
}

.st-hint {
  display: block;
  margin-top: 5px;
  font-size: 11.5px;
  color: var(--text-3);
}
</style>
