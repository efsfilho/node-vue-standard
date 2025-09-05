<template>
  <q-page class="q-pa-sm">
    <q-btn :loading="isLoading" color="secondary" @click="refetch" label="Update" />
    <q-table
      title="Treats"
      :loading="isLoading"
      :rows="rows"
      :columns="columns"
      row-key="name"
    />
    <!-- <q-toggle v-model="isLoading" label="Loading state" class="q-mb-md" />
    <q-table
      flat bordered
      title="Treats"
      :rows="rows"
      :columns="columns"
      color="primary"
      row-key="name"
      :loading="isLoading"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table> -->
  </q-page>
</template>

<script setup>
// import { QToggle } from 'quasar';
// import { QTable } from 'quasar';
// import { QInnerLoading } from 'quasar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref, watch } from 'vue';
import { fetchWrapper } from 'src/helpers/fetch-wrapper';
import notify from 'src/helpers/notify';

const rows = ref([])
const queryClient = useQueryClient()
const { isLoading, isSuccess, isPending, isError, isFetching, data, error, refetch } = useQuery({
  queryKey: ['rents'],
  queryFn: async() => {
    try {
      let data = await fetchWrapper.get('/a/1')
      rows.value = data ? data: []
      return rows.value
    } catch (err) {
      throw new Error(err)
    }
  },
  throwOnError: (err) => {
    notify('error', err)
    console.log(err)
  }
}, queryClient);

// postId	1
// id	1
// name	"id labore ex et quam laborum"
// email	"Eliseo@gardner.biz"
// body	"laudant

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Id',
    align: 'left',
    field: 'id',
    // field: row => row.name,
    // format: val => `${val}`,
    // sortable: true
  },
  // { name: 'postId', align: 'left', label: 'postId', field: 'postId', sortable: true },
  { name: 'carbs', align: 'left',label: 'email', field: 'email' },
  { name: 'fat', align: 'left', label: 'name', field: 'name', sortable: true },
  { name: 'protein', align: 'left',label: 'Protein (g)', field: 'body' },
  // { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
  // { name: 'calcium', label: 'Calcium (%)', field: 'calcium', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
  // { name: 'iron', label: 'Iron (%)', field: 'iron', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
]

// const rows = [
//   {
//     name: 'Frozen Yogurt',
//     calories: 159,
//     fat: 6.0,
//     carbs: 24,
//     protein: 4.0,
//     sodium: 87,
//     calcium: '14%',
//     iron: '1%'
//   },
//   {
//     name: 'Ice cream sandwich',
//     calories: 237,
//     fat: 9.0,
//     carbs: 37,
//     protein: 4.3,
//     sodium: 129,
//     calcium: '8%',
//     iron: '1%'
//   },
//   {
//     name: 'Eclair',
//     calories: 262,
//     fat: 16.0,
//     carbs: 23,
//     protein: 6.0,
//     sodium: 337,
//     calcium: '6%',
//     iron: '7%'
//   },
//   {
//     name: 'Cupcake',
//     calories: 305,
//     fat: 3.7,
//     carbs: 67,
//     protein: 4.3,
//     sodium: 413,
//     calcium: '3%',
//     iron: '8%'
//   },
//   {
//     name: 'Gingerbread',
//     calories: 356,
//     fat: 16.0,
//     carbs: 49,
//     protein: 3.9,
//     sodium: 327,
//     calcium: '7%',
//     iron: '16%'
//   },
//   {
//     name: 'Jelly bean',
//     calories: 375,
//     fat: 0.0,
//     carbs: 94,
//     protein: 0.0,
//     sodium: 50,
//     calcium: '0%',
//     iron: '0%'
//   },
//   {
//     name: 'Lollipop',
//     calories: 392,
//     fat: 0.2,
//     carbs: 98,
//     protein: 0,
//     sodium: 38,
//     calcium: '0%',
//     iron: '2%'
//   },
//   {
//     name: 'Honeycomb',
//     calories: 408,
//     fat: 3.2,
//     carbs: 87,
//     protein: 6.5,
//     sodium: 562,
//     calcium: '0%',
//     iron: '45%'
//   },
//   {
//     name: 'Donut',
//     calories: 452,
//     fat: 25.0,
//     carbs: 51,
//     protein: 4.9,
//     sodium: 326,
//     calcium: '2%',
//     iron: '22%'
//   },
//   {
//     name: 'KitKat',
//     calories: 518,
//     fat: 26.0,
//     carbs: 65,
//     protein: 7,
//     sodium: 54,
//     calcium: '12%',
//     iron: '6%'
//   }
// ]
</script>
