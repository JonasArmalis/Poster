<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Post } from '@/interfaces/Post'
import { getPostsByUser } from '@/services/PostService'
import { useNotifyStore } from '@/stores/notification.store'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const notifyStore = useNotifyStore()

const posts = ref<Post[]>([])
const infoMessage = ref<string>()
const userId = Number(route.params.id)

const fetchPosts = async () => {
  try {
    const { data, totalAmount } = await getPostsByUser(userId, 1, 100)
    posts.value = data
    if (totalAmount === 0) {
      infoMessage.value = 'This user has no posts yet.'
      notifyStore.notifyInfo(infoMessage.value)
    } else {
      infoMessage.value = undefined
    }
  } catch (error) {
    posts.value = []
    infoMessage.value = 'Failed to load posts for this user, please try again later'
    notifyStore.notifyError(infoMessage.value)
  }
}

onMounted(fetchPosts)
</script>

<template>
  <div style="padding: 20px">
    <h1 class="title is-3">Posts by this user</h1>

    <div v-if="infoMessage">
      <strong>{{ infoMessage }}</strong>
    </div>

    <div v-for="post in posts" :key="post.id">
      <PostCard :post="post" />
    </div>
  </div>
</template>
