/**
 * Incident Reporting Service
 * Digital module for reporting incidents, near misses, or unsafe situations
 */

// In-memory incident store
let incidents = [];
let incidentIdCounter = 1;

/**
 * Create a new incident report
 */
function createIncident(incidentData) {
  const incident = {
    id: `INC-${new Date().getFullYear()}-${String(incidentIdCounter++).padStart(4, '0')}`,
    type: incidentData.type, // 'incident', 'near_miss', 'unsafe_condition'
    title: incidentData.title,
    description: incidentData.description,
    location: incidentData.location,
    dateTime: incidentData.dateTime || new Date().toISOString(),
    reportedBy: incidentData.reportedBy,
    reportedAt: new Date().toISOString(),
    severity: incidentData.severity, // 'low', 'medium', 'high', 'critical'
    peopleInvolved: incidentData.peopleInvolved || [],
    witnesses: incidentData.witnesses || [],
    photos: incidentData.photos || [],
    immediateActions: incidentData.immediateActions || '',
    status: 'reported', // 'reported', 'investigating', 'action_taken', 'closed'
    assignedTo: incidentData.assignedTo || null,
    followUps: [],
    timeline: [
      {
        action: 'Incident reported',
        timestamp: new Date().toISOString(),
        by: incidentData.reportedBy
      }
    ]
  };
  
  incidents.push(incident);
  
  return incident;
}

/**
 * Get all incidents
 */
function getAllIncidents(filters = {}) {
  let filtered = [...incidents];
  
  // Filter by type
  if (filters.type) {
    filtered = filtered.filter(inc => inc.type === filters.type);
  }
  
  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(inc => inc.status === filters.status);
  }
  
  // Filter by severity
  if (filters.severity) {
    filtered = filtered.filter(inc => inc.severity === filters.severity);
  }
  
  // Filter by date range
  if (filters.startDate) {
    filtered = filtered.filter(inc => 
      new Date(inc.dateTime) >= new Date(filters.startDate)
    );
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(inc => 
      new Date(inc.dateTime) <= new Date(filters.endDate)
    );
  }
  
  // Search in title and description
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(inc => 
      inc.title.toLowerCase().includes(searchLower) ||
      inc.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  
  return filtered;
}

/**
 * Get incident by ID
 */
function getIncidentById(id) {
  return incidents.find(inc => inc.id === id);
}

/**
 * Update incident
 */
function updateIncident(id, updates) {
  const index = incidents.findIndex(inc => inc.id === id);
  
  if (index === -1) {
    throw new Error('Incident not found');
  }
  
  const incident = incidents[index];
  
  // Track status changes in timeline
  if (updates.status && updates.status !== incident.status) {
    incident.timeline.push({
      action: `Status changed to: ${updates.status}`,
      timestamp: new Date().toISOString(),
      by: updates.updatedBy || 'System'
    });
  }
  
  // Track assignment changes
  if (updates.assignedTo && updates.assignedTo !== incident.assignedTo) {
    incident.timeline.push({
      action: `Assigned to: ${updates.assignedTo.name}`,
      timestamp: new Date().toISOString(),
      by: updates.updatedBy || 'System'
    });
  }
  
  // Update fields
  Object.assign(incident, updates);
  incident.updatedAt = new Date().toISOString();
  
  incidents[index] = incident;
  
  return incident;
}

/**
 * Add follow-up to incident
 */
function addFollowUp(id, followUp) {
  const incident = getIncidentById(id);
  
  if (!incident) {
    throw new Error('Incident not found');
  }
  
  const followUpEntry = {
    id: `FU-${incident.followUps.length + 1}`,
    description: followUp.description,
    action: followUp.action,
    responsiblePerson: followUp.responsiblePerson,
    dueDate: followUp.dueDate,
    completedAt: null,
    status: 'pending', // 'pending', 'in_progress', 'completed'
    createdAt: new Date().toISOString(),
    createdBy: followUp.createdBy
  };
  
  incident.followUps.push(followUpEntry);
  
  incident.timeline.push({
    action: 'Follow-up action added',
    timestamp: new Date().toISOString(),
    by: followUp.createdBy
  });
  
  return incident;
}

/**
 * Complete follow-up
 */
function completeFollowUp(incidentId, followUpId, completedBy) {
  const incident = getIncidentById(incidentId);
  
  if (!incident) {
    throw new Error('Incident not found');
  }
  
  const followUp = incident.followUps.find(fu => fu.id === followUpId);
  
  if (!followUp) {
    throw new Error('Follow-up not found');
  }
  
  followUp.status = 'completed';
  followUp.completedAt = new Date().toISOString();
  
  incident.timeline.push({
    action: `Follow-up completed: ${followUp.description}`,
    timestamp: new Date().toISOString(),
    by: completedBy
  });
  
  return incident;
}

/**
 * Delete incident
 */
function deleteIncident(id) {
  const index = incidents.findIndex(inc => inc.id === id);
  
  if (index === -1) {
    throw new Error('Incident not found');
  }
  
  incidents.splice(index, 1);
  
  return { success: true };
}

/**
 * Get incident statistics
 */
function getIncidentStats(filters = {}) {
  let filtered = getAllIncidents(filters);
  
  const stats = {
    total: filtered.length,
    byType: {},
    bySeverity: {},
    byStatus: {},
    recentIncidents: filtered.slice(0, 5).map(inc => ({
      id: inc.id,
      title: inc.title,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      dateTime: inc.dateTime
    }))
  };
  
  filtered.forEach(inc => {
    stats.byType[inc.type] = (stats.byType[inc.type] || 0) + 1;
    stats.bySeverity[inc.severity] = (stats.bySeverity[inc.severity] || 0) + 1;
    stats.byStatus[inc.status] = (stats.byStatus[inc.status] || 0) + 1;
  });
  
  return stats;
}

module.exports = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  addFollowUp,
  completeFollowUp,
  deleteIncident,
  getIncidentStats
};
