import { execSync } from 'child_process';

async function syncDatabase() {
  try {
    console.log('Running database migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });

    console.log('Running database seeders...');
    execSync('npm run db:seed', { stdio: 'inherit' });

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the sync function
syncDatabase();
