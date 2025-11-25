<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import type { User } from '@/interfaces/User'
import { getAllUsers } from '@/services/UserService'
import { useNotifyStore } from '@/stores/notification.store'
import { useAuthStore } from '@/stores/authStore'
import { useModalStore } from '@/stores/modalStore'
import CreateUserForm from '@/components/forms/CreateUserForm.vue'
import EditUserRoleForm from '@/components/forms/EditUserRoleForm.vue'
import DeleteUserConfirmationForm from '@/components/forms/DeleteUserConfirmationForm.vue'

const users = ref<User[]>([])
const infoMessage = ref<string>()
const loading = ref(false)

const filterRole = ref<'all' | 'admin' | 'worker'>('all')

const notifyStore = useNotifyStore()
const authStore = useAuthStore()
const modalStore = useModalStore()

const filteredUsers = computed(() => {
  if (filterRole.value === 'all') {
    return users.value
  }
  return users.value.filter((u) => u.role === filterRole.value)
})

const fetchUsers = async () => {
  try {
    loading.value = true
    users.value = await getAllUsers()
    if (users.value.length === 0) {
      infoMessage.value = 'No users found'
      notifyStore.notifyInfo(infoMessage.value)
    } else {
      infoMessage.value = undefined
    }
  } catch (error) {
    users.value = []
    infoMessage.value = 'Failed to load users, please try again later'
    notifyStore.notifyError(infoMessage.value)
  } finally {
    loading.value = false
  }
}

const openCreateUserModal = () => {
  modalStore.openModal(CreateUserForm, 'Create a new user')
}

const openEditRoleModal = (user: User) => {
  modalStore.openModal(EditUserRoleForm, 'Change user role', { user })
}

const openDeleteUserModal = (user: User) => {
  modalStore.openModal(DeleteUserConfirmationForm, 'Confirm user deletion', { user })
}

const isSelf = (user: User) => authStore.user?.id === user.id

onMounted(fetchUsers)

watch(
  () => modalStore.state.requestSent,
  (requestSent) => {
    if (requestSent !== undefined) {
      fetchUsers()
    }
  }
)
</script>

<template>
  <div style="padding: 20px">
    <h1 class="title is-3">User Management</h1>
    <p class="subtitle is-6">Only admins can access this page.</p>

    <button class="button is-link" @click="openCreateUserModal">Create User</button>

    <div class="field is-grouped mt-4 mb-2">
      <div class="control">
        <div class="select">
          <select v-model="filterRole">
            <option value="all">Show all roles</option>
            <option value="admin">Only admins</option>
            <option value="worker">Only workers</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="mt-4">Loading users...</div>

    <div v-if="infoMessage && !loading" class="mt-4">
      <strong>{{ infoMessage }}</strong>
    </div>

    <table v-if="filteredUsers.length > 0" class="table is-fullwidth is-striped mt-4">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th style="width: 220px">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span class="tag" :class="user.role === 'admin' ? 'is-danger' : 'is-info'">
              {{ user.role }}
            </span>
            <span v-if="isSelf(user)" class="tag is-dark ml-2">You</span>
          </td>
          <td>
            <div class="buttons">
              <button
                class="button is-small is-info"
                @click="openEditRoleModal(user)"
                :disabled="isSelf(user)"
                :title="isSelf(user) ? 'You cannot change your own role here' : ''"
              >
                Change Role
              </button>
              <button
                class="button is-small is-danger"
                @click="openDeleteUserModal(user)"
                :disabled="isSelf(user)"
                :title="isSelf(user) ? 'You cannot delete yourself' : ''"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
