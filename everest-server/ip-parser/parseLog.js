const geoip = require('fast-geoip')
const fs = require('fs')

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.log('Usage: node parseLog.js <ipFile>')
  console.log('Example: node parseLog.js ip.txt')
  process.exit(1)
}

const ipFile = args[0]

if (!fs.existsSync(ipFile)) {
  console.error(`IP file "${ipFile}" does not exist`)
  process.exit(1)
}

const ips = fs.readFileSync(ipFile, 'utf-8').trim().split('\n').filter(ip => ip.trim())

console.log(`Processing ${ips.length} IP addresses...`)

const results = []
const cityCounts = {}

ips.forEach(ip => {
  const geo = geoip.lookup(ip)
  
  if (geo) {
    const city = geo.city || 'Unknown'
    const country = geo.country || 'Unknown'
    const lat = geo.ll ? geo.ll[0] : null
    const lon = geo.ll ? geo.ll[1] : null
    
    if (!cityCounts[city]) {
      cityCounts[city] = {
        count: 0,
        lat: lat,
        lon: lon,
        country: country
      }
    }
    cityCounts[city].count++
  }
})

// Convert to array and sort by count descending
const sortedResults = Object.entries(cityCounts)
  .map(([name, data]) => ({
    name,
    count: data.count,
    lat: data.lat,
    lon: data.lon,
    country: data.country
  }))
  .sort((a, b) => b.count - a.count)

console.log('\nResults (sorted by count):')
sortedResults.forEach(result => {
  console.log(`${result.name}: ${result.count} (Country: ${result.country}, Lat: ${result.lat}, Lon: ${result.lon})`)
})

// Save to output.json
fs.writeFileSync('output.json', JSON.stringify(sortedResults, null, 2))
console.log('\nResults saved to output.json')
