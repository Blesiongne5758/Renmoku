const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function watermarkLabel(userId: string) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  return `RENMOKU - DOKUMEN PENGGUNA - ${userId.slice(0, 8).toUpperCase()} - ${date}`;
}

function outputName(name: string, extension: string) {
  const base = name.replace(/\.[^.]+$/, '') || 'document';
  return `${base}-watermarked.${extension}`;
}

async function watermarkImage(file: File, label: string): Promise<File> {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = sourceUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browser tidak dapat memproses gambar untuk watermark.');
    context.drawImage(image, 0, 0);

    const fontSize = Math.max(18, Math.min(canvas.width, canvas.height) * 0.026);
    const diagonal = Math.hypot(canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(-Math.PI / 6);
    context.font = `700 ${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineWidth = Math.max(1, fontSize * 0.045);
    context.strokeStyle = 'rgba(0,0,0,0.28)';
    context.fillStyle = 'rgba(255,255,255,0.24)';
    const rowGap = fontSize * 5;
    const columnGap = Math.max(context.measureText(label).width + fontSize * 2, fontSize * 12);
    for (let y = -diagonal; y <= diagonal; y += rowGap) {
      const offset = Math.round(y / rowGap) % 2 ? columnGap / 2 : 0;
      for (let x = -diagonal; x <= diagonal; x += columnGap) {
        context.strokeText(label, x + offset, y);
        context.fillText(label, x + offset, y);
      }
    }
    context.restore();

    const bandHeight = Math.max(32, fontSize * 1.8);
    context.fillStyle = 'rgba(9,10,12,0.72)';
    context.fillRect(0, canvas.height - bandHeight, canvas.width, bandHeight);
    context.fillStyle = '#fff';
    context.font = `600 ${Math.max(12, fontSize * 0.62)}px Arial, sans-serif`;
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.fillText(label, canvas.width - fontSize * 0.6, canvas.height - bandHeight / 2, canvas.width - fontSize * 1.2);

    const type = allowedImageTypes.has(file.type) ? file.type : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Watermark gambar gagal dibuat.')), type, type === 'image/png' ? undefined : 0.94);
    });
    const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    return new File([blob], outputName(file.name, extension), { type: blob.type, lastModified: file.lastModified });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function watermarkPdf(file: File, label: string): Promise<File> {
  const { degrees, PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  const document = await PDFDocument.load(await file.arrayBuffer());
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  for (const page of document.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(18, Math.min(width, height) * 0.045);
    const textWidth = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: Math.max(16, (width - textWidth) / 2), y: height / 2,
      size, font, color: rgb(0.56, 0.56, 0.56), opacity: 0.22, rotate: degrees(32),
    });
    page.drawText(label, {
      x: 14, y: 10, size: Math.max(7, size * 0.36), font,
      color: rgb(0.36, 0.36, 0.36), opacity: 0.72,
    });
  }
  document.setSubject('Watermarked Renmoku user document');
  document.setKeywords(['RENMOKU_WATERMARK', label]);
  const bytes = await document.save();
  const pdfBuffer = new Uint8Array(bytes).buffer as ArrayBuffer;
  return new File([pdfBuffer], outputName(file.name, 'pdf'), { type: 'application/pdf', lastModified: file.lastModified });
}

/** Applies a permanent per-user watermark before a user document is uploaded. */
export async function applyDocumentWatermark(file: File, userId: string): Promise<File> {
  const label = watermarkLabel(userId);
  if (allowedImageTypes.has(file.type)) return watermarkImage(file, label);
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return watermarkPdf(file, label);
  throw new Error('Format dokumen tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.');
}

export function isWatermarkableDocument(file: File) {
  return allowedImageTypes.has(file.type) || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
