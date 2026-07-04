import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type PersistGeneratedImageOptions = {
  beatId: string;
  publicRoot?: string;
  directory?: string;
  now?: Date;
  uuid?: string;
};

const DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=\s]+)$/;

function extensionForImageType(imageType: string): string {
  return imageType === "jpeg" ? "jpg" : imageType;
}

function safeFileSegment(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "story-art";
}

export async function persistGeneratedImageUrl(
  imageUrl: string,
  options: PersistGeneratedImageOptions,
): Promise<string> {
  const match = DATA_IMAGE_PATTERN.exec(imageUrl);

  if (!match) {
    return imageUrl;
  }

  const [, imageType, base64] = match;
  const directory = options.directory ?? "generated/sessions";
  const publicRoot = options.publicRoot ?? path.join(process.cwd(), "public");
  const timestamp = (options.now ?? new Date()).toISOString().replace(/[:.]/g, "-");
  const uuid = options.uuid ?? randomUUID();
  const extension = extensionForImageType(imageType);
  const fileName = `${timestamp}-${safeFileSegment(options.beatId)}-${uuid}.${extension}`;
  const outputDirectory = path.join(publicRoot, directory);
  const outputPath = path.join(outputDirectory, fileName);
  const imageBuffer = Buffer.from(base64.replace(/\s/g, ""), "base64");

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, imageBuffer);

  return `/${directory}/${fileName}`;
}
