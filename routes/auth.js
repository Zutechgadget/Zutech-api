import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../model/user.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const jwtPrivateKey = process.env.JWT_SECRET;
    if (!jwtPrivateKey) {
      console.error('JWT_SECRET not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin, email: user.email, name: user.name },
      jwtPrivateKey,
      { expiresIn: '24h' } // Changed from 1h to 24h
    );

    console.log('Generated token for:', email, { isAdmin: user.isAdmin });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;