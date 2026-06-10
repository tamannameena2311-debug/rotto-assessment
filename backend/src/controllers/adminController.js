const Booking = require('../models/Booking');

/**
 * GET /api/admin/stats
 * Protected (admin) — dashboard stats from one MongoDB facet aggregation.
 */
const getStats = async (req, res, next) => {
  try {
    const [stats] = await Booking.aggregate([
      {
        $facet: {
          bookingsByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, status: '$_id', count: 1 } },
            { $sort: { status: 1 } },
          ],
          bookingsByServiceType: [
            { $group: { _id: '$serviceType', count: { $sum: 1 } } },
            { $project: { _id: 0, serviceType: '$_id', count: 1 } },
            { $sort: { serviceType: 1 } },
          ],
          lastFiveBookings: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'cars',
                localField: 'carId',
                foreignField: '_id',
                as: 'car',
              },
            },
            { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                serviceType: 1,
                scheduledDate: 1,
                status: 1,
                estimatedCost: 1,
                createdAt: 1,
                car: {
                  _id: '$car._id',
                  make: '$car.make',
                  model: '$car.model',
                  year: '$car.year',
                  registrationNumber: '$car.registrationNumber',
                  fuelType: '$car.fuelType',
                },
                user: {
                  _id: '$user._id',
                  name: '$user.name',
                  email: '$user.email',
                  role: '$user.role',
                },
              },
            },
          ],
          revenue: [
            { $group: { _id: null, totalEstimatedRevenue: { $sum: '$estimatedCost' } } },
            { $project: { _id: 0, totalEstimatedRevenue: 1 } },
          ],
        },
      },
      {
        $project: {
          bookingsByStatus: 1,
          bookingsByServiceType: 1,
          lastFiveBookings: 1,
          totalEstimatedRevenue: {
            $ifNull: [{ $arrayElemAt: ['$revenue.totalEstimatedRevenue', 0] }, 0],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats || {
        bookingsByStatus: [],
        bookingsByServiceType: [],
        lastFiveBookings: [],
        totalEstimatedRevenue: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
