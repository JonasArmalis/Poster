<script setup lang="ts">
import type { Author } from '@/interfaces/Author';
import { editAuthor } from '@/services/AuthorService';
import { useModalStore } from '@/stores/modalStore';
import { useNotifyStore } from '@/stores/notification.store';
import { ActionType } from '@/types/ActionType';
import { authorValidationSchema } from '@/validation/authorValidationScema';
import { useForm, useField } from 'vee-validate';
import { computed } from 'vue';

const notifyStore = useNotifyStore();
const modalStore = useModalStore();

const props = defineProps<{
    author: Author
}>();

if (!props.author) {
    notifyStore.notifyError("Failed to load the author edit form")
}

const { handleSubmit, resetForm, values } = useForm({
    validationSchema: authorValidationSchema,
    initialValues: {
        name: props.author.name,
        surname: props.author.surname
    }
});

const { value: name, errorMessage: nameError, handleBlur: nameBlur } = useField<string>('name');
const { value: surname, errorMessage: surnameError, handleBlur: surnameBlur } = useField<string>('surname');

const hasChanges = computed(() => {
    return values.name != props.author.name || values.surname != props.author.surname;
});

const onSubmit = handleSubmit(async (values) => {
    values.name = values.name.trim();
    values.surname = values.surname.trim();
    if (hasChanges.value) {
        try {
            await editAuthor(values.name, values.surname, props.author.id);
            notifyStore.notifySuccess("Success! Author has been modified");
            modalStore.setRequestSentStatus(ActionType.EDIT);
        } catch (error) {
            notifyStore.notifyError("Failed to modify the author");
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
                    <input v-model="name" @blur="nameBlur" class="input" type="text" placeholder="e.g. John">
                </div>
                <p v-if="nameError" class="help is-danger">{{ nameError }}</p>
            </div>

            <div class="field">
                <label class="label">Surname</label>
                <div class="control">
                    <input v-model="surname" @blur="surnameBlur" class="input" type="text" placeholder="e.g. Smith">
                </div>
                <p v-if="surnameError" class="help is-danger">{{ surnameError }}</p>
            </div>

            <div class="buttons is-centered">
                <button type="submit" class="button is-success">Save</button>
                <button type="button" @click="modalStore.closeModal()" class="button is-danger">Cancel</button>
            </div>
        </form>
    </div>
</template>