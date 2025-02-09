"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import logo from '../public/logo-image-converter.webp';
import { useDropzone } from 'react-dropzone';

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageArray: ImageInfo[] = acceptedFiles.map(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        data: '', // Temporalmente vacío, se llenará en onload
      };
    });
    setSelectedImages(imageArray);

    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        setSelectedImages(prevImages => {
          return prevImages.map(img => {
            if (img.name === file.name) {
              return { ...img, data: dataURL };
            }
            return img;
          });
        });
      };
      reader.readAsDataURL(file);
    });

  }, []);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})


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
          body: JSON.stringify({ imageSrc: image.data, format: selectedFormat, originalName: image.name }),
        });

        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
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
    <div className="container">
      <Image
        src={logo}
        alt="Image Converter Logo"
        width={200}
        height={50}
        className="mb-8"
      />
      <div {...getRootProps()} className="dropzone mb-4" style={{border: '2px dashed #ccc', borderRadius: '5px', padding: '20px', textAlign: 'center', cursor: 'pointer'}}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Suelta las imágenes aquí ...</p> :
            <p>Arrastra y suelta las imágenes aquí, o haz clic para seleccionar archivos</p>
        }
      </div>

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

      <select className="mt-2 select-format" value={selectedFormat} onChange={handleFormatChange}>
        <option value="webp">WebP</option>
        <option value="avif">AVIF</option>
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
      </select>

      {conversionProgress > 0 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-green-500 h-2.5 rounded-full dark:bg-green-500"
            style={{ width: conversionProgress + "%" }}
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
                  src={"data:image/png;base64," + file.data}
                />
              </li>
            ))}
          </ul>
          {convertedFiles.length > 0 && (
            <a
              href={"data:image/png;base64," + convertedFiles.map(file => file.data).join(',')}
              download={"converted_images." + selectedFormat}
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
