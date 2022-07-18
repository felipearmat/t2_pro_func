const fs = require('fs')

const csvUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/01-01-2021.csv"

function compare(a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

// Função reverse que preserva os valores do array original
function reverse(array) {
  return [...array].reverse()
}

// Função sortBy que preserva os valores do array original
function sortBy(array, key) {
  return [...array].sort((value_a, value_b) => {
    const a = Number(value_a[key])
    const b = Number(value_b[key])
    return compare(a, b)
  })
}

// Função sort que preserva os valores do array original
function sort(array) {
  return [...array].sort()
}

function bottomConfirmed(array, qnt = 1) {
  return sortBy(array, 'Confirmed').slice(0, qnt)
}

function topActive(array, qnt = 1) {
  return reverse(sortBy(array, 'Active')).slice(0, qnt)
}

function topConfirmed(array, qnt = 1) {
  return reverse(sortBy(array, 'Confirmed')).slice(0, qnt)
}

function topDeaths(array, qnt = 1) {
  return reverse(sortBy(array, 'Deaths')).slice(0, qnt)
}

function makeEntriesArray(headers, body) {
  return body.map(value => {
    return value.map((item, index) => {
      return [headers[index], item]
    })
  })
}

function textToObject(text) {
  const textArr = text.split('\n')

  const arr = textArr.map(item => {
    // Quebra strings nas vírgulas, exceto quando circundadas por aspas duplas
    return item.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
  })

  const headers = arr[0]
  const body = arr.slice(1)

  const result = makeEntriesArray(headers, body).map(entry => {
    return Object.fromEntries(entry)
  })

  // O ultimo item do array acaba sempre sendo invalido
  return result.slice(0, -1)
}

function readFromUrl(url) {
  fetch(url).then(r => {
    r.text().then(t => {
      startApp(t)
    })
  })
}

function readFromFile(file) {
  return fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.log(err)
      return
    }
    startApp(data.toString())
  })
}

function resp1(object) {
  const resp = topConfirmed(object, 3).map(item => {
    if (item['Province_State']) {
      return item['Province_State'] + ' (' + item['Country_Region'] + ')'
    }
    return item['Country_Region']
  })
  return sort(resp)
}

function resp2(object) {
  const active = topActive(object, 10)
  const confirmed = bottomConfirmed(active, 5)
  return confirmed.reduce((acc, item) => {
    return acc + Number(item['Deaths'])
  }, 0)
}

function resp3(object) {
  const filtered = object.filter(item => {
    return Number(item['Lat']) < 0;
  })
  return topDeaths(filtered)[0]['Deaths']
}

function resp4(object) {
  const filtered = object.filter(item => {
    return Number(item['Lat']) > 0;
  })
  return topDeaths(filtered)[0]['Deaths']
}

function resp5(object) {
  const filtered = object.filter(item => {
    return Number(item['Confirmed']) >= 1000000;
  })
  return filtered.reduce((acc, item) => {
    return acc + Number(item['Active'])
  }, 0)
}

function startApp(text) {
  const obj = textToObject(text)

  console.log(`\n- As cidades com mais confirmações: ${resp1(obj)}`)
  console.log(`\n- Dentre os dez países com maiores valores de "Active", a soma dos "Deaths" dos cinco países com menores valres de "Confirmed": ${resp2(obj)}`)
  console.log(`\n- O maior valor de "Deaths" entre os países do hemisfério sul: ${resp3(obj)}`)
  console.log(`\n- O maior valor de "Deaths" entre os países do hemisfério norte: ${resp4(obj)}`)
  console.log(`\n- A soma de "Active" de todos os países em que "Confirmed" é maior o igual que 1.000.000: ${resp5(obj)}`)
  console.log("\n")
}

function main() {
  const target = process.argv[2] || csvUrl

  if (target !== csvUrl) {
    readFromFile(target)
  } else {
    readFromUrl(target)
  }
}

main()
