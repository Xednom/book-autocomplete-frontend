<script lang="ts" setup>
import ListPage from '@/src/apps/book_notes/NoteList.vue';

definePageMeta({
    middleware: ['auth']
});
</script>

<template>
    <ListPage></ListPage>
</template>

<style></style>
