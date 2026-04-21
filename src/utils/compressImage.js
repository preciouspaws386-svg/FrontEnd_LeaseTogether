export function compressImage(file, { maxSizeKB = 500, maxDim = 800, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!file) return resolve('');
      if (!String(file.type || '').startsWith('image/')) return reject(new Error('Only images are allowed'));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Try a few quality steps to stay under maxSizeKB.
        const qualities = [quality, 0.6, 0.5, 0.4, 0.3];
        for (const q of qualities) {
          const dataUrl = canvas.toDataURL('image/jpeg', q);
          const approxBytes = Math.ceil((dataUrl.length * 3) / 4); // base64 -> bytes (approx)
          if (approxBytes <= maxSizeKB * 1024) return resolve(dataUrl);
        }

        return resolve(canvas.toDataURL('image/jpeg', 0.3));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

