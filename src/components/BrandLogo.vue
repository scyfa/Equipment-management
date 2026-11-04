<script setup>
defineProps({
  size: { type: Number, default: 36 },
  light: { type: Boolean, default: false },
  compact: { type: Boolean, default: false }
})
</script>

<template>
  <div class="brand" :class="{ light }">
    <svg :width="size" :height="size" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#2C63AC" />
          <stop offset="1" stop-color="#123A72" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#bgGrad)" />
      <path
        d="M11 27.5V22.2M17.4 27.5V17.4M23.8 27.5V20.2"
        stroke="#8FB4E4"
        stroke-width="2.4"
        stroke-linecap="round"
      />
      <path
        d="M27.2 12.4l-6.4 7.1-4.2-3.1-5.1 6.2"
        stroke="#F2F7FF"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="11.4" cy="12.4" r="1.9" fill="#E4B05A" />
    </svg>
    <div v-if="!compact" class="txt">
      <strong>机电设备招投标</strong>
      <small>ME EQUIPMENT BIDDING</small>
    </div>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.txt {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.txt strong {
  font-size: 16.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--text);
}
.txt small {
  font-size: 9.5px;
  letter-spacing: 1.6px;
  color: var(--text-3);
  margin-top: 2px;
}
.light .txt strong {
  color: #fff;
}
.light .txt small {
  color: rgba(255, 255, 255, 0.55);
}
</style>
