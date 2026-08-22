/**
 * Client-side Canvas Image Cropping Utility
 * Ensures all uploaded images strictly conform to a 3:4 aspect ratio (600x800px)
 */

export async function cropImageToAspect(
    file: File,
    targetWidth = 600,
    targetHeight = 800
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }

                const targetRatio = targetWidth / targetHeight;
                const sourceRatio = img.width / img.height;

                let srcX = 0;
                let srcY = 0;
                let srcW = img.width;
                let srcH = img.height;

                if (sourceRatio > targetRatio) {
                    // Image is wider than 3:4 -> Crop horizontal sides
                    srcW = img.height * targetRatio;
                    srcX = (img.width - srcW) / 2;
                } else if (sourceRatio < targetRatio) {
                    // Image is taller than 3:4 -> Crop vertical top/bottom
                    srcH = img.width / targetRatio;
                    srcY = (img.height - srcH) / 2;
                }

                // Fill background dark obsidian (in case of transparent PNG)
                ctx.fillStyle = '#060708';
                ctx.fillRect(0, 0, targetWidth, targetHeight);

                // Draw cropped region centered onto 600x800 canvas
                ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const croppedFile = new File(
                            [blob],
                            file.name.replace(/\.[^/.]+$/, '') + '_3x4.jpg',
                            { type: 'image/jpeg', lastModified: Date.now() }
                        );
                        resolve(croppedFile);
                    } else {
                        reject(new Error('Canvas blob generation failed'));
                    }
                }, 'image/jpeg', 0.92);
            };

            img.onerror = (err) => reject(err);
            img.src = e.target?.result as string;
        };

        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}
