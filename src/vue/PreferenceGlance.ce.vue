<template>
  <div class="glance">
    <div class="pulse" aria-hidden></div>
    <div class="label">Top pick</div>
    <div class="title">{{ highlight || 'Awaiting picks' }}</div>
    <div class="meta" v-if="count && count > 0">Score {{ count }}</div>
    <div class="meta" v-else>Choose to set your vibe</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ highlight: string; count?: number }>();
</script>

<style scoped>
.glance {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(168, 85, 247, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 15px 35px -12px rgba(34, 211, 238, 0.35);
  color: #e0f2fe;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

.label {
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.7);
}

.title {
  margin-top: 6px;
  font-weight: 700;
  font-size: 18px;
  color: #fff;
}

.meta {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(226, 232, 240, 0.8);
}

.pulse {
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.16), transparent 55%);
  animation: pulse 5.5s ease-in-out infinite;
  z-index: 0;
}

.glance > * {
  position: relative;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(0.95) rotate(0deg);
    opacity: 0.65;
  }
  50% {
    transform: scale(1.05) rotate(3deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.97) rotate(-2deg);
    opacity: 0.7;
  }
}
</style>
