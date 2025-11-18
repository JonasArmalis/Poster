<script setup lang="ts">
import type { Post } from '@/interfaces/Post';
import { getPost } from '@/services/PostService';
import { useNotifyStore } from '@/stores/notification.store';
import { computed, ref, watch } from 'vue';
import { format } from "date-fns";
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import EditPostForm from '@/components/forms/EditPostForm.vue';
import { useModalStore } from '@/stores/modalStore';
import { ActionType } from '@/types/ActionType';
import DeletePostConfirmationForm from '@/components/forms/DeletePostConfirmationForm.vue';
import router from '@/router';

const route = useRoute();
const notifyStore = useNotifyStore();
const authStore = useAuthStore();
const modalStore = useModalStore();

const post = ref<Post | undefined>(undefined);

const fetchPost = async (id: Number) => {
    try {
        post.value = await getPost(id);
    } catch (error) {
        notifyStore.notifyError("Failed to load the post");
    }
};

watch(() => route.params.id, (id) => {
    if (id) {
        fetchPost(Number(id));
    }
}, { immediate: true });

watch(() => modalStore.state.requestSent, (requestSent) => {
    if (requestSent !== undefined) {
        if (requestSent === ActionType.EDIT) {
             fetchPost(Number(route.params.id))
        }
        if (requestSent === ActionType.DELETE) {
            router.push("/");
        }
    }
});

const onDeleteButtonClick = async () => {
    try {
        if (post.value) {
            const postToDelete = await getPost(post.value.id);
            modalStore.openModal(DeletePostConfirmationForm, 'Confirm Post Deletion', { post: postToDelete })
        }
    } catch (error) {
        notifyStore.notifyError("Failed to get post, please try again later");
    }
}

const onEditButtonClick = async () => {
    try {
        if (post.value) {
            const postToEdit = await getPost(post.value.id);
            modalStore.openModal(EditPostForm, 'Edit post details', { post: postToEdit })
        }
    } catch (error) {
        notifyStore.notifyError("Failed to get post, please try again later");
    }
}

const displayDate = computed(() => {
    if (!post.value) {
        return '';
    }
    const { updated_at, created_at } = post.value;
    return updated_at >= created_at ? updated_at : created_at;
});

</script>

<template>
    <div v-if="post" class="card my-5">
        <div class="card-content has-text-centered">
            <p class="title is-3">{{ post.title }}</p>
            <p class="subtitle is-6">Posted by: {{ post.author.name }} {{ post.author.surname }}</p>
            <p class="content">{{ post.body }}</p>
            <time v-if="displayDate">{{ format(displayDate, 'yyyy-MM-dd h:mm a') }}</time>
        </div>
        <footer v-if="authStore.isUserLoggedIn" class="card-footer">
            <a @click="onEditButtonClick" class="card-footer-item">Edit</a>
            <a @click="onDeleteButtonClick" class="card-footer-item">Delete</a>
        </footer>
    </div>
    <div v-if="!post">
        <p class="title is-3"> This post doesn't exist</p>

    </div>

</template>

<style scoped>
.content {
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
}
</style>
