// test-env.js
require('dotenv').config();

console.log('\n🔍 Testing Environment Variables:\n');

// Define required environment variables
const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

// Test function
function testEnvVariables() {
  let allPresent = true;
  
  console.log('📌 Checking required variables:');
  console.log('--------------------------------');
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      // Mask sensitive information
      let value = process.env[varName];
      if (varName.includes('PASSWORD') || varName.includes('SECRET')) {
        value = '********';
      }
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`❌ ${varName}: Missing!`);
      allPresent = false;
    }
  });

  console.log('\n📌 Testing database connection:');
  console.log('--------------------------------');
  
  // Test database connection
  const mysql = require('mysql2');
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  connection.connect((err) => {
    if (err) {
      console.log('❌ Database connection failed!');
      console.log('Error:', err.message);
    } else {
      console.log('✅ Database connection successful!');
      connection.end();
    }
    
    console.log('\n📌 Summary:');
    console.log('--------------------------------');
    if (allPresent) {
      console.log('✅ All required environment variables are present');
    } else {
      console.log('❌ Some environment variables are missing');
    }
  });
}

// Run the test
testEnvVariables();