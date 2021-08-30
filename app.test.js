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
                        account_balance: 0
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
                amount: 10
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
    it('PATCH /send -- send money', () => {
        return request(app)
            .post('/send/')
            .send({
                username: 'precious',
                amount: 5,
                to: 'default'
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
            to: 'default'
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
                to: 'default'
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
            to: 'default'
        }).expect(422);
    })
})