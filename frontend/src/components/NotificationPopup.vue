<script setup lang="ts">
import { onMounted } from 'vue';
import type { Notification } from '../interfaces/Notification';
import { useNotifyStore } from '../stores/notification.store';
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css';

const props = defineProps<{ notification: Notification }>();

const notifyStore = useNotifyStore();

const toast = () => {
    createToast(props.notification.message, {
        type: props.notification.type, 
        showIcon: true,
        timeout: 4000,
        position: 'bottom-right',
        onClose: () => notifyStore.removeNotification(props.notification),
    });
};

onMounted(() => {
    toast();
});
</script>

<template>
    <div>
    </div>
</template>