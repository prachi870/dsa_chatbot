const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testChat() {
  console.log('=== Testing DSABot API ===\n');
  
  try {
    // Step 1: Signup/Login
    console.log('1. Creating test user...');
    const signupRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: `test_${Date.now()}@test.com`,
      password: 'test123456',
      name: 'Test User'
    });
    
    if (signupRes.status !== 200 && signupRes.status !== 201) {
      throw new Error(`Signup failed: ${JSON.stringify(signupRes)}`);
    }
    
    const token = signupRes.data.token;
    console.log('✓ User created, token:', token.substring(0, 20) + '...\n');
    
    // Step 2: Send a chat message
    console.log('2. Sending chat message...');
    const chatRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/chat',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      message: 'Explain arrays in simple terms'
    });
    
    if (chatRes.status !== 200) {
      throw new Error(`Chat failed: ${JSON.stringify(chatRes)}`);
    }
    
    console.log('✓ Chat response received:\n');
    console.log('Session ID:', chatRes.data.sessionId);
    console.log('In Scope:', chatRes.data.inScope);
    console.log('Reply preview:', chatRes.data.reply.substring(0, 200) + '...\n');
    
    console.log('=== TEST PASSED ===');
    
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testChat();
