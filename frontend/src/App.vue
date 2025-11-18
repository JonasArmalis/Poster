<script setup lang="ts">
import { RouterView } from 'vue-router';
import NavigationBar from './components/NavigationBar.vue';

import NotificationWrapper from './components/NotificationWrapper.vue';
import ModalCard from './components/ModalWindow.vue';
import { useModalStore } from './stores/modalStore';
import { storeToRefs } from 'pinia';
const modalStore = useModalStore();
const { state } = storeToRefs(modalStore);

</script>

<template>
  <header>
    <NavigationBar />
  </header>
  <RouterView />
  <NotificationWrapper/>
  <div v-if="state.isOpen">
    <ModalCard />
  </div>


</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}
</style>
