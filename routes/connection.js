const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  delay
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const express = require("express");
const Router = express.Router();
const fs = require("fs");
const path = require("path");
const {
  deleteTemp,
  makeDirIsNotExists
} = require("../utils/functions");

// direktori session (untuk useMultiFileAuthState)
const sessionDir = path.join(__dirname, "../session");
makeDirIsNotExists(sessionDir).catch(() => {});

// Map in-memory untuk menyimpan socket aktif per nomor pemilik
const activeSockets = new Map();

/**
 * Helper untuk membuat socket. Hanya simpan ke activeSockets saat connection === "open".
 */
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

  // event: connection update
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    console.log(`[${pn}] connection.update =>`, connection);

    if (connection === "open") {
      // hanya simpan socket saat benar-benar open
      activeSockets.set(pn, { sock, statePath: sessionPath });
      console.log(`[${pn}] Socket saved to activeSockets (open)`);
      // notif ke pemilik (opsional)
      try {
        await delay(200);
        await sock.sendMessage(sock.user.id, { text: "_*Berhasil terhubung ke WhatsApp!*_" });
      } catch (e) { /* ignore send errors */ }
      return;
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(`[${pn}] closed with code:`, statusCode);

      // hapus dari activeSockets karena sudah close
      if (activeSockets.has(pn)) activeSockets.delete(pn);

      if (
        statusCode === DisconnectReason.connectionLost ||
        statusCode === DisconnectReason.connectionReplaced ||
        statusCode === DisconnectReason.restartRequired ||
        statusCode === DisconnectReason.timedOut
      ) {
        // coba reconnect (akan membuat socket baru)
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

  // update credentials
  sock.ev.on("creds.update", saveCreds);

  // Catatan: TIDAK menyimpan socket ke activeSockets di sini.
  // activeSockets hanya diset saat event 'open' di atas.

  return sock;
}

/**
 * GET /connect
 * - Jika belum ter-registered -> generate pairing code dan kembalikan { code }
 * - Jika sudah registered/connected -> kembalikan { connected: true } (hanya jika socket sudah open)
 */
Router.get("/", async (req, res) => {
  const phoneNumberRaw = req.query.phoneNumber;
  if (!phoneNumberRaw) return res.status(400).json({ error: "Phone number is required" });

  const phoneNumber = String(phoneNumberRaw).replace(/[^0-9]/g, "");
  if (!phoneNumber) return res.status(400).json({ error: "Invalid phone number" });

  try {
    const sock = await ensureSocketForNumber(phoneNumber);

    // cek apakah creds sudah registered (paired before)
    const registered = Boolean(sock?.authState?.creds?.registered);
    if (!registered) {
      // generate pairing code
      await delay(500);
      let pairingCode = await sock.requestPairingCode(phoneNumber, "WAHYUXDI");
      pairingCode = pairingCode?.match(/.{1,4}/g)?.join("-") || pairingCode;
      console.log(`[${phoneNumber}] Pairing code:`, pairingCode);
      return res.status(200).json({ code: pairingCode });
    }

    // jika sudah registered — hanya anggap connected jika socket benar-benar open & ada di map
    const isActive = activeSockets.has(phoneNumber);
    return res.status(200).json({ connected: !!isActive });
  } catch (err) {
    console.error("connect error:", err);
    return res.status(500).json({ error: "Something went wrong while connecting" });
  }
});

/**
 * GET /connect/status
 * - Query: phoneNumber
 * - Response: { connected: true/false }
 */
Router.get("/status", async (req, res) => {
  const phoneNumberRaw = req.query.phoneNumber;
  if (!phoneNumberRaw) return res.status(400).json({ error: "Phone number is required" });
  const phoneNumber = String(phoneNumberRaw).replace(/[^0-9]/g, "");
  const isActive = activeSockets.has(phoneNumber);
  res.json({ connected: !!isActive });
});

/**
 * GET /connect/action
 * - Query:
 *    owner (phoneNumber pemilik / socket yang aktif)
 *    type  (bug_a | bug_b | bug_c)
 *    target (nomor target)
 */
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

  try {
    let message = "";
    if (type === "bug_a") {
      message = "Ping! Ini test bug A.";
      await sock.sendMessage(jid, { text: message });
      return res.json({ success: true, message: "Pesan pendek terkirim (bug_a)" });
    } else if (type === "bug_b") {
      message = "Ini pesan panjang untuk bug B. ".repeat(30);
      await sock.sendMessage(jid, { text: message });
      return res.json({ success: true, message: "Pesan panjang terkirim (bug_b)" });
    } else if (type === "bug_c") {
      message = "PING\n\nInformasi: device terkonek via API.\nTime: " + new Date().toISOString();
      await sock.sendMessage(jid, { text: message });
      return res.json({ success: true, message: "Ping/info terkirim (bug_c)" });
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
