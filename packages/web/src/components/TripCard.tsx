import { Link } from 'react-router-dom';
import type { Trip } from '@provaprogetto/shared';
import { formatDateRange, isTripActive } from '../lib/format';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const active = isTripActive(trip.startDate, trip.endDate);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {trip.city}
            {trip.country && (
              <span className="text-gray-500 font-normal">, {trip.country}</span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
        {active && (
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            In corso
          </span>
        )}
      </div>

      {(trip.client || trip.purpose) && (
        <div className="mt-3 text-sm text-gray-600 space-y-0.5">
          {trip.client && (
            <p className="truncate">
              <span className="font-medium text-gray-700">Cliente:</span> {trip.client}
            </p>
          )}
          {trip.purpose && (
            <p className="truncate">
              <span className="font-medium text-gray-700">Motivo:</span> {trip.purpose}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
