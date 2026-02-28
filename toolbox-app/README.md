# ToolBox - AI-Powered Safety Document Management

A full-stack web application for construction site safety management, inspired by PreventX. It features AI-powered document generation, digital signatures via QR code, AI photo inspection, and a comprehensive project management dashboard.

## Features

### Implemented
- **Dashboard** — Personalized home screen with stats, recent activity, compliance status, and quick-action shortcuts
- **Project Management** — Browse and select projects to manage toolbox sessions
- **3-Step Document Request Wizard** — Guided form to create safety documents:
  1. Select project and document type (20+ types in 4 categories)
  2. Provide context (location, tasks, parties, photos)
  3. Review and confirm
- **AI Document Generator** — Automatically generates structured Toolbox Talk documents with hazard analysis, PPE requirements, and emergency procedures
- **Session Management** — View, close, cancel, and delete toolbox sessions
- **QR Code Signature System** — Generate QR codes for mobile signature collection
- **AI Photo Inspection (Beta)** — Upload site photos for automated hazard detection
- **Role-Based Sidebar Navigation** — Full navigation with all modules organized by category

### Document Types Supported
| Category | Types |
|----------|-------|
| Project & Site-Specific | TRA, LMRA, Method Statement, Task Risk Analysis, VGM Plan, Safety & Health Plan, RI&E, Incident Report, CAPA, Emergency Plan, Lifting/Height/Confined Space/Hot Work Risk Analysis, Traffic Plan |
| Company / Structural | Company RI&E, Global Prevention Plan, Annual Action Plan, Safety Policy |
| Subcontractor Documentation | Pre-qualification, Assessment Forms, Checklists, Dossiers, Communication Docs, Compliance Overview |
| Other | Custom document requests |

## Tech Stack

- **Frontend:** React 18, React Router v6, Lucide Icons
- **Backend:** Node.js, Express.js
- **AI Engine:** Template-based generation (ready for OpenAI/Azure OpenAI integration)
- **Storage:** In-memory (ready for database integration)

## Project Structure

```
toolbox-app/
├── backend/
│   ├── config/
│   │   └── documentTypes.js      # 20+ document type definitions
│   ├── models/
│   │   └── store.js              # In-memory data store
│   ├── routes/
│   │   ├── dashboard.js          # Dashboard statistics API
│   │   ├── documentTypes.js      # Document types API
│   │   ├── inspections.js        # AI inspection API
│   │   ├── projects.js           # Projects CRUD API
│   │   └── sessions.js           # Sessions + AI generation API
│   ├── services/
│   │   └── aiService.js          # AI document generation engine
│   ├── server.js                 # Express entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Top navigation bar
│   │   │   ├── NewRequestModal.jsx  # 3-step document wizard
│   │   │   └── Sidebar.jsx       # Left navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Home dashboard
│   │   │   ├── Inspection.jsx    # AI photo inspection
│   │   │   ├── PlaceholderPage.jsx  # Placeholder for future modules
│   │   │   ├── SessionDetail.jsx # Session detail + document view
│   │   │   ├── ToolboxProjects.jsx  # Project selection
│   │   │   └── ToolboxSessions.jsx  # Sessions list per project
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── styles/
│   │   │   ├── globals.css       # Global styles
│   │   │   └── sidebar.css       # Sidebar styles
│   │   ├── App.jsx               # Root component with routing
│   │   └── index.js              # React entry point
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# 1. Clone or unzip the project
cd toolbox-app

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

```bash
# Terminal 1: Start backend (port 5000)
cd backend
npm start

# Terminal 2: Start frontend (port 3000)
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
# For real AI generation (optional):
OPENAI_API_KEY=your-key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/document-types` | List document types by category |
| GET | `/api/sessions?projectId=` | List sessions (filter by project) |
| POST | `/api/sessions` | Create session + generate document |
| GET | `/api/sessions/:id` | Get session detail |
| PATCH | `/api/sessions/:id/status` | Update session status |
| POST | `/api/sessions/:id/signatures` | Add a signature |
| POST | `/api/inspections/analyze` | Upload photo for AI inspection |

## Production Deployment

For production, integrate:
1. **Database:** Replace in-memory store with PostgreSQL/MongoDB
2. **AI Engine:** Connect to OpenAI or Azure OpenAI for real document generation
3. **Authentication:** Add JWT-based auth with role management
4. **File Storage:** Use Azure Blob Storage or AWS S3 for photos/documents
5. **PDF Export:** Add PDF generation for signed document downloads

## License

Proprietary - Internal use only.
