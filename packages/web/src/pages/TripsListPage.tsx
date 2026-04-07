import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { TripCard } from '../components/TripCard';
import { EmptyState } from '../components/EmptyState';

export function TripsListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.trips.list(),
  });

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">I miei viaggi</h2>
        <Link
          to="/trips/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Nuovo viaggio
        </Link>
      </div>

      {isLoading && (
        <p className="text-gray-500" aria-live="polite">
          Caricamento…
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          Errore nel caricamento dei viaggi: {(error as Error).message}
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState
          icon="✈️"
          title="Nessun viaggio ancora"
          description="Aggiungi il tuo primo viaggio di lavoro per iniziare a tenere traccia dei ristoranti."
          action={
            <Link
              to="/trips/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Crea il primo viaggio
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
