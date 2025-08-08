const express = require('express');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth'); // реализуй JWT-проверку
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + req.user.id + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware для JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'Токен отсутствует' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};

// Профиль
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка' });
  }
});

// Верификация
router.post('/verify', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.verified = true;
    user.avatar = `/uploads/${req.file.filename}`;
    user.balance += 50; // +50 Хуликов за верификацию
    await user.save();
    res.json({ message: '✅ Верифицировано!', balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки' });
  }
});

module.exports = router;
