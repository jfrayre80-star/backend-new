const { Client } = require('pg');
(async () => {
  const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: '031022', database: 'CECyTech' });
  await c.connect();
  const r = await c.query(
    "select s.id, s.is_active, s.expires_at, s.user_agent, u.email, u.role from active_sessions s join users u on u.id = s.user_id where u.email = 'admin@gmail.com' order by s.created_at desc limit 10"
  );
  console.log(JSON.stringify(r.rows, null, 2));
  await c.end();
})().catch((e) => console.error(e));
