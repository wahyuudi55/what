const Jimp = require("jimp");
const fs = require("fs");

// fungsi untuk generate foto profil (resize & preview)
const generateProfilePicture = async (filePath) => {
  try {
    const image = await Jimp.read(filePath);
    const width = image.getWidth();
    const height = image.getHeight();

    const cropped = image.crop(0, 0, width, height);

    return {
      img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
      preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG)
    };
  } catch (err) {
    console.error("Failed to generate profile picture:", err);
  }
};

// fungsi untuk hapus file/temp session
const deleteTemp = async (filePath, sessionPath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Image " + filePath + " deleted successfully.");
    }
    if (sessionPath && fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      console.log("Session " + sessionPath + " directory deleted.");
    }
  } catch (err) {
    console.error("Error while deleting temp directories:", err);
  }
};

// fungsi untuk buat folder kalau belum ada
const makeDirIsNotExists = async (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log("Directory " + dirPath + " created.");
  }
};

module.exports = {
  generateProfilePicture,
  deleteTemp,
  makeDirIsNotExists
};