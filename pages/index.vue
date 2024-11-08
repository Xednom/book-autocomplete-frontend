<script setup lang="ts">
import { useLayout } from '@/layouts/composables/layout';
import { ProductService } from '@/service/ProductService';
import { CountryService } from '@/service/CountryService';
import { onMounted, reactive, ref, watch } from 'vue';
import { useFuse } from '@vueuse/integrations/useFuse';
import { useAnonApiCrud } from '@/src/vue-bvgels/composables/useAnonApiCrud';

const { isDarkTheme } = useLayout();
// definePageMeta({
//     middleware: 'auth'
// });

interface TodoItem {
    description: string;
    book: string;
    done: boolean;
    editing?: boolean;
}
const products = ref(null);

const countries = ref();
const filteredBooks = ref([]);
const books = ref([]);

const selectedBook = ref();

const todoList = ref<TodoItem[]>([
    { description: 'Read chapter 1', book: 'Book A', done: false, editing: false },
    { description: 'Review notes', book: 'Book B', done: true, editing: false }
]);
const lineOptions = ref(null);
const striked = ref(false);
const columns = ref([
    { field: 'description', header: 'Description' },
    { field: 'book', header: 'Book' }
]);

onMounted(() => {
    ProductService.getProductsSmall().then((data) => (products.value = data));
    CountryService.getCountries().then((data) => (countries.value = data));
});

const { save, fetchItem, item, saving, loading, serverError } = useAnonApiCrud('todo');

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
    console.log('event: ', event);

    if (!query.length) {
        filteredBooks.value = [...books.value];
    } else {
        setTimeout(async () => {
            try {
                const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`);
                console.log('Response: ', response);
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
const addTodo = () => {
    if (typeof selectedBook.value === 'object' && selectedBook.value != null) {
        console.log('selectedBook.value ? selectedBook.value.title : null: ', selectedBook.value.title);
        todoList.value.push({
            description: 'read later',
            book: selectedBook.value.title,
            done: false
        });
        // save(...todoList.value);
    }

    // Clear input fields after adding

    selectedBook.value = null;
};

const removeTodo = (index) => {
    todoList.value.splice(index, 1);
};

const strikeTodo = (index: number) => {
    todoList.value[index].done = !todoList.value[index].done;
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
watch(selectedBook, (val) => {
    if (typeof selectedBook.value === 'object') {
        addTodo();
    }
});

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
                <div class="card mt-3">
                    <h5>To-Do List</h5>
                    <ul class="todo-list">
                        <li v-for="(todo, index) in todoList" :key="index" class="todo-item">
                            <div class="todo-content">
                                <span v-if="!todo.editing">
                                    <span v-if="todo.done" class="todo-text" @click="startEditing(todo)">
                                        <strike>{{ todo.description }} - {{ todo.book }}</strike>
                                    </span>
                                    <span v-else class="todo-text" @click="startEditing(todo)"> {{ todo.description }} - {{ todo.book }} </span>
                                </span>
                                <InputText v-else v-model="todo.description" class="edit-input" @keyup.enter="stopEditing(todo)" @blur="stopEditing(todo)" />

                                <div class="button-group">
                                    <Button v-if="!todo.done" @click="strikeTodo(index)" class="small-button" label="Done" severity="warning" size="small" aria-label="Done" rounded />
                                    <Button v-else-if="todo.done" @click="strikeTodo(index)" class="small-button" label="Reopen" severity="info" size="small" aria-label="Reopen" rounded />
                                    <Button @click="removeTodo(index)" class="small-button" label="Remove" severity="danger" size="small" aria-label="Remove" rounded />
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
}

.edit-input {
    width: 100%;
}
</style>
