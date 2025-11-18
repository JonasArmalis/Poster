<script setup lang="ts">

import { debounce } from "lodash";
import { ref, watch } from 'vue';

const searchValue = ref<string>('');

const emit = defineEmits(['search']);

const onButtonClick = () => {
    emit('search', searchValue.value);
};

const debouncedSearch = debounce((value: string) => {
    emit('search', value);
}, 700);

watch(searchValue, (newValue) => {
    debouncedSearch(newValue);
});

</script>

<template>
    <div class="field has-addons has-addons-centered">
        <div class="control is-expanded">
            <input v-model="searchValue" class="input" type="text" placeholder="Find something specific"
                @keyup.enter="onButtonClick">
        </div>
        <div class="control">
            <button class="button is-success" @click="onButtonClick">
                Search
            </button>
        </div>
    </div>
</template>