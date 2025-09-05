import { useAuthStore } from 'src/stores/auth.store';

// const authHeader = (url) => {
//   // return auth header with jwt if user is logged in and request is to the api url
//   const { user } = useAuthStore();
//   const isLoggedIn = !!user?.token;
//   const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);
//   if (isLoggedIn && isApiUrl) {
//     return { Authorization: `Bearer ${user.token}` };
//   } else {
//     return {};
//   }
// }

const handleResponse = async (res) => {
  try {
    const isJson = res.headers?.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;
    if (res.redirected && data.page === "/login") {
      const { user, logout } = useAuthStore();
      logout()
    }
    // check for error response
    if (!res.ok) {
      const { user, logout } = useAuthStore();
      // auto logout if 401 Unauthorized
      if ([401].includes(res.status)) {
        logout();
      }

      if (res.status === 403) {
        return Promise.reject('Access denied!');
      }
      // get error message from body or default to res status
      const error = (data && data.detail) || res.status;
      return Promise.reject(error);
    }
    return data;
  } catch (err) {
    Promise.reject(err)
  }
}

const request = (method) => {
  return (url, body) => {
    let requestOptions = {
      method,
      mode: "cors",
      credentials: "include",
      // headers: authHeader(url)
      headers: {}
    };
    if (body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }
    return fetch(`${process.env.VUE_APP_API+url}`, requestOptions)
      .then(handleResponse)
  }
}

// helper functions
export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    patch: request('PATCH'),
    put: request('PUT'),
    delete: request('DELETE')
};
