import express from 'express';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';

import { User, validateUser } from '../model/user.js';

const router = express.Router();

// Register new user
router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send('Error creating user: ' + err.message);
    }

    const token = jwt.sign({ _id: user._id }, config.get('jwtPrivateKey'));
    res.send({ ..._.pick(user, ['_id', 'name', 'email']), token });
});

// Direct password reset (no token)
router.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).send('Email and new password are required.');

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User with this email does not exist.');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    try {
        await user.save();
        res.send('Password has been reset successfully.');
    } catch (err) {
        res.status(500).send('Error updating password: ' + err.message);
    }
});

export default router;
