<script setup lang="ts">
import { useLayout } from '@/layouts/composables/layout';
import { ProductService } from '@/service/ProductService';
import { CountryService } from '@/service/CountryService';
import { onMounted, reactive, ref, watch } from 'vue';
const { isDarkTheme } = useLayout();
// definePageMeta({
//     middleware: 'auth'
// });
const products = ref(null);
const lineData = reactive({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4
        },
        {
            label: 'Second Dataset',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
});
const countries = ref();
const filteredBooks = ref([]);
const books = ref([]);

const filteredCountries = ref();
const selectedCountry = ref();
const selectedBook = ref();
const items = ref([
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-minus' }
]);
const lineOptions = ref(null);

onMounted(() => {
    ProductService.getProductsSmall().then((data) => (products.value = data));
    CountryService.getCountries().then((data) => (countries.value = data));
});

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const searchCountry = (event) => {
    console.log('event: ', event.query);
    setTimeout(() => {
        if (!event.query.trim().length) {
            filteredCountries.value = [...countries.value];
        } else {
            filteredCountries.value = countries.value.filter((country) => {
                return country.name.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }
    }, 250);
};

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
                        year: book.first_publish_year || 'Unknown Year',
                        lccn: book.lccn || 'Unknown LCCN',
                        oclc: book.oclc || 'Unknown OCLC'
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
    <div class="flex justify-content-center align-items-center">
        <div class="grid p-fluid">
            <div class="col-12 md:col-12 lg:col-12">
                <div class="card mb-0">
                    <h5>Search a book</h5>
                    <AutoComplete v-model="selectedBook" optionLabel="title" :suggestions="filteredBooks" @complete="searchBooks" class="w-full" dropdown />
                </div>
            </div>
        </div>
    </div>
</template>
