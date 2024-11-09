<script lang="ts" setup>
import ListPage from '@/src/apps/meeting/MeetingList.vue';

definePageMeta({
    middleware: ['auth']
});
</script>

<template>
    <ListPage></ListPage>
</template>

<style></style>
