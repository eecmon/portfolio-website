export type ImageUploadPreset = "avatar" | "icon" | "content";

export interface OptimizeImageOptions {
  preset?: ImageUploadPreset;
  /** Skip optimization below this byte size when dimensions also fit. */
  skipBelowBytes?: number;
}

const PRESETS: Record<
  ImageUploadPreset,
  { maxSize: number; quality: number; maxInputBytes: number }
> = {
  avatar: { maxSize: 512, quality: 0.88, maxInputBytes: 12 * 1024 * 1024 },
  icon: { maxSize: 256, quality: 0.9, maxInputBytes: 5 * 1024 * 1024 },
  content: { maxSize: 1920, quality: 0.84, maxInputBytes: 20 * 1024 * 1024 },
};

const NON_RASTER_TYPES = new Set(["image/svg+xml", "image/gif"]);

export function isOptimizableImage(file: File): boolean {
  return file.type.startsWith("image/") && !NON_RASTER_TYPES.has(file.type);
}

export function getScaledDimensions(
  width: number,
  height: number,
  maxSize: number
): { width: number; height: number; scale: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSize) {
    return { width, height, scale: 1 };
  }
  const scale = maxSize / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

function pickOutputMimeType(): string {
  if (typeof document === "undefined") return "image/jpeg";

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const dataUrl = canvas.toDataURL("image/webp");
  return dataUrl.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
}

function extensionForMime(mime: string): string {
  return mime === "image/webp" ? "webp" : "jpg";
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode image"));
      },
      type,
      quality
    );
  });
}

async function drawOptimizedImage(
  file: File,
  preset: ImageUploadPreset
): Promise<File | null> {
  const { maxSize, quality } = PRESETS[preset];
  const outputMime = pickOutputMimeType();

  if (typeof createImageBitmap !== "function") {
    return null;
  }

  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = getScaledDimensions(bitmap.width, bitmap.height, maxSize);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, outputMime, quality);
    const ext = extensionForMime(outputMime);
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

    return new File([blob], `${baseName}.${ext}`, {
      type: outputMime,
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

/**
 * Resize and re-encode raster images before upload.
 * SVG/GIF and non-images are returned unchanged.
 */
export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  const preset = options.preset ?? "content";
  const { maxSize, maxInputBytes } = PRESETS[preset];
  const skipBelowBytes = options.skipBelowBytes ?? 150_000;

  if (!isOptimizableImage(file)) {
    return file;
  }

  if (file.size > maxInputBytes) {
    throw new Error(`Image is too large. Maximum size is ${Math.round(maxInputBytes / (1024 * 1024))} MB.`);
  }

  const dimensions = await readImageDimensions(file);
  if (
    file.size <= skipBelowBytes &&
    dimensions &&
    Math.max(dimensions.width, dimensions.height) <= maxSize
  ) {
    return file;
  }

  try {
    const optimized = await drawOptimizedImage(file, preset);
    if (!optimized) return file;

    // Keep original if optimization didn't help (rare edge case).
    return optimized.size < file.size ? optimized : file;
  } catch {
    return file;
  }
}
