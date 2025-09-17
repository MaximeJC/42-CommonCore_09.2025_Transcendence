import { getUserByEmail } from './db.js';

async function test() {
  const user = await getUserByEmail('merge@merge.com');
  console.log('Résultat final:', user);
}

test();
