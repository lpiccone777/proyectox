import { DataTypes, Model, Sequelize } from 'sequelize';

export interface ReviewAttributes {
  id: number;
  bookingId: number;
  spaceId: number;
  reviewerId: number;
  reviewedId: number;
  reviewType: 'host_to_tenant' | 'tenant_to_host' | 'tenant_to_space';
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReviewInstance extends Model<ReviewAttributes>, ReviewAttributes {}

export const ReviewModel = (sequelize: Sequelize) => {
  const Review = sequelize.define<ReviewInstance>('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces',
        key: 'id'
      }
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewType: {
      type: DataTypes.ENUM('host_to_tenant', 'tenant_to_host', 'tenant_to_space'),
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true
  });

  return Review;
};