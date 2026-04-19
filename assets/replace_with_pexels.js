const fs = require('fs');

const pexelsUrls = [
    // Woodworking / Carpentry / Luxury Interiors
    "https://images.pexels.com/photos/3201761/pexels-photo-3201761.jpeg?auto=compress&cs=tinysrgb&w=1600", // Woodworker
    "https://images.pexels.com/photos/175004/pexels-photo-175004.jpeg?auto=compress&cs=tinysrgb&w=1600", // Wood texture
    "https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg?auto=compress&cs=tinysrgb&w=1600", // Tools
    "https://images.pexels.com/photos/1239257/pexels-photo-1239257.jpeg?auto=compress&cs=tinysrgb&w=1600", // Wood interior
    "https://images.pexels.com/photos/208684/pexels-photo-208684.jpeg?auto=compress&cs=tinysrgb&w=1600", // Wood ceiling
    "https://images.pexels.com/photos/101808/pexels-photo-101808.jpeg?auto=compress&cs=tinysrgb&w=1600", // Workshop
    "https://images.pexels.com/photos/312058/pexels-photo-312058.jpeg?auto=compress&cs=tinysrgb&w=1600", // Planks
    "https://images.pexels.com/photos/3637803/pexels-photo-3637803.jpeg?auto=compress&cs=tinysrgb&w=1600", // Architecture
    "https://images.pexels.com/photos/4099511/pexels-photo-4099511.jpeg?auto=compress&cs=tinysrgb&w=1600", // Construction
    "https://images.pexels.com/photos/2791696/pexels-photo-2791696.jpeg?auto=compress&cs=tinysrgb&w=1600", // Kitchen
    "https://images.pexels.com/photos/208685/pexels-photo-208685.jpeg?auto=compress&cs=tinysrgb&w=1600", // Wood pattern
    "https://images.pexels.com/photos/172289/pexels-photo-172289.jpeg?auto=compress&cs=tinysrgb&w=1600", // Staircase
    "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=1600", // Luxury door
    "https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=1600", // Floor
];

function replaceImages(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let i = 0;
    
    // Replace unsplash URLs
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+\?[^"']+/g;
    
    content = content.replace(regex, (match) => {
        const pexelUrl = pexelsUrls[i % pexelsUrls.length];
        i++;
        return pexelUrl;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Replaced ${i} images in ${filePath}`);
}

replaceImages('index.html');
replaceImages('script.js');
