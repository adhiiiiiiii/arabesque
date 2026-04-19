const fs = require('fs');

const ids = [
    '1616486029423-aaa4789e8c9a', // Craftsman
    '1519817914152-2a241f6f52e3', // Mosque architecture
    '1510008581628-97063de4fcbe', // Wooden doors
    '1549488344-c28ab8d4b3ac', // Corridors/fire
    '1595526114101-11b3ec3def79', // Wardrobes
    '1556911220-e15b29be8c8f', // Kitchens
    '1513694203232-719a280e022f', // Staircase
    '1581858326456-2e86536b5ec6', // Wood floor
    '1600585154340-be6161a56a0c', // Gypsum / luxury
    '1498855926480-d98e83099315', // Pergola
    '1554902843-26151acd46db', // Mosque interior
    '1600566752355-32e92c2ab72a', // Arabesque
    '1582213782179-e0d53f98f2ca', // Texture
    '1514488975386-896841d1a938', // Luxury room
    '1618221195710-dd6b41faaea6'  // Carving
];

let html = fs.readFileSync('index.html', 'utf8');

// Also process JS file for the takeover backgrounds
let js = fs.readFileSync('script.js', 'utf8');

let i = 0;
html = html.replace(/https:\/\/picsum\.photos\/seed\/[^\s"']+/g, () => {
    let id = ids[i % ids.length];
    i++;
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
});

js = js.replace(/https:\/\/picsum\.photos\/seed\/[^\s"']+/g, () => {
    let id = ids[i % ids.length];
    i++;
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
});

fs.writeFileSync('index.html', html);
fs.writeFileSync('script.js', js);
console.log('Fixed', i, 'images to woodworking unspash URLs!');
