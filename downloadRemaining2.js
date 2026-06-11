const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

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
  { id: 'pierre_loti_kafe', query: 'Tea' },
  { id: 'fazil_bey', query: 'Turkish_coffee' },
  { id: 'gulluoglu', query: 'Baklava' },
  { id: 'hafiz_mustafa', query: 'Turkish_delight' },
  { id: 'haci_bekir', query: 'Turkish_delight' },
  { id: 'saray_muhallebicisi', query: 'Pudding' },
  { id: 'mado', query: 'Dondurma' }
];

const headers = {
    'User-Agent': 'IstanbulGuideBot/2.0 (https://github.com/duduperi32-hue/gezi-rehberi; duduperi32@gmail.com)'
};

async function downloadImage(url, filepath) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Unexpected status ${res.status} ${res.statusText}`);
    await pipeline(res.body, fs.createWriteStream(filepath));
}

async function getWikiImage(query, lang = 'en') {
    const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&pithumbsize=1024&format=json`;
    const res = await fetch(apiUrl, { headers });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
    }
    return null;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    for (const place of places) {
        console.log(`Fetching image for ${place.id} (${place.query})...`);
        try {
            let url = await getWikiImage(place.query, 'en');
            if (!url) {
                console.log(`No English wiki image. Trying Turkish wiki...`);
                url = await getWikiImage(place.query, 'tr');
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
        await delay(2000);
    }
}

main();
