require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signin')
        .send({
          email: 'john@arbuckle.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 50000);
  
    afterAll(done => {
      return client.end(done);
    });
  
    // TEST FOR TODOS DATA
    test('GET/returns todos data', async() => {

      const expectation = {
        id: 1,
        todo: 'build time travel machine',
        completed: false,
        user_id: 1
      };

      const data = await fakeRequest(app)
        .get('/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/);
        // .expect(200);

      expect(data.body[0]).toEqual(expectation);
    });

    // TEST FOR NEW TODO
    test('POST/api/todos returns todos data', async() => {

      const newTodo = {
        todo: 'learn how to dance salsa',
        completed: true,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .set('Authorization', token)
        .send(newTodo)
        .expect(200)
        .expect('Content-Type', /json/);
       

      expect(data.body.todo).toEqual(newTodo.todo);
      expect(data.body.id).toBeGreaterThan(0);
    });

    // TEST FOR PUT/UPDATING TODO
    test('PUT//api/todos/:id updates todos', async() => {

      const updateTodo = {
        todo: 'learn how to dance salsa',
        completed: true,
        user_id: 2
      };
  
      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .set('Authorization', token)
        .send(updateTodo)
        .expect(200)
        .expect('Content-Type', /json/);
         
  
      expect(data.body.completed).toEqual(updateTodo.completed);
      expect(data.body.id).toBeGreaterThan(0);
    });

    //TEST TO DELETE TODO
    test('DELETE//api/todos/:id  deletes to do', async() => {
      const deleteTodo = {
        todo: 'learn how to dance salsa',
        completed: true,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .delete('/api/todos/4')
        .set('Authorization', token)
        .send(deleteTodo)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(data.body.todo).toEqual(deleteTodo.todo);
      expect(data.body.completed).toEqual(deleteTodo.completed);
    });

  });
});
