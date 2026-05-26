const fs    = require('fs');
const geoip = require('../node_modules/fast-geoip');

async function loadIPs(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    return content.split('\n').map(l => l.trim()).filter(l => l !== '');
}

async function aggregateByRegion(ips) {
    const regionMap = {};

    for (const ip of ips) {
        const geo = await geoip.lookup(ip);

        if (!geo) continue;

        const key = geo.city || geo.region || geo.country;

        if (!regionMap[key]) {
            regionMap[key] = {
                count:   0,
                lat:     geo.ll[0],
                lon:     geo.ll[1],
                country: geo.country
            };
        }

        regionMap[key].count++;
    }

    return regionMap;
}

async function main() {
    const filepath = process.argv[2];

    if (!filepath) {
        console.log('Usage: node parseLog.js <ip-file.txt>');
        return;
    }

    if (!fs.existsSync(filepath)) {
        console.log('Error: File not found: ' + filepath);
        return;
    }

    const ips = await loadIPs(filepath);
    console.log('Found ' + ips.length + ' IPs. Looking up regions...');

    const regionMap = await aggregateByRegion(ips);

    console.log('\n===== IP Aggregation by Region =====\n');
    const sorted = Object.entries(regionMap).sort((a, b) => b[1].count - a[1].count);
    for (const [region, data] of sorted) {
        console.log('  ' + region + ' (' + data.country + '): ' + data.count + ' IP(s)');
    }

    const output = sorted.map(([name, data]) => ({
        name:    name,
        count:   data.count,
        lat:     data.lat,
        lon:     data.lon,
        country: data.country
    }));

    fs.writeFileSync('output.json', JSON.stringify(output, null, 2), 'utf-8');
    console.log('\nSaved to output.json');
}

main();