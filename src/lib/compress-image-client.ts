"use client";

/**
 * Client-side JPEG resize + encode. Admin wraps {@link compressImageToMaxBytes} +
 * {@link blobToDataURL} in `admin-image-compression.ts` and enforces a **Base64 data URL** length cap.
 */

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file."));
    };
    img.src = url;
  });
}

/** Used by admin flow to verify Base64 length after JPEG encode. */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/**
 * Resize + JPEG encode until the blob is at most `maxBytes`, or throw if impossible.
 */
export async function compressImageToMaxBytes(file: File, maxBytes: number): Promise<Blob> {
  let img: HTMLImageElement;
  try {
    img = await loadImageElement(file);
  } catch (e) {
    throw e instanceof Error ? e : new Error("Could not read image file.");
  }

  /** Smaller canvas first when the byte budget is tight (Firestore doc holds many images). */
  let maxDimension: number;
  if (maxBytes <= 160 * 1024) {
    maxDimension = 1100;
  } else if (maxBytes >= 512 * 1024) {
    maxDimension = 2400;
  } else {
    maxDimension = 1600;
  }

  while (maxDimension >= 280) {
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w < 1 || h < 1) {
      throw new Error("Invalid image dimensions.");
    }
    if (w > maxDimension || h > maxDimension) {
      const scale = Math.min(maxDimension / w, maxDimension / h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not compress image (canvas not available).");
    }

    // Flatten transparency onto white for JPEG
    if (file.type === "image/png" || file.type === "image/webp") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);

    for (let q = 0.92; q >= 0.28; q -= 0.05) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", q)
      );
      if (blob && blob.size <= maxBytes) {
        return blob;
      }
    }

    maxDimension = Math.floor(maxDimension * 0.82);
  }

  throw new Error(
    `Could not compress image under ${Math.round(maxBytes / 1024)}KB. Try a smaller or simpler image.`
  );
}

/**
 * Always re-encode to JPEG under `maxBytes`. Embedding raw PNG/WebP as data URLs can still
 * blow past Firestore’s 1MB document limit even when `file.size` looks small.
 */
export async function fileOrCompressedJpegDataUrl(file: File, maxBytes: number): Promise<string> {
  const blob = await compressImageToMaxBytes(file, maxBytes);
  return blobToDataURL(blob);
}
