<script setup lang="ts">
import type { Author } from '@/interfaces/Author';
import { useModalStore } from '@/stores/modalStore';
import { format } from "date-fns";
import EditAuthorForm from './forms/EditAuthorForm.vue';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getAuthor } from '@/services/AuthorService';
import { useNotifyStore } from '@/stores/notification.store';
import DeleteAuthorComfirmationForm from './forms/DeleteAuthorComfirmationForm.vue';


const modalStore = useModalStore();
const notifyStore = useNotifyStore();
const authStore = useAuthStore();
const props = defineProps<{
    author: Author
}>();

const onDeleteButtonClick = async () => {
    try {
        const author = await getAuthor(props.author.id);
        modalStore.openModal(DeleteAuthorComfirmationForm, 'Confirm Author Deletion', {author: author})
    } catch (error) {
        notifyStore.notifyError("Failed to get author, please try again later");
    }
}

const onEditButtonClick = async () => {
    try {
        const author = await getAuthor(props.author.id);
        modalStore.openModal(EditAuthorForm, 'Edit author details', {author: author})
    } catch (error) {
        notifyStore.notifyError("Failed to get author, please try again later");
    }
}

const displayDate = computed(() => {
  const date = props.author.updated_at > props.author.created_at 
    ? props.author.updated_at 
    : props.author.created_at;
  return format(new Date(date), 'yyyy-MM-dd h:mm a');
});

</script>

<template>
    <div class="card" style="margin-top: 10px; margin-bottom: 10px">
        <div class="card-content">
            <div class="media">
                <div class="media-content">
                    <p class="title is-4">{{ props.author.name }} {{ props.author.surname }}</p>
                </div>
            </div>
            <div class="content">
                <time>{{ displayDate }}</time>
            </div>
        </div>
        <footer v-if="authStore.isUserLoggedIn" class="card-footer">
            <a @click="onEditButtonClick" class="card-footer-item">Edit</a>
            <a @click="onDeleteButtonClick" class="card-footer-item">Delete</a>
        </footer>
    </div>
</template>