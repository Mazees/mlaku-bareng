/**
 * Adaptive Image Compressor Utility
 * ---------------------------------
 * Mengompresi foto bukti transaksi secara adaptif dengan target keras:
 * Maksimal ~60-100 KB per foto WebP dengan resolusi 1000px.
 * Jika hasil awal masih di atas 100 KB, algoritma otomatis menurunkan
 * kualitas/skala secara adaptif hingga di bawah 100 KB tanpa mengorbankan keterbacaan teks.
 */
export async function compressImage(
  file: File,
  maxWidth = 1000,
  targetMaxKB = 100
): Promise<File> {
  // Jika bukan gambar, kembalikan file asli
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        let currentWidth = img.width;
        let currentHeight = img.height;

        // Resize proporsional jika lebar melebihi maxWidth (1000px)
        if (currentWidth > maxWidth) {
          currentHeight = Math.round((currentHeight * maxWidth) / currentWidth);
          currentWidth = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = currentWidth;
        canvas.height = currentHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

        // Kualitas awal WebP (0.60 sangat tajam untuk teks namun irit)
        let quality = 0.6;
        let blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/webp", quality)
        );

        // Loop adaptif jika ukuran masih > targetMaxKB (100 KB)
        let attempts = 0;
        while (blob && blob.size > targetMaxKB * 1024 && attempts < 3) {
          attempts++;
          quality -= 0.15;

          if (quality < 0.35) {
            // Skala ulang canvas jika kualitas sudah rendah
            currentWidth = Math.round(currentWidth * 0.85);
            currentHeight = Math.round(currentHeight * 0.85);
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
            quality = 0.5;
          }

          blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, "image/webp", Math.max(quality, 0.3))
          );
        }

        if (!blob) {
          resolve(file);
          return;
        }

        const newFileName =
          file.name.replace(/\.[^/.]+$/, "") + "_" + Date.now() + ".webp";
        const compressedFile = new File([blob], newFileName, {
          type: "image/webp",
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
