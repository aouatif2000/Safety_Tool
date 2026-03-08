# 📊 Database Schema Design

## Overview

This document defines the database schemas for all 5 services when moving from in-memory storage to a persistent database (MongoDB or PostgreSQL).

---

## Technology Recommendations

### Option 1: MongoDB (Recommended)

**Pros:**
- Flexible schema (good for evolving requirements)
- Easy to work with Node.js (Mongoose ODM)
- JSON-like documents match in-memory structure
- Good for unstructured data (incident photos, documents)

**Cons:**
- Less strict data validation
- No built-in transactions (older versions)

### Option 2: PostgreSQL

**Pros:**
- Strong data validation
- ACID transactions
- Better for complex queries and reporting
- Relationships between tables

**Cons:**
- More rigid schema
- Requires ORM (Sequelize, TypeORM)
- JSON support not as native

---

## 1. Toolbox Service Schema

### Documents Collection/Table

#### MongoDB Schema
```javascript
{
  _id: ObjectId,
  id: String,              // "DOC-0001" (indexed, unique)
  type: String,            // "safety_procedure", "machine_operation", etc.
  title: String,
  content: {
    title: String,
    sections: [
      {
        heading: String,
        content: String,
        level: Number,
        order: Number
      }
    ],
    fullMarkdown: String
  },
  rawMarkdown: String,
  metadata: {
    model: String,          // "phi3:mini"
    generatedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    createdBy: String,
    status: String,         // "draft", "approved", "archived"
    version: Number,
    wordCount: Number,
    characterCount: Number,
    documentType: String
  },
  context: {
    title: String,
    equipment: String,
    location: String,
    tasks: [String],
    hazards: [String],
    regulations: [String],
    ppe: [String],
    tools: [String],
    frequency: String,
    customInstructions: String
  },
  tags: [String],
  versionHistory: [
    {
      version: Number,
      updatedAt: Date,
      updatedBy: String,
      changes: String
    }
  ]
}
```

#### PostgreSQL Schema
```sql
-- Documents table
CREATE TABLE documents (
  id VARCHAR(20) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  raw_markdown TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  word_count INTEGER,
  llm_model VARCHAR(50)
);

-- Document sections table
CREATE TABLE document_sections (
  id SERIAL PRIMARY KEY,
  document_id VARCHAR(20) REFERENCES documents(id) ON DELETE CASCADE,
  heading VARCHAR(255) NOT NULL,
  content TEXT,
  level INTEGER,
  order_index INTEGER
);

-- Document tags table
CREATE TABLE document_tags (
  id SERIAL PRIMARY KEY,
  document_id VARCHAR(20) REFERENCES documents(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL
);

-- Indexes
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_document_tags_tag ON document_tags(tag);
```

---

## 2. Incident Reporting Schema

### Incidents Collection/Table

#### MongoDB Schema
```javascript
{
  _id: ObjectId,
  id: String,              // "INC-2025-0001" (indexed, unique)
  type: String,            // "incident", "near_miss", "unsafe_condition"
  title: String,
  description: String,
  location: String,
  dateTime: Date,
  reportedBy: {
    id: String,
    name: String,
    email: String
  },
  reportedAt: Date,
  severity: String,        // "low", "medium", "high", "critical"
  peopleInvolved: [
    {
      id: String,
      name: String,
      role: String,
      injuries: String
    }
  ],
  witnesses: [
    {
      id: String,
      name: String,
      contactInfo: String
    }
  ],
  photos: [
    {
      url: String,
      uploadedAt: Date,
      description: String
    }
  ],
  immediateActions: String,
  status: String,          // "reported", "investigating", "action_taken", "closed"
  assignedTo: {
    id: String,
    name: String
  },
  followUps: [
    {
      id: String,
      description: String,
      action: String,
      responsiblePerson: {
        id: String,
        name: String
      },
      dueDate: Date,
      completedAt: Date,
      status: String,      // "pending", "in_progress", "completed"
      createdAt: Date,
      createdBy: String
    }
  ],
  timeline: [
    {
      action: String,
      timestamp: Date,
      by: String
    }
  ],
  rootCauseAnalysis: {
    rootCause: String,
    contributingFactors: [String],
    preventiveMeasures: [String]
  },
  updatedAt: Date
}
```

#### PostgreSQL Schema
```sql
-- Incidents table
CREATE TABLE incidents (
  id VARCHAR(20) PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  date_time TIMESTAMP NOT NULL,
  reported_by_id VARCHAR(20),
  reported_by_name VARCHAR(100),
  reported_at TIMESTAMP DEFAULT NOW(),
  severity VARCHAR(20) NOT NULL,
  immediate_actions TEXT,
  status VARCHAR(30) DEFAULT 'reported',
  assigned_to_id VARCHAR(20),
  assigned_to_name VARCHAR(100),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- People involved table
CREATE TABLE incident_people (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(20) REFERENCES incidents(id) ON DELETE CASCADE,
  person_id VARCHAR(20),
  person_name VARCHAR(100),
  role VARCHAR(100),
  injuries TEXT
);

-- Photos table
CREATE TABLE incident_photos (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(20) REFERENCES incidents(id) ON DELETE CASCADE,
  url VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  description TEXT
);

-- Follow-ups table
CREATE TABLE incident_followups (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(20) REFERENCES incidents(id) ON DELETE CASCADE,
  followup_id VARCHAR(20) UNIQUE,
  description TEXT,
  action TEXT,
  responsible_person_id VARCHAR(20),
  responsible_person_name VARCHAR(100),
  due_date DATE,
  completed_at TIMESTAMP,
  status VARCHAR(30) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- Timeline table
CREATE TABLE incident_timeline (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(20) REFERENCES incidents(id) ON DELETE CASCADE,
  action VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  by VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_date_time ON incidents(date_time DESC);
```

---

## 3. Risk Assessment Schema

### Risk Assessments Collection/Table

#### MongoDB Schema
```javascript
{
  _id: ObjectId,
  id: String,              // "RISK-2025-0001"
  title: String,
  hazardDescription: String,
  activity: String,
  location: String,
  peopleAtRisk: [String],
  existingControls: [String],
  severity: Number,        // 1-5
  probability: Number,     // 1-5
  riskScore: Number,       // severity * probability
  riskLevel: String,       // "low", "medium", "high", "critical"
  mitigationActions: [
    {
      id: String,
      description: String,
      responsiblePerson: {
        id: String,
        name: String
      },
      targetDate: Date,
      status: String,
      completedAt: Date,
      createdAt: Date
    }
  ],
  assessedBy: {
    id: String,
    name: String
  },
  assessedAt: Date,
  reviewDate: Date,
  status: String,          // "active", "mitigated", "closed"
  residualRisk: {
    severity: Number,
    probability: Number,
    riskScore: Number,
    riskLevel: String,
    assessedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### PostgreSQL Schema
```sql
-- Risk assessments table
CREATE TABLE risk_assessments (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  hazard_description TEXT NOT NULL,
  activity VARCHAR(255),
  location VARCHAR(255),
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (severity * probability) STORED,
  risk_level VARCHAR(20) NOT NULL,
  assessed_by_id VARCHAR(20),
  assessed_by_name VARCHAR(100),
  assessed_at TIMESTAMP DEFAULT NOW(),
  review_date DATE,
  status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- People at risk table
CREATE TABLE risk_people_at_risk (
  id SERIAL PRIMARY KEY,
  risk_assessment_id VARCHAR(20) REFERENCES risk_assessments(id) ON DELETE CASCADE,
  group_description VARCHAR(255)
);

-- Existing controls table
CREATE TABLE risk_existing_controls (
  id SERIAL PRIMARY KEY,
  risk_assessment_id VARCHAR(20) REFERENCES risk_assessments(id) ON DELETE CASCADE,
  control_description TEXT
);

-- Mitigation actions table
CREATE TABLE risk_mitigation_actions (
  id SERIAL PRIMARY KEY,
  risk_assessment_id VARCHAR(20) REFERENCES risk_assessments(id) ON DELETE CASCADE,
  action_id VARCHAR(20) UNIQUE,
  description TEXT,
  responsible_person_id VARCHAR(20),
  responsible_person_name VARCHAR(100),
  target_date DATE,
  status VARCHAR(30) DEFAULT 'pending',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Residual risk table
CREATE TABLE risk_residual_assessments (
  id SERIAL PRIMARY KEY,
  risk_assessment_id VARCHAR(20) REFERENCES risk_assessments(id) ON DELETE CASCADE,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  probability INTEGER CHECK (probability BETWEEN 1 AND 5),
  risk_score INTEGER,
  risk_level VARCHAR(20),
  assessed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_risk_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_status ON risk_assessments(status);
CREATE INDEX idx_risk_score ON risk_assessments(risk_score DESC);
```

---

## 4. Permit System Schema

### Permits Collection/Table

#### MongoDB Schema
```javascript
{
  _id: ObjectId,
  id: String,              // "PERMIT-00001"
  type: String,            // "hot_work", "height", "confined_space", etc.
  typeName: String,
  workDescription: String,
  location: String,
  requestedBy: {
    id: String,
    name: String
  },
  contractor: {
    name: String,
    company: String,
    contactInfo: String
  },
  validFrom: Date,
  validTo: Date,
  requiredPrecautions: [String],
  precautionsConfirmed: [String],
  additionalPrecautions: [String],
  requiredApprovals: [String],
  approvals: [
    {
      role: String,
      approvedBy: {
        id: String,
        name: String
      },
      approvedAt: Date,
      comments: String
    }
  ],
  signatures: [
    {
      role: String,
      name: String,
      signedAt: Date,
      type: String         // "digital", "electronic"
    }
  ],
  status: String,          // "pending", "approved", "active", "completed", "cancelled", "expired"
  notes: String,
  emergencyContact: {
    name: String,
    phone: String
  },
  activatedAt: Date,
  activatedBy: String,
  completedAt: Date,
  completedBy: String,
  cancelledAt: Date,
  cancelledBy: String,
  cancellationReason: String,
  expiredAt: Date,
  createdAt: Date,
  createdBy: String
}
```

#### PostgreSQL Schema
```sql
-- Permits table
CREATE TABLE permits (
  id VARCHAR(20) PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  type_name VARCHAR(100),
  work_description TEXT NOT NULL,
  location VARCHAR(255),
  requested_by_id VARCHAR(20),
  requested_by_name VARCHAR(100),
  contractor_name VARCHAR(100),
  contractor_company VARCHAR(100),
  valid_from TIMESTAMP NOT NULL,
  valid_to TIMESTAMP NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  notes TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  activated_at TIMESTAMP,
  activated_by VARCHAR(100),
  completed_at TIMESTAMP,
  completed_by VARCHAR(100),
  cancelled_at TIMESTAMP,
  cancelled_by VARCHAR(100),
  cancellation_reason TEXT,
  expired_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- Permit precautions table
CREATE TABLE permit_precautions (
  id SERIAL PRIMARY KEY,
  permit_id VARCHAR(20) REFERENCES permits(id) ON DELETE CASCADE,
  precaution TEXT,
  is_confirmed BOOLEAN DEFAULT FALSE
);

-- Permit approvals table
CREATE TABLE permit_approvals (
  id SERIAL PRIMARY KEY,
  permit_id VARCHAR(20) REFERENCES permits(id) ON DELETE CASCADE,
  role VARCHAR(50),
  approved_by_id VARCHAR(20),
  approved_by_name VARCHAR(100),
  approved_at TIMESTAMP DEFAULT NOW(),
  comments TEXT
);

-- Permit signatures table
CREATE TABLE permit_signatures (
  id SERIAL PRIMARY KEY,
  permit_id VARCHAR(20) REFERENCES permits(id) ON DELETE CASCADE,
  role VARCHAR(50),
  name VARCHAR(100),
  signed_at TIMESTAMP DEFAULT NOW(),
  signature_type VARCHAR(20)
);

-- Indexes
CREATE INDEX idx_permits_type ON permits(type);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_valid_from ON permits(valid_from);
CREATE INDEX idx_permits_valid_to ON permits(valid_to);
```

---

## 5. Access Control Schema

### Zones, Access Rights, and Logs Collections/Tables

#### MongoDB Schema

**Zones Collection:**
```javascript
{
  _id: ObjectId,
  id: String,              // "ZONE-001"
  name: String,
  type: String,            // "production", "restricted", "hazardous", etc.
  description: String,
  hazardLevel: String,     // "low", "medium", "high", "critical"
  capacityLimit: Number,
  requiredTraining: [String],
  requiredPermissions: [String],
  requiredPPE: [String],
  emergencyExits: [String],
  currentOccupancy: Number,
  status: String,          // "active", "closed", "restricted"
  createdAt: Date,
  updatedAt: Date
}
```

**Access Rights Collection:**
```javascript
{
  _id: ObjectId,
  id: String,              // "ACCESS-001"
  personId: String,
  personName: String,
  zoneId: String,
  zoneName: String,
  grantedBy: String,
  grantedAt: Date,
  validFrom: Date,
  validTo: Date,           // null = permanent
  status: String,          // "active", "suspended", "revoked"
  trainingCompleted: Boolean,
  trainingDate: Date,
  revokedAt: Date,
  revokedBy: String,
  revocationReason: String
}
```

**Access Logs Collection:**
```javascript
{
  _id: ObjectId,
  id: String,              // "LOG-000001"
  type: String,            // "entry", "exit"
  personId: String,
  personName: String,
  zoneId: String,
  zoneName: String,
  timestamp: Date,
  method: String,          // "manual", "card", "biometric", "qr"
  authorized: Boolean,
  purpose: String,
  exitTime: Date,          // for entry logs
  duration: Number         // minutes
}
```

#### PostgreSQL Schema
```sql
-- Zones table
CREATE TABLE zones (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  description TEXT,
  hazard_level VARCHAR(20),
  capacity_limit INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Zone requirements tables
CREATE TABLE zone_required_training (
  id SERIAL PRIMARY KEY,
  zone_id VARCHAR(20) REFERENCES zones(id) ON DELETE CASCADE,
  training_name VARCHAR(255)
);

CREATE TABLE zone_required_ppe (
  id SERIAL PRIMARY KEY,
  zone_id VARCHAR(20) REFERENCES zones(id) ON DELETE CASCADE,
  ppe_item VARCHAR(255)
);

-- Access rights table
CREATE TABLE access_rights (
  id VARCHAR(20) PRIMARY KEY,
  person_id VARCHAR(20) NOT NULL,
  person_name VARCHAR(100),
  zone_id VARCHAR(20) REFERENCES zones(id) ON DELETE CASCADE,
  zone_name VARCHAR(255),
  granted_by VARCHAR(100),
  granted_at TIMESTAMP DEFAULT NOW(),
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  status VARCHAR(30) DEFAULT 'active',
  training_completed BOOLEAN DEFAULT FALSE,
  training_date DATE,
  revoked_at TIMESTAMP,
  revoked_by VARCHAR(100),
  revocation_reason TEXT
);

-- Access logs table
CREATE TABLE access_logs (
  id VARCHAR(20) PRIMARY KEY,
  type VARCHAR(10) NOT NULL,
  person_id VARCHAR(20) NOT NULL,
  person_name VARCHAR(100),
  zone_id VARCHAR(20) REFERENCES zones(id),
  zone_name VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  method VARCHAR(20),
  authorized BOOLEAN,
  purpose TEXT,
  exit_time TIMESTAMP,
  duration INTEGER
);

-- Indexes
CREATE INDEX idx_zones_type ON zones(type);
CREATE INDEX idx_zones_hazard_level ON zones(hazard_level);
CREATE INDEX idx_access_rights_person ON access_rights(person_id);
CREATE INDEX idx_access_rights_zone ON access_rights(zone_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp DESC);
CREATE INDEX idx_access_logs_person ON access_logs(person_id);
CREATE INDEX idx_access_logs_zone ON access_logs(zone_id);
```

---

## Migration Plan

### Phase 1: Choose Database
- Evaluate MongoDB vs PostgreSQL based on team expertise
- Consider scalability requirements
- Review hosting options

### Phase 2: Install Database
```bash
# MongoDB
brew install mongodb-community  # macOS
# or
sudo apt install mongodb-server  # Ubuntu

# PostgreSQL
brew install postgresql          # macOS
# or
sudo apt install postgresql      # Ubuntu
```

### Phase 3: Install ORM/ODM
```bash
# MongoDB
npm install mongoose

# PostgreSQL
npm install pg sequelize
# or
npm install typeorm
```

### Phase 4: Create Models

Create model files in `backend/models/`:
- `Document.js`
- `Incident.js`
- `RiskAssessment.js`
- `Permit.js`
- `Zone.js`, `AccessRight.js`, `AccessLog.js`

### Phase 5: Update Services

Modify service files to use database models instead of in-memory arrays.

### Phase 6: Add Indexes

Create database indexes for frequently queried fields.

### Phase 7: Backup Strategy

Implement automated backups:
```bash
# MongoDB
mongodump --out /backup/$(date +%Y%m%d)

# PostgreSQL
pg_dump dbname > /backup/backup_$(date +%Y%m%d).sql
```

---

## Best Practices

### Data Validation
- Use Mongoose schemas or Sequelize models for validation
- Validate before saving to database
- Use constraints in PostgreSQL

### Relationships
- Use references/foreign keys appropriately
- Consider denormalization for frequently accessed data
- Use indexes for foreign key fields

### Performance
- Index frequently queried fields
- Use pagination for large result sets
- Consider caching for read-heavy operations

### Security
- Never store plain text passwords
- Use parameterized queries (prevent SQL injection)
- Implement proper access control at database level

---

**Last Updated:** March 7, 2025
**For:** Safety Platform v2.0.0
