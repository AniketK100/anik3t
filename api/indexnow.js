const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = JSON.stringify({
    host: 'anik3t.vercel.app',
    key: '37605b4c82d9401cb4dddcfab6747c86',
    keyLocation: 'https://anik3t.vercel.app/37605b4c82d9401cb4dddcfab6747c86.txt',
    urlList: ['https://anik3t.vercel.app/']
  });

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', chunk => body += chunk);
      response.on('end', () => {
        const isOk = response.statusCode === 200 || response.statusCode === 202;
        res.status(isOk ? 200 : response.statusCode).json({
          success: isOk,
          statusCode: response.statusCode,
          message: response.statusCode === 202 ? 'IndexNow accepted submission for processing' : 'IndexNow submission complete',
          host: 'anik3t.vercel.app',
          submittedUrl: 'https://anik3t.vercel.app/'
        });
        resolve();
      });
    });

    request.on('error', (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });

    request.write(payload);
    request.end();
  });
};
