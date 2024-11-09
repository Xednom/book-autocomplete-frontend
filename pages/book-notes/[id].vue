<script lang="ts" setup>
import { computed, ref } from 'vue';
import FormPage from '@/src/apps/book_notes/NoteForm.vue';

const route = useRouter().currentRoute.value;

const id = route.params.id;

definePageMeta({
    middleware: ['auth']
});

const create = ref(false);

computed(() => {
    if (!id) {
        create.value = true;
    } else {
        create.value = false;
    }
});
</script>

<template>
    <div v-if="id">
        <FormPage :id="id" :create="create" />
    </div>
</template>

<style></style>
