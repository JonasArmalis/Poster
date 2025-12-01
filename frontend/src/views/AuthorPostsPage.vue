<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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

const sortOrder = ref<'asc' | 'desc'>('desc')
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

// užkrauna postus su datų ir rikiavimo filtrais
const fetchPosts = async () => {
  try {
    const { data } = await getPostsByUser(userId, 1, 100, {
      sortOrder: sortOrder.value,
      dateFrom: dateFrom.value || undefined,
      dateTo: dateTo.value || undefined
    })

    posts.value = data

    if (data.length === 0) {
      infoMessage.value = 'This user has no posts for the selected period.'
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
watch([sortOrder, dateFrom, dateTo], () => {
  fetchPosts()
})
</script>

<template>
  <div style="padding: 20px">
    <h1 class="title is-3">Posts by this user</h1>

    <!-- Date filters -->
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

    <div v-if="infoMessage">
      <strong>{{ infoMessage }}</strong>
    </div>

    <div v-for="post in posts" :key="post.id">
      <PostCard :post="post" />
    </div>
  </div>
</template>
