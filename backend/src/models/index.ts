import { Sequelize } from 'sequelize';
import { UserModel } from './User';
import { SpaceModel } from './Space';
import { BookingModel } from './Booking';
import { ReviewModel } from './Review';
import { PaymentModel } from './Payment';
import { SpaceImageModel } from './SpaceImage';

export interface Database {
  sequelize: Sequelize;
  User: ReturnType<typeof UserModel>;
  Space: ReturnType<typeof SpaceModel>;
  Booking: ReturnType<typeof BookingModel>;
  Review: ReturnType<typeof ReviewModel>;
  Payment: ReturnType<typeof PaymentModel>;
  SpaceImage: ReturnType<typeof SpaceImageModel>;
}

export const initDatabase = (sequelize: Sequelize): Database => {
  const User = UserModel(sequelize);
  const Space = SpaceModel(sequelize);
  const Booking = BookingModel(sequelize);
  const Review = ReviewModel(sequelize);
  const Payment = PaymentModel(sequelize);
  const SpaceImage = SpaceImageModel(sequelize);

  // User associations
  User.hasMany(Space, { as: 'spaces', foreignKey: 'hostId' });
  User.hasMany(Booking, { as: 'bookings', foreignKey: 'tenantId' });
  User.hasMany(Review, { as: 'reviewsGiven', foreignKey: 'reviewerId' });
  User.hasMany(Review, { as: 'reviewsReceived', foreignKey: 'reviewedId' });

  // Space associations
  Space.belongsTo(User, { as: 'host', foreignKey: 'hostId' });
  Space.hasMany(Booking, { as: 'bookings', foreignKey: 'spaceId' });
  Space.hasMany(SpaceImage, { as: 'images', foreignKey: 'spaceId' });
  Space.hasMany(Review, { as: 'reviews', foreignKey: 'spaceId' });

  // Booking associations
  Booking.belongsTo(User, { as: 'tenant', foreignKey: 'tenantId' });
  Booking.belongsTo(Space, { as: 'space', foreignKey: 'spaceId' });
  Booking.hasOne(Payment, { as: 'payment', foreignKey: 'bookingId' });
  Booking.hasMany(Review, { as: 'reviews', foreignKey: 'bookingId' });

  // Review associations
  Review.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewerId' });
  Review.belongsTo(User, { as: 'reviewed', foreignKey: 'reviewedId' });
  Review.belongsTo(Space, { as: 'space', foreignKey: 'spaceId' });
  Review.belongsTo(Booking, { as: 'booking', foreignKey: 'bookingId' });

  // Payment associations
  Payment.belongsTo(Booking, { as: 'booking', foreignKey: 'bookingId' });

  // SpaceImage associations
  SpaceImage.belongsTo(Space, { as: 'space', foreignKey: 'spaceId' });

  return {
    sequelize,
    User,
    Space,
    Booking,
    Review,
    Payment,
    SpaceImage
  };
};