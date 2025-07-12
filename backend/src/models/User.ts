import { DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'host' | 'tenant' | 'both';
  profilePicture?: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  googleId?: string;
  appleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInstance extends Model<UserAttributes, Partial<UserAttributes>>, UserAttributes {
  comparePassword(password: string): Promise<boolean>;
}

export const UserModel = (sequelize: Sequelize) => {
  const User = sequelize.define<UserInstance>('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[+]?[0-9\s-()]+$/
      }
    },
    role: {
      type: DataTypes.ENUM('host', 'tenant', 'both'),
      defaultValue: 'tenant'
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verifiedEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedPhone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    appleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: UserInstance) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: UserInstance) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  (User.prototype as any).comparePassword = async function(this: UserInstance, password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  };

  return User;
};