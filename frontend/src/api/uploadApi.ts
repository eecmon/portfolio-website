import { isLocalMode } from "./apiMode";
import { optimizeImageForUpload, type ImageUploadPreset } from "@/lib/optimizeImage";

export interface UploadFileOptions {
  preset?: ImageUploadPreset;
}

export async function uploadFile(file: File, options: UploadFileOptions = {}): Promise<string> {
  const optimized = file.type.startsWith("image/")
    ? await optimizeImageForUpload(file, { preset: options.preset })
    : file;

  if (isLocalMode()) {
    return URL.createObjectURL(optimized);
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: optimized.name, contentType: optimized.type }),
  });
  if (!res.ok) throw new Error(`POST /api/upload failed: ${res.status}`);

  const { uploadUrl, publicUrl } = (await res.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": optimized.type },
    body: optimized,
  });
  if (!putRes.ok) throw new Error(`S3 PUT failed: ${putRes.status}`);

  return publicUrl;
}
