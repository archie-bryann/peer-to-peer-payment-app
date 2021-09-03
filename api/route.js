const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const moment = require('moment');

// data
const users = [
    {id:1,username:'default',naira_balance:0,dollar_balance:500, yen_balance:0,yuan_balance:0}
    // {id:1,username:'precious',naira_balance:0,dollar_balance:100, yen_balance:0,yuan_balance:0}
];
const transactions = [];

const rates = [
    {"dollar": 1},
    {"naira": 411.57},
    {"yen": 109.47},
    {"yuan": 6.46}
];

function getCurrencyAmount(currency) {
    let rate_amount;
    for(var j in rates) {
        if(currency == Object.keys(rates[j])[0]) {
            rate_amount = rates[j][currency];
        }
    }
    return rate_amount;
}
 
router.post('/add-user', (req,res,next) => {

    const {username} = req.body;
    const existing = users.find((user)=>user.username == username)

    if(existing) {
        return next(createError(409, 'User already exists'));
    }

    const newUser = {
        id: users.length + 1,
        username,
        naira_balance:0,
        dollar_balance:0, 
        yen_balance:0,
        yuan_balance:0
    }

    users.push(newUser);

    return res.status(201).json(newUser);
})

router.patch('/deposit/:username', (req,res,next)=>{
    // return res.status(200).json(users);
    const { username } = req.params;
    const { amount, currency } = req.body;

    var user = users.find(x => x.username == username);

    var index = users.findIndex(x => x.username == username);

    user[`${currency}_balance`] += amount;
    users[index] = user;

    return res.status(200).json(user);
})

router.post('/send', (req,res,next)=>{
    const {username,amount,to, currency} = req.body; // naira, dollar, yen, yuan

    const sender = users.find((user)=>user.username == username);
    const sender_index = users.findIndex((user)=>user.username == username);
    const recipient = users.find((user)=>user.username == to);
    const recipient_index = users.findIndex((user)=>user.username == to);

    // check if sender has sufficient account balance
    if(sender[`${currency}_balance`] < amount) {
        return next(createError(422, `Insufficient ${currency} balance`));
    }

    sender[`${currency}_balance`] -= amount;
    recipient[`${currency}_balance`] += amount;

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

router.post('/sell', (req,res,next) => {

    const { username, amount, from, to } = req.body; // dollar, naira
    
    const user = users.find(x=>x.username==username);

    if(user[`${from}_balance`] < amount) {
        return next(createError(422, `Insufficient ${from} balance`));
    }

    let converted_amount;
    if(from == 'dollar') {
        converted_amount = amount * getCurrencyAmount(from) * getCurrencyAmount(to);
    } else {
        converted_amount = (amount * getCurrencyAmount(from)) / getCurrencyAmount(to);
    }

    
    user[`${from}_balance`] = user[`${from}_balance`] - amount; 
    user[`${to}_balance`] = user[`${to}_balance`] + converted_amount; 

    return res.status(200).json(user);
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
    const {username, amount, bankcode, to, currency} = req.body;
    
    const sender = users.find((user)=>user.username == username);
    const sender_index = users.findIndex((user)=>user.username == username);


     // check if sender has sufficient account balance
     if(sender[`${currency}_balance`] < amount) {
        return next(createError(422, 'Insufficient account balance'));
    }

    sender[`${currency}_balance`] -= amount;
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
