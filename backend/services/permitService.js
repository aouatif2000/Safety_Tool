/**
 * Permit System Service
 * Manage all work permits and operational authorizations
 */

// In-memory permit store
let permits = [];
let permitIdCounter = 1;

// Permit type definitions
const permitTypes = {
  hot_work: {
    name: 'Hot Work Permit',
    icon: '🔥',
    requiredPrecautions: [
      'Fire extinguisher present',
      'Fire watch assigned',
      'Area cleared of flammables',
      'Ventilation adequate'
    ],
    requiredApprovals: ['supervisor', 'safety_officer']
  },
  height: {
    name: 'Working at Height',
    icon: '📏',
    requiredPrecautions: [
      'Fall protection equipment inspected',
      'Area below secured',
      'Weather conditions acceptable',
      'Rescue plan in place'
    ],
    requiredApprovals: ['supervisor']
  },
  confined_space: {
    name: 'Confined Space Entry',
    icon: ' ',
    requiredPrecautions: [
      'Atmosphere tested',
      'Ventilation running',
      'Entry attendant assigned',
      'Rescue equipment ready',
      'Communication established'
    ],
    requiredApprovals: ['supervisor', 'safety_officer', 'entry_supervisor']
  },
  electrical: {
    name: 'Electrical Work',
    icon: '⚡',
    requiredPrecautions: [
      'Lockout/tagout completed',
      'Voltage tested (zero energy)',
      'Appropriate PPE worn',
      'Insulated tools used'
    ],
    requiredApprovals: ['supervisor', 'electrical_supervisor']
  },
  zone_access: {
    name: 'Zone Access Approval',
    icon: '🚧',
    requiredPrecautions: [
      'Required training verified',
      'PPE appropriate for zone',
      'Site induction completed'
    ],
    requiredApprovals: ['zone_manager']
  }
};

/**
 * Create a new permit
 */
function createPermit(permitData) {
  const permitType = permitTypes[permitData.type];
  
  if (!permitType) {
    throw new Error('Invalid permit type');
  }
  
  const permit = {
    id: `PERMIT-${String(permitIdCounter++).padStart(5, '0')}`,
    type: permitData.type,
    typeName: permitType.name,
    workDescription: permitData.workDescription,
    location: permitData.location,
    requestedBy: permitData.requestedBy,
    contractor: permitData.contractor || null,
    validFrom: permitData.validFrom,
    validTo: permitData.validTo,
    requiredPrecautions: permitType.requiredPrecautions,
    precautionsConfirmed: permitData.precautionsConfirmed || [],
    additionalPrecautions: permitData.additionalPrecautions || [],
    requiredApprovals: permitType.requiredApprovals,
    approvals: [],
    signatures: [],
    status: 'pending', // 'pending', 'approved', 'active', 'completed', 'cancelled', 'expired'
    notes: permitData.notes || '',
    emergencyContact: permitData.emergencyContact,
    createdAt: new Date().toISOString(),
    createdBy: permitData.requestedBy
  };
  
  permits.push(permit);
  
  return permit;
}

/**
 * Get all permits
 */
function getAllPermits(filters = {}) {
  let filtered = [...permits];
  
  // Filter by type
  if (filters.type) {
    filtered = filtered.filter(p => p.type === filters.type);
  }
  
  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  // Filter active permits (within validity period)
  if (filters.activeOnly) {
    const now = new Date();
    filtered = filtered.filter(p => {
      const validFrom = new Date(p.validFrom);
      const validTo = new Date(p.validTo);
      return now >= validFrom && now <= validTo && p.status === 'active';
    });
  }
  
  // Filter expiring soon (within next 24 hours)
  if (filters.expiringSoon) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    filtered = filtered.filter(p => {
      const validTo = new Date(p.validTo);
      return validTo > now && validTo <= tomorrow && p.status === 'active';
    });
  }
  
  // Filter by location
  if (filters.location) {
    filtered = filtered.filter(p => 
      p.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  
  // Search in work description
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.workDescription.toLowerCase().includes(searchLower) ||
      p.location.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by validity date (newest first)
  filtered.sort((a, b) => new Date(b.validFrom) - new Date(a.validFrom));
  
  return filtered;
}

/**
 * Get permit by ID
 */
function getPermitById(id) {
  return permits.find(p => p.id === id);
}

/**
 * Add approval to permit
 */
function addApproval(permitId, approval) {
  const permit = getPermitById(permitId);
  
  if (!permit) {
    throw new Error('Permit not found');
  }
  
  // Check if this approval role is required
  if (!permit.requiredApprovals.includes(approval.role)) {
    throw new Error('This approval is not required for this permit type');
  }
  
  // Check if already approved by this role
  const existingApproval = permit.approvals.find(a => a.role === approval.role);
  if (existingApproval) {
    throw new Error('Approval from this role already exists');
  }
  
  const approvalEntry = {
    role: approval.role,
    approvedBy: approval.approvedBy,
    approvedAt: new Date().toISOString(),
    comments: approval.comments || ''
  };
  
  permit.approvals.push(approvalEntry);
  
  // Check if all required approvals are received
  const allApproved = permit.requiredApprovals.every(role => 
    permit.approvals.some(a => a.role === role)
  );
  
  if (allApproved && permit.status === 'pending') {
    permit.status = 'approved';
  }
  
  return permit;
}

/**
 * Add signature to permit
 */
function addSignature(permitId, signature) {
  const permit = getPermitById(permitId);
  
  if (!permit) {
    throw new Error('Permit not found');
  }
  
  const signatureEntry = {
    role: signature.role,
    name: signature.name,
    signedAt: new Date().toISOString(),
    type: signature.type || 'digital' // 'digital' or 'electronic'
  };
  
  permit.signatures.push(signatureEntry);
  
  return permit;
}

/**
 * Activate permit (start work)
 */
function activatePermit(permitId, activatedBy) {
  const permit = getPermitById(permitId);
  
  if (!permit) {
    throw new Error('Permit not found');
  }
  
  if (permit.status !== 'approved') {
    throw new Error('Permit must be approved before activation');
  }
  
  const now = new Date();
  const validFrom = new Date(permit.validFrom);
  
  if (now < validFrom) {
    throw new Error('Permit is not yet valid');
  }
  
  permit.status = 'active';
  permit.activatedAt = now.toISOString();
  permit.activatedBy = activatedBy;
  
  return permit;
}

/**
 * Complete permit (work finished)
 */
function completePermit(permitId, completedBy) {
  const permit = getPermitById(permitId);
  
  if (!permit) {
    throw new Error('Permit not found');
  }
  
  if (permit.status !== 'active') {
    throw new Error('Only active permits can be completed');
  }
  
  permit.status = 'completed';
  permit.completedAt = new Date().toISOString();
  permit.completedBy = completedBy;
  
  return permit;
}

/**
 * Cancel permit
 */
function cancelPermit(permitId, reason, cancelledBy) {
  const permit = getPermitById(permitId);
  
  if (!permit) {
    throw new Error('Permit not found');
  }
  
  if (permit.status === 'completed') {
    throw new Error('Cannot cancel a completed permit');
  }
  
  permit.status = 'cancelled';
  permit.cancelledAt = new Date().toISOString();
  permit.cancelledBy = cancelledBy;
  permit.cancellationReason = reason;
  
  return permit;
}

/**
 * Check for expired permits and update status
 */
function updateExpiredPermits() {
  const now = new Date();
  let expiredCount = 0;
  
  permits.forEach(permit => {
    if (permit.status === 'active') {
      const validTo = new Date(permit.validTo);
      if (now > validTo) {
        permit.status = 'expired';
        permit.expiredAt = now.toISOString();
        expiredCount++;
      }
    }
  });
  
  return { expiredCount };
}

/**
 * Get permit statistics
 */
function getPermitStats() {
  updateExpiredPermits(); // Update expired permits first
  
  const stats = {
    total: permits.length,
    byType: {},
    byStatus: {},
    active: 0,
    expiringSoon: 0,
    pending: 0
  };
  
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  permits.forEach(permit => {
    // Count by type
    stats.byType[permit.type] = (stats.byType[permit.type] || 0) + 1;
    
    // Count by status
    stats.byStatus[permit.status] = (stats.byStatus[permit.status] || 0) + 1;
    
    // Count active
    if (permit.status === 'active') {
      stats.active++;
      
      // Count expiring soon
      const validTo = new Date(permit.validTo);
      if (validTo <= tomorrow) {
        stats.expiringSoon++;
      }
    }
    
    // Count pending
    if (permit.status === 'pending') {
      stats.pending++;
    }
  });
  
  return stats;
}

/**
 * Get available permit types
 */
function getPermitTypes() {
  return Object.entries(permitTypes).map(([key, value]) => ({
    id: key,
    name: value.name,
    icon: value.icon,
    requiredPrecautions: value.requiredPrecautions,
    requiredApprovals: value.requiredApprovals
  }));
}

module.exports = {
  createPermit,
  getAllPermits,
  getPermitById,
  addApproval,
  addSignature,
  activatePermit,
  completePermit,
  cancelPermit,
  updateExpiredPermits,
  getPermitStats,
  getPermitTypes
};
