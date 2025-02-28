import express from 'express';
import { Customer, validate } from '../model/customer.js';


const router = express.Router();

// To show all customers
router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let customer = new Customer({
            name: req.body.name,
            isGold: req.body.isGold,
            phoneNumber: req.body.phoneNumber
        });
        customer = await customer.save();
        res.send(customer);
    } catch (err) {
        res.status(500).send('Server error: ' + err.message);
    }
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true }
    );

    if (!customer) return res.status(400).send("User with the given ID not found");
    res.send(customer);
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(400).send('The user with the given ID not found');
    res.send(customer);
});

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(400).send('The customer with the given ID not found');
    res.send(customer);
});

export default router;
