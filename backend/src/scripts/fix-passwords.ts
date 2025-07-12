import sequelize from '../config/database';
import { initDatabase } from '../models';
import bcrypt from 'bcryptjs';

const fixPasswords = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const db = initDatabase(sequelize);

    // Find all users
    const users = await db.User.findAll();
    console.log(`Found ${users.length} users`);

    // Test password for verification
    const testPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    for (const user of users) {
      console.log(`\nUser: ${user.email}`);
      
      // Test if current password works
      const currentPasswordWorks = await bcrypt.compare(testPassword, user.password);
      console.log(`Current password works: ${currentPasswordWorks}`);

      if (!currentPasswordWorks) {
        // Update password
        user.password = hashedPassword;
        await user.save();
        console.log(`Password updated for ${user.email}`);
        
        // Verify the update
        const updatedUser = await db.User.findByPk(user.id);
        const newPasswordWorks = await bcrypt.compare(testPassword, updatedUser!.password);
        console.log(`New password works: ${newPasswordWorks}`);
      }
    }

    console.log('\nPassword fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixPasswords();