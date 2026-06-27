export const downloadItemImage = (imageBase64: string, itemName: string) => {
  const cleanName = itemName.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_') || 'souvenir';
  const link = document.createElement('a');
  link.href = imageBase64;
  link.download = `${cleanName}_pixel.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadItemLore = (
  itemName: string,
  rarity: string,
  objectDetected: string,
  lore: string,
  date?: string
) => {
  const cleanName = itemName.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_') || 'souvenir';
  const acquiredDate = date || new Date().toISOString().split('T')[0];
  const content = `====================================================
           GAMIFY EVERYTHING - AI SOUVENIR
====================================================

Item Name      : ${itemName}
Rarity         : ${rarity.toUpperCase()}
Real Object    : ${objectDetected}
Acquired Date  : ${acquiredDate}

----------------------------------------------------
DESCRIPTION & LORE:
${lore}
----------------------------------------------------
* Synthesized by Google Gemini AI & CV Pixel Engine
====================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanName}_lore.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
