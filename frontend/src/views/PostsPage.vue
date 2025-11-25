<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useNotifyStore } from '@/stores/notification.store';
import type { Post } from '@/interfaces/Post';
import { getAllPosts } from '@/services/PostService';
import PostCard from '@/components/PostCard.vue';
import SearchBar from '@/components/SearchBar.vue';
import PaginationMenu from '@/components/PaginationMenu.vue';
import { useModalStore } from '@/stores/modalStore';
import { useAuthStore } from '@/stores/authStore';
import CreatePostForm from '@/components/forms/CreatePostForm.vue';
import { ActionType } from '@/types/ActionType';

const limit = 5;
const searchValue = ref<string>("");
const currentPage = ref<number>(1);
const notifyStore = useNotifyStore();
const posts = ref<Post[]>([]);
const postAmount = ref<number>();
const infoMessage = ref<string>();

const sortOrder = ref<'asc' | 'desc'>('desc');
const dateFrom = ref<string>('');
const dateTo = ref<string>('');

const modalStore = useModalStore();
const authStore = useAuthStore();

const fetchPosts = async () => {
  try {
    const { data, totalAmount } = await getAllPosts(
      currentPage.value,
      limit,
      searchValue.value,
      {
        sortOrder: sortOrder.value,
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined
      }
    );

    posts.value = data;
    postAmount.value = totalAmount;

    if (data.length === 0) {
      infoMessage.value = "No Posts have been found.";
      notifyStore.notifyInfo(infoMessage.value);
    } else {
      infoMessage.value = undefined;
    }
  } catch (error) {
    postAmount.value = undefined;
    posts.value = [];
    infoMessage.value = "Failed to load the posts, please try again later";
    notifyStore.notifyError(infoMessage.value);
  }
};

onMounted(fetchPosts);

watch([sortOrder, dateFrom, dateTo], () => {
  currentPage.value = 1;
  fetchPosts();
});

const handleSearch = (input: string) => {
  currentPage.value = 1;
  searchValue.value = input;
  infoMessage.value = undefined;
  fetchPosts();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchPosts();
};

watch(() => modalStore.state.requestSent, (requestSent) => {
  if (requestSent !== undefined) {
    if (requestSent === ActionType.DELETE) {
      currentPage.value = 1;
    }
    fetchPosts();
  }
});
</script>

<template>
  <div style="padding: 20px;">

    <div class="field is-grouped mb-4 is-align-items-flex-end">
      <div class="control">
        <div class="select">
          <select v-model="sortOrder">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      <div class="control is-flex is-flex-direction-column">
        <label class="mb-1 has-text-grey-light">Start date</label>
        <input v-model="dateFrom" type="date" class="input" />
      </div>

      <div class="control is-flex is-flex-direction-column">
        <label class="mb-1 has-text-grey-light">End date</label>
        <input v-model="dateTo" type="date" class="input" />
      </div>
    </div>

    <SearchBar @search="handleSearch" />

    <button
      v-if="authStore.isUserLoggedIn"
      @click="modalStore.openModal(CreatePostForm, 'Create a new post')"
      class="button is-link"
    >
      Create Post
    </button>

    <div v-if="infoMessage" class="mt-4">
      <h1><strong>{{ infoMessage }}</strong></h1>
    </div>

    <div v-for="post in posts" :key="post.id">
      <PostCard :post="post" />
    </div>

    <PaginationMenu
      v-if="postAmount && postAmount > 0"
      :totalPages="Math.ceil(postAmount / limit)"
      :perPage="limit"
      :currentPage="currentPage"
      @pagechanged="handlePageChange"
    />
  </div>
</template>
