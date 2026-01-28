// QR signature validation for URL-based QR codes
// Uses a simple HMAC-like signature to verify unlock requests originated from valid QR codes

const QR_SECRET = "TLW-2024-ALMARMOOM-RESERVE"; // Shared secret for QR signature

// Generate a signature for an animal ID
export function generateQRSignature(animalId: string): string {
  // Simple hash: combine animalId with secret and create a deterministic signature
  let hash = 0;
  const str = `${QR_SECRET}-${animalId}-unlock`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to base36 string and take last 8 chars
  return Math.abs(hash).toString(36).padStart(8, '0').slice(-8).toUpperCase();
}

// Validate a signature for an animal ID
export function validateQRSignature(animalId: string, signature: string): boolean {
  const expectedSignature = generateQRSignature(animalId);
  return signature === expectedSignature;
}

// Generate all signatures for reference (used by QR code generator)
export const animalSignatures: Record<string, string> = {
  little_grebe: generateQRSignature("little_grebe"),
  frog_headed_lizard: generateQRSignature("frog_headed_lizard"),
  western_great_egret: generateQRSignature("western_great_egret"),
  desert_hare: generateQRSignature("desert_hare"),
  hoopoe: generateQRSignature("hoopoe"),
  ruppells_fox: generateQRSignature("ruppells_fox"),
  iraqi_sandgrouse: generateQRSignature("iraqi_sandgrouse"),
  water_rail: generateQRSignature("water_rail"),
  green_bee_eater: generateQRSignature("green_bee_eater"),
  desert_monitor: generateQRSignature("desert_monitor"),
  purple_sunbird: generateQRSignature("purple_sunbird"),
  blue_throated_wagtail: generateQRSignature("blue_throated_wagtail"),
  gerbillus_cheesmani: generateQRSignature("gerbillus_cheesmani"),
  yellow_wagtail: generateQRSignature("yellow_wagtail"),
  sandfish_lizard: generateQRSignature("sandfish_lizard"),
  spiny_tailed_lizard: generateQRSignature("spiny_tailed_lizard"),
  little_owl: generateQRSignature("little_owl"),
  arabian_oryx: generateQRSignature("arabian_oryx"),
  houbara_bustard: generateQRSignature("houbara_bustard"),
  dorcas_gazelle: generateQRSignature("dorcas_gazelle"),
  eurasian_stone_curlew: generateQRSignature("eurasian_stone_curlew"),
  white_tailed_lapwing: generateQRSignature("white_tailed_lapwing"),
  desert_eagle_owl: generateQRSignature("desert_eagle_owl"),
  hedgehog: generateQRSignature("hedgehog"),
};
