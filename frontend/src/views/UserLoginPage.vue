<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import router from '@/router';
import { useNotifyStore } from '@/stores/notification.store';

const authStore = useAuthStore();
const notifyStore = useNotifyStore();

const passwordInput = ref<HTMLInputElement | null>(null);

const email = ref<string>("");
const password = ref<string>("");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validEmail = computed(() => {
    return emailRegex.test(email.value);
});

const validPassword = computed(() => {
    return password.value.length > 0;
});

const onLoginButtonClick = async () => {
    if (validEmail.value && validPassword.value) {
        const success = await authStore.login(email.value, password.value);
        if (success) router.push('/'); 
    } else {
        notifyStore.notifyWarning("Please enter a valid email and password");
    }
}

</script>

<template>
    <div class="container is-flex is-justify-content-center is-align-items-center" style="height: 100vh;">
        <div class="box">
            <h1 class="title is-4 has-text-centered">Enter Your Login Details</h1>
            <div class="field">
                <p class="control has-icons-left has-icons-right">
                    <input v-model="email" class="input" type="email" placeholder="Email"
                        @keydown.enter="$nextTick(() => { if (passwordInput) passwordInput.focus(); })">
                        <span class="icon is-small is-left">
                    <i class="fas fa-envelope"></i>
                    </span>
                    <span class="icon is-small is-right">
                        <i class="fas fa-check"></i>
                    </span>
                </p>
            </div>
            <div class="field">
                <p class="control has-icons-left">
                    <input v-model="password" class="input" type="password" placeholder="Password"
                        @keydown.enter="onLoginButtonClick()" ref="passwordInput">
                    <span class="icon is-small is-left">
                        <i class="fas fa-lock"></i>
                    </span>
                </p>
            </div>
            <div class="field has-text-centered">
                <p class="control">
                    <button @click="onLoginButtonClick" class="button is-success">
                        Login
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>