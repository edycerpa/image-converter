import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const { imageSrc, format, originalName } = await req.json();

    const imageBuffer = Buffer.from(imageSrc.split(',')[1], 'base64');
    const fileNameWithoutExtension = originalName.split('.').slice(0, -1).join('.');
    const convertedImageBuffer = await sharp(imageBuffer)
      .toFormat(format as keyof sharp.FormatEnum)
      .toBuffer();

    // Generate unique filename using nanoid
    const convertedFileName = `${fileNameWithoutExtension}-cwd-conv.${format}`;
    const convertedFileSize = convertedImageBuffer.byteLength;

    const base64Image = convertedImageBuffer.toString('base64');

    return NextResponse.json({ name: convertedFileName, size: convertedFileSize, data: base64Image });
  } catch (error) {
    console.error("Error converting image:", error);
    return NextResponse.json({ error: "Error converting image" }, { status: 500 });
  }
}
