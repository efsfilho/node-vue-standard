<script setup>
import { storeToRefs } from 'pinia';

import { useAlertStore } from 'src/stores/alert.store';

const alertStore = useAlertStore();
const { alert } = storeToRefs(alertStore);
</script>

<template>
  <div v-if="alert" class="container">
    <div class="m-3">
      <div class="alert alert-dismissable" :class="alert.type">
        <button @click="alertStore.clear()" class="btn btn-link close">×</button>
        {{alert.message}}
      </div>
    </div>
  </div>
</template>