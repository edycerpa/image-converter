"use client";

import React, { useState } from 'react';
import Image from 'next/image';

enum ImageFormat {
  WEBP = "webp",
  AVIF = "avif",
  JPEG = "jpeg",
  PNG = "png",
}

interface ImageInfo {
  name: string;
  size: number;
  type: string;
  data: string;
}

const Home: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>(ImageFormat.WEBP);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; size: number; data: string }[]>([]);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageArray: ImageInfo[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const data = event.target.result as string;
            imageArray.push({
              name: file.name,
              size: file.size,
              type: file.type,
              data: data,
            });
            if (imageArray.length === files.length) {
              setSelectedImages(imageArray);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFormat(event.target.value as ImageFormat);
  };

  const convertImages = async () => {
    setConvertedFiles([]);
    setConversionProgress(0);

    const convertedResults: { name: string; size: number; data: string }[] = [];
    let completedCount = 0;

    for (const image of selectedImages) {
      try {
        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageSrc: image.data, format: selectedFormat }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        convertedResults.push({ name: result.name, size: result.size, data: result.data });
      } catch (error) {
        console.error("Error converting image:", error);
      } finally {
        completedCount++;
        setConversionProgress((completedCount / selectedImages.length) * 100);
        if (completedCount === selectedImages.length) {
          setConvertedFiles(convertedResults);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />

      {selectedImages.length > 0 && (
        <div>
          <h3>Imágenes Seleccionadas:</h3>
          <ul>
            {selectedImages.map((image) => (
              <li key={image.name}>
                {image.name} - {image.size} bytes - {image.type}
              </li>
            ))}
          </ul>
          <button onClick={convertImages} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Convertir Imágenes
          </button>
        </div>
      )}

      <select className="mt-2" value={selectedFormat} onChange={handleFormatChange}>
        <option value="webp">WebP</option>
        <option value="avif">AVIF</option>
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
      </select>

      {conversionProgress > 0 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-green-500 h-2.5 rounded-full dark:bg-green-500"
            style={{ width: `${conversionProgress}%` }}
          ></div>
        </div>
      )}

      {convertedFiles.length > 0 && (
        <div className="mt-4">
          <h3>Imágenes Convertidas:</h3>
          <ul>
            {convertedFiles.map((file: { name: string; size: number; data: string }) => (
              <li key={file.name}>
                {file.name} - {file.size} bytes
                <Image
                  width={200}
                  height={200}
                  alt={file.name}
                  src={`data:image/png;base64,${file.data}`}
                />
              </li>
            ))}
          </ul>
          {convertedFiles.length > 0 && (
            <a
              href={`data:image/png;base64,${convertedFiles.map(file => file.data).join(',')}`}
              download={`converted_images.${selectedFormat}`}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 inline-block"
            >
              Descargar Imágenes Convertidas
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
