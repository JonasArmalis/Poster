<script setup lang="ts">
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()

const onLogoutButtonClick = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar is-link" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <RouterLink to="/posts" class="navbar-item">
        <img src="/logo.svg" alt="Logo" />
      </RouterLink>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <RouterLink class="navbar-item" to="/posts">Posts</RouterLink>
        <RouterLink class="navbar-item" to="/authors">Authors</RouterLink>
        <RouterLink v-if="authStore.isAdmin" class="navbar-item" to="/users">Users</RouterLink>
        <RouterLink class="navbar-item" to="/sitemap">Sitemap</RouterLink>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <RouterLink v-if="!authStore.isUserLoggedIn" class="button is-primary" to="/login">
              <strong>Login</strong>
            </RouterLink>

            <button
              v-if="authStore.isUserLoggedIn"
              @click="onLogoutButtonClick"
              class="button is-danger"
            >
              <strong>Logout</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
