<script setup lang="ts">
defineProps<{
  title: string | Ref<string>,
  body: string | Ref<string>,
  disabled?: boolean | Ref<boolean>,
  confirmText?: string | Ref<string>,
  confirmColor?: string | Ref<string>,
  loading?: boolean | Ref<boolean>,
  error?: string | Ref<string>,
  confirm: () => void,
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal
      :close="{ disabled: loading, onClick: () => emit('close', false) }"
      :title="title"
      :dismissible="!loading"
  >
    <template #body>
      {{ body }}
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton :disabled="loading" color="neutral" label="Dismiss" @click="emit('close', false)" />
        <UButton :disabled="disabled" :loading="loading" :color="confirmColor ?? 'success'" :label="confirmText ?? 'Confirm'" @click="confirm()" />
        <span v-if="error" class="text-error">{{ error }}</span>
      </div>
    </template>
  </UModal>
</template>