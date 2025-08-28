<template>
  <q-page class="q-pa-sm">
    <user-dialog v-if=showDialog @close="closeDialog" :user-id="userId"></user-dialog>
    <!-- <user-dialog class="q-pa-sm justify-center" :user-id="23432"></user-dialog> -->
    <q-btn class="q-mb-sm" :loading="isFetching" color="secondary" @click="refetch" label="Update" />
    <q-btn class="q-ml-sm q-mb-sm" color="secondary" @click="rows = []" label="CLEAR" />
    <q-table
      title="Users"
      :loading="isFetching"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :filter="search"
    >
      <template v-slot:top-right>
        <!-- <q-checkbox class="q-mr-md" :disable="true" v-model="filter " label="Label on Right" /> -->
        <!-- <q-toggle class="q-mr-md" indeterminate-value="maybe" v-model="filter" label="Did you eat lunch today?" /> -->
        <q-toggle class="q-mr-md" toggle-indeterminate v-model="filter" left-label :label="filterStatus()" />
        <q-btn
          class="q-mr-md"
          color="primary"
          :disable="isFetching"
          label="Add"
          @click="openDialog(0)"
        />
        
        <q-input  dense debounce="300" color="primary" v-model="search" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" label="Please wait..."/>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn icon="edit" size="sm" @click="openDialog(props.key)" flat dense/>
          <q-btn icon="delete" size="sm" class="q-ml-sm" flat dense/>
        </q-td>
      </template>

    </q-table>

    <table-actions class="q-mt-lg"></table-actions>

  </q-page>
</template>

<script setup>
import UserDialog from 'src/components/UserDialog.vue';
import TableActions from 'src/components/tables/TableActions.vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { ref, watch } from 'vue';
import { fetchWrapper } from 'src/helpers/fetch-wrapper';

const rows = ref([])
const filter = ref(null)
const search = ref('')
const showDialog = ref(false)
const userId = ref(0)

const openDialog = (id) => {
  userId.value = id
  showDialog.value = true
}

const closeDialog = () => {
  userId.value = 0
  showDialog.value = false
}

const filterStatus = () => {
  if (filter.value === null) {
    return `all`
  } else {
    return filter.value ? 'true' : 'false'
  }
}

const fetchUsers = async () => {
  try {
    let data = await fetchWrapper.get('/users');
    if (filter.value !== null) {
      data = data.filter(e => e.active === filter.value)
    }
    rows.value = data ? data : []
    return rows.value
  } catch (err) {
    throw new Error(err)
  }
}

// Users
const { isFetching, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  throwOnError: (err) => console.log(err)
});

watch(filter, () => {
  refetch()
})

const columns = [
  { name: 'id', required: true, label: 'ID', align: 'left', field: row => row.id, sortable: true },
  { name: 'active', align: 'left', label: 'Active', field: 'active', sortable: true },
  { name: 'username', align: 'left', label: 'Username', field: 'username'},
  { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true},
  { name: 'email', align: 'left',label: 'Email', field: 'email',sortable: true },
  { name: 'createdAt', label: 'Created Date', field: 'createdAt' },
  { name: 'updatedAt', label: 'Last Update', field: 'updatedAt' },
  { name: 'action', label: '', field: '' },
]
</script>

<style>

</style>
