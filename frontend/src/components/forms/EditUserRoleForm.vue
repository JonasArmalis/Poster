<script setup lang="ts">
import type { User, UserRole } from '@/interfaces/User'
import { ref } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { useNotifyStore } from '@/stores/notification.store'
import { updateUserRole } from '@/services/UserService'
import { ActionType } from '@/types/ActionType'

const props = defineProps<{
  user: User
}>()

const modalStore = useModalStore()
const notifyStore = useNotifyStore()

const role = ref<UserRole>(props.user.role)

const onSubmit = async () => {
  try {
    if (role.value !== props.user.role) {
      await updateUserRole(props.user.id, role.value)
      notifyStore.notifySuccess('User role updated')
      modalStore.setRequestSentStatus(ActionType.EDIT)
    }
    modalStore.closeModal()
  } catch (error) {
    notifyStore.notifyError('Failed to update user role')
  }
}

const onCancel = () => {
  modalStore.closeModal()
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <p class="subtitle is-4 mb-4">
      Change role for <strong>{{ props.user.name }}</strong>
    </p>
    <div class="field">
      <label class="label">Role</label>
      <div class="control">
        <div class="select">
          <select v-model="role">
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </div>

    <div class="buttons is-centered">
      <button type="submit" class="button is-success">Save</button>
      <button type="button" class="button is-danger" @click="onCancel">Cancel</button>
    </div>
  </form>
</template>
