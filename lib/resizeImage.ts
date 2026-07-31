/**
 * Client-side image downscale + recompress, run before upload.
 *
 * Photos off a phone or camera are routinely 5-20 MB — far more than a website
 * needs, and over the Server Action / Netlify request-body limits. This caps the
 * longest edge and re-encodes to WebP (small, keeps transparency), so uploads
 * stay well under the 5 MB limit and pages load fast.
 *
 * Animated GIFs and anything that fails to decode are passed through untouched
 * (the server still validates type and size).
 */

const MAX_EDGE = 2000; // px on the longest side
const QUALITY = 0.82;
const SKIP_UNDER = 1_200_000; // already small enough (~1.2 MB) and not oversized

export async function resizeImage(file: File): Promise<File> {
  // Only raster photos are safe to redraw; leave GIFs (animation) and anything
  // exotic alone.
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    // `from-image` applies EXIF orientation so phone photos aren't rotated.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_EDGE / longest);
  if (scale === 1 && file.size <= SKIP_UNDER) {
    bitmap.close?.();
    return file;
  }

  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob =
    (await toBlob(canvas, 'image/webp', QUALITY)) ??
    (await toBlob(canvas, 'image/jpeg', QUALITY));
  if (!blob) return file;

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const base = file.name.replace(/\.[^./\\]+$/, '') || 'image';
  return new File([blob], `${base}.${ext}`, { type: blob.type });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
