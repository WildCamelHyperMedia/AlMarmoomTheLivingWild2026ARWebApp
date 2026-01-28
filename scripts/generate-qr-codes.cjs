const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Base URL for the deployed app - update this to match your deployment URL
const BASE_URL = process.env.BASE_URL || 'https://the-living-wild.replit.app';

// QR signature generation (must match shared/qrSignature.ts)
const QR_SECRET = "TLW-2024-ALMARMOOM-RESERVE";

function generateQRSignature(animalId) {
  let hash = 0;
  const str = `${QR_SECRET}-${animalId}-unlock`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(8, '0').slice(-8).toUpperCase();
}

const animalIds = [
  "little_grebe",
  "frog_headed_lizard",
  "western_great_egret",
  "desert_hare",
  "hoopoe",
  "ruppells_fox",
  "iraqi_sandgrouse",
  "water_rail",
  "green_bee_eater",
  "desert_monitor",
  "purple_sunbird",
  "blue_throated_wagtail",
  "gerbillus_cheesmani",
  "yellow_wagtail",
  "sandfish_lizard",
  "spiny_tailed_lizard",
  "little_owl",
  "arabian_oryx",
  "houbara_bustard",
  "dorcas_gazelle",
  "eurasian_stone_curlew",
  "white_tailed_lapwing",
  "desert_eagle_owl",
  "hedgehog"
];

const outputDir = path.join(__dirname, '../client/public/qr-codes');

async function generateQRCodes() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating QR codes for all 24 animals...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const animalId of animalIds) {
    const filename = `${animalId}.png`;
    const filepath = path.join(outputDir, filename);
    
    // Generate signature for secure unlock
    const signature = generateQRSignature(animalId);
    
    // Generate URL with unlock query parameter and signature
    const animalUrl = `${BASE_URL}/animal/${animalId}?qr=unlock&sig=${signature}`;
    
    await QRCode.toFile(filepath, animalUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#30221b',
        light: '#fef3dc'
      }
    });
    
    console.log(`Generated: ${filename} -> ${animalUrl}`);
  }

  console.log('\n✅ All QR codes generated successfully!');
  console.log(`📁 Location: ${outputDir}`);
  
  // Generate an HTML file with all QR codes for easy printing
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Living Wild - Animal QR Codes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      background: #fef3dc; 
      padding: 20px;
    }
    h1 { 
      text-align: center; 
      color: #30221b; 
      margin-bottom: 10px;
    }
    .subtitle {
      text-align: center;
      color: #855338;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
      gap: 30px; 
      max-width: 1200px; 
      margin: 0 auto;
    }
    .card { 
      background: white; 
      border-radius: 16px; 
      padding: 20px; 
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 2px solid #b97d42;
    }
    .card img { 
      width: 200px; 
      height: 200px; 
      margin-bottom: 15px;
    }
    .card h3 { 
      color: #30221b; 
      text-transform: capitalize;
      margin-bottom: 8px;
    }
    .card code { 
      display: block;
      font-size: 9px; 
      color: #855338;
      word-break: break-all;
      background: #fef3dc;
      padding: 8px;
      border-radius: 8px;
    }
    @media print {
      .card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>🦁 The Living Wild - Animal QR Codes</h1>
  <p class="subtitle">Scan with any QR scanner to open the animal page directly</p>
  <div class="grid">
    ${animalIds.map(animalId => {
      const sig = generateQRSignature(animalId);
      return `
    <div class="card">
      <img src="qr-codes/${animalId}.png" alt="${animalId}">
      <h3>${animalId.replace(/_/g, ' ')}</h3>
      <code>${BASE_URL}/animal/${animalId}?qr=unlock&sig=${sig}</code>
    </div>
    `;
    }).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../client/public/qr-codes.html'), htmlContent);
  console.log(`📄 HTML preview: /qr-codes.html`);
}

generateQRCodes().catch(console.error);
