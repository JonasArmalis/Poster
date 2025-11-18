<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/interfaces/User'
import { useModalStore } from '@/stores/modalStore'
import { useNotifyStore } from '@/stores/notification.store'
import { deleteUser } from '@/services/UserService'
import { ActionType } from '@/types/ActionType'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  user: User
}>()

const modalStore = useModalStore()
const notifyStore = useNotifyStore()
const authStore = useAuthStore()

const isSelf = computed(() => authStore.user?.id === props.user.id)

const onDelete = async () => {
  if (isSelf.value) {
    notifyStore.notifyWarning('You cannot delete your own account')
    return
  }

  try {
    await deleteUser(props.user.id)
    notifyStore.notifySuccess('User deleted successfully')
    modalStore.setRequestSentStatus(ActionType.DELETE)
  } catch (error) {
    notifyStore.notifyError('Failed to delete user')
  }
  modalStore.closeModal()
}

const onCancel = () => {
  modalStore.closeModal()
}
</script>

<template>
  <div>
    <p class="subtitle is-4 mb-4">
      <strong>Are you sure you want to delete this user?</strong>
    </p>
    <p class="title is-5">{{ props.user.name }} ({{ props.user.email }})</p>
    <div class="buttons is-centered">
      <button
        @click="onDelete"
        class="button is-danger"
        :disabled="isSelf"
        :title="isSelf ? 'You cannot delete yourself' : ''"
      >
        Yes, Delete
      </button>
      <button @click="onCancel" class="button is-info">Cancel</button>
    </div>
  </div>
</template>
