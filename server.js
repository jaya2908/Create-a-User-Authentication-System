// --- Backend
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mern-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.', error });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error });
  }
});

app.get('/api/me', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.', error });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
