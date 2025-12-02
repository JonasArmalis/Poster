<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'

import NotificationWrapper from './components/NotificationWrapper.vue'
import ModalCard from './components/ModalWindow.vue'
import { useModalStore } from './stores/modalStore'
import { storeToRefs } from 'pinia'

const modalStore = useModalStore()
const { state } = storeToRefs(modalStore)
const downloadDoc = new URL('./assets/ataskaita.docx', import.meta.url).href
</script>

<template>
  <div class="layout">
  <header>
    <NavigationBar v-if="$route.path !== '/login'" />
    <div v-else class="login-logo">
      <img src="/logo.svg" alt="Poster Logo" />
    </div>
  </header>

    <main class="page-content">
      <RouterView />
    </main>

    <footer class="footer has-text-centered">
      <p>
        2025 © Contact us at: 
        <a href="mailto:jonasarmalis60@gmail.com">jonasarmalis60@gmail.com</a>
      </p>
        <a :href="downloadDoc" download class="button is-info mt-2">ataskaita.docx</a>
    </footer>

    <NotificationWrapper />

    <div v-if="state.isOpen">
      <ModalCard />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.page-content {
  flex: 1;
}

.footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e5e5;
  font-size: 0.9rem;
}

.login-logo {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
}

.login-logo img {
  height: 80px;
}
</style>
