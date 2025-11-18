<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllUsers } from '@/services/UserService'
import type { User } from '@/interfaces/User'
import { useNotifyStore } from '@/stores/notification.store'
import router from '@/router'

const users = ref<User[]>([])
const loading = ref(false)
const notifyStore = useNotifyStore()

const fetchUsers = async () => {
  try {
    loading.value = true
    users.value = await getAllUsers()
  } catch (error) {
    notifyStore.notifyError('Failed to load authors')
  } finally {
    loading.value = false
  }
}

const openAuthorPosts = (user: User) => {
  router.push(`/authors/${user.id}`)
}

onMounted(fetchUsers)
</script>

<template>
  <div style="padding: 20px">
    <h1 class="title is-3">Authors</h1>

    <div v-if="loading">Loading authors...</div>

    <div v-for="user in users" :key="user.id" class="box"
         style="cursor: pointer"
         @click="openAuthorPosts(user)">
      <p class="title is-5">{{ user.name }}</p>
      <p class="subtitle is-6 has-text-grey">{{ user.email }}</p>
    </div>
  </div>
</template>
