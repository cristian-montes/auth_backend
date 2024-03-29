const bcrypt = require('bcryptjs'); //--NEW--
const client = require('../lib/client');
// import our seed data:
const todos = require('./todos.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        const hash = bcrypt.hashSync(user.password, 8); //-NEW--
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, hash]); //-NEW--
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      todos.map(tidi => {
        return client.query(`
                    INSERT INTO todos (todo, completed, user_id)
                    VALUES ($1, $2, $3);
                `,
        [tidi.todo, tidi.completed, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
