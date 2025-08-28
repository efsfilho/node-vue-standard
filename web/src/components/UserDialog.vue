<template>
  <q-dialog v-model="show" persistent>
    <!-- <div class="" style="background-color: green;"> -->
    <div class="" >
      <div class="q-pb-sm col-lg-8 col-md-8 col-xs-12 col-sm-12" >
        <q-card class="no-shadow" bordered>
          <q-card-section class="text-h6">
            <div class="text-h6">{{ userId > 0 ? 'Edit Profile' : 'New'}}</div>             
          </q-card-section>
          <q-card-section class="q-pa-sm">
            <q-list class="row">
              <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-item-section>
                   <q-toggle v-model="userDetails.active" color="green" label="Active"/>
                </q-item-section>
              </q-item>
              <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input color="white" dense v-model="userDetails.username" label="Username"/>
                </q-item-section>
              </q-item>
              <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input color="white" dense v-model="userDetails.email" label="Email Address"/>
                </q-item-section>
              </q-item>
              <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input dense v-model="userDetails.name" label="Name"/>
                </q-item-section>
              </q-item>
              <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <q-item-section>
                   <q-checkbox :disable="true" dense v-model="level" label="Label on Right" />
                </q-item-section>
              </q-item>
              <q-item class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-item-section>
                  <q-input autogrow dense disable v-model="userDetails.createdAt" label="Created At"/>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn class="text-capitalize bg-info text-white">Update User Info</q-btn>
            <q-btn label="Alert" color="primary" @click="show = true" />
            <q-btn label="Cancel" color="secondary" @click="closeDialog" />
            <q-btn label="Save" color="primary" @click="saveChange" />
          </q-card-actions>

          <q-inner-loading :showing="isLoading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>

      <!-- PASSWORD -->
      <!-- <div class="col-lg-8 col-md-8 col-xs-12 col-sm-12">
        <q-card class="card-bg text-white no-shadow" bordered>
          <q-card-section class="text-h6 q-pa-sm">
            <div class="text-h6">Change Password</div>
          </q-card-section>
          <q-card-section class="q-pa-sm row">
            <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-item-section>
                Current Password
              </q-item-section>
            </q-item>
            <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input type="password" dark dense outlined color="white" round
                          v-model="password_dict.current_password"
                          label="Current Password"/>
              </q-item-section>
            </q-item>
            <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-item-section>
                New Password
              </q-item-section>
            </q-item>
            <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input type="password" dark dense outlined color="white" round v-model="password_dict.new_password"
                          label="New Password"/>
              </q-item-section>
            </q-item>
            <q-item class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-item-section>
                Confirm New Password
              </q-item-section>
            </q-item>
            <q-item class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
              <q-item-section>
                <q-input type="password" dark dense outlined round color="white"
                          v-model="password_dict.confirm_new_password"
                          label="Confirm New Password"/>
              </q-item-section>
            </q-item>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn class="text-capitalize bg-info text-white">Change Password</q-btn>
          </q-card-actions>

        </q-card>
      </div> -->
    </div>
  </q-dialog>
</template>
<style scoped>

.card-bg {
  background-color: #162b4d;
}
</style>

<script setup>
import { ref, watchEffect } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchWrapper } from 'src/helpers/fetch-wrapper'

const { userId = 0, open } = defineProps(['userId', 'open'])
const emit = defineEmits(['close'])
const show = ref(true)
const userDetails = ref({})
// const password_dict = ref({})
const level = ref(false)
const closeDialog = () => {
  emit('close')
  show.value = false
}

// Load info
const { isLoading, data , error } = useQuery({
  queryKey: ['user', userId],
  queryFn: async () => {
    try {
      if (userId > 0) {
        return await fetchWrapper.get(`/users/${userId}`)
      } else {
        return {}
      }
    } catch (err) {
      throw new Error(err)
    }
  },
  throwOnError: (err) => console.log(err)
})

watchEffect(async () => {
  userDetails.value = {...data.value}
})


// Save info
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: async (data) => await fetchWrapper.post(`/users`, data),
})

const updateMutation = useMutation({
  mutationFn: async (data) => await fetchWrapper.patch(`/users/${userId}`, data),
})

const mutationOptions = {
  onSuccess: async () => {
    await queryClient.refetchQueries({ queryKey: ['users'] })
    closeDialog()
  },
  // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
}

const saveChange = async () => {
  if (userId > 0) {
    const baseUser = data.value
    const editedUser = userDetails.value
    let changesToSave = {}
    for await (const key of Object.keys(baseUser)) {
      if (baseUser[key] !== editedUser[key]) {
        Object.assign(changesToSave, { [key]: editedUser[key] })
      }
    }
    updateMutation.mutate(changesToSave, mutationOptions)
  } else {
    // New user
    createMutation.mutate({
      password: 'testeteste',
      ...userDetails.value
    }, mutationOptions)
  }
} 


</script>