import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const { imageSrc, format } = await req.json();

    const imageBuffer = Buffer.from(imageSrc.split(',')[1], 'base64');
    const convertedImageBuffer = await sharp(imageBuffer)
      .toFormat(format as keyof sharp.FormatEnum)
      .toBuffer();

    const convertedFileName = `converted.${format}`;
    const convertedFileSize = convertedImageBuffer.byteLength;

    const base64Image = convertedImageBuffer.toString('base64');

    return NextResponse.json({ name: convertedFileName, size: convertedFileSize, data: base64Image });
  } catch (error) {
    console.error("Error converting image:", error);
    return NextResponse.json({ error: "Error converting image" }, { status: 500 });
  }
}
