import {expect, test, beforeAll} from 'vitest'

import supertest from 'supertest'
import app from '../src/app'

beforeAll( async() => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
})

test('server running test', async () => {
    await supertest(app).get('/test').expect(200).then((response) => {
        expect(response.body).toBe("API is running...")
    })
})