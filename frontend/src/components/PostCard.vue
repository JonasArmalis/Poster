<script setup lang="ts">
import type { Post } from "@/interfaces/Post";
import router from "@/router";
import { getPost } from "@/services/PostService";
import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";
import { useNotifyStore } from "@/stores/notification.store";
import { format } from "date-fns";
import { computed } from "vue";
import EditPostForm from "./forms/EditPostForm.vue";
import DeletePostConfirmationForm from "./forms/DeletePostConfirmationForm.vue";

const modalStore = useModalStore();
const notifyStore = useNotifyStore();
const authStore = useAuthStore();
const props = defineProps<{
    post: Post
}>();

const displayDate = computed(() => {
  const date = props.post.updated_at > props.post.created_at 
    ? props.post.updated_at 
    : props.post.created_at;
  return format(new Date(date), 'yyyy-MM-dd h:mm a');
});

const redirectToPost = () => {
    router.push({ path: `/posts/${props.post.id}` });
};

const onDeleteButtonClick = async () => {
    try {
        const post = await getPost(props.post.id);
        modalStore.openModal(DeletePostConfirmationForm, 'Confirm Post Deletion', { post: post })
    } catch (error) {
        notifyStore.notifyError("Failed to get post, please try again later");
    }
}
const onEditButtonClick = async () => {
    try {
        const post = await getPost(props.post.id);
        modalStore.openModal(EditPostForm, 'Edit post details', { post: post })
    } catch (error) {
        notifyStore.notifyError("Failed to get post, please try again later");
    }
}


</script>

<template>
    <div class="card" style="margin-top: 10px; margin-bottom: 10px">
        <div class="card-content">
            <div class="media">
                <div class="media-content">
                    <p class="title is-4">{{ props.post.title }}</p>
                    <p class="subtitle is-6"> Posted by: {{ props.post.author.name }} {{ props.post.author.surname
                        }}</p>
                </div>
            </div>
            <div class="content">
                <time>{{ displayDate }}</time>
            </div>
        </div>
        <footer class="card-footer">
            <a @click="redirectToPost" class="card-footer-item">View details</a>
            <a v-if="authStore.isUserLoggedIn" @click="onEditButtonClick" class="card-footer-item">Edit</a>
            <a v-if="authStore.isUserLoggedIn" @click="onDeleteButtonClick" class="card-footer-item">Delete</a>
        </footer>
    </div>
</template>
