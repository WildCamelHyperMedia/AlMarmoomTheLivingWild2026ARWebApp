export interface AnimalQRCode {
  animalId: string;
  token: string;
  qrValue: string;
}

export const animalQRCodes: AnimalQRCode[] = [
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

export function validateQRCode(qrValue: string): { valid: boolean; animalId?: string } {
  const qrCode = animalQRCodes.find(qr => qr.qrValue === qrValue);
  if (qrCode) {
    return { valid: true, animalId: qrCode.animalId };
  }
  return { valid: false };
}
