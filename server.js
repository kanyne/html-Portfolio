const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

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
      try {
        fs.copyFileSync(
          path.join(__dirname, "public/videos/content24-ad-16x9.mp4"),
          path.join(__dirname, "Content24-Ad-16x9.mp4")
        );
        fs.copyFileSync(
          path.join(__dirname, "public/videos/content24-ad-9x16.mp4"),
          path.join(__dirname, "Content24-Ad-9x16.mp4")
        );
      } catch (_e) {}
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
