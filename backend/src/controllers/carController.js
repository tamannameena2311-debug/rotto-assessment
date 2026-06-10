const Car = require('../models/Car');
const Booking = require('../models/Booking');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * POST /api/cars — create a car for the authenticated user.
 */
const createCar = async (req, res, next) => {
  try {
    const { make, model, year, registrationNumber, fuelType } = req.body;

    if (!make || !model || !year || !registrationNumber || !fuelType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'make, model, year, registrationNumber, and fuelType are required',
        },
      });
    }

    const existing = await Car.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'REGISTRATION_EXISTS',
          message: 'A car with this registration number already exists',
        },
      });
    }

    const car = await Car.create({
      userId: req.user.id,
      make,
      model,
      year,
      registrationNumber,
      fuelType,
    });

    res.status(201).json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cars — list all cars belonging to the authenticated user.
 */
const getMyCars = async (req, res, next) => {
  try {
    const filter = { userId: req.user.id };
    const search = req.query.search?.trim();

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { make: regex },
        { model: regex },
        { registrationNumber: regex },
        { fuelType: regex },
      ];
    }

    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: cars });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cars/:id — get a single car (must belong to the authenticated user).
 */
const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });

    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found' },
      });
    }

    res.json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cars/:id — update a car (make, model, year, fuelType only).
 */
const updateCar = async (req, res, next) => {
  try {
    const allowedFields = ['make', 'model', 'year', 'fuelType'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found' },
      });
    }

    res.json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cars/:id — delete a car.
 * Return 409 if any active bookings exist for this car.
 */
const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });

    if (!car) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAR_NOT_FOUND', message: 'Car not found' },
      });
    }

    const activeBooking = await Booking.findOne({
      carId: car._id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ACTIVE_BOOKINGS_EXIST',
          message: 'Cannot delete a car with active bookings',
        },
      });
    }

    await car.deleteOne();
    res.json({ success: true, data: { id: car._id } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCar, getMyCars, getCarById, updateCar, deleteCar };
