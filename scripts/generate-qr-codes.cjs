const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const animalQRCodes = [
  { animalId: "little_grebe", token: "LG2024-XK9M3P7R", qrValue: "TLW-little_grebe-LG2024-XK9M3P7R" },
  { animalId: "frog_headed_lizard", token: "FHL2024-QW8N2T5L", qrValue: "TLW-frog_headed_lizard-FHL2024-QW8N2T5L" },
  { animalId: "western_great_egret", token: "WGE2024-YH4K6B9V", qrValue: "TLW-western_great_egret-WGE2024-YH4K6B9V" },
  { animalId: "desert_hare", token: "DH2024-MJ7P3C8Z", qrValue: "TLW-desert_hare-DH2024-MJ7P3C8Z" },
  { animalId: "hoopoe", token: "HP2024-FS2R9D4X", qrValue: "TLW-hoopoe-HP2024-FS2R9D4X" },
  { animalId: "ruppells_fox", token: "RF2024-NT6W1G7K", qrValue: "TLW-ruppells_fox-RF2024-NT6W1G7K" },
  { animalId: "iraqi_sandgrouse", token: "IS2024-BV3L8H2Q", qrValue: "TLW-iraqi_sandgrouse-IS2024-BV3L8H2Q" },
  { animalId: "water_rail", token: "WR2024-CX5M4J9Y", qrValue: "TLW-water_rail-WR2024-CX5M4J9Y" },
  { animalId: "green_bee_eater", token: "GBE2024-DZ8P6K3U", qrValue: "TLW-green_bee_eater-GBE2024-DZ8P6K3U" },
  { animalId: "desert_monitor", token: "DM2024-EW2T7N5I", qrValue: "TLW-desert_monitor-DM2024-EW2T7N5I" },
  { animalId: "purple_sunbird", token: "PS2024-FQ9R1B8O", qrValue: "TLW-purple_sunbird-PS2024-FQ9R1B8O" },
  { animalId: "blue_throated_wagtail", token: "BTW2024-GV4S3L6A", qrValue: "TLW-blue_throated_wagtail-BTW2024-GV4S3L6A" },
  { animalId: "gerbillus_cheesmani", token: "GC2024-HX7U5M2E", qrValue: "TLW-gerbillus_cheesmani-GC2024-HX7U5M2E" },
  { animalId: "yellow_wagtail", token: "YW2024-IZ1V8P4F", qrValue: "TLW-yellow_wagtail-IZ1V8P4F" },
  { animalId: "sandfish_lizard", token: "SL2024-JQ3W2R7G", qrValue: "TLW-sandfish_lizard-JQ3W2R7G" },
  { animalId: "spiny_tailed_lizard", token: "STL2024-KS6X4T9H", qrValue: "TLW-spiny_tailed_lizard-KS6X4T9H" },
  { animalId: "little_owl", token: "LO2024-LT8Y6U1J", qrValue: "TLW-little_owl-LT8Y6U1J" },
  { animalId: "arabian_oryx", token: "AO2024-MU2Z9V3K", qrValue: "TLW-arabian_oryx-MU2Z9V3K" },
  { animalId: "houbara_bustard", token: "HB2024-NV5A1W6L", qrValue: "TLW-houbara_bustard-NV5A1W6L" },
  { animalId: "dorcas_gazelle", token: "DG2024-OW7B3X8M", qrValue: "TLW-dorcas_gazelle-OW7B3X8M" },
  { animalId: "eurasian_stone_curlew", token: "ESC2024-PX9C5Y2N", qrValue: "TLW-eurasian_stone_curlew-PX9C5Y2N" },
  { animalId: "white_tailed_lapwing", token: "WTL2024-QY1D7Z4O", qrValue: "TLW-white_tailed_lapwing-QY1D7Z4O" },
  { animalId: "desert_eagle_owl", token: "DEO2024-RZ3E9A6P", qrValue: "TLW-desert_eagle_owl-RZ3E9A6P" },
  { animalId: "hedgehog", token: "HH2024-SA5F1B8Q", qrValue: "TLW-hedgehog-SA5F1B8Q" }
];

const outputDir = path.join(__dirname, '../client/public/qr-codes');

async function generateQRCodes() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating QR codes for all 24 animals...\n');

  for (const animal of animalQRCodes) {
    const filename = `${animal.animalId}.png`;
    const filepath = path.join(outputDir, filename);
    
    await QRCode.toFile(filepath, animal.qrValue, {
      width: 400,
      margin: 2,
      color: {
        dark: '#30221b',
        light: '#fef3dc'
      }
    });
    
    console.log(`Generated: ${filename} - ${animal.qrValue}`);
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
      margin-bottom: 30px;
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
      font-size: 10px; 
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
  <div class="grid">
    ${animalQRCodes.map(animal => `
    <div class="card">
      <img src="qr-codes/${animal.animalId}.png" alt="${animal.animalId}">
      <h3>${animal.animalId.replace(/_/g, ' ')}</h3>
      <code>${animal.qrValue}</code>
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '../client/public/qr-codes.html'), htmlContent);
  console.log(`📄 HTML preview: /qr-codes.html`);
}

generateQRCodes().catch(console.error);
