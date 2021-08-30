const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const moment = require('moment');

// data
const users = [{id:1,username:'default',account_balance:0}];
const transactions = [];

router.post('/add-user', (req,res,next) => {

    const {username} = req.body;
    const existing = users.find((user)=>user.username == username)

    if(existing) {
        return next(createError(409, 'User already exists'));
    }

    const newUser = {
        id: users.length + 1,
        username,
        account_balance:0
    }

    users.push(newUser);

    return res.status(201).json(newUser);
})

router.patch('/deposit/:username', (req,res,next)=>{
    // return res.status(200).json(users);
    const { username } = req.params;
    const { amount } = req.body;

    var user = users.find(x => x.username == username);

    var index = users.findIndex(x => x.username == username);

    user.account_balance += amount;
    users[index] = user;


    return res.status(200).json(user);
})

router.post('/send', (req,res,next)=>{
    const {username,amount,to} = req.body;

    const sender = users.find((user)=>user.username == username);
    const sender_index = users.findIndex((user)=>user.username == username);
    const recipient = users.find((user)=>user.username == to);
    const recipient_index = users.findIndex((user)=>user.username == to);

    // check if sender has sufficient account balance
    if(sender.account_balance < amount) {
        return next(createError(422, 'Insufficient account balance'));
    }

    sender.account_balance -= amount;
    recipient.account_balance += amount;

    users[sender_index] = sender;
    users[recipient_index] = recipient;

    const newTransaction = {
        id: transactions.length + 1,
        from: username,
        to,
        time: moment().unix(),
        type: 'debit',
        in_app: 'true',
        bank: '',
        status: 'success',
        description: 'Transaction successful'
    }

    transactions.push(newTransaction);

    return res.status(200).json(newTransaction);
})

router.get('/balance/:username', (req,res,next)=>{
    const {username} = req.params;

    const user = users.find((user)=>user.username == username)

    if(!user) {
        return next(createError(404, 'User does not exist'));
    }

    // the user object contains the account balance
    return res.status(200).json(user);
})

router.post('/transfer', (req,res,next) => {
    const {username, amount, bankcode, to} = req.body;
    
    const sender = users.find((user)=>user.username == username);
    const sender_index = users.findIndex((user)=>user.username == username);


     // check if sender has sufficient account balance
     if(sender.account_balance < amount) {
        return next(createError(422, 'Insufficient account balance'));
    }

    sender.account_balance -= amount;
    users[sender_index] = sender;

    // using an api the amount is then sent OUTSIDE THE APP

    const newTransaction = {
        id: transactions.length + 1,
        from: username,
        to,
        time: moment().unix(),
        type: 'debit',
        in_app: 'false',
        bank: bankcode,
        status: 'success',
        description: 'Transaction successful'
    }

    transactions.push(newTransaction);


    return res.status(200).json(newTransaction);
})

module.exports = router;
