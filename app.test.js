const request = require('supertest');
const app = require('./app');

describe('Wafi Api', () => {
    it('POST /add-user -- added user', () => {
        return request(app)
            .post('/add-user')
            .send({
                username: 'precious'
            })
            .expect('Content-Type', /json/)
            .expect(201)
            .then((response)=>{
                expect(response.body).toEqual(
                    expect.objectContaining({
                        username: 'precious',
                        naira_balance:0,
                        dollar_balance:0, 
                        yen_balance:0,
                        yuan_balance:0
                    })
                )
            })
    })

    it('POST /add-user -- validates request body', () => {
        return request(app).post('/add-user').send({ username: 'default' }).expect(409);
    })

    it('PATCH /deposit/:username -- deposit money', () => {
        return request(app)
            .patch('/deposit/precious')
            .send({
                amount: 10,
                currency: 'naira'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response)=>{
                expect(response.body).toEqual(
                    expect.objectContaining({
                        username: 'precious'
                    })
                )
            })
    })
    it('POST /send -- send money', () => {
        return request(app)
            .post('/send/')
            .send({
                username: 'precious',
                amount: 5,
                to: 'default',
                currency: 'naira'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response)=>{
                expect(response.body).toEqual(
                    expect.objectContaining({
                        status: 'success',
                        description: 'Transaction successful'
                    })
                )
            })
    })

    it('POST /send -- validates request body', () => {
        return request(app).post('/send').send({
            username: 'precious',
            amount: 100,
            to: 'default',
            currency: 'naira'
        }).expect(422);
    })

    it('SELL /sell -- sell for another currency', () => {
        return request(app)
            .post('/sell')
            .send({
                username: 'precious',
                amount: 5,
                from: 'naira',
                to: 'dollar',
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response)=>{
                expect(response.body).toEqual(
                    expect.objectContaining({
                        username: 'precious',
                    })
                )
            })
    })

    it('SELL /sell -- validates request body', () => {
        return request(app).post('/send').send({
            username: 'precious',
            amount: 52222222222222222222222,
            from: 'naira',
            to: 'dollar',
        }).expect(422);
    })


    it('GET /balance/:username -- get account balance', () => {
        return request(app)
            .get('/balance/precious')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response)=>{
                expect(response.body).toEqual(
                    expect.objectContaining({
                        username: 'precious'
                    })
                )
            })
    })

    it('POST /balance/:username -- validates request body', () => {
        return request(app).get('/balance/ddddd').expect(404);
    })


    it('PATCH /transfer -- transfers money', () => {
        return request(app)
            .post('/transfer/')
            .send({
                username: 'precious',
                amount: 2,
                bankcode: '032',
                to: 'default',
                to: 'naira'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response)=>{
                expect(response.body).toEqual(
                    expect.objectContaining({
                        status: 'success',
                        description: 'Transaction successful'
                    })
                )
            })
    })

    it('POST /transfer -- validates request body', () => {
        return request(app).post('/transfer').send({
            username: 'precious',
            amount: 1000,
            bankcode: '032',
            to: 'default',
            currency: 'naira'
        }).expect(422);
    })
})