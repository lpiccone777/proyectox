import sequelize from '../config/database';
import { initDatabase } from '../models';
import { UserInstance } from '../models/User';

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    const db = initDatabase(sequelize);
    
    const users = await db.User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role']
    });
    
    console.log('\n=== Users in database ===');
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user: UserInstance) => {
      console.log(`\nID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Role: ${user.role}`);
      // console.log(`Created: ${user.createdAt}`);
    });
    
    // Check for specific email
    const email = process.argv[2];
    if (email) {
      console.log(`\n=== Checking for email: ${email} ===`);
      const user = await db.User.findOne({ where: { email } });
      if (user) {
        console.log('User found!');
      } else {
        console.log('User NOT found');
      }
      
      // Also check lowercase version
      const lowerEmail = email.toLowerCase();
      if (lowerEmail !== email) {
        console.log(`\n=== Checking lowercase: ${lowerEmail} ===`);
        const userLower = await db.User.findOne({ where: { email: lowerEmail } });
        if (userLower) {
          console.log('User found with lowercase email!');
        } else {
          console.log('User NOT found with lowercase');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();