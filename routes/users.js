import express from 'express';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

import auth from '../middleware/auth.js';
import { User, validateUser } from '../model/user.js';  // Import validateUser

const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);  // Use validateUser function
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('User already registered.');
    }

    // Create new user
    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send('Error creating user: ' + err.message);
    }

    // Send token and user data
    const token = jwt.sign({ _id: user._id }, config.get('jwtPrivateKey'));
    res.send({ ..._.pick(user, ['_id', 'name', 'email']), token });
});

export default router;
