const WP = 'https://dev-bluerange.pantheonsite.io';
const slug = 'infrastruktur-som-en-tjanst';
const lang = 'sv';

async function test() {
    const url = `${WP}/wp-json/wp/v2/pages?slug=${slug}&_embed&lang=${lang}&acf_format=standard`;
    console.log('Fetching:', url);
    const res = await fetch(url);
    const data = await res.json();
    console.log('Result length:', Array.isArray(data) ? data.length : 'Not an array');
    if (Array.isArray(data) && data.length > 0) {
        console.log('Page found:', data[0].title.rendered);
    } else {
        console.log('Page NOT found for slug:', slug, 'and lang:', lang);
        
        // Try without lang to see if it exists at all
        const url2 = `${WP}/wp-json/wp/v2/pages?slug=${slug}&_embed&acf_format=standard`;
        console.log('Fetching without lang:', url2);
        const res2 = await fetch(url2);
        const data2 = await res2.json();
        console.log('Result length (no lang):', data2.length);
    }
}

test();
