import { DataTypes, Model, Sequelize } from 'sequelize';

export interface PaymentAttributes {
  id: number;
  bookingId: number;
  mercadopagoPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  payerEmail?: string;
  processedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentInstance extends Model<PaymentAttributes>, PaymentAttributes {}

export const PaymentModel = (sequelize: Sequelize) => {
  const Payment = sequelize.define<PaymentInstance>('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    mercadopagoPaymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'ARS'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'refunded'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true
  });

  return Payment;
};