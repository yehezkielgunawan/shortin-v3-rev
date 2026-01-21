import QRCode from "qrcode";

/**
 * Generate QR code as PNG data URL
 */
export async function generateQRCodePNG(
  text: string,
  options: {
    size?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  } = {},
): Promise<string> {
  const {
    size = 256,
    margin = 2,
    darkColor = "#000000",
    lightColor = "#ffffff",
  } = options;

  const dataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin: margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: "M",
  });

  return dataUrl;
}

/**
 * Generate downloadable QR code image with URL text below it using Canvas
 */
export async function generateQRCodeWithText(
  qrCodeDataUrl: string,
  urlText: string,
  options: {
    qrSize?: number;
    padding?: number;
    fontSize?: number;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
  } = {},
): Promise<string> {
  const {
    qrSize = 256,
    padding = 20,
    fontSize = 14,
    fontFamily = "monospace",
    backgroundColor = "#ffffff",
    textColor = "#374151",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Calculate text dimensions
      ctx.font = `${fontSize}px ${fontFamily}`;
      const textMetrics = ctx.measureText(urlText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // Calculate canvas dimensions
      const canvasWidth = Math.max(qrSize, textWidth) + padding * 2;
      const canvasHeight = qrSize + textHeight + padding * 3;

      // Set canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw QR code centered
      const qrX = (canvasWidth - qrSize) / 2;
      const qrY = padding;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Draw URL text centered below QR code
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const textX = canvasWidth / 2;
      const textY = qrY + qrSize + padding;
      ctx.fillText(urlText, textX, textY);

      // Convert to data URL
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      reject(new Error("Failed to load QR code image"));
    };

    img.src = qrCodeDataUrl;
  });
}
