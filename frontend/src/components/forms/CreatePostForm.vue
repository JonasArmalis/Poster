<script setup lang="ts">
import { createPost } from '@/services/PostService'
import { useModalStore } from '@/stores/modalStore'
import { useNotifyStore } from '@/stores/notification.store'
import { ActionType } from '@/types/ActionType'
import { createPostValidationSchema } from '@/validation/createPostValidationSchema'
import { useForm, useField } from 'vee-validate'
import { useAuthStore } from '@/stores/authStore'

const modalStore = useModalStore()
const notifyStore = useNotifyStore()
const authStore = useAuthStore()

const { handleSubmit, resetForm } = useForm({
  validationSchema: createPostValidationSchema
})

const { value: title, errorMessage: titleError, handleBlur: titleBlur } = useField<string>('title')
const {
  value: content,
  errorMessage: contentError,
  handleBlur: contentBlur
} = useField<string>('content')

const onSubmit = handleSubmit(async (values) => {
  try {
    if (!authStore.isUserLoggedIn) {
      notifyStore.notifyError('You must be logged in to create a post')
      return
    }

    const trimmedTitle = values.title.trim()
    const trimmedContent = values.content.trim()

    await createPost(trimmedTitle, trimmedContent)
    notifyStore.notifySuccess('Success! Post has been created')
    modalStore.setRequestSentStatus(ActionType.CREATE)
    modalStore.closeModal()
    resetForm()
  } catch (error) {
    notifyStore.notifyError('Failed to create a post')
  }
})
</script>

<template>
  <div>
    <form @submit="onSubmit" no-validate>
      <div class="field">
        <label class="label">Title</label>
        <div class="control">
          <input
            v-model="title"
            @blur="titleBlur"
            class="input"
            type="text"
            placeholder="e.g. New Post"
          />
        </div>
        <p v-if="titleError" class="help is-danger">{{ titleError }}</p>
      </div>

      <div class="field">
        <label class="label">Content</label>
        <div class="control">
          <textarea
            v-model="content"
            @blur="contentBlur"
            class="textarea"
            placeholder="e.g. This is the body of a new post"
          ></textarea>
        </div>
        <p v-if="contentError" class="help is-danger">{{ contentError }}</p>
      </div>

      <div class="buttons is-centered">
        <button type="submit" class="button is-success">Save</button>
        <button type="button" @click="modalStore.closeModal()" class="button is-danger">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
