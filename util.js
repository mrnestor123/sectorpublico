//const API = 'https://public.digitalvalue.es:8868/v2';
const API = 'https://sql.digitalvalue.es/sql/santcugatdelvalles/';
var nonJsonErrors = function (xhr) {
  //    var e =  xhr.status == 400 ? JSON.stringify(xhr.responseText) : xhr.responseText
  //    console.log("TYPE:",responseType, xhr.responseText)
  return JSON.parse(xhr.responseText);
};


function api_get(url, method = 'GET', data = {}) {
  return fetch(API + url, {
    method: method,
    mode: 'cors',
  })
    .then((res) => {
      return res.json();
    })
}


function api_get2(url, method = 'GET', data = {}) {
  return m
    .request({
      method: method,
      url: url,
      //      withCredentials: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
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

// formatea el número al formato alemán
function formatoNumero(numero) {
  let numFloat = parseFloat(numero, 10)
  return new Intl.NumberFormat("de-DE").format(numFloat)
}


//Dada una respuesta de la bd sacamos las listas de esa base de datos para poblar la gráfica.
//Una lista con lista labels,values y percentages
function getData(res) {
  var labels = [];
  var values = [];
  var total = 0;
  var percentages = [];

  res[0].data.map((element) => {
    //the data that is less than 1 million is not added to the chart
    if (element[2] > 1000000) {
      labels.push(element[1])
      values.push(element[2]);
    }
    labels.push()
    total += Number(element[2]);
  })
  values.map((element) => {
    percentages.push(Math.floor((element * 100) / total))
  })

  return [labels, values, percentages]
}

export { api_get, formatoNumero, getData }




