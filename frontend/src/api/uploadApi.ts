import { isLocalMode } from "./apiMode";

export async function uploadFile(file: File): Promise<string> {
  if (isLocalMode()) {
    return URL.createObjectURL(file);
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type }), // FIX: fileName (capital N)
  });
  if (!res.ok) throw new Error(`POST /api/upload failed: ${res.status}`);

  const { uploadUrl, publicUrl } = (await res.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error(`S3 PUT failed: ${putRes.status}`);

  return publicUrl;
}
