import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors';
import { Database } from '../models';
import { processImage, deleteImage } from '../services/imageService';

export const searchSpaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      lat,
      lng,
      radius = 5,
      type,
      minPrice,
      maxPrice,
      minSize,
      city,
      page = 1,
      limit = 20
    } = req.query;

    const { Space, SpaceImage, User, Review } = req.app.locals.db as Database;
    const offset = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      available: true
    };

    // Location-based search
    if (lat && lng) {
      const sequelize = Space.sequelize!;
      where[Op.and] = sequelize.literal(
        `ST_DWithin(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${Number(radius) * 1000})`
      );
    }

    // Filters
    if (type) where.type = type;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (minPrice || maxPrice) {
      where.pricePerMonth = {};
      if (minPrice) where.pricePerMonth[Op.gte] = minPrice;
      if (maxPrice) where.pricePerMonth[Op.lte] = maxPrice;
    }
    if (minSize) where.size = { [Op.gte]: minSize };

    const { count, rows: spaces } = await Space.findAndCountAll({
      where,
      include: [
        {
          model: SpaceImage,
          as: 'images',
          attributes: ['url', 'order'],
          separate: true,
          order: [['order', 'ASC']]
        },
        {
          model: User,
          as: 'host',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            Space.sequelize!.fn('AVG', Space.sequelize!.col('reviews.rating')),
            'averageRating'
          ],
          [
            Space.sequelize!.fn('COUNT', Space.sequelize!.col('reviews.id')),
            'reviewCount'
          ]
        ]
      },
      group: ['Space.id', 'host.id'],
      offset,
      limit: Number(limit),
      order: lat && lng ? 
        [[Space.sequelize!.literal(`location <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`), 'ASC']] :
        [['created_at', 'DESC']],
      subQuery: false
    });

    sendPaginated(res, spaces, Number(page), Number(limit), count.length ? count[0].count : 0);
  } catch (error) {
    next(error);
  }
};

export const getMySpaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { Space, SpaceImage, Review } = req.app.locals.db as Database;
    
    const spaces = await Space.findAll({
      where: { hostId: req.user.id },
      include: [
        {
          model: SpaceImage,
          as: 'images',
          attributes: ['id', 'url', 'order'],
          separate: true,
          order: [['order', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Get ratings for each space
    const spacesWithRatings = await Promise.all(
      spaces.map(async (space) => {
        const reviews = await Review.findAll({
          where: { spaceId: space.id },
          attributes: [
            [Review.sequelize!.fn('AVG', Review.sequelize!.col('rating')), 'averageRating'],
            [Review.sequelize!.fn('COUNT', Review.sequelize!.col('id')), 'totalReviews']
          ],
          raw: true
        });

        const spaceData = space.toJSON() as any;
        const rating = reviews[0] as any;
        spaceData.averageRating = rating?.averageRating ? parseFloat(rating.averageRating) : null;
        spaceData.totalReviews = rating?.totalReviews ? parseInt(rating.totalReviews) : 0;
        return spaceData;
      })
    );

    sendSuccess(res, spacesWithRatings);
  } catch (error) {
    next(error);
  }
};

export const getSpaceById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { Space, SpaceImage, User, Review } = req.app.locals.db as Database;

    const space = await Space.findByPk(id, {
      include: [
        {
          model: SpaceImage,
          as: 'images',
          attributes: ['id', 'url', 'order'],
          order: [['order', 'ASC']]
        },
        {
          model: User,
          as: 'host',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'createdAt']
        }
      ]
    });

    if (!space) {
      throw new NotFoundError('Space');
    }

    const reviews = await Review.findAll({
      where: { spaceId: id },
      attributes: [
        [Review.sequelize!.fn('AVG', Review.sequelize!.col('rating')), 'averageRating'],
        [Review.sequelize!.fn('COUNT', Review.sequelize!.col('id')), 'totalReviews']
      ],
      raw: true
    });

    const spaceData = space.toJSON() as any;
    spaceData.rating = reviews[0] || { averageRating: 0, totalReviews: 0 };

    sendSuccess(res, spaceData);
  } catch (error) {
    next(error);
  }
};

export const createSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { Space } = req.app.locals.db as Database;
    
    const space = await Space.create({
      ...req.body,
      hostId: req.user.id
    });

    sendSuccess(res, space, 201);
  } catch (error) {
    next(error);
  }
};

export const updateSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { id } = req.params;
    const { Space } = req.app.locals.db as Database;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new NotFoundError('Space');
    }

    if (space.hostId !== req.user.id) {
      throw new AuthorizationError('You can only update your own spaces');
    }

    await space.update(req.body);

    sendSuccess(res, space);
  } catch (error) {
    next(error);
  }
};

export const deleteSpace = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { id } = req.params;
    const { Space, Booking } = req.app.locals.db as Database;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new NotFoundError('Space');
    }

    if (space.hostId !== req.user.id) {
      throw new AuthorizationError('You can only delete your own spaces');
    }

    // Check for active bookings
    const activeBookings = await Booking.count({
      where: {
        spaceId: id,
        status: ['pending', 'confirmed'],
        endDate: { [Op.gte]: new Date() }
      }
    });

    if (activeBookings > 0) {
      throw new ValidationError('Cannot delete space with active bookings');
    }

    await space.destroy();

    sendSuccess(res, { message: 'Space deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadSpaceImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { id } = req.params;
    const { Space, SpaceImage } = req.app.locals.db as Database;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new NotFoundError('Space');
    }

    if (space.hostId !== req.user.id) {
      throw new AuthorizationError('You can only upload images to your own spaces');
    }

    if (!req.files || !Array.isArray(req.files)) {
      throw new ValidationError('No images provided');
    }

    const existingImagesCount = await SpaceImage.count({ where: { spaceId: id } });
    
    if (existingImagesCount + req.files.length > 10) {
      throw new ValidationError('Maximum 10 images allowed per space');
    }

    const images = await Promise.all(
      req.files.map(async (file, index) => {
        const filename = await processImage(file.buffer, file.originalname);
        return SpaceImage.create({
          id: 0, // Auto-generated
          spaceId: Number(id),
          url: `/uploads/${filename}`,
          order: existingImagesCount + index
        } as any);
      })
    );

    sendSuccess(res, images, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteSpaceImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError();
    }

    const { id, imageId } = req.params;
    const { Space, SpaceImage } = req.app.locals.db as Database;

    const space = await Space.findByPk(id);

    if (!space) {
      throw new NotFoundError('Space');
    }

    if (space.hostId !== req.user.id) {
      throw new AuthorizationError('You can only delete images from your own spaces');
    }

    const image = await SpaceImage.findOne({
      where: { id: imageId, spaceId: id }
    });

    if (!image) {
      throw new NotFoundError('Image');
    }

    // Delete file from disk
    const filename = image.url.split('/').pop();
    if (filename) {
      await deleteImage(filename);
    }

    await image.destroy();

    sendSuccess(res, { message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};