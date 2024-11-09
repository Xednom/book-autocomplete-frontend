<script lang="ts" setup>
import { toRefs, onMounted, onUnmounted, ref, toRaw, nextTick, onBeforeUnmount, computed, watch } from 'vue';
import { useApiCrud } from '../../vue-bvgels/composables/useApiCrud';
import { useRestStore } from '../../vue-bvgels/stores/restModule';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';

import BInputText from '@/src/vue-bvgels/components/uikit/fields/BInputText.vue';
import BTextArea from '@/src/vue-bvgels/components/uikit/fields/BTextArea.vue';
import VCalendar from '@/src/vue-bvgels/components/uikit/fields/VCalendar.vue';
import BDateTime from '@/src/vue-bvgels/components/uikit/fields/BDateTime.vue';
import BBoolean from '@/src/vue-bvgels/components/uikit/fields/BBoolean.vue';
import BSelect from '@/src/vue-bvgels/components/uikit/fields/BSelect.vue';
import EditableDataTable from '@/src/vue-bvgels/components/uikit/table/EditableDataTable.vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import moment from 'moment';

const selectedBook = ref();
const filteredBooks = ref([]);
const books = ref([]);
const toast = useToast();
const store = useRestStore();
const { save, fetchItem, item, saving, loading, serverError } = useApiCrud('meeting');
const props = defineProps({
    id: {
        type: [String, Number],
        required: true
    },
    create: {
        type: Boolean,
        default: true
    }
});

const model = defineModel();
const responseError = ref<object>({});
const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
};
const formatDateTime = (date) => {
    return moment(date).format('YYYY-MM-DD HH:mm');
};

const fields = ref([
    { id: 0, name: 'name', type: 'text', placeholder: 'Name' },
    { id: 0, name: 'description', type: 'text', placeholder: 'Description' }
]);

const searchBooks = (event) => {
    const query = event.query.trim();

    if (!query.length) {
        filteredBooks.value = [...books.value];
    } else {
        setTimeout(async () => {
            try {
                const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();

                    filteredBooks.value = data.docs.map((book) => ({
                        title: book.title || 'Unknown Title',
                        author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
                        year: book.first_publish_year || 'Unknown Year'
                        // lccn: book.lccn || 'Unknown LCCN',
                        // oclc: book.oclc || 'Unknown OCLC'
                    }));
                    books.value = filteredBooks.value;
                } else {
                    console.error('Error fetching books:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        }, 250);
    }
};

const onBookChange = () => {
    if (typeof selectedBook.value === 'object') {
        item.value.book = selectedBook.value.title; // Assign selected book to item.book
    }
    if (item.value.id) {
        item.value.book = selectedBook.value.title;
    }
};

function bookSelected() {
    console.info('item id: ', item);
    if (item.value.id) {
        selectedBook.value = item.book;
    }
}

watch(
    () => item.value.date_field,
    (newVal) => {
        item.value.date_field = formatDate(newVal);
    },
    { immediate: true }
);

watch(
    () => item.value.datetime_field,
    (newVal) => {
        item.value.datetime_field = formatDateTime(newVal);
    },
    { immediate: true }
);

watch(
    serverError,
    (newVal) => {
        responseError.value = newVal;
    },
    { immediate: true }
);

onMounted(() => {
    if (!props.create) {
        nextTick(async () => {
            store.loading = false;
            fetchItem(props.id);
            if (item.value.id && item.value.book) {
                selectedBook.value = { title: item.value.book }; // Initialize selectedBook based on item.book
            }
        });
    }
});

onBeforeUnmount(() => {
    serverError.data = {};
    serverError.data = null;
});

onUnmounted(() => {
    serverError.data = null;
    serverError.data = {};
});

const mode = computed(() => {
    return item.value.id ? 'Edit' : 'Create';
});
computed(bookSelected);
</script>

<template>
    <div class="grid">
        <div className="col-12">
            <Card class="card">
                <template #title>{{ mode }} Meeting</template>
                <template #content>
                    <div class="col-12">
                        <div>
                            <div class="p-fluid formgrid grid">
                                <div v-if="!item.id" class="field col-12 md:col-12">
                                    <h5>Search a book {{ item.book }}</h5>
                                    <AutoComplete v-model="selectedBook" optionLabel="title" :suggestions="filteredBooks" @complete="searchBooks" @change="onBookChange" class="w-full" dropdown>
                                        <template #option="slotProps">
                                            <div class="flex align-options-center">
                                                <div>{{ slotProps.option.title }} - {{ slotProps.option.author }}</div>
                                            </div>
                                        </template>
                                    </AutoComplete>
                                </div>
                                <div v-else class="field col-12 md:col-12">
                                    <BInputText v-model="item.book" type="text" :model-value="item.book" :server-error="responseError" :loading="loading" label="Book" field="book" />
                                </div>
                            </div>
                            <div class="p-fluid formgrid grid">
                                <div class="field col-12">
                                    <BTextArea v-model="item.description" :model-value="item.description" :server-error="responseError" :loading="loading" label="Description" field="description" />
                                </div>
                            </div>
                            <div class="p-fluid formgrid grid">
                                <div class="field col-12 md:col-6">
                                    <div>
                                        <BDateTime v-model="item.start_time" :server-error="responseError" label="Start time" field="start_time" showTime> </BDateTime>
                                    </div>
                                </div>
                                <div class="field col-12 md:col-6">
                                    <BInputText v-model="item.duration" type="text" :model-value="item.duration" :server-error="responseError" :loading="loading" label="Duration" field="duration" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- </div> -->
                    <Toolbar>
                        <template v-slot:start>
                            <Toast />
                            <Button v-if="!saving" label="Save" icon="pi pi-check" class="p-button-success mr-2" @click="save(item, true)" />
                            <Button v-else-if="saving" label="Saving.." icon="pi pi-spin pi-spinner" class="p-button-success mr-2" disabled />
                            <NuxtLink :to="`/meeting/`">
                                <Button label="Close" icon="pi pi-times" class="p-button-danger" />
                            </NuxtLink>
                        </template>
                    </Toolbar>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
.card {
    max-width: 100vh;
    margin: 0 auto;
    padding: 20px;
}
</style>
