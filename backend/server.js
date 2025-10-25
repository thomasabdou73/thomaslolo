import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const VIDEOS_DIR = path.join(process.cwd(), "videos");
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR);

// multer setup (حفظ الملفات في ./videos)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, VIDEOS_DIR);
  },
  filename: function (req, file, cb) {
    // احتفظ بالاسم الأصلي
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // حد 2GB (يمكن تغييره)
});

let ffmpegProcess = null;
let currentFile = null;

app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  currentFile = path.basename(req.file.path);
  return res.json({ ok: true, filename: currentFile });
});

app.get('/videos', (req, res) => {
  const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.match(/\.(mp4|mkv|mov|webm)$/i));
  res.json(files);
});

app.post('/start', (req, res) => {
  const { streamKey, filename } = req.body;
  if (ffmpegProcess) return res.status(400).json({ error: 'Stream already running' });

  const key = streamKey || process.env.YOUTUBE_STREAM_KEY;
  const fileToPlay = filename || process.env.VIDEO_FILE || currentFile;

  if (!key) return res.status(400).json({ error: 'No stream key provided' });
  if (!fileToPlay) return res.status(400).json({ error: 'No video selected to stream' });

  const videoPath = path.join(VIDEOS_DIR, fileToPlay);
  if (!fs.existsSync(videoPath)) return res.status(400).json({ error: 'Video file not found' });

  const videoBitrate = process.env.VIDEO_BITRATE || '2500k';
  const audioBitrate = process.env.AUDIO_BITRATE || '128k';

  const args = [
    '-re',
    '-stream_loop', '-1',
    '-i', videoPath,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-b:v', videoBitrate,
    '-c:a', 'aac',
    '-b:a', audioBitrate,
    '-ar', '44100',
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${key}`
  ];

  ffmpegProcess = spawn('ffmpeg', args);

  ffmpegProcess.stderr.on('data', (d) => console.log('[ffmpeg]', d.toString()));
  ffmpegProcess.on('close', (code) => {
    console.log('ffmpeg exited', code);
    ffmpegProcess = null;
  });

  res.json({ ok: true, message: 'Stream started', file: fileToPlay });
});

app.post('/stop', (req, res) => {
  if (!ffmpegProcess) return res.status(400).json({ error: 'No running stream' });
  ffmpegProcess.kill('SIGINT');
  ffmpegProcess = null;
  res.json({ ok: true, message: 'Stream stopped' });
});

app.get('/status', (req, res) => {
  res.json({ running: !!ffmpegProcess, file: ffmpegProcess ? currentFile : null });
});

// serve uploaded videos via static (optional)
app.use('/uploads', express.static(VIDEOS_DIR));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
