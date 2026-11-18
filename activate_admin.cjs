const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:VuQr$4aqE9J@5eN@db.xqldtfpkfkqraltcdedn.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  // 1. Confirm email in auth.users
  const authRes = await client.query(
    'UPDATE auth.users SET email_confirmed_at = now() WHERE email = $1 RETURNING id, email, email_confirmed_at',
    ['gupistar.qris@gmail.com']
  );
  console.log('Confirmed in auth.users:', authRes.rows);

  if (authRes.rows.length > 0) {
    const user = authRes.rows[0];

    // 2. Insert or update in public.users with role = 'ADMIN' and status = 'VERIFIED'
    const publicRes = await client.query(`
      INSERT INTO public.users (id, email, full_name, role, status)
      VALUES ($1, $2, 'Admin Gupistar', 'ADMIN', 'VERIFIED')
      ON CONFLICT (id) DO UPDATE 
      SET role = 'ADMIN', status = 'VERIFIED'
      RETURNING id, email, role, status;
    `, [user.id, user.email]);

    console.log('Updated in public.users:', publicRes.rows);
  }

  await client.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  client.end();
});
