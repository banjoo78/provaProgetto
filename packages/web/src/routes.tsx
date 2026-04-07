import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import App from './App';
import { TripsListPage } from './pages/TripsListPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { TripFormPage } from './pages/TripFormPage';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <TripsListPage /> },
      { path: 'trips/new', element: <TripFormPage /> },
      { path: 'trips/:id', element: <TripDetailPage /> },
      { path: 'trips/:id/edit', element: <TripFormPage /> },
      {
        path: '*',
        element: (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-600">Pagina non trovata.</p>
          </div>
        ),
      },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter(routes);
