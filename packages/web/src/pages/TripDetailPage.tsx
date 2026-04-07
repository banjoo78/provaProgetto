import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '../lib/api';
import { formatDateRange, isTripActive } from '../lib/format';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function TripDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trips', id],
    queryFn: () => apiClient.trips.get(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.trips.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate('/');
    },
  });

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="px-4 py-6">
        <p className="text-red-700">ID viaggio non valido.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Torna alla lista
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <p className="px-4 py-6 text-gray-500" aria-live="polite">
        Caricamento…
      </p>
    );
  }

  if (error) {
    const msg = error instanceof ApiError ? error.message : 'Errore sconosciuto';
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-4">
          {msg}
        </div>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Torna alla lista
        </Link>
      </div>
    );
  }

  if (!trip) return null;

  const active = isTripActive(trip.startDate, trip.endDate);

  return (
    <div className="px-4 py-6">
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        ← Torna ai viaggi
      </Link>

      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {trip.city}
              {trip.country && (
                <span className="text-gray-500 font-normal">, {trip.country}</span>
              )}
            </h2>
            <p className="text-gray-600 mt-1">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          {active && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              In corso
            </span>
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {trip.client && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Cliente</dt>
              <dd className="mt-1 text-gray-900">{trip.client}</dd>
            </div>
          )}
          {trip.purpose && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Motivo</dt>
              <dd className="mt-1 text-gray-900">{trip.purpose}</dd>
            </div>
          )}
        </dl>

        {trip.notes && (
          <div className="mt-4">
            <dt className="text-sm font-medium text-gray-500">Note</dt>
            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">{trip.notes}</dd>
          </div>
        )}

        <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4">
          <Link
            to={`/trips/${trip.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Modifica
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Elimina
          </button>
        </div>

        {deleteMutation.error && (
          <p className="mt-3 text-sm text-red-600">
            Errore durante l&apos;eliminazione:{' '}
            {(deleteMutation.error as Error).message}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminare il viaggio?"
        message={`Stai per eliminare il viaggio a ${trip.city}. L'azione non è reversibile.`}
        confirmLabel="Elimina"
        destructive
        onConfirm={() => {
          setConfirmOpen(false);
          deleteMutation.mutate();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
