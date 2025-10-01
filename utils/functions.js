const Jimp = require("jimp");
const fs = require("fs");
const crypto = require("crypto");
const axios = require('axios');

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

const anjingDarat = "az-chatai-key";
const modelan = [
  "deepseek-v3.1",
  "deepseek-r1",
  "grok-4",
  "qwen3-32b",
  "gemini-2.5-pro",
  "llama-4",
  "agent-x",
  "gpt-5",
  "gpt-5-mini",
  "o3",
  "claude-sonnet-4",
  "o4-mini",
  "gpt-4o-mini",
  "gpt-4.1-mini",
  "gemini-2.5-flash",
];
function kecoaPink() {
  return `RCAnonymousID:${crypto.randomBytes(16).toString("hex")}`;
}
async function chatAi(model, prompt, onDelta, onDone) {
  try {
    const resp = await axios.post(
      "https://api.appzone.tech/v1/chat/completions",
      {
        model,
        stream: true,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }],
          },
        ],
        isSubscribed: true,
        web_search: false,
        reason: false,
        study_mode: false,
      },
      {
        headers: {
          accept: "text/event-stream",
          "cache-control": "no-cache",
          "x-requested-with": "XMLHttpRequest",
          authorization: `Bearer ${anjingDarat}`,
          "x-app-version": "1.0.13",
          "x-user-id": kecoaPink(),
          "content-type": "application/json",
          "accept-encoding": "gzip",
          "user-agent": "Gienetic/1.2.0 (Android 13; Pixel 7 Pro) Premium",
        },
        responseType: "stream",
      }
    );
    let buffer = "";
    let sudahSelesai = false; // biar alien gak nyamber 2x
    function finish() {
      if (sudahSelesai) return;
      sudahSelesai = true;
      const clean = buffer.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      if (onDone) onDone(clean);
    }
    resp.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          finish();
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta?.content;
          if (delta) {
            buffer += delta;
            if (onDelta) onDelta(delta);
          }
        } catch {
        }
      }
    });
    resp.data.on("end", finish);
  } catch (err) {
    console.error("kata gwejh ", err?.response?.data || err.message);
  }
}


module.exports = {
  chatAi, 
  modelan,
  generateProfilePicture,
  deleteTemp,
  makeDirIsNotExists
};