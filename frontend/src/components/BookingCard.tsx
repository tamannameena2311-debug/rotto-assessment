import type { Booking, BookingStatus, Car, User } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onStatusChange?: (id: string, status: BookingStatus) => void;
  statusOptions?: BookingStatus[];
}

const getCar = (booking: Booking): Car | null => {
  if (booking.carId && typeof booking.carId === 'object') {
    return booking.carId as Car;
  }
  return null;
};

const getUser = (booking: Booking): User | null => {
  if (booking.userId && typeof booking.userId === 'object') {
    return booking.userId as User;
  }
  return null;
};

const STATUS_OPTIONS: BookingStatus[] = [
  'pending',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled',
];

const formatLabel = (value: string) => value.replace(/-/g, ' ');

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export default function BookingCard({
  booking,
  onStatusChange,
  statusOptions = STATUS_OPTIONS,
}: BookingCardProps) {
  const car = getCar(booking);
  const user = getUser(booking);

  return (
    <div className="rt-booking-card">
      <div className="rt-booking-card__header">
        <div>
          <p className="rt-booking-card__service">{formatLabel(booking.serviceType)}</p>
          <p className="rt-booking-card__date">{formatDate(booking.scheduledDate)}</p>
        </div>

        {onStatusChange ? (
          <select
            aria-label="Booking status"
            value={booking.status}
            onChange={(e) => onStatusChange(booking._id, e.target.value as BookingStatus)}
            className={`rt-booking-status rt-booking-status--${booking.status}`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        ) : (
          <span className={`rt-booking-status rt-booking-status--${booking.status}`}>
            {formatLabel(booking.status)}
          </span>
        )}
      </div>

      <p className="rt-booking-card__car">
        {car ? `${car.year} ${car.make} ${car.model} - ${car.registrationNumber}` : 'Car details unavailable'}
      </p>

      {user && (
        <p className="rt-booking-card__car">Customer: {user.name} ({user.email})</p>
      )}

      <p className="rt-booking-card__cost">Estimated cost: {formatCurrency(booking.estimatedCost)}</p>

      {booking.notes && (
        <p className="rt-booking-card__car">{booking.notes}</p>
      )}
    </div>
  );
}
