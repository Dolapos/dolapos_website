require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function initializeAdmin() {
  console.log('\n=== Admin Account Setup ===\n');

  rl.question('Enter admin username: ', (username) => {
    rl.question('Enter admin password: ', (password) => {
      rl.question('Enter secret admin path (e.g., "my-secret-admin-2024"): ', async (secretPath) => {

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          db.run(
            'INSERT OR REPLACE INTO admin (username, password, secret_path) VALUES (?, ?, ?)',
            [username, hashedPassword, secretPath],
            (err) => {
              if (err) {
                console.error('Error creating admin:', err.message);
              } else {
                console.log('\n✓ Admin account created successfully!');
                console.log(`\nYour secret admin URL: /admin/${secretPath}`);
                console.log('Keep this URL secret - it\'s your only way to access the admin panel.\n');
              }
              rl.close();
              db.close();
            }
          );
        } catch (error) {
          console.error('Error hashing password:', error);
          rl.close();
          db.close();
        }
      });
    });
  });
}

initializeAdmin();
