const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const streamUpload = (fileBuffer, folderName = "game-inventory") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const getPublicIdFromUrl = (folder, url) => {
  const regex = /\/([^\/]+)\/([^\/]+)$/; // Match the last two segments of the URL
  const match = url.match(regex);
  if (match) {
    return folder + "/" + match[2].split(".")[0]; // Extract the public ID (remove file extension)
  }
  throw new Error("Invalid Cloudinary URL");
};

const deleteImage = async (folder, url) => {
  try {
    const publicId = getPublicIdFromUrl(folder, url);
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

module.exports = { streamUpload, deleteImage };
