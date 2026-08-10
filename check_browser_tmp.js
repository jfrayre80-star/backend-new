const http = require('http');

function raw(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const r = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method,
      headers,
    }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

(async () => {
  // 1) Login para obtener token
  const login = await raw('POST', '/auth/login', {
    'Content-Type': 'application/json',
    Origin: 'http://localhost:4200',
  }, JSON.stringify({ identifier: 'admin@gmail.com', password: 'prueba123' }));
  const token = JSON.parse(login.body).access_token;
  console.log('Login status:', login.status, '| CORS header:', login.headers['access-control-allow-origin']);

  // 2) Preflight OPTIONS como el navegador lo hace para POST json + Authorization
  const preflight = await raw('OPTIONS', '/students/register', {
    Origin: 'http://localhost:4200',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'authorization,content-type',
  });
  console.log('Preflight status:', preflight.status);
  console.log('Preflight ACAO:', preflight.headers['access-control-allow-origin']);
  console.log('Preflight ACAH:', preflight.headers['access-control-allow-headers']);

  // 3) POST real simulando el navegador (con Origin)
  const create = await raw('POST', '/students/register', {
    'Content-Type': 'application/json',
    Origin: 'http://localhost:4200',
    Authorization: 'Bearer ' + token,
  }, JSON.stringify({
    email: 'alumno_browser_403@gmail.com', password: 'password123', firstName: 'A', lastName: 'B',
    enrollmentNumber: 'ALU_BROWSE_001', parentEmail: 'padre_browser_403@gmail.com', parentPassword: 'password123',
    parentFirstName: 'C', parentLastName: 'D',
  }));
  console.log('POST student status:', create.status);
  console.log('POST body:', create.body.slice(0, 300));
})();
