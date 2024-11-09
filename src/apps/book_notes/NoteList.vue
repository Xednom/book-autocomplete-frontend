<script lang="ts" setup>
import { ref, Ref, onMounted, reactive, watch } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
// import { usePaginatedFetch } from '../../../vue-bvgels/composables/usePaginatedFetch';
import { usePaginatedFetch } from '@/src/vue-bvgels/composables/usePaginatedFetch';

import { useToast } from 'primevue/usetoast';
// const transformedData = ref([{ results: [] }]);
const dt = ref();
const filters = ref({
    book: { value: '', matchMode: FilterMatchMode.CONTAINS },
    description: { value: '', matchMode: FilterMatchMode.CONTAINS },
    start_time: { value: '', matchMode: FilterMatchMode.DATE_IS },
    duration: { value: '', matchMode: FilterMatchMode.CONTAINS }
});

const { transformedData, first, rows, totalRecords, loading, fetchItems, onPageChange } = usePaginatedFetch('book-notes', filters);

const rowsPerPageItems = [5, 10, 50, 100];

const exportCSV = () => {
    dt.value.exportCSV();
};
// Handle filter event
const onFilter = () => {
    fetchItems(first.value / rows.value + 1, rows.value, filters.value);
};

const multiSortMeta = ref([]);

const onSort = (event: any) => {
    multiSortMeta.value = event.multiSortMeta;

    // Call fetchItems with the sortQuery
    fetchItems(first.value / rows.value + 1, rows.value, filters.value, multiSortMeta.value);
};
</script>

<template>
    <div className="grid">
        <div className="col-12">
            <div className="card">
                <h3>Manage Book Notes</h3>
                <div class="card">
                    <Toolbar class="mb-4">
                        <template #start>
                            <NuxtLink to="/book-notes/create">
                                <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" />
                            </NuxtLink>
                        </template>

                        <template #end>
                            <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                        </template>
                    </Toolbar>
                    <DataTable
                        :value="transformedData"
                        lazy
                        :first="first"
                        :rows="rows"
                        v-model:filters="filters"
                        ref="dt"
                        dataKey="id"
                        :totalRecords="totalRecords"
                        filterDisplay="row"
                        :globalFilterFields="['book', 'description', 'start_date', 'duration']"
                        :loading="loading"
                        @filter="onFilter"
                        @sort="onSort"
                        tableStyle="min-width: 75rem"
                        sortMode="multiple"
                    >
                        <Column headerStyle="width: 3rem"></Column>
                        <template #loading> Loading demo data. Please wait. </template>
                        <Column field="book" header="Book" filterMatchMode="startsWith" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                            <template #body="{ data }">
                                <NuxtLink :to="`/book-notes/${data.id}`">{{ data.book }}</NuxtLink>
                            </template>
                        </Column>
                        <Column field="description" header="Description" filterMatchMode="startsWith" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>
                        <Column field="start_time" header="Start time" filterMatchMode="contains" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <Calendar v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" showIcon iconDisplay="input" showTime hourFormat="24" />
                            </template>
                        </Column>
                        <Column field="duration" header="Duration" filterMatchMode="startsWith" sortable>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search" />
                            </template>
                        </Column>
                    </DataTable>
                    <Paginator
                        v-model:first="first"
                        :rows="rows"
                        :totalRecords="totalRecords"
                        :rowsPerPageOptions="rowsPerPageItems"
                        :currentPageReportTemplate="`Showing ${first + 1} to ${Math.min(first + rows, totalRecords)} of ${totalRecords} entries`"
                        @page="onPageChange"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
