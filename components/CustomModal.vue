<template>
  <view class="modal-overlay" v-if="show" @click="$emit('cancel')">
    <view class="modal-content animated-pop" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
      </view>
      <view class="modal-body">
        <text class="modal-text">{{ content }}</text>
      </view>
      <view class="modal-footer">
        <button class="btn-cancel" @click="$emit('cancel')">{{ cancelText }}</button>
        <button class="btn-confirm" @click="$emit('confirm')">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Tip' },
  content: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' }
})

defineEmits(['confirm', 'cancel'])
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 75%;
  max-width: 300px;
  background-color: #fff;
  border-radius: 35px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header {
  margin-bottom: 20px;
}

.modal-title {
  font-size: 24px;
  font-weight: 800;
  color: #2D3436;
  text-align: center;
}

.modal-body {
  margin-bottom: 35px;
}

.modal-text {
  font-size: 16px;
  color: #636E72;
  text-align: center;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  height: 48px;
  background-color: #F1F2F6;
  color: #747D8C;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &::after { border: none; }

  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.btn-confirm {
  flex: 1;
  height: 48px;
  background: linear-gradient(135deg, $color-primary 0%, #7d5fff 100%);
  color: #fff;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 800;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba($color-primary, 0.25);
  line-height: 1;

  &::after { border: none; }

  &:active {
    transform: scale(0.95);
  }
}

.animated-pop {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
