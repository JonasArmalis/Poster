<script setup lang="ts">
import { createAuthor } from '@/services/AuthorService';
import { useModalStore } from '@/stores/modalStore';
import { useNotifyStore } from '@/stores/notification.store';
import { ActionType } from '@/types/ActionType';
import { authorValidationSchema } from '@/validation/authorValidationScema';
import { useForm, useField } from 'vee-validate';

const { handleSubmit, resetForm } = useForm({
    validationSchema: authorValidationSchema,
});

const { value: name, errorMessage: nameError, handleBlur: nameBlur } = useField<string>('name');
const { value: surname, errorMessage: surnameError, handleBlur: surnameBlur } = useField<string>('surname');

const modalStore = useModalStore();
const notifyStore = useNotifyStore();

const onSubmit = handleSubmit(async (values) => {
    try {
        values.name = values.name.trim();
        values.surname = values.surname.trim();
        await createAuthor(values.name, values.surname);
        notifyStore.notifySuccess("Success! Author has been created");
        modalStore.setRequestSentStatus(ActionType.CREATE);
        modalStore.closeModal();
        resetForm();
    } catch (error) {
        notifyStore.notifyError("Failed to create an author");
    }
});

</script>

<template>
    <div>
        <form @submit="onSubmit" no-validate>
            <div class="field">
                <label class="label">Name</label>
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