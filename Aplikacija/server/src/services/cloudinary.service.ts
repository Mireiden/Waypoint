import type { UploadApiResponse } from "cloudinary";

import { AppError } from "../errors/appError.js";
import { cloudinary } from "../lib/cloudinary.js";

export const uploadBuffer = async (buffer: Buffer, resourceType: "image" | "video") => {
  const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: resourceType }, (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          reject(new AppError("Upload failed", 502));
          return;
        }
        if (!result) {
          console.error("Cloudinary upload returned no result");
          reject(new AppError("Upload failed", 502));
          return;
        }
        resolve(result);
      })
      .end(buffer);
  });
  return { url: uploadResult.secure_url, publicId: uploadResult.public_id };
};

export const destroy = async (publicId: string, resourceType: "image" | "video") => {
  const res = (await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })) as {
    result: string;
  };
  console.log("Cloudinary destroy:", publicId, resourceType, res);
  return res;
};
