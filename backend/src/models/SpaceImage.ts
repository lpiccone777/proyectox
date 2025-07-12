import { DataTypes, Model, Sequelize } from 'sequelize';

export interface SpaceImageAttributes {
  id: number;
  spaceId: number;
  url: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SpaceImageInstance extends Model<SpaceImageAttributes>, SpaceImageAttributes {}

export const SpaceImageModel = (sequelize: Sequelize) => {
  const SpaceImage = sequelize.define<SpaceImageInstance>('SpaceImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'spaces',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'space_images',
    timestamps: true,
    underscored: true
  });

  return SpaceImage;
};