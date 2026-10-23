const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// 1. Chunked raw binary upload route MUST come before express.json()
//    1 MB slices bypass any reverse-proxy body size caps cleanly.
app.post(
  "/api/upload-chunk",
  express.raw({ type: "*/*", limit: "6mb" }),
  (req, res) => {
    try {
      const rawId = String(req.query.uploadId || "default").replace(/[^a-zA-Z0-9_-]/g, "");
      const ext = path.extname(String(req.query.name || "video.mp4")).replace(/[^.a-zA-Z0-9]/g, "") || ".mp4";
      const index = Number(req.query.index || 0);
      const tmpPath = path.join(os.tmpdir(), `c24_ref_${rawId}${ext}`);

      if (index === 0 && fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ ok: false, error: "Empty chunk payload" });
      }
      fs.appendFileSync(tmpPath, req.body);
      const stat = fs.statSync(tmpPath);
      return res.json({ ok: true, index, receivedBytes: stat.size });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }
);

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/uploads", express.static(UPLOADS_DIR));

// Finalize uploaded chunks -> FFmpeg transcode + 24-frame extraction + cut/beat analysis
app.post("/api/upload-complete", (req, res) => {
  const rawId = String(req.body?.uploadId || "default").replace(/[^a-zA-Z0-9_-]/g, "");
  const origName = String(req.body?.name || "reference.mp4");
  const note = String(req.body?.note || "").trim();
  const ext = path.extname(origName).replace(/[^.a-zA-Z0-9]/g, "") || ".mp4";
  const tmpPath = path.join(os.tmpdir(), `c24_ref_${rawId}${ext}`);

  if (!fs.existsSync(tmpPath)) {
    return res.status(404).json({ ok: false, error: "Uploaded file chunks not found on server." });
  }

  if (note) {
    fs.writeFileSync(path.join(UPLOADS_DIR, "user_note.txt"), note, "utf8");
  }

  const py = spawn("python3", ["scripts/analyze_reference.py", tmpPath, origName], {
    cwd: __dirname,
  });

  let stdout = "";
  let stderr = "";
  py.stdout.on("data", (d) => (stdout += d.toString()));
  py.stderr.on("data", (d) => (stderr += d.toString()));

  py.on("close", (code) => {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch (_e) {}

    if (code !== 0) {
      return res.status(500).json({
        ok: false,
        error: "FFmpeg analysis failed: " + (stderr || stdout).slice(-400),
      });
    }
    try {
      const parsed = JSON.parse(stdout.trim().split("\n").pop());
      return res.json(parsed);
    } catch (e) {
      return res.status(500).json({ ok: false, error: "Parse error: " + e.message });
    }
  });
});

app.post("/api/save-note", (req, res) => {
  const note = String(req.body?.note || "").trim();
  fs.writeFileSync(path.join(UPLOADS_DIR, "user_note.txt"), note, "utf8");
  res.json({ ok: true });
});

app.get("/api/reference-status", (_req, res) => {
  const analysisPath = path.join(UPLOADS_DIR, "analysis.json");
  const notePath = path.join(UPLOADS_DIR, "user_note.txt");
  const note = fs.existsSync(notePath) ? fs.readFileSync(notePath, "utf8") : "";
  if (fs.existsSync(analysisPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(analysisPath, "utf8"));
      return res.json({ ok: true, uploaded: true, note, analysis: data });
    } catch (_e) {}
  }
  return res.json({ ok: true, uploaded: false, note });
});

let renderInProgress = false;
let renderStatus = { state: "idle", message: "Ready", updatedAt: Date.now() };

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/download/16x9", (_req, res) => {
  res.download(
    path.join(__dirname, "public/videos/content24-ad-16x9.mp4"),
    "Content24-AI-Hub-Ad-16x9.mp4"
  );
});

app.get("/download/9x16", (_req, res) => {
  res.download(
    path.join(__dirname, "public/videos/content24-ad-9x16.mp4"),
    "Content24-AI-Hub-Ad-9x16.mp4"
  );
});

app.get("/api/status", (_req, res) => {
  res.json({ ok: true, renderInProgress, renderStatus });
});

app.post("/api/render", (req, res) => {
  if (renderInProgress) {
    return res.status(409).json({ ok: false, error: "A render is already in progress." });
  }
  const copyCfg = req.body && typeof req.body.copy === "object" ? req.body.copy : {};
  const format = ["16:9", "9:16", "both"].includes(req.body?.format) ? req.body.format : "both";

  renderInProgress = true;
  renderStatus = {
    state: "rendering",
    message: `Rendering ${format} HD commercial MP4...`,
    updatedAt: Date.now(),
  };

  const child = spawn("python3", ["scripts/render_ad_video.py", JSON.stringify(copyCfg), format], {
    cwd: __dirname,
  });

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
    const lines = logs.trim().split("\n");
    renderStatus = {
      state: "rendering",
      message: lines[lines.length - 1] || "Encoding frames via FFmpeg H.264...",
      updatedAt: Date.now(),
    };
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.on("close", (code) => {
    renderInProgress = false;
    if (code === 0) {
      renderStatus = {
        state: "done",
        message: "Render complete — HD MP4 updated!",
        updatedAt: Date.now(),
      };
    } else {
      renderStatus = {
        state: "error",
        message: `Render exited with code ${code}`,
        logs: logs.slice(-800),
        updatedAt: Date.now(),
      };
    }
  });

  res.json({ ok: true, status: renderStatus });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Content24 Ad Film Studio running at http://0.0.0.0:${PORT}`);
});
