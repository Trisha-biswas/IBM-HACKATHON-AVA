# Agentic VISA Assistant - Frontend

React frontend application built with Vite and Carbon Design System for the Agentic VISA Assistant project.

## Features

- **Dashboard**: View and manage all visa requests with Carbon DataTable
- **Dynamic Data**: Fetches real-time data from backend API
- **Carbon Design System**: Uses IBM's Carbon components for consistent UI
- **Responsive Design**: Works on desktop and mobile devices
- **Modal Details**: View detailed information for each request
- **File Downloads**: Download generated PDFs directly from the UI

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Carbon Design System**: IBM's design system (@carbon/react)
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with Carbon theme

## Prerequisites

- Node.js 18+ and npm
- Backend server running on http://localhost:3001

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Development

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:5173

## Build

```bash
# Build for production
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard component
│   │   └── Dashboard.css       # Dashboard styles
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── .env                        # Environment variables
├── package.json                # Dependencies
└── vite.config.js              # Vite configuration
```

## Components

### Dashboard

The main dashboard component that displays all visa requests in a Carbon DataTable.

**Features:**
- Fetches data from `/api/visa/dashboard` endpoint
- Displays requests in a sortable, searchable table
- Status tags (Complete/Pending) using Carbon Tag component
- Overflow menu for actions (View Details, Download All)
- Modal for viewing detailed traveler information
- File download tiles for PDFs

**Props:** None (fetches data internally)

**State:**
- `requests`: Array of visa requests
- `loading`: Loading state
- `error`: Error message
- `selectedRequest`: Currently selected request for modal
- `isModalOpen`: Modal visibility state
- `searchValue`: Search filter value

## API Integration

The dashboard connects to the backend API:

```javascript
const API_BASE_URL = 'http://localhost:3001/api/visa';

// Fetch dashboard data
GET /api/visa/dashboard

// Response format:
{
  "success": true,
  "requests": [
    {
      "requestId": "req-1777758310168",
      "createdAt": "2026-05-02T22:00:00.000Z",
      "summary": { "total": 2, "successful": 2, "failed": 0 },
      "travelers": [...],
      "pdfFiles": [...]
    }
  ],
  "summary": {
    "totalRequests": 1,
    "totalTravelers": 2,
    "successfulGenerations": 2,
    "failedGenerations": 0
  }
}
```

## Carbon Components Used

- `Header` & `HeaderName`: Top navigation
- `Breadcrumb` & `BreadcrumbItem`: Navigation breadcrumbs
- `DataTable`: Main table component
- `TableToolbar` & `TableToolbarSearch`: Table search functionality
- `Button`: Action buttons
- `Tag`: Status indicators
- `OverflowMenu` & `OverflowMenuItem`: Action menu
- `Modal`: Details popup
- `Tile`: File download cards
- `Loading`: Loading spinner
- `Theme`: Carbon theme wrapper

## Styling

The application uses:
1. **Carbon Design System**: Base styles from `@carbon/styles`
2. **Custom CSS**: Component-specific styles in `Dashboard.css`
3. **Global CSS**: Reset and base styles in `index.css`

### Color Palette (Carbon)
- Background: `#f4f4f4`
- White: `#ffffff`
- Text: `#161616`
- Secondary Text: `#525252`
- Border: `#e0e0e0`
- Error: `#da1e28`

## Testing

The code is written with clean, modular patterns for easy testing with React Testing Library.

Example test structure:
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './components/Dashboard';

test('renders dashboard with data', async () => {
  render(<Dashboard />);
  await waitFor(() => {
    expect(screen.getByText('Visa Application Package')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Backend Connection Error
If you see "Failed to load dashboard data":
1. Ensure backend server is running: `cd backend && npm run dev`
2. Check backend is on port 3001
3. Verify CORS is enabled in backend

### Carbon Styles Not Loading
1. Ensure `@carbon/styles` is imported in `main.jsx`
2. Check import order (Carbon styles before custom CSS)

### Build Errors
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`

## Future Enhancements

- [ ] Add create itinerary form
- [ ] Implement pagination for large datasets
- [ ] Add date range filtering
- [ ] Export to CSV functionality
- [ ] Dark mode support
- [ ] Unit tests with React Testing Library
- [ ] E2E tests with Playwright

## License

ISC

## Author

Agentic VISA Assistant Team
