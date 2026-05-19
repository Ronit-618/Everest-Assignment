const fs = require('fs');
const geoip = require('fast-geoip');


async function loadIPs(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');

    const lines = content.split('\n').map(line => line.trim()).filter(line => line !== '');

    return lines;
}

async function getRegion(ip) {
    const geo = await geoip.lookup(ip);

    if (!geo) {
        return 'Unknown';
    }

    return geo.country;
}


async function aggregateByRegion(ips) {
    const regionCount = {};

    for (const ip of ips) {
        const region = await getRegion(ip);

        if (!regionCount[region]) {
            regionCount[region] = 0;
        }

        regionCount[region]++;
    }

    return regionCount;
}


function printResults(regionCount) {
    console.log('\n===== IP Aggregation by Region =====\n');

    const sorted = Object.entries(regionCount).sort((a, b) => b[1] - a[1]);

    for (const [region, count] of sorted) {
        console.log(`  ${region}: ${count} IP(s)`);
    }

    console.log('\n====================================');
}


async function main() {
    const filepath = process.argv[2];

    if (!filepath) {
        console.log('Usage: node parseLog.js <ip-log-file.txt>');
        return;
    }

    if (!fs.existsSync(filepath)) {
        console.log(`Error: File '${filepath}' not found.`);
        return;
    }

    console.log(`Reading IPs from: ${filepath}`);
    const ips = await loadIPs(filepath);
    console.log(`Found ${ips.length} IPs. Looking up regions...`);

    const regionCount = await aggregateByRegion(ips);

    printResults(regionCount);
}

main();