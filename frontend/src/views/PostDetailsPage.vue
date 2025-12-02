<script setup lang="ts">
import type { Post } from '@/interfaces/Post'
import type { Comment } from '@/interfaces/Comment'
import { getPost } from '@/services/PostService'
import { getCommentsForPost, createComment, deleteComment } from '@/services/CommentService'
import { useNotifyStore } from '@/stores/notification.store'
import { computed, ref, watch } from 'vue'
import { format } from 'date-fns'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import EditPostForm from '@/components/forms/EditPostForm.vue'
import { useModalStore } from '@/stores/modalStore'
import { ActionType } from '@/types/ActionType'
import DeletePostConfirmationForm from '@/components/forms/DeletePostConfirmationForm.vue'
import router from '@/router'

const route = useRoute()
const notifyStore = useNotifyStore()
const authStore = useAuthStore()
const modalStore = useModalStore()

const post = ref<Post | undefined>(undefined)
const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const newComment = ref('')

const fetchPost = async (id: number) => {
  try {
    post.value = await getPost(id)
    await fetchComments(id)
  } catch (error) {
    notifyStore.notifyError('Failed to load the post')
  }
}

const fetchComments = async (postId: number) => {
  try {
    commentsLoading.value = true
    comments.value = await getCommentsForPost(postId)
  } catch (error) {
    comments.value = []
    notifyStore.notifyError('Failed to load comments')
  } finally {
    commentsLoading.value = false
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (id) {
      fetchPost(Number(id))
    }
  },
  { immediate: true }
)

watch(
  () => modalStore.state.requestSent,
  (requestSent) => {
    if (requestSent !== undefined) {
      if (requestSent === ActionType.EDIT) {
        fetchPost(Number(route.params.id))
      }
      if (requestSent === ActionType.DELETE) {
        router.push('/')
      }
    }
  }
)

const displayDate = computed(() => {
  if (!post.value) return ''
  const { updated_at, created_at } = post.value
  return updated_at >= created_at ? updated_at : created_at
})

const isOwner = computed(() => post.value && authStore.user?.id === post.value.userId)
const canEdit = computed(() => authStore.isAdmin || isOwner.value)
const canDelete = computed(() => authStore.isAdmin || isOwner.value)

const formatCommentDate = (comment: Comment) => {
  const dateStr =
    comment.updated_at >= comment.created_at ? comment.updated_at : comment.created_at
  return format(new Date(dateStr), 'yyyy-MM-dd h:mm a')
}

const canDeleteComment = (comment: Comment) =>
  authStore.isAdmin || authStore.user?.id === comment.userId

const onAddCommentClick = async () => {
  if (!post.value) return
  const text = newComment.value.trim()
  if (!text) {
    notifyStore.notifyWarning('Comment cannot be empty')
    return
  }
  try {
    await createComment(post.value.id, text)
    newComment.value = ''
    await fetchComments(post.value.id)
    notifyStore.notifySuccess('Comment added')
  } catch {
    notifyStore.notifyError('Failed to add comment')
  }
}

const onDeleteCommentClick = async (id: number) => {
  if (!post.value) return
  try {
    await deleteComment(id)
    await fetchComments(post.value.id)
    notifyStore.notifySuccess('Comment deleted')
  } catch {
    notifyStore.notifyError('Failed to delete comment')
  }
}

const onEditPost = async () => {
  if (!post.value) return
  modalStore.openModal(EditPostForm, 'Edit Post', { post: post.value })
}

const onDeletePost = async () => {
  if (!post.value) return
  modalStore.openModal(DeletePostConfirmationForm, 'Delete Post', { post: post.value })
}
</script>

<template>
  <div v-if="post" class="post-wrapper">
    <section class="post-header box">
      <h1 class="title is-2">{{ post.title }}</h1>
      <p class="subtitle is-6">Posted by: {{ post.user.name }}</p>
      <time class="post-date">
        {{ format(new Date(displayDate), 'yyyy-MM-dd h:mm a') }}
      </time>

      <div v-if="authStore.isUserLoggedIn" class="button-row">
        <button v-if="canEdit" class="button is-link is-light" @click="onEditPost">Edit</button>
        <button v-if="canDelete" class="button is-danger is-light" @click="onDeletePost">
          Delete
        </button>
      </div>
    </section>

    <section class="post-body box">
      <div class="content post-text content-wrapped">
        {{ post.body }}
      </div>
    </section>

    <section class="comments-section box">
      <h2 class="title is-4">Comments</h2>

      <div v-if="commentsLoading">Loading comments...</div>

      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-entry"
      >
        <p class="comment-header">
          <strong>{{ comment.user?.name }}</strong>
          <small class="comment-date"> · {{ formatCommentDate(comment) }}</small>
        </p>
        <p class="comment-body">{{ comment.content }}</p>

        <button
          v-if="canDeleteComment(comment)"
          class="delete comment-delete"
          title="Delete comment"
          @click="onDeleteCommentClick(comment.id)"
        ></button>
      </div>

      <div v-if="authStore.isUserLoggedIn" class="add-comment">
        <label class="label">Add a comment</label>
          <textarea
            v-model="newComment"
            class="textarea no-resize"
            maxlength="1000"
            rows="3"
            placeholder="Write a comment..."
          ></textarea>
        <button class="button is-link mt-2" @click="onAddCommentClick">Post Comment</button>
      </div>

      <p v-else class="has-text-grey mt-4">Log in to write a comment.</p>
    </section>
  </div>
</template>

<style scoped>
.post-wrapper {
  max-width: 900px;
  margin: 0 auto;
  margin-top: 20px;
}

.post-header {
  text-align: center;
}

.post-date {
  color: #9a9a9a;
  display: block;
  margin-top: 5px;
}

.button-row {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.post-body {
  margin-top: 20px;
}

.post-text {
  font-size: 1.15rem;
  line-height: 1.7;
  white-space: pre-wrap;
}

.comments-section {
  margin-top: 30px;
}

.comment-entry {
  padding: 10px 0;
  border-bottom: 1px solid #333;
  position: relative;
}

.comment-delete {
  position: absolute;
  right: 0;
  top: 10px;
}

.comment-header {
  margin-bottom: 3px;
}

.comment-body {
  white-space: pre-wrap;
}

.no-resize {
  resize: none;
}

.comment-body {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.content-wrapped {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
