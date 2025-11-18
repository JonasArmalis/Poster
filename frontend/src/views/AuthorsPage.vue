<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Author } from '@/interfaces/Author';
import { getAuthorsByPage } from '../services/AuthorService';
import { useNotifyStore } from '@/stores/notification.store';
import AuthorCard from '@/components/AuthorCard.vue';
import SearchBar from '@/components/SearchBar.vue';
import PaginationMenu from '@/components/PaginationMenu.vue';
import { useModalStore } from '@/stores/modalStore';
import CreateAuthorForm from '@/components/forms/CreateAuthorForm.vue';
import { useAuthStore } from '@/stores/authStore';
import { ActionType } from '@/types/ActionType';

const notifyStore = useNotifyStore();
const limit = 5;
const searchValue = ref<String>("");
const currentPage = ref<number>(1);
const authors = ref<Author[]>([]);
const authorAmount = ref<number>();
const infoMessage = ref<string>();

const modalStore = useModalStore();
const authStore = useAuthStore();

const fetchAuthors = async () => {
    try {
        const { data, totalAmount } = await getAuthorsByPage(currentPage.value, limit, searchValue.value);
        authors.value = data;
        authorAmount.value = totalAmount;
        if (authors.value.length == 0) {
            infoMessage.value = "No Authors have been found";
            notifyStore.notifyInfo(infoMessage.value);
        } else {
            infoMessage.value = undefined;
        }
    } catch (error) {
        authorAmount.value = undefined;
        authors.value = [];
        infoMessage.value = "Failed to load the authors, please try again later";
        notifyStore.notifyError(infoMessage.value);
    }
};

const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchAuthors();
};
const handleSearch = (input: String) => {
    currentPage.value = 1;
    searchValue.value = input;
    infoMessage.value = undefined;
    fetchAuthors();
}

onMounted(fetchAuthors);

watch(() => modalStore.state.requestSent, (requestSent) => {
    if (requestSent !== undefined){
        if (requestSent === ActionType.DELETE) {
            currentPage.value = 1;
        }
        fetchAuthors();
    }
});

</script>

<template>
    <div style="padding: 20px;">
        <SearchBar @search="handleSearch" />
        <button v-if="authStore.isUserLoggedIn" @click="modalStore.openModal(CreateAuthorForm, 'Create a new author')"
            class="button is-link">Create Author</button>
        <div v-if="infoMessage">
            <h1> <strong> {{ infoMessage }} </strong></h1>
        </div>
        <div v-for="author in authors" :key="author.id">
            <AuthorCard :author="author" />
        </div>
        <PaginationMenu v-if="authorAmount && authorAmount > 0" :totalPages="Math.ceil(authorAmount / limit)"
            :perPage="limit" :currentPage="currentPage" @pagechanged="handlePageChange" />
    </div>
</template>