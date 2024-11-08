<script setup lang="ts">
import { useLayout } from '@/layouts/composables/layout';
import { ProductService } from '@/service/ProductService';
import { CountryService } from '@/service/CountryService';
import { onMounted, reactive, ref, watch } from 'vue';
import { useFuse } from '@vueuse/integrations/useFuse';

const { isDarkTheme } = useLayout();
// definePageMeta({
//     middleware: 'auth'
// });
const products = ref(null);

const countries = ref();
const filteredBooks = ref([]);
const books = ref([]);

const selectedBook = ref();
const todoList = ref([]);
const items = ref([
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-minus' }
]);
const lineOptions = ref(null);

onMounted(() => {
    ProductService.getProductsSmall().then((data) => (products.value = data));
    CountryService.getCountries().then((data) => (countries.value = data));
});

const exactMatch = ref(false);
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
    const query = event.query.trim().toLowerCase();

    console.info('selectedBook and query: ', selectedBook, query);

    if (!query.length) {
        filteredBooks.value = [...books.value];
    } else {
        setTimeout(async () => {
            try {
                const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();

                    // Filter and map results to prioritize exact or popular titles
                    filteredBooks.value = data.docs
                        .filter((book) => book.title && book.title.toLowerCase().includes(query)) // Filter by query match
                        .map((book) => ({
                            title: book.title || 'Unknown Title',
                            author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
                            year: book.first_publish_year || 'Unknown Year',
                            lccn: book.lccn || 'Unknown LCCN',
                            oclc: book.oclc || 'Unknown OCLC'
                        }));

                    // Save the results for display
                    books.value = filteredBooks.value;
                    console.warn('filteredBooks: ', filteredBooks.value);
                    console.warn('Type of selectedBook: ', typeof selectedBook.value == 'object');
                    if (typeof selectedBook.value == 'object' && selectedBook.value != null) {
                        addTodo();
                    }
                } else {
                    console.error('Error fetching books:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        }, 3000);
    }
};

const addBookTodo = () => {
    if (selectedBook.value & !todoList.find((book) => book.title == selectedBook.value.title)) {
        todoList.push(...selectedBook.value);
        selectedBook.value = null; // clear selection after adding
    }
};

// Add todo item when Enter is pressed
const addTodo = () => {
    if (typeof selectedBook.value === 'object' && selectedBook.value != null) {
        todoList.value.push({
            description: 'read later',
            book: selectedBook.value ? { ...selectedBook.value } : null
        });
    }

    // Clear input fields after adding

    selectedBook.value = null;
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
    <div class="flex justify-content-center align-items-center">
        <div class="grid p-fluid">
            <div class="col-12 md:col-12 lg:col-12">
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
                    <ul>
                        <li v-for="(todo, index) in todoList" :key="index">
                            <span v-if="todo.book">{{ todo.description }} {{ todo.book.title }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
