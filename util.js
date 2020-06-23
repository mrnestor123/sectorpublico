//const API = 'https://public.digitalvalue.es:8868/v2';
const API = 'https://public.digitalvalue.es:8869/v2';

function api_get(url, method = 'GET', data = {}) {
  return m
    .request({
      method: method,
      url: url,
      withCredentials: true,
      body: data,
      extract: nonJsonErrors,
    })
    .then((res) => {
      return res;
    })
    .catch((e) => {
      // Entra cuando los código de respuesta del servidor son distintos de 2xx y 304 (https://mithril.js.org/request.html)
      if (e.remote) e.response.remote = e.remote;
      return e.response;
    });
}

export { api_get }




