<script setup lang="ts">
import type { Author } from '@/interfaces/Author';
import { getAllAuthors } from '@/services/AuthorService';
import { createPost } from '@/services/PostService';
import { useModalStore } from '@/stores/modalStore';
import { useNotifyStore } from '@/stores/notification.store';
import { ActionType } from '@/types/ActionType';
import { createPostValidationSchema } from '@/validation/createPostValidationSchema';
import { useForm, useField } from 'vee-validate';
import { onMounted, onUnmounted, ref } from 'vue';

const modalStore = useModalStore();
const notifyStore = useNotifyStore();
const authors = ref<Author[]>([]);
const isDropdownOpen = ref(false);
const selectedAuthor = ref<Author | null>(null);
const dropdownRef = ref<HTMLElement | null>(null); // Ref for the dropdown

const { handleSubmit, resetForm } = useForm({
    validationSchema: createPostValidationSchema,
});

const { value: title, errorMessage: titleError, handleBlur: titleBlur } = useField<string>('title');
const { value: content, errorMessage: contentError, handleBlur: contentBlur } = useField<string>('content');
const { value: authorId, errorMessage: authorError } = useField<number>('authorId');

const onSubmit = handleSubmit(async (values) => {
    try {
        values.title = values.title.trim();
        values.content = values.content.trim();
        await createPost(values.title, values.content, values.authorId);
        notifyStore.notifySuccess("Success! Post has been created");
        modalStore.setRequestSentStatus(ActionType.CREATE);
        modalStore.closeModal();
        resetForm();
    } catch (error) {
        notifyStore.notifyError("Failed to create a post");
    }
});

const fetchAuthors = async () => {
    try {
        authors.value = await getAllAuthors();
    } catch (error) {
        notifyStore.notifyError("Failed to fetch authors for post creation");
    }
};

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
};

const selectAuthor = (author: Author) => {
    selectedAuthor.value = author;
    authorId.value = author.id;
    isDropdownOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isDropdownOpen.value = false;
    }
};

onMounted(() => {
    fetchAuthors();
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div>
        <form @submit="onSubmit" no-validate>
            <div class="field">
                <label class="label">Title</label>
                <div class="control">
                    <input v-model="title" @blur="titleBlur" class="input" type="text" placeholder="e.g. New Post">
                </div>
                <p v-if="titleError" class="help is-danger">{{ titleError }}</p>
            </div>

            <div class="field">
                <label class="label">Author</label>
                <div class="control">
                    <div :class="['dropdown', { 'is-active': isDropdownOpen }]">
                        <div class="dropdown-trigger">
                            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" ref="dropdownRef"
                                @click="toggleDropdown" type="button">
                                <span>{{ selectedAuthor ? selectedAuthor.name + ' ' + selectedAuthor.surname :
                                    'SelectAuthor' }}</span>
                                <span class="icon is-small">
                                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                                </span>
                            </button>
                        </div>
                        <div class="dropdown-menu" id="dropdown-menu" role="menu">
                            <div class="dropdown-content" style="max-height: 200px; overflow-y: auto;">
                                <a v-for="author in authors" :key="author.id" class="dropdown-item"
                                    @click="selectAuthor(author)">
                                    {{ author.name }} {{ author.surname }}
                                </a>
                                <a v-if="authors.length < 1" class="dropdown-item">
                                    No authors available, please create an author first
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-if="authorError" class="help is-danger">{{ authorError }}</p>
            </div>

            <div class="field">
                <label class="label">Content</label>
                <div class="control">
                    <textarea v-model="content" @blur="contentBlur" class="textarea"
                        placeholder="e.g. This is the body of a new post"></textarea>
                </div>
                <p v-if="contentError" class="help is-danger">{{ contentError }}</p>
            </div>

            <div class="buttons is-centered">
                <button type="submit" class="button is-success">Save</button>
                <button type="button" @click="modalStore.closeModal()" class="button is-danger">Cancel</button>
            </div>
        </form>
    </div>
</template>