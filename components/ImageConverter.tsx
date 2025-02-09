"use client";

import React, { useEffect } from 'react';
import sharp from 'sharp';
import { Buffer } from 'node:buffer';

import Image from 'next/image';

interface ImageConverterProps {
  imageSrc: string;
  format: string;
  onConversionComplete: (data: { name: string; size: number } | null) => void;
}

const ImageConverter: React.FC<ImageConverterProps> = ({ imageSrc, format, onConversionComplete }: ImageConverterProps) => {
  useEffect(() => {
    if (!imageSrc) {
      onConversionComplete(null);
      return;
    }

    (async () => {
      try {
        // Convert the image to the specified format using sharp
        const imageBuffer = Buffer.from(imageSrc.split(',')[1], 'base64');
        const convertedImageBuffer = await sharp(imageBuffer)
          .toFormat(format as keyof sharp.FormatEnum)
          .toBuffer();

        const convertedFileName = `converted.${format}`;
        const convertedFileSize = convertedImageBuffer.byteLength;

        onConversionComplete({ name: convertedFileName, size: convertedFileSize });
      } catch (error) {
        console.error("Error converting image:", error);
        onConversionComplete(null);
      }
    })();
  }, [imageSrc, format, onConversionComplete]);

  return (
    <div className="image-converter">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt="Converted Image"
          width={200}
          height={200}
        />
      )}
    </div>
  );
};

export default ImageConverter;
