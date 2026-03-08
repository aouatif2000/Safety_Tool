# 🛡️ SAFETY PLATFORM - Complete Refactor

## Overview

A comprehensive Safety & Operations Platform with **AI-powered document generation** using **Ollama** (100% FREE, no paid APIs).

### The 5 Core Services

1. **  Toolbox Service** - Document repository with AI-powered generation
2. **  Incident Reporting** - Digital incident and near-miss reporting
3. **  Risk Assessment** - Systematic workplace risk evaluation
4. **  Permit System** - Work permit and authorization management
5. **  Access Control** - Zone access and personnel presence tracking

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Ollama** for AI features ([Install Guide](#installing-ollama))

### Installation Steps

#### 1. Install Ollama (FREE LLM)

**On Linux/macOS:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**On Windows:**
Download from [https://ollama.com/download](https://ollama.com/download)

#### 2. Download AI Model

```bash
# Recommended: Llama 3 (8GB RAM minimum)
ollama pull phi3:mini

# OR for lower-end hardware:
ollama pull phi3:mini.2    # 4GB RAM
ollama pull tinyllama   # 2GB RAM
```

#### 3. Start Ollama Server

```bash
ollama serve
```

Leave this running in a separate terminal. Ollama will run on `http://localhost:11434`

#### 4. Install Project Dependencies

```bash
# Clone the repository
cd Safety_Platform_Refactored

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (when created)
cd ../frontend
npm install
```

#### 5. Configure Environment

```bash
# In the backend directory
cp .env.example .env

# Edit .env if needed (default settings should work)
# Default Ollama URL: http://localhost:11434
# Default Model: phi3:mini
```

#### 6. Start the Application

```bash
# In backend directory
npm run dev

# The server will start on http://localhost:5000
```

---

## 📚 Architecture Overview

### Backend Structure

```
backend/
├── config/
│   └── documentRules.js          # LLM generation rules
├── models/
│   └── (future database models)
├── routes/
│   ├── toolbox.js                # Toolbox API with AI
│   ├── incidents.js              # Incident reporting API
│   ├── riskAssessments.js        # Risk assessment API
│   ├── permits.js                # Permit system API
│   └── accessControl.js          # Access control API
├── services/
│   ├── llmService.js             # ⭐ Ollama LLM integration
│   ├── toolboxService.js         # Toolbox business logic
│   ├── incidentService.js        # Incident business logic
│   ├── riskAssessmentService.js  # Risk assessment logic
│   ├── permitService.js          # Permit system logic
│   └── accessControlService.js   # Access control logic
├── server.js                     # Main Express server
├── package.json
└── .env.example
```

### Technology Stack

**Backend:**
- Node.js + Express.js
- **Ollama** (Local LLM - FREE)
- In-memory data store (MVP)

**Frontend:**
- React 18+
- React Router
- Custom CSS
- Lucide React icons

**NO PAID DEPENDENCIES:**
- ✅ Ollama (Free, open-source)
- ❌ OpenAI API (NOT USED)
- ❌ Azure OpenAI (NOT USED)

---

##   Service 1: Toolbox (AI-Powered)

### Features

- **AI Document Generation** using Ollama LLM
- 4 Document Types:
  - Safety Procedures
  - Machine Operation Guides
  - Safety Checklists
  - Maintenance Instructions
- Rule-based generation (13-14 rules per document type)
- Document versioning
- Export to Markdown, Text, JSON
- Full-text search
- Tag-based organization

### API Endpoints

#### Generate Document (AI)
```http
POST /api/toolbox/generate-document
Content-Type: application/json

{
  "documentType": "safety_procedure",
  "context": {
    "title": "Forklift Operation Procedure",
    "equipment": "Electric Forklift Model XY-2000",
    "location": "Warehouse A",
    "tasks": [
      "Pre-operation inspection",
      "Load handling",
      "Maneuvering in tight spaces"
    ],
    "hazards": [
      "Tip-over risk",
      "Pedestrian collision",
      "Load falling"
    ],
    "regulations": [
      "OSHA 1910.178",
      "ISO 3691-1"
    ],
    "ppe": [
      "Safety shoes",
      "High-visibility vest",
      "Hard hat"
    ]
  },
  "createdBy": "John Doe",
  "tags": ["forklift", "warehouse", "material-handling"]
}
```

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "DOC-0001",
    "type": "safety_procedure",
    "title": "Forklift Operation Procedure",
    "content": {
      "title": "Forklift Operation Procedure",
      "sections": [
        {
          "heading": "Purpose",
          "content": "...",
          "level": 2,
          "order": 1
        },
        ...
      ]
    },
    "rawMarkdown": "# Forklift Operation Procedure\n\n## Purpose\n...",
    "metadata": {
      "model": "phi3:mini",
      "generatedAt": "2025-03-07T10:30:00Z",
      "wordCount": 1247,
      "createdBy": "John Doe",
      "status": "draft",
      "version": 1
    }
  }
}
```

#### Get All Documents
```http
GET /api/toolbox/documents?type=safety_procedure&status=draft&search=forklift
```

#### Get Document by ID
```http
GET /api/toolbox/documents/DOC-0001
```

#### Update Document
```http
PUT /api/toolbox/documents/DOC-0001
Content-Type: application/json

{
  "status": "approved",
  "tags": ["forklift", "approved"]
}
```

#### Export Document
```http
GET /api/toolbox/export/DOC-0001?format=markdown
```

#### Get Document Types
```http
GET /api/toolbox/document-types
```

#### Get Statistics
```http
GET /api/toolbox/stats
```

#### Check LLM Health
```http
GET /api/toolbox/health
```

---

##   Service 2: Incident Reporting

### Features

- Three incident types:
  - Incidents
  - Near misses
  - Unsafe conditions
- Photo upload support
- Severity levels (low/medium/high/critical)
- Status workflow
- Follow-up actions
- Timeline tracking

### API Endpoints

#### Create Incident
```http
POST /api/incidents
Content-Type: application/json

{
  "type": "incident",
  "title": "Slip and Fall in Warehouse",
  "description": "Employee slipped on wet floor near loading dock",
  "location": "Warehouse A - Loading Dock 3",
  "dateTime": "2025-03-07T08:30:00Z",
  "severity": "medium",
  "reportedBy": {
    "id": "EMP001",
    "name": "Jane Smith"
  },
  "peopleInvolved": [
    {
      "id": "EMP042",
      "name": "Mike Johnson",
      "role": "Warehouse Worker"
    }
  ],
  "immediateActions": "Area cordoned off, wet floor signs placed"
}
```

#### Get All Incidents
```http
GET /api/incidents?type=incident&status=investigating&severity=high
```

#### Add Follow-Up
```http
POST /api/incidents/INC-2025-0001/follow-ups
Content-Type: application/json

{
  "description": "Repair drainage system",
  "action": "Contact facilities team to fix floor drainage",
  "responsiblePerson": {
    "id": "EMP100",
    "name": "Facilities Manager"
  },
  "dueDate": "2025-03-14",
  "createdBy": "Safety Officer"
}
```

---

##   Service 3: Risk Assessment

### Features

- Risk matrix (5x5)
- Severity scoring (1-5)
- Probability scoring (1-5)
- Automatic risk level calculation
- Mitigation action tracking
- Residual risk assessment

### API Endpoints

#### Create Risk Assessment
```http
POST /api/risk-assessments
Content-Type: application/json

{
  "title": "Chemical Storage Risk Assessment",
  "hazardDescription": "Exposure to corrosive chemicals",
  "activity": "Chemical storage and handling",
  "location": "Chemical Storage Room B",
  "peopleAtRisk": ["Chemical handlers", "Warehouse staff"],
  "existingControls": [
    "Ventilation system",
    "PPE available",
    "Safety showers"
  ],
  "severity": 4,
  "probability": 3,
  "assessedBy": {
    "id": "EMP050",
    "name": "Safety Manager"
  },
  "reviewDate": "2025-09-07"
}
```

**Response includes calculated risk:**
```json
{
  "success": true,
  "assessment": {
    "id": "RISK-2025-0001",
    "riskScore": 12,
    "riskLevel": "high",
    ...
  }
}
```

#### Get Risk Matrix
```http
GET /api/risk-assessments/matrix
```

---

##   Service 4: Permit System

### Features

- 5 Permit Types:
  - Hot Work
  - Working at Height
  - Confined Space Entry
  - Electrical Work
  - Zone Access
- Multi-level approval workflow
- Digital signatures
- Expiration alerts
- Active permit dashboard

### API Endpoints

#### Create Permit
```http
POST /api/permits
Content-Type: application/json

{
  "type": "hot_work",
  "workDescription": "Welding repairs on production line 3",
  "location": "Production Floor - Line 3",
  "requestedBy": {
    "id": "EMP030",
    "name": "Maintenance Technician"
  },
  "validFrom": "2025-03-08T07:00:00Z",
  "validTo": "2025-03-08T17:00:00Z",
  "precautionsConfirmed": [
    "Fire extinguisher present",
    "Area cleared of flammables"
  ],
  "emergencyContact": {
    "name": "John Doe",
    "phone": "+1-555-0100"
  }
}
```

#### Add Approval
```http
POST /api/permits/PERMIT-00001/approvals
Content-Type: application/json

{
  "role": "supervisor",
  "approvedBy": {
    "id": "EMP200",
    "name": "Production Supervisor"
  },
  "comments": "All precautions verified"
}
```

---

##   Service 5: Access Control

### Features

- Zone management
- Access rights per person/zone
- Entry/exit logging
- Live presence dashboard
- Capacity tracking
- Unauthorized entry alerts

### API Endpoints

#### Create Zone
```http
POST /api/access-control/zones
Content-Type: application/json

{
  "name": "High Voltage Equipment Room",
  "type": "restricted",
  "hazardLevel": "critical",
  "capacityLimit": 2,
  "requiredTraining": ["Electrical Safety Level 3"],
  "requiredPPE": ["Insulated gloves", "Arc flash suit"]
}
```

#### Grant Access Right
```http
POST /api/access-control/access-rights
Content-Type: application/json

{
  "personId": "EMP025",
  "personName": "Sarah Lee",
  "zoneId": "ZONE-001",
  "grantedBy": "Safety Manager",
  "trainingCompleted": true,
  "trainingDate": "2025-02-15"
}
```

#### Log Entry
```http
POST /api/access-control/logs/entry
Content-Type: application/json

{
  "personId": "EMP025",
  "personName": "Sarah Lee",
  "zoneId": "ZONE-001",
  "method": "card",
  "purpose": "Equipment maintenance"
}
```

#### Get Live Presence
```http
GET /api/access-control/presence
```

---

## 🔧 Troubleshooting

### Ollama Connection Issues

**Problem:** "Cannot connect to Ollama"

**Solution:**
1. Check Ollama is running: `ps aux | grep ollama`
2. Start Ollama: `ollama serve`
3. Test connectivity: `curl http://localhost:11434/api/tags`

### Model Not Found

**Problem:** "Model 'phi3:mini' not found"

**Solution:**
```bash
ollama pull phi3:mini
ollama list  # Verify model is installed
```

### Slow Document Generation

**Problem:** Documents take too long to generate

**Solutions:**
1. Use a lighter model: `ollama pull phi3:mini.2` or `ollama pull tinyllama`
2. Update `.env`: `OLLAMA_MODEL=phi3:mini.2`
3. Reduce context in document generation requests

### Port Already in Use

**Problem:** "Port 5000 already in use"

**Solution:**
Edit `.env` and change `PORT=5000` to another port (e.g., `PORT=5001`)

---

## 📊 API Documentation

### Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Security Considerations

### Current Implementation (MVP)

- In-memory data storage (no persistence)
- No authentication/authorization
- No encryption at rest

### Production Recommendations

1. **Database:** Replace in-memory stores with MongoDB/PostgreSQL
2. **Authentication:** Implement JWT-based auth
3. **Authorization:** Role-based access control (RBAC)
4. **HTTPS:** Enable SSL/TLS
5. **Data Encryption:** Encrypt sensitive fields
6. **Rate Limiting:** Prevent API abuse
7. **Input Validation:** Enhanced validation and sanitization

---

## 🚀 Deployment

### Deploying Ollama

**Option 1: Same Server**
- Run Ollama on the same server as the application
- Ensure sufficient RAM (8GB+ for phi3:mini)

**Option 2: Separate Server**
- Run Ollama on a dedicated GPU server
- Update `OLLAMA_BASE_URL` to point to the Ollama server

### Docker Deployment (Future)

```dockerfile
# Example Dockerfile for Ollama
FROM ollama/ollama:latest

RUN ollama pull phi3:mini

EXPOSE 11434
CMD ["ollama", "serve"]
```

---

## 📝 License

ISC License - Free for commercial use

---

## 🤝 Contributing

This is an internal ES-Tec project. For questions or improvements, contact the AI development team.

---

## 📞 Support

**Ollama Documentation:** https://ollama.com/docs
**Project Issues:** Contact ES-Tec AI Team

---

## ✅ Success Criteria Checklist

- ✅ All 5 services implemented
- ✅ Ollama LLM integration working
- ✅ Rule-based document generation (13-14 rules per type)
- ✅ Clean, maintainable code
- ✅ Complete API documentation
- ✅ Zero cost (no paid APIs)
- ✅ Professional backend architecture
- ✅ Comprehensive error handling
- ✅ Health check endpoints
- ✅ Statistics endpoints for all services

---

**Last Updated:** March 7, 2025
**Version:** 2.0.0 - Complete Refactor with Ollama Integration
