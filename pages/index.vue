<script setup lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';

import { useLayout } from '@/layouts/composables/layout';
import { ProductService } from '@/service/ProductService';
import { CountryService } from '@/service/CountryService';
import { onMounted, reactive, ref, watch } from 'vue';
import { useFuse } from '@vueuse/integrations/useFuse';
import { useApiCrud } from '@/src/vue-bvgels/composables/useApiCrud';
import { usePaginatedFetch } from '@/src/vue-bvgels/composables/usePaginatedFetch';

const { isDarkTheme } = useLayout();
definePageMeta({
    middleware: 'auth'
});

interface TodoItem {
    description: string;
    book: string;
    done: boolean;
    editing?: boolean;
}

const filters = ref({
    description: { value: '', matchMode: FilterMatchMode.CONTAINS },
    book: { value: '', matchMode: FilterMatchMode.CONTAINS }
});

const { transformedData, first, rows, totalRecords, loading, fetchItems, onPageChange } = usePaginatedFetch('todo', filters);

const { data } = useAuth();
const products = ref(null);

const countries = ref();
const filteredBooks = ref([]);
const books = ref([]);

const todoDescription = ref('');
const selectedBook = ref();

const lineOptions = ref(null);
onMounted(() => {
    ProductService.getProductsSmall().then((data) => (products.value = data));
    CountryService.getCountries().then((data) => (countries.value = data));
});

const { save, fetchItem, item, saving, serverError } = useApiCrud('todo');

const isCaseSensitive = ref(false);
const matchAllWhenSearchEmpty = ref(true);

const options = computed<UseFuseOptions<DataItem>>(() => ({
    fuseOptions: {
        keys: ['title'],
        isCaseSensitive: isCaseSensitive.value,
        threshold: 0.4
    },
    // resultLimit: resultLimit.value,
    matchAllWhenSearchEmpty: matchAllWhenSearchEmpty.value
}));

const { results } = useFuse(books, options);

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

// Add todo item when Enter is pressed
const addTodo = async () => {
    if (todoDescription.value.trim() && selectedBook.value) {
        const newTodo = {
            description: todoDescription.value + " - ",
            book: "Book: " + selectedBook.value.title,
            done: false,
            user: data.value.id
        };

        try {
            await save(newTodo, false);
            await fetchItems();
        } catch (err) {
            console.error('err saving todo: ', err);
        }
    }

    // Clear input fields after adding
    todoDescription.value = '';
    selectedBook.value = null;
};

const removeTodo = (index: number, item: object) => {
    transformedData.value.splice(index, 1);
    save(item);
};

const strikeTodo = (index: number, item: object) => {
    transformedData.value[index].done = !transformedData.value[index].done;
    save(item);
};

const startEditing = (todo: TodoItem) => {
    todo.editing = true;
};

const stopEditing = (todo: TodoItem) => {
    todo.editing = false;
};

const applyLightTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };
};

const applyDarkTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#ebedef'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            },
            y: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            }
        }
    };
};

watch(
    isDarkTheme,
    (val) => {
        if (val) {
            applyDarkTheme();
        } else {
            applyLightTheme();
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="container">
        <div class="grid p-fluid">
            <div class="col-12">
                <div class="card mb-0">
                    <h5>Search a book</h5>
                    <AutoComplete v-model="selectedBook" optionLabel="title" :suggestions="filteredBooks" @complete="searchBooks" class="w-full" dropdown>
                        <template #option="slotProps">
                            <div class="flex align-options-center">
                                <div>{{ slotProps.option.title }} - {{ slotProps.option.author }}</div>
                            </div>
                        </template>
                    </AutoComplete>
                </div>
                <div class="card mt-2">
                    <h5>Enter your Todo</h5>
                    <InputText v-model="todoDescription" placeholder="Describe your todo..." class="w-full" @keyup.enter="addTodo" />
                </div>
                <div class="card mt-3">
                    <h5>To-Do List</h5>
                    <ul class="todo-list">
                        <li v-for="(todo, index) in transformedData" :key="todo.id" class="todo-item">
                            <div class="todo-content">
                                <span v-if="todo.done">
                                    <strike>{{ todo.description }} {{ todo.book }}</strike>
                                </span>
                                <span v-else>{{ todo.description }} {{ todo.book }}</span>
                                <!-- Button Group on the Right Side -->
                                <div class="button-group">
                                    <Button v-if="!todo.done" @click="strikeTodo(index, todo)" class="small-button" label="Done" severity="success" size="small" aria-label="Done" rounded />
                                    <Button v-else-if="todo.done" @click="strikeTodo(index, todo)" class="small-button" label="Reopen" severity="info" size="small" aria-label="Reopen" rounded />
                                    <Button @click="removeTodo(index, todo)" class="small-button" label="Remove" severity="danger" size="small" aria-label="Remove" rounded />
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.small-button {
    padding: 0.25rem 0.5rem; /* Adjust padding for smaller size */
    font-size: 0.8rem; /* Adjust font size if needed */
    border-radius: 8px; /* Customize border radius */
    max-width: 70px;
}

.card {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.todo-list {
    list-style-type: none;
    padding: 0;
}

.todo-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.todo-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-grow: 1;
}

.todo-text {
    cursor: pointer;
}

.button-group {
    display: flex;
    gap: 5px;
    margin-left: auto;
}

.edit-input {
    width: 100%;
}
</style>
