const fs = require('fs');

const localUrls = [
    "assets/kitchen.png",
    "assets/staircase.png",
    "assets/arabesque.png",
    "assets/pergola.png",
    "assets/door.png",
    "assets/tools.png"
];

function replaceImages(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let i = 0;
    
    // Replace pexels URLs
    const regex = /https:\/\/images\.pexels\.com\/photos\/[0-9]+\/pexels-photo-[0-9]+\.jpeg\?[^"']+/g;
    
    content = content.replace(regex, (match) => {
        const localUrl = localUrls[i % localUrls.length];
        i++;
        return localUrl;
    });
    
    // Also replace any remaining Unsplash URLs just in case
    const regexUnsplash = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+\?[^"']+/g;
    content = content.replace(regexUnsplash, (match) => {
        const localUrl = localUrls[i % localUrls.length];
        i++;
        return localUrl;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Replaced ${i} images in ${filePath}`);
}

replaceImages('index.html');
