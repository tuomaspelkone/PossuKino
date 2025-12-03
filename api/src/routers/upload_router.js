import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { updateOne, getOne } from '../models/user_model.js';

const router = Router();

const uploadsDir = path.resolve(process.cwd(), 'uploads');
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext && ext.length <= 6 ? ext : '';
    cb(null, `user_${req.params.id}_${Date.now()}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter called with:', file);
    const ok = (file.mimetype || '').startsWith('image/');
    if (!ok) {
      console.log('File rejected: not an image');
    }
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

// Add error handler middleware for multer
const uploadErrorHandler = (err, req, res, next) => {
  console.error('Multer error:', err);
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.post('/user/:id/profile_picture', (req, res, next) => {
  console.log('Request received at upload endpoint');
  console.log('Headers:', req.headers);
  console.log('Body before multer:', req.body);
  next();
}, upload.single('file'), uploadErrorHandler, async (req, res, next) => {
  try {
    console.log('Upload request received:', { id: req.params.id, file: req.file, body: req.body });
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid user id' });
    if (!req.file) {
      console.log('No file uploaded. Headers:', req.headers);
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const existing = await getOne(id);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const payload = {
      username: existing.username,
      email: existing.email,
      password: existing.password,
      refresh_token: existing.refresh_token,
      profile_picture_url: publicUrl
    };
    await updateOne(id, payload);
    res.json({ profile_picture_url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
});

export default router;
