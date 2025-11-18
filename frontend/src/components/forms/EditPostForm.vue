<script setup lang="ts">
import type { Post } from '@/interfaces/Post';
import { editPost } from '@/services/PostService';
import { useModalStore } from '@/stores/modalStore';
import { useNotifyStore } from '@/stores/notification.store';
import { ActionType } from '@/types/ActionType';
import { editPostValidationSchema } from '@/validation/editPostValidationSchema';
import { useForm, useField } from 'vee-validate';
import { computed } from 'vue';

const notifyStore = useNotifyStore();
const modalStore = useModalStore();

const props = defineProps<{
    post: Post
}>();

if (!props.post) {
    notifyStore.notifyError("Failed to load the post edit form")
}

const { handleSubmit, resetForm, values } = useForm({
    validationSchema: editPostValidationSchema,
    initialValues: {
        title: props.post.title,
        content: props.post.body
    }
});

const { value: title, errorMessage: titleError, handleBlur: titleBlur } = useField<string>('title');
const { value: content, errorMessage: contentError, handleBlur: contentBlur } = useField<string>('content');

const hasChanges = computed(() => {
    return values.title != props.post.title || values.content != props.post.body;
});

const onSubmit = handleSubmit(async (values) => {
    values.title = values.title.trim();
    values.content = values.content.trim();
    if (hasChanges.value) {
        try {
            await editPost(values.title, values.content, props.post.id);
            notifyStore.notifySuccess("Success! Post has been modified");
            modalStore.setRequestSentStatus(ActionType.EDIT);
        } catch (error) {
            notifyStore.notifyError("Failed to modify the post");
        }
    }
    modalStore.closeModal();
    resetForm();
});

</script>

<template>
    <div>
        <form @submit="onSubmit" no-validate>
            <div class="field">
                <label class="label">Title</label>
                <div class="control">
                    <input v-model="title" @blur="titleBlur" class="input" type="text" placeholder="e.g. New title">
                </div>
                <p v-if="titleError" class="help is-danger">{{ titleError }}</p>
            </div>

            <div class="field">
                <label class="label">Content</label>
                <div class="control">
                    <textarea v-model="content" @blur="contentBlur" class="textarea"
                    placeholder="e.g. This is the body of the post"></textarea>
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