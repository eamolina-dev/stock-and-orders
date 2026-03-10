export type Options = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
};

export default function imageCompression(file: File, options?: Options): Promise<File>;
