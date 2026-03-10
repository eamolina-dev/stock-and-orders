const readImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

const blobFromCanvas = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Failed to compress image"));
      },
      type,
      quality
    );
  });

export default async function imageCompression(file, options = {}) {
  const maxSizeMB = options.maxSizeMB ?? 0.3;
  const maxWidthOrHeight = options.maxWidthOrHeight ?? 1200;

  const image = await readImage(file);

  let width = image.width;
  let height = image.height;
  const maxDimension = Math.max(width, height);
  if (maxDimension > maxWidthOrHeight) {
    const ratio = maxWidthOrHeight / maxDimension;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }
  ctx.drawImage(image, 0, 0, width, height);

  const targetBytes = maxSizeMB * 1024 * 1024;
  const mimeType = file.type || "image/jpeg";

  let quality = 0.92;
  let compressedBlob = await blobFromCanvas(canvas, mimeType, quality);

  while (compressedBlob.size > targetBytes && quality > 0.3) {
    quality -= 0.1;
    compressedBlob = await blobFromCanvas(canvas, mimeType, quality);
  }

  return new File([compressedBlob], file.name, {
    type: compressedBlob.type || mimeType,
    lastModified: Date.now(),
  });
}
