import sequelize from '../config/database';
import { initDatabase } from '../models';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    // Initialize database
    await sequelize.sync({ force: true });
    console.log('Database synced');
    
    // Initialize models
    const db = initDatabase(sequelize);

    // Create test users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    const host = await db.User.create({
      email: 'host@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Host',
      phone: '+1234567890',
      role: 'host',
      verifiedEmail: true,
    } as any);

    const tenant = await db.User.create({
      email: 'tenant@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Tenant',
      phone: '+0987654321',
      role: 'tenant',
      verifiedEmail: true,
    } as any);

    const both = await db.User.create({
      email: 'both@example.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Both',
      phone: '+1122334455',
      role: 'both',
      verifiedEmail: true,
    } as any);

    console.log('Users created:', { host: host.id, tenant: tenant.id, both: both.id });

    // Create test spaces
    const spaces = await db.Space.bulkCreate([
      {
        hostId: host.id,
        title: 'Spacious Garage in Palermo',
        description: 'Large garage space perfect for storage, easy access',
        type: 'garage',
        address: 'Av. Santa Fe 3000',
        city: 'Buenos Aires',
        province: 'CABA',
        postalCode: '1425',
        latitude: -34.5875,
        longitude: -58.4086,
        size: 25,
        pricePerMonth: 15000,
        pricePerDay: 600,
        available: true,
        features: JSON.stringify(['24/7 Access', 'Security Cameras', 'Ground Floor']),
        rules: 'No flammable materials, Access with 24h notice',
        minBookingDays: 30,
      },
      {
        hostId: host.id,
        title: 'Storage Room in Recoleta',
        description: 'Secure storage room in residential building',
        type: 'room',
        address: 'Av. Callao 1234',
        city: 'Buenos Aires',
        province: 'CABA',
        postalCode: '1024',
        latitude: -34.5943,
        longitude: -58.3925,
        size: 10,
        pricePerMonth: 8000,
        pricePerDay: 300,
        available: true,
        features: JSON.stringify(['Elevator', 'Climate Control', 'Security']),
        rules: 'No pets, No food items',
        minBookingDays: 7,
      },
      {
        hostId: both.id,
        title: 'Small Locker in Belgrano',
        description: 'Perfect for documents and small items',
        type: 'locker',
        address: 'Av. Cabildo 2000',
        city: 'Buenos Aires',
        province: 'CABA',
        postalCode: '1428',
        latitude: -34.5562,
        longitude: -58.4496,
        size: 2,
        pricePerMonth: 3000,
        available: true,
        features: JSON.stringify(['24/7 Access', 'Individual Lock']),
        rules: 'Documents and small items only',
        minBookingDays: 30,
      },
    ] as any);

    console.log(`Spaces created: ${spaces.length} spaces`);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();