const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//configuring cloudinary acct details
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV', //name of folder on cloudinary
    allowedFormats: ["png", "jpg", "jpeg"], //image types allowed for storage
  },
});

module.exports = {
    cloudinary,
    storage,
};