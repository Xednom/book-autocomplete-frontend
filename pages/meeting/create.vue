<script lang="ts" setup>
import FormPage from '@/src/apps/meeting/MeetingForm.vue';

definePageMeta({
    middleware: ['auth']
});
</script>

<template>
    <FormPage />
</template>

<style></style>
