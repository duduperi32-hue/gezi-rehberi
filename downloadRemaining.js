const fs = require('fs');
const https = require('https');
const path = require('path');

const places = [
  { id: 'mikla', query: 'Fine_dining' },
  { id: 'hamdi', query: 'Kebab' },
  { id: 'balikci_sabahattin', query: 'Meze' },
  { id: 'balik_ekmek', query: 'Bal%C4%B1k_ekmek' },
  { id: 'kizilkayalar', query: 'Hamburger' },
  { id: 'durumzade', query: 'D%C3%BCr%C3%BCm' },
  { id: 'karadeniz_pide', query: 'Pide' },
  { id: 'borsam', query: 'Lahmacun' },
  { id: 'mandabatmaz', query: 'Turkish_coffee' },
  { id: 'kronotrop', query: 'Coffee_cup' },
  { id: 'pierre_loti_kafe', query: 'Turkish_tea' },
  { id: 'fazil_bey', query: 'Turkish_coffee' },
  { id: 'gulluoglu', query: 'Baklava' },
  { id: 'hafiz_mustafa', query: 'Turkish_delight' },
  { id: 'haci_bekir', query: 'Turkish_delight' },
  { id: 'saray_muhallebicisi', query: 'S%C3%BCtla%C3%A7' },
  { id: 'mado', query: 'Dondurma' }
];

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'IstanbulGuideBot/1.0 (test@example.com)' } }, (res) => {
            if (res.statusCode === 200) {
                const stream = fs.createWriteStream(filepath);
                res.pipe(stream);
                stream.on('finish', () => resolve(true));
                stream.on('error', reject);
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Failed with status ${res.statusCode}`));
            }
        }).on('error', reject);
    });
};

const getWikiImage = (query) => {
    return new Promise((resolve, reject) => {
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&pithumbsize=1024&format=json`;
        https.get(apiUrl, { headers: { 'User-Agent': 'IstanbulGuideBot/1.0 (test@example.com)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== '-1' && pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    for (const place of places) {
        console.log(`Fetching image for ${place.id} (${place.query})...`);
        try {
            let url = await getWikiImage(place.query);
            if (!url) {
                console.log(`No English wiki image for ${place.query}. Trying Turkish wiki...`);
                // Fallback to Turkish Wikipedia
                const trApiUrl = `https://tr.wikipedia.org/w/api.php?action=query&titles=${place.query}&prop=pageimages&pithumbsize=1024&format=json`;
                url = await new Promise((resolve, reject) => {
                    https.get(trApiUrl, { headers: { 'User-Agent': 'IstanbulGuideBot/1.0' } }, (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            const parsed = JSON.parse(data);
                            const pages = parsed.query.pages;
                            const pageId = Object.keys(pages)[0];
                            resolve(pageId !== '-1' && pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null);
                        });
                    }).on('error', reject);
                });
            }
            
            if (url) {
                const filepath = path.join(__dirname, 'images', `${place.id}.jpg`);
                await downloadImage(url, filepath);
                console.log(`Saved ${place.id}.jpg`);
            } else {
                console.log(`Could not find image for ${place.id}`);
            }
        } catch (err) {
            console.error(`Error for ${place.id}:`, err.message);
        }
        await delay(1500); // Wait 1.5 seconds between requests to avoid rate limits
    }
}

main();
