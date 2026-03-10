import imageCompression from "browser-image-compression";

export async function optimizeImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(file, options);

  return compressedFile;
}
