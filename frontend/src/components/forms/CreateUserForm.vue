<script setup lang="ts">
import { ref, computed } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { useNotifyStore } from '@/stores/notification.store'
import { createUser } from '@/services/UserService'
import type { UserRole } from '@/interfaces/User'
import { ActionType } from '@/types/ActionType'

const modalStore = useModalStore()
const notifyStore = useNotifyStore()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<UserRole>('worker')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validName = computed(() => name.value.trim().length > 0)
const validEmail = computed(() => emailRegex.test(email.value))
const validPassword = computed(() => password.value.length >= 4)

const onSubmit = async () => {
  if (!validName.value || !validEmail.value || !validPassword.value) {
    notifyStore.notifyWarning('Please fill all fields correctly')
    return
  }

  try {
    await createUser(name.value.trim(), email.value.trim(), password.value, role.value)
    notifyStore.notifySuccess('User created successfully')
    modalStore.setRequestSentStatus(ActionType.CREATE)
    modalStore.closeModal()
  } catch (error) {
    notifyStore.notifyError('Failed to create user')
  }
}

const onCancel = () => {
  modalStore.closeModal()
}
</script>

<template>
  <form @submit.prevent="onSubmit" novalidate>
    <div class="field">
      <label class="label">Name</label>
      <div class="control">
        <input v-model="name" class="input" type="text" placeholder="e.g. John Doe" />
      </div>
    </div>

    <div class="field">
      <label class="label">Email</label>
      <div class="control">
        <input v-model="email" class="input" type="email" placeholder="e.g. user@example.com" />
      </div>
    </div>

    <div class="field">
      <label class="label">Password</label>
      <div class="control">
        <input
          v-model="password"
          class="input"
          type="password"
          placeholder="At least 4 characters"
        />
      </div>
    </div>

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
