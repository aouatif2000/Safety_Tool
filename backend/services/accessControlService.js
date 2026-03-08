/**
 * Access Control Service
 * Track and manage area access and personnel presence
 */

// In-memory stores
let zones = [];
let accessRights = [];
let accessLogs = [];
let zoneIdCounter = 1;
let logIdCounter = 1;

/**
 * Create a new zone/area
 */
function createZone(zoneData) {
  const zone = {
    id: `ZONE-${String(zoneIdCounter++).padStart(3, '0')}`,
    name: zoneData.name,
    type: zoneData.type, // 'production', 'restricted', 'hazardous', 'office', 'storage'
    description: zoneData.description || '',
    hazardLevel: zoneData.hazardLevel, // 'low', 'medium', 'high', 'critical'
    capacityLimit: zoneData.capacityLimit || null,
    requiredTraining: zoneData.requiredTraining || [],
    requiredPermissions: zoneData.requiredPermissions || [],
    requiredPPE: zoneData.requiredPPE || [],
    emergencyExits: zoneData.emergencyExits || [],
    currentOccupancy: 0,
    status: 'active', // 'active', 'closed', 'restricted'
    createdAt: new Date().toISOString()
  };
  
  zones.push(zone);
  
  return zone;
}

/**
 * Get all zones
 */
function getAllZones(filters = {}) {
  let filtered = [...zones];
  
  // Filter by type
  if (filters.type) {
    filtered = filtered.filter(z => z.type === filters.type);
  }
  
  // Filter by hazard level
  if (filters.hazardLevel) {
    filtered = filtered.filter(z => z.hazardLevel === filters.hazardLevel);
  }
  
  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(z => z.status === filters.status);
  }
  
  // Filter zones at/near capacity
  if (filters.nearCapacity) {
    filtered = filtered.filter(z => {
      if (!z.capacityLimit) return false;
      const percentFull = (z.currentOccupancy / z.capacityLimit) * 100;
      return percentFull >= 80;
    });
  }
  
  return filtered;
}

/**
 * Get zone by ID
 */
function getZoneById(id) {
  return zones.find(z => z.id === id);
}

/**
 * Update zone
 */
function updateZone(id, updates) {
  const index = zones.findIndex(z => z.id === id);
  
  if (index === -1) {
    throw new Error('Zone not found');
  }
  
  Object.assign(zones[index], updates);
  zones[index].updatedAt = new Date().toISOString();
  
  return zones[index];
}

/**
 * Grant access rights to a person for a zone
 */
function grantAccessRight(accessData) {
  const zone = getZoneById(accessData.zoneId);
  
  if (!zone) {
    throw new Error('Zone not found');
  }
  
  // Check if access right already exists
  const existing = accessRights.find(ar => 
    ar.personId === accessData.personId && ar.zoneId === accessData.zoneId
  );
  
  if (existing) {
    throw new Error('Access right already exists for this person and zone');
  }
  
  const accessRight = {
    id: `ACCESS-${accessRights.length + 1}`,
    personId: accessData.personId,
    personName: accessData.personName,
    zoneId: accessData.zoneId,
    zoneName: zone.name,
    grantedBy: accessData.grantedBy,
    grantedAt: new Date().toISOString(),
    validFrom: accessData.validFrom || new Date().toISOString(),
    validTo: accessData.validTo || null, // null = permanent
    status: 'active', // 'active', 'suspended', 'revoked'
    trainingCompleted: accessData.trainingCompleted || false,
    trainingDate: accessData.trainingDate || null
  };
  
  accessRights.push(accessRight);
  
  return accessRight;
}

/**
 * Revoke access right
 */
function revokeAccessRight(accessId, revokedBy, reason) {
  const accessRight = accessRights.find(ar => ar.id === accessId);
  
  if (!accessRight) {
    throw new Error('Access right not found');
  }
  
  accessRight.status = 'revoked';
  accessRight.revokedAt = new Date().toISOString();
  accessRight.revokedBy = revokedBy;
  accessRight.revocationReason = reason;
  
  return accessRight;
}

/**
 * Log zone entry
 */
function logEntry(entryData) {
  const zone = getZoneById(entryData.zoneId);
  
  if (!zone) {
    throw new Error('Zone not found');
  }
  
  // Check access rights
  const hasAccess = accessRights.some(ar => 
    ar.personId === entryData.personId &&
    ar.zoneId === entryData.zoneId &&
    ar.status === 'active'
  );
  
  const logEntry = {
    id: `LOG-${String(logIdCounter++).padStart(6, '0')}`,
    type: 'entry',
    personId: entryData.personId,
    personName: entryData.personName,
    zoneId: entryData.zoneId,
    zoneName: zone.name,
    timestamp: new Date().toISOString(),
    method: entryData.method || 'manual', // 'manual', 'card', 'biometric', 'qr'
    authorized: hasAccess,
    purpose: entryData.purpose || '',
    exitTime: null // Will be filled when person exits
  };
  
  accessLogs.push(logEntry);
  
  // Update zone occupancy
  if (hasAccess) {
    zone.currentOccupancy++;
  }
  
  return logEntry;
}

/**
 * Log zone exit
 */
function logExit(exitData) {
  const zone = getZoneById(exitData.zoneId);
  
  if (!zone) {
    throw new Error('Zone not found');
  }
  
  // Find the corresponding entry log
  const entryLog = accessLogs
    .filter(log => 
      log.personId === exitData.personId &&
      log.zoneId === exitData.zoneId &&
      log.type === 'entry' &&
      log.exitTime === null
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  
  const exitLog = {
    id: `LOG-${String(logIdCounter++).padStart(6, '0')}`,
    type: 'exit',
    personId: exitData.personId,
    personName: exitData.personName,
    zoneId: exitData.zoneId,
    zoneName: zone.name,
    timestamp: new Date().toISOString(),
    method: exitData.method || 'manual',
    duration: null // Will be calculated if entry found
  };
  
  // Link to entry and calculate duration
  if (entryLog) {
    entryLog.exitTime = exitLog.timestamp;
    const entryTime = new Date(entryLog.timestamp);
    const exitTime = new Date(exitLog.timestamp);
    const durationMinutes = Math.round((exitTime - entryTime) / 1000 / 60);
    exitLog.duration = durationMinutes;
    entryLog.duration = durationMinutes;
  }
  
  accessLogs.push(exitLog);
  
  // Update zone occupancy
  if (zone.currentOccupancy > 0) {
    zone.currentOccupancy--;
  }
  
  return exitLog;
}

/**
 * Get current zone presence
 */
function getZonePresence(zoneId) {
  const zone = getZoneById(zoneId);
  
  if (!zone) {
    throw new Error('Zone not found');
  }
  
  // Find all people currently in the zone (entry without exit)
  const currentlyPresent = accessLogs
    .filter(log => 
      log.zoneId === zoneId &&
      log.type === 'entry' &&
      log.exitTime === null &&
      log.authorized === true
    )
    .map(log => ({
      personId: log.personId,
      personName: log.personName,
      entryTime: log.timestamp,
      duration: Math.round((new Date() - new Date(log.timestamp)) / 1000 / 60),
      purpose: log.purpose
    }));
  
  return {
    zone: {
      id: zone.id,
      name: zone.name,
      type: zone.type,
      hazardLevel: zone.hazardLevel,
      capacityLimit: zone.capacityLimit,
      currentOccupancy: zone.currentOccupancy
    },
    currentlyPresent,
    count: currentlyPresent.length,
    capacityPercentage: zone.capacityLimit 
      ? Math.round((zone.currentOccupancy / zone.capacityLimit) * 100)
      : null
  };
}

/**
 * Get all current presence across all zones
 */
function getAllPresence() {
  const presenceByZone = zones.map(zone => getZonePresence(zone.id));
  
  const totalPeople = presenceByZone.reduce((sum, zp) => sum + zp.count, 0);
  
  return {
    totalPeople,
    zones: presenceByZone
  };
}

/**
 * Get access logs
 */
function getAccessLogs(filters = {}) {
  let filtered = [...accessLogs];
  
  // Filter by zone
  if (filters.zoneId) {
    filtered = filtered.filter(log => log.zoneId === filters.zoneId);
  }
  
  // Filter by person
  if (filters.personId) {
    filtered = filtered.filter(log => log.personId === filters.personId);
  }
  
  // Filter by type
  if (filters.type) {
    filtered = filtered.filter(log => log.type === filters.type);
  }
  
  // Filter unauthorized entries
  if (filters.unauthorizedOnly) {
    filtered = filtered.filter(log => 
      log.type === 'entry' && log.authorized === false
    );
  }
  
  // Filter by date range
  if (filters.startDate) {
    filtered = filtered.filter(log => 
      new Date(log.timestamp) >= new Date(filters.startDate)
    );
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(log => 
      new Date(log.timestamp) <= new Date(filters.endDate)
    );
  }
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return filtered;
}

/**
 * Get access control statistics
 */
function getAccessStats() {
  const stats = {
    totalZones: zones.length,
    activeZones: zones.filter(z => z.status === 'active').length,
    totalAccessRights: accessRights.filter(ar => ar.status === 'active').length,
    currentOccupancy: zones.reduce((sum, z) => sum + z.currentOccupancy, 0),
    unauthorizedAttempts: accessLogs.filter(log => 
      log.type === 'entry' && log.authorized === false
    ).length,
    zonesNearCapacity: zones.filter(z => {
      if (!z.capacityLimit) return false;
      const percentFull = (z.currentOccupancy / z.capacityLimit) * 100;
      return percentFull >= 80;
    }).length
  };
  
  return stats;
}

module.exports = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  grantAccessRight,
  revokeAccessRight,
  logEntry,
  logExit,
  getZonePresence,
  getAllPresence,
  getAccessLogs,
  getAccessStats
};
