/**
 * Risk Assessment Service
 * Systematically identify and evaluate workplace risks
 */

// In-memory risk assessment store
let riskAssessments = [];
let assessmentIdCounter = 1;

/**
 * Calculate risk level based on severity and probability
 */
function calculateRiskLevel(severity, probability) {
  const riskScore = severity * probability;
  
  if (riskScore >= 20) return 'critical';
  if (riskScore >= 12) return 'high';
  if (riskScore >= 6) return 'medium';
  return 'low';
}

/**
 * Create a new risk assessment
 */
function createRiskAssessment(assessmentData) {
  const riskScore = assessmentData.severity * assessmentData.probability;
  const riskLevel = calculateRiskLevel(assessmentData.severity, assessmentData.probability);
  
  const assessment = {
    id: `RISK-${new Date().getFullYear()}-${String(assessmentIdCounter++).padStart(4, '0')}`,
    title: assessmentData.title,
    hazardDescription: assessmentData.hazardDescription,
    activity: assessmentData.activity,
    location: assessmentData.location,
    peopleAtRisk: assessmentData.peopleAtRisk || [],
    existingControls: assessmentData.existingControls || [],
    severity: assessmentData.severity, // 1-5
    probability: assessmentData.probability, // 1-5
    riskScore: riskScore,
    riskLevel: riskLevel,
    mitigationActions: assessmentData.mitigationActions || [],
    assessedBy: assessmentData.assessedBy,
    assessedAt: new Date().toISOString(),
    reviewDate: assessmentData.reviewDate,
    status: 'active', // 'active', 'mitigated', 'closed'
    residualRisk: null, // Calculated after mitigation
    createdAt: new Date().toISOString()
  };
  
  riskAssessments.push(assessment);
  
  return assessment;
}

/**
 * Get all risk assessments
 */
function getAllRiskAssessments(filters = {}) {
  let filtered = [...riskAssessments];
  
  // Filter by risk level
  if (filters.riskLevel) {
    filtered = filtered.filter(ra => ra.riskLevel === filters.riskLevel);
  }
  
  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(ra => ra.status === filters.status);
  }
  
  // Filter by location
  if (filters.location) {
    filtered = filtered.filter(ra => 
      ra.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  
  // Search in title and hazard description
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(ra => 
      ra.title.toLowerCase().includes(searchLower) ||
      ra.hazardDescription.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort by risk score (highest first)
  filtered.sort((a, b) => b.riskScore - a.riskScore);
  
  return filtered;
}

/**
 * Get risk assessment by ID
 */
function getRiskAssessmentById(id) {
  return riskAssessments.find(ra => ra.id === id);
}

/**
 * Update risk assessment
 */
function updateRiskAssessment(id, updates) {
  const index = riskAssessments.findIndex(ra => ra.id === id);
  
  if (index === -1) {
    throw new Error('Risk assessment not found');
  }
  
  const assessment = riskAssessments[index];
  
  // Recalculate risk if severity or probability changed
  if (updates.severity || updates.probability) {
    const severity = updates.severity || assessment.severity;
    const probability = updates.probability || assessment.probability;
    updates.riskScore = severity * probability;
    updates.riskLevel = calculateRiskLevel(severity, probability);
  }
  
  Object.assign(assessment, updates);
  assessment.updatedAt = new Date().toISOString();
  
  riskAssessments[index] = assessment;
  
  return assessment;
}

/**
 * Add mitigation action
 */
function addMitigationAction(id, action) {
  const assessment = getRiskAssessmentById(id);
  
  if (!assessment) {
    throw new Error('Risk assessment not found');
  }
  
  const mitigationAction = {
    id: `MA-${assessment.mitigationActions.length + 1}`,
    description: action.description,
    responsiblePerson: action.responsiblePerson,
    targetDate: action.targetDate,
    status: 'pending', // 'pending', 'in_progress', 'completed'
    completedAt: null,
    createdAt: new Date().toISOString()
  };
  
  assessment.mitigationActions.push(mitigationAction);
  
  return assessment;
}

/**
 * Complete mitigation action
 */
function completeMitigationAction(assessmentId, actionId) {
  const assessment = getRiskAssessmentById(assessmentId);
  
  if (!assessment) {
    throw new Error('Risk assessment not found');
  }
  
  const action = assessment.mitigationActions.find(ma => ma.id === actionId);
  
  if (!action) {
    throw new Error('Mitigation action not found');
  }
  
  action.status = 'completed';
  action.completedAt = new Date().toISOString();
  
  // Check if all actions are completed
  const allCompleted = assessment.mitigationActions.every(ma => ma.status === 'completed');
  
  if (allCompleted) {
    assessment.status = 'mitigated';
  }
  
  return assessment;
}

/**
 * Set residual risk after mitigation
 */
function setResidualRisk(id, residualData) {
  const assessment = getRiskAssessmentById(id);
  
  if (!assessment) {
    throw new Error('Risk assessment not found');
  }
  
  const residualScore = residualData.severity * residualData.probability;
  const residualLevel = calculateRiskLevel(residualData.severity, residualData.probability);
  
  assessment.residualRisk = {
    severity: residualData.severity,
    probability: residualData.probability,
    riskScore: residualScore,
    riskLevel: residualLevel,
    assessedAt: new Date().toISOString()
  };
  
  return assessment;
}

/**
 * Delete risk assessment
 */
function deleteRiskAssessment(id) {
  const index = riskAssessments.findIndex(ra => ra.id === id);
  
  if (index === -1) {
    throw new Error('Risk assessment not found');
  }
  
  riskAssessments.splice(index, 1);
  
  return { success: true };
}

/**
 * Get risk matrix data (for visualization)
 */
function getRiskMatrix() {
  const matrix = Array(5).fill(0).map(() => Array(5).fill(0));
  
  riskAssessments.forEach(ra => {
    if (ra.status === 'active') {
      const severityIndex = ra.severity - 1;
      const probabilityIndex = ra.probability - 1;
      matrix[severityIndex][probabilityIndex]++;
    }
  });
  
  return {
    matrix,
    labels: {
      severity: ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'],
      probability: ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain']
    }
  };
}

/**
 * Get risk assessment statistics
 */
function getRiskStats() {
  const stats = {
    total: riskAssessments.length,
    byLevel: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    byStatus: {},
    pendingActions: 0,
    overdueMitigations: 0
  };
  
  const now = new Date();
  
  riskAssessments.forEach(ra => {
    // Count by risk level
    stats.byLevel[ra.riskLevel]++;
    
    // Count by status
    stats.byStatus[ra.status] = (stats.byStatus[ra.status] || 0) + 1;
    
    // Count pending and overdue actions
    ra.mitigationActions.forEach(ma => {
      if (ma.status !== 'completed') {
        stats.pendingActions++;
        if (new Date(ma.targetDate) < now) {
          stats.overdueMitigations++;
        }
      }
    });
  });
  
  return stats;
}

module.exports = {
  createRiskAssessment,
  getAllRiskAssessments,
  getRiskAssessmentById,
  updateRiskAssessment,
  addMitigationAction,
  completeMitigationAction,
  setResidualRisk,
  deleteRiskAssessment,
  getRiskMatrix,
  getRiskStats
};
