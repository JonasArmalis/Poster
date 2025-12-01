<script setup lang="ts">
import type { Post } from '@/interfaces/Post'
import router from '@/router'
import { getPost } from '@/services/PostService'
import { useAuthStore } from '@/stores/authStore'
import { useModalStore } from '@/stores/modalStore'
import { useNotifyStore } from '@/stores/notification.store'
import { format } from 'date-fns'
import { computed } from 'vue'
import EditPostForm from './forms/EditPostForm.vue'
import DeletePostConfirmationForm from './forms/DeletePostConfirmationForm.vue'

const modalStore = useModalStore()
const notifyStore = useNotifyStore()
const authStore = useAuthStore()
const props = defineProps<{
  post: Post
}>()

const displayDate = computed(() => {
  const date =
    props.post.updated_at > props.post.created_at ? props.post.updated_at : props.post.created_at
  return format(new Date(date), 'yyyy-MM-dd h:mm a')
})

const isOwner = computed(() => {
  return authStore.user?.id === props.post.userId
})

const canEdit = computed(() => {
  return authStore.isAdmin || isOwner.value
})

const canDelete = computed(() => {
  return authStore.isAdmin || isOwner.value
})

const previewContent = computed(() => {
  const text = props.post.body ?? ''
  const maxLength = 150
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
})

const redirectToPost = () => {
  router.push({ path: `/posts/${props.post.id}` })
}

const onDeleteButtonClick = async () => {
  try {
    const post = await getPost(props.post.id)
    modalStore.openModal(DeletePostConfirmationForm, 'Confirm Post Deletion', { post })
  } catch (error) {
    notifyStore.notifyError('Failed to get post, please try again later')
  }
}
const onEditButtonClick = async () => {
  try {
    const post = await getPost(props.post.id)
    modalStore.openModal(EditPostForm, 'Edit post details', { post })
  } catch (error) {
    notifyStore.notifyError('Failed to get post, please try again later')
  }
}
</script>

<template>
  <div
    class="card clickable-card"
    style="margin-top: 10px; margin-bottom: 10px"
    @click="redirectToPost"
    tabindex="0"
    @keydown.enter="redirectToPost"
    @keydown.space.prevent="redirectToPost"
  >
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-4">{{ props.post.title }}</p>
          <p class="subtitle is-6">
            Posted by: {{ props.post.user.name }}
          </p>
        </div>
      </div>
      <div class="content">
        <p class="preview">
          {{ previewContent }}
        </p>
        <time>{{ displayDate }}</time>
      </div>
    </div>
    <footer class="card-footer">
      <a
        v-if="authStore.isUserLoggedIn && canEdit"
        @click.stop="onEditButtonClick"
        class="card-footer-item"
      >
        Edit
      </a>
      <a
        v-if="authStore.isUserLoggedIn && canDelete"
        @click.stop="onDeleteButtonClick"
        class="card-footer-item"
      >
        Delete
      </a>
    </footer>
  </div>
</template>

<style scoped>
.clickable-card {
  cursor: pointer;
}

.preview {
  margin-bottom: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
