import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Trip } from '@provaprogetto/shared';
import { TripCard } from './TripCard';

const baseTrip: Trip = {
  id: 1,
  city: 'Milano',
  country: 'Italia',
  startDate: '2026-04-10T00:00:00.000Z',
  endDate: '2026-04-12T00:00:00.000Z',
  client: 'Acme SpA',
  purpose: 'Workshop',
  notes: null,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

function renderCard(trip: Trip) {
  return render(
    <MemoryRouter>
      <TripCard trip={trip} />
    </MemoryRouter>,
  );
}

describe('<TripCard />', () => {
  it('renders city, country, dates and client', () => {
    renderCard(baseTrip);
    expect(screen.getByText('Milano')).toBeInTheDocument();
    expect(screen.getByText(', Italia')).toBeInTheDocument();
    expect(screen.getByText(/10\/04\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/12\/04\/2026/)).toBeInTheDocument();
    expect(screen.getByText('Acme SpA')).toBeInTheDocument();
  });

  it('shows "In corso" badge when today is within the trip range', () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(past.getDate() - 1);
    const future = new Date(today);
    future.setDate(future.getDate() + 1);

    renderCard({
      ...baseTrip,
      startDate: past.toISOString(),
      endDate: future.toISOString(),
    });
    expect(screen.getByText('In corso')).toBeInTheDocument();
  });

  it('does not show "In corso" badge for past trips', () => {
    renderCard({
      ...baseTrip,
      startDate: '2020-01-01T00:00:00.000Z',
      endDate: '2020-01-05T00:00:00.000Z',
    });
    expect(screen.queryByText('In corso')).not.toBeInTheDocument();
  });

  it('links to the trip detail page', () => {
    renderCard(baseTrip);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/trips/1');
  });
});
