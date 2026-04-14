const WP = 'https://dev-bluerange.pantheonsite.io';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';

async function test() {
    const slug = 'infrastruktur-som-en-tjanst';
    const urls = [
        `${WP}/wp-json/wp/v2/pages?slug=${slug}&lang=sv`,
        `${WP}/wp-json/wp/v2/pages?slug=${slug}`,
        `${WP}/sv/wp-json/wp/v2/pages?slug=${slug}`, // Some Polylang setups use this
    ];

    for (const url of urls) {
        console.log('Testing:', url);
        try {
            const res = await fetch(url, { headers: { 'User-Agent': UA } });
            const data = await res.json();
            console.log('  Status:', res.status);
            console.log('  Count:', Array.isArray(data) ? data.length : 'Error object');
            if (Array.isArray(data) && data.length > 0) {
                console.log('  Found ID:', data[0].id);
            }
        } catch (e) {
            console.log('  Fetch error:', e.message);
        }
    }
}

test();
