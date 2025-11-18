<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore';
import { useNotifyStore } from '@/stores/notification.store';
import { ActionType } from '@/types/ActionType';
import type { Post } from '@/interfaces/Post';
import { deletePost } from '@/services/PostService';

const modalStore = useModalStore();
const notifyStore = useNotifyStore();
const props = defineProps<{
    post: Post
}>();

const onDeleteButtonClick = async () => {
    try {
        await deletePost(props.post.id);
        notifyStore.notifySuccess("Success! Post has been deleted");
        modalStore.setRequestSentStatus(ActionType.DELETE);
    } catch (error) {
        notifyStore.notifyError("Failed to delete post, please try again later");
    }
    modalStore.closeModal();
}

const onCancelButtonClick = async () => {
    modalStore.closeModal();
}


</script>

<template>
    <div>
        <p class="subtitle is-4 mb-4">
            <strong>Are you sure you want to delete this post?</strong>
        </p>
        <p class="title is-5">{{ props.post.title }}</p>
        <div class="buttons is-centered">
            <button @click="onDeleteButtonClick" class="button is-danger">Yes, Delete</button>
            <button @click="onCancelButtonClick" class="button is-info">Cancel</button>
        </div>
    </div>
</template>