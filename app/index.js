const fs = require('fs')

const csvUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/01-01-2021.csv"

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
    return item.split(',')
  })

  const headers = arr[0]
  const body = arr.slice(1, -1)

  const result = makeEntriesArray(headers, body).map(entry => {
    return Object.fromEntries(entry)
  })

  return result
}

function startApp(text) {
  const obj = textToObject(text)
  console.log(obj)
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
