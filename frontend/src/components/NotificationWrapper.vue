<script setup lang="ts">
import { useNotifyStore } from '@/stores/notification.store';
import { storeToRefs } from 'pinia';
import NotificationPopup from './NotificationPopup.vue';


const notifyStore = useNotifyStore();
const { state } = storeToRefs(notifyStore);
</script>

<template>
    <div>
        <div v-for="notification in state.notifications" :key="notification.notifyTime">
            <NotificationPopup :notification="notification" />
        </div>
    </div>
</template>