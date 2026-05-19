console.log('script started');
const fs = require('fs');
const geoip = require('fast-geoip');

// Step 1: Read the IP log file
async function loadIPs(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line !== '');
    return lines;
}

// Step 2: Look up region for each IP
async function getGeoInfo(ip) {
    const geo = await geoip.lookup(ip);

    if (!geo) {
        return null;
    }

    return {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        lat: geo.ll[0],
        lon: geo.ll[1]
    };
}

// Step 3: Aggregate IPs by region
async function aggregateByRegion(ips) {
    const regionMap = {};

    for (const ip of ips) {
        const info = await getGeoInfo(ip);

        if (!info) continue;

        const key = info.city || info.region || info.country;

        if (!regionMap[key]) {
            regionMap[key] = {
                count: 0,
                lat: info.lat,
                lon: info.lon,
                country: info.country
            };
        }

        regionMap[key].count++;
    }

    return regionMap;
}

// Step 4: Print results in the terminal
function printResults(regionMap) {
    console.log('\n===== IP Aggregation by Region =====\n');

    const sorted = Object.entries(regionMap).sort((a, b) => b[1].count - a[1].count);

    for (const [region, data] of sorted) {
        console.log('  ' + region + ' (' + data.country + '): ' + data.count + ' IP(s)');
    }

    console.log('\n====================================');
}

// Step 5: Save results as a JSON file for the map
function saveJSON(regionMap) {
    const output = Object.entries(regionMap).map(([name, data]) => ({
        name: name,
        count: data.count,
        lat: data.lat,
        lon: data.lon,
        country: data.country
    }));

    fs.writeFileSync('output.json', JSON.stringify(output, null, 2), 'utf-8');
    console.log('\nSaved results to output.json');
}

// Main: Run everything
async function main() {
    const filepath = process.argv[2];

    if (!filepath) {
        console.log('Usage: node parseLog.js <ip-log-file.txt>');
        return;
    }

    if (!fs.existsSync(filepath)) {
        console.log("Error: File '" + filepath + "' not found.");
        return;
    }

    console.log('Reading IPs from: ' + filepath);
    const ips = await loadIPs(filepath);
    console.log('Found ' + ips.length + ' IPs. Looking up regions...');

    const regionMap = await aggregateByRegion(ips);

    printResults(regionMap);
    saveJSON(regionMap);
}

main();