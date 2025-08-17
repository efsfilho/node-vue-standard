<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="$q.screen.lt.sm?{'width': '80%'}:{'width':'30%'}">
          <q-card-section>
            <q-avatar size="103px" class="absolute-center shadow-10">
              <img src="profile.svg">
            </q-avatar>
          </q-card-section>
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">
                Log in
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form
              @submit="sendAuth"
              class="q-gutter-md"
            >
              <q-input
                filled
                v-model="username"
                label="Username"
                lazy-rules
              />

              <q-input
                type="password"
                filled
                v-model="password"
                label="Password"
                lazy-rules

              />

              <div>
                <q-btn label="Login" type="submit" color="primary"/>
              </div>
            </q-form>
          </q-card-section>

          <q-popup-proxy v-if="showError" v-model="showError" transition-show="flip-up" transition-hide="flip-down">
            <q-banner class="bg-red text-white">
              {{ errorMessage }}
            </q-banner>
          </q-popup-proxy>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, defineComponent } from 'vue'
import { useAuthStore } from 'src/stores/auth.store'
const username = ref('')
const password = ref('')
const showError = ref(false)
const errorMessage = ref('')

const sendAuth = async () => {
  const authStore = useAuthStore();
  try {
    await authStore.login(username.value, password.value);
  } catch (error) {
    console.log(error)
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 1500);
    errorMessage.value = error
  }
}
</script>

<style>

.bg-image {
  background-image: linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%);
}
</style>
