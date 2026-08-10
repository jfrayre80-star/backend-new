const http = require('http');

function raw(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const r = http.request({ hostname: 'localhost', port: 3000, path: '/api' + path, method, headers }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

(async () => {
  const login = await raw('POST', '/auth/login', { 'Content-Type': 'application/json' }, JSON.stringify({ identifier: 'admin@gmail.com', password: 'prueba123' }));
  const token = JSON.parse(login.body).access_token;
  console.log('Login:', login.status);

  const decoded = token.split('.')[1];
  const payload = JSON.parse(Buffer.from(decoded, 'base64url').toString());
  console.log('Token payload:', JSON.stringify(payload));

  const t = await raw('POST', '/teachers/register', {
    'Content-Type': 'application/json',
    Origin: 'http://localhost:4200',
    Authorization: 'Bearer ' + token,
  }, JSON.stringify({
    email: 'profesor_test_403@gmail.com', password: 'password123',
    firstName: 'Pedro', lastName: 'Gomez', employeeCode: 'T-4031',
  }));
  console.log('POST teacher:', t.status, t.body.slice(0, 200));

  const a = await raw('POST', '/admins/register', {
    'Content-Type': 'application/json',
    Origin: 'http://localhost:4200',
    Authorization: 'Bearer ' + token,
  }, JSON.stringify({
    email: 'admin_test_403@gmail.com', password: 'password123',
    firstName: 'Ana', lastName: 'Lopez', employeeCode: 'A-4031',
  }));
  console.log('POST admin:', a.status, a.body.slice(0, 200));
})();
