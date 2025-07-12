import { DataTypes, Model, Sequelize } from 'sequelize';

export interface SpaceAttributes {
  id: number;
  hostId: number;
  title: string;
  description: string;
  type: 'room' | 'garage' | 'warehouse' | 'locker' | 'other';
  address: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  size: number; // in square meters
  pricePerMonth: number;
  pricePerDay?: number;
  available: boolean;
  features: string[]; // JSON array of features
  rules?: string;
  minBookingDays: number;
  maxBookingDays?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SpaceInstance extends Model<SpaceAttributes>, SpaceAttributes {}

export const SpaceModel = (sequelize: Sequelize) => {
  const Space = sequelize.define<SpaceInstance>('Space', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('room', 'garage', 'warehouse', 'locker', 'other'),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    size: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.1
      }
    },
    pricePerMonth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    pricePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    minBookingDays: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    maxBookingDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    }
  }, {
    tableName: 'spaces',
    timestamps: true,
    underscored: true
  });

  return Space;
};