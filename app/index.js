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

function topConfirmed(array, qnt = 1) {
  const sorted = array.sort((value_a, value_b) => {
    let a = Number(value_a['Confirmed'])
    let b = Number(value_b['Confirmed'])
    return compare(b, a)
  })

  return sorted.slice(0, qnt)
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
    return item.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
  })

  const headers = arr[0]
  const body = arr.slice(1)

  const result = makeEntriesArray(headers, body).map(entry => {
    return Object.fromEntries(entry)
  })

  return result
}

function startApp(text) {
  const obj = textToObject(text)
  console.log(topConfirmed(obj, 3))
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

function main() {
  let target = process.argv[2] || csvUrl

  if (target !== csvUrl) {
    readFromFile(target)
  } else {
    readFromUrl(target)
  }
}

main()
