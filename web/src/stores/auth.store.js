import { defineStore } from 'pinia';
import { fetchWrapper } from 'src/helpers/fetch-wrapper';
import { useAlertStore } from 'src/stores/alert.store';
import router from 'src/router';

const baseUrl = `${process.env.MY_API}`;


export const useAuthStore = defineStore('auth', {
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null
  }),
  actions: {
    async login(username, password) {
      try {
        await fetchWrapper.post(`${baseUrl}/login`, {
          username: username, 
          password: password 
        });
        const user = {
          username: username
        };

        // update pinia state
        this.user = user

        // store user details and jwt in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));

        // redirect to previous url or default to home page
        // router.push(this.returnUrl || '/');
        router.push('/');
        
      } catch (err) {
        // const alertStore = useAlertStore();
        // alertStore.error(error);
        console.log(err)
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
      router.push('/login')
    }
  }
});