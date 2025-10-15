require('dotenv').config();
const axios = require('axios');

async function testRestAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...\n');

  const modelsToTest = [
    { name: 'gemini-1.5-flash', version: 'v1' },
    { name: 'gemini-1.5-pro', version: 'v1' },
    { name: 'gemini-pro', version: 'v1' },
    { name: 'gemini-1.5-flash', version: 'v1beta' },
  ];

  for (const { name, version } of modelsToTest) {
    try {
      console.log(`Testing: ${name} (${version})...`);
      const url = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent?key=${apiKey}`;
      
      const response = await axios.post(url, {
        contents: [{
          parts: [{
            text: 'Say "Hello, I am working!" if you can read this.'
          }]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`  ✅ SUCCESS! Response: ${text}\n`);
      return { name, version }; // Return the working model
    } catch (err) {
      if (err.response) {
        console.log(`  ❌ ${err.response.status}: ${err.response.data.error?.message || err.response.statusText}`);
      } else {
        console.log(`  ❌ ${err.message}`);
      }
    }
  }

  console.log('\n❌ None of the models worked. Checking API key status...');
  
  // Try to list models via REST API
  try {
    console.log('\n🔍 Attempting to list available models...');
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await axios.get(listUrl);
    
    console.log('✅ Available models:');
    response.data.models?.forEach(model => {
      console.log(`  - ${model.name}`);
    });
  } catch (err) {
    console.log('❌ Could not list models:', err.response?.data || err.message);
    console.log('\n⚠️  ISSUE: Your API key may not have access to the Generative Language API');
    console.log('\n📝 To fix this:');
    console.log('1. Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com');
    console.log('2. Select your project: projects/608207724245');
    console.log('3. Click "Enable API"');
    console.log('4. Wait a few minutes and try again');
    console.log('\nOR create a new API key at: https://aistudio.google.com/app/apikey');
  }
}

testRestAPI().catch(console.error);