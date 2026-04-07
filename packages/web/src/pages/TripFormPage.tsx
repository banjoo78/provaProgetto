import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TripCreateInput } from '@provaprogetto/shared';
import type { Trip } from '@provaprogetto/shared';
import { apiClient, ApiError } from '../lib/api';
import { DateRangeInput } from '../components/DateRangeInput';
import { dateInputToIso, isoToDateInput } from '../lib/format';

interface FormState {
  city: string;
  country: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  client: string;
  purpose: string;
  notes: string;
}

const emptyForm: FormState = {
  city: '',
  country: '',
  startDate: '',
  endDate: '',
  client: '',
  purpose: '',
  notes: '',
};

function tripToForm(t: Trip): FormState {
  return {
    city: t.city,
    country: t.country ?? '',
    startDate: isoToDateInput(t.startDate),
    endDate: isoToDateInput(t.endDate),
    client: t.client ?? '',
    purpose: t.purpose ?? '',
    notes: t.notes ?? '',
  };
}

function buildPayload(form: FormState) {
  return {
    city: form.city,
    country: form.country || undefined,
    startDate: dateInputToIso(form.startDate),
    endDate: dateInputToIso(form.endDate),
    client: form.client || undefined,
    purpose: form.purpose || undefined,
    notes: form.notes || undefined,
  };
}

export function TripFormPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const isEdit = idParam !== undefined;
  const id = idParam ? Number(idParam) : NaN;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ['trips', id],
    queryFn: () => apiClient.trips.get(id),
    enabled: isEdit && Number.isFinite(id) && id > 0,
  });

  useEffect(() => {
    if (existing.data) setForm(tripToForm(existing.data));
  }, [existing.data]);

  const createMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildPayload>) =>
      apiClient.trips.create(payload as Parameters<typeof apiClient.trips.create>[0]),
    onSuccess: async (trip) => {
      await queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate(`/trips/${trip.id}`);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setSubmitError(err.message);
      } else {
        setSubmitError((err as Error).message);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildPayload>) =>
      apiClient.trips.update(
        id,
        payload as Parameters<typeof apiClient.trips.update>[1],
      ),
    onSuccess: async (trip) => {
      await queryClient.invalidateQueries({ queryKey: ['trips'] });
      await queryClient.invalidateQueries({ queryKey: ['trips', trip.id] });
      navigate(`/trips/${trip.id}`);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setSubmitError(err.message);
      } else {
        setSubmitError((err as Error).message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    const payload = buildPayload(form);

    // Client-side validation via shared Zod schema
    const parsed = TripCreateInput.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.errors) {
        const path = issue.path.join('.') || '_';
        if (!(path in fieldErrors)) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && existing.isLoading) {
    return (
      <p className="px-4 py-6 text-gray-500" aria-live="polite">
        Caricamento…
      </p>
    );
  }

  return (
    <div className="px-4 py-6 max-w-2xl">
      <Link to={isEdit ? `/trips/${id}` : '/'} className="text-blue-600 hover:underline text-sm">
        ← Annulla
      </Link>

      <h2 className="mt-4 text-2xl font-bold text-gray-900">
        {isEdit ? 'Modifica viaggio' : 'Nuovo viaggio'}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Città <span className="text-red-600">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
            maxLength={120}
            aria-invalid={errors.city ? 'true' : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Paese
          </label>
          <input
            id="country"
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            maxLength={120}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>

        <DateRangeInput
          startValue={form.startDate}
          endValue={form.endDate}
          onStartChange={(v) => setForm({ ...form, startDate: v })}
          onEndChange={(v) => setForm({ ...form, endDate: v })}
          startError={errors.startDate}
          endError={errors.endDate}
          required
        />

        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <input
            id="client"
            type="text"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
            Motivo del viaggio
          </label>
          <input
            id="purpose"
            type="text"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            maxLength={5000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea viaggio'}
          </button>
          <Link
            to={isEdit ? `/trips/${id}` : '/'}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Annulla
          </Link>
        </div>
      </form>
    </div>
  );
}
