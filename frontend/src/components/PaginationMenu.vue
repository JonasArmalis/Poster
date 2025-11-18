<script setup lang="ts">

const props = defineProps<{
    totalPages: number,
    perPage: number,
    currentPage: number
}>();

const emit = defineEmits<{
    (e: 'pagechanged', page: number): void;
}>();


const onClickFirstPage = () => { emit('pagechanged', 1); };
const onClickPreviousPage = () => { emit('pagechanged', props.currentPage - 1); };
const onClickPage = (page: number) => { emit('pagechanged', page); };
const onClickNextPage = () => { emit('pagechanged', props.currentPage + 1); };
const onClickLastPage = () => { emit('pagechanged', props.totalPages); };



</script>

<template>
    <nav class="pagination is-centered" role="navigation" aria-label="pagination" style="margin-top: 30px;">
        <ul class="pagination-list">
            <li v-if="currentPage > 2"><a @click="onClickFirstPage" 
                    class="pagination-link">1</a></li>
            <li v-if="currentPage > 3 "><span class="pagination-ellipsis">&hellip;</span></li>
            <li v-if="currentPage > 1"><a @click="onClickPreviousPage" class="pagination-link">{{ currentPage - 1 }}</a></li>
            <li>
                <a class="pagination-link is-current" aria-current="page">{{ currentPage }}</a>
            </li>
            <li v-if="currentPage < totalPages"><a @click="onClickNextPage" class="pagination-link">{{ currentPage + 1 }}</a></li>
            <li v-if="currentPage < totalPages - 2"><span class="pagination-ellipsis">&hellip;</span></li>
            <li v-if="currentPage < totalPages - 1"><a @click="onClickLastPage"
                    class="pagination-link">{{ totalPages }}</a></li>
        </ul>
    </nav>
</template>