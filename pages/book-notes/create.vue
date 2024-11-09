<script lang="ts" setup>
import FormPage from '@/src/apps/book_notes/NoteForm.vue';

definePageMeta({
    middleware: ['auth']
});
</script>

<template>
    <FormPage />
</template>

<style></style>
