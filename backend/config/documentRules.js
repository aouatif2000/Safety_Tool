/**
 * Document Generation Rules
 * These rules guide the LLM to create high-quality, compliant safety documents
 */

/**
 * Safety Procedure Rules
 */
const safetyProcedureRules = [
  "MUST include a 'Purpose' section explaining why this procedure exists",
  "MUST include a 'Scope' section defining when and where this procedure applies",
  "MUST include a section on Personal Protective Equipment (PPE) requirements with specific items listed",
  "MUST include step-by-step instructions numbered sequentially (1, 2, 3, etc.)",
  "MUST include an 'Emergency Procedures' section with clear actions for common emergencies",
  "MUST list all required equipment and materials at the beginning",
  "MUST include hazard warnings (  WARNING) before each hazardous step",
  "MUST include a sign-off section for supervisor acknowledgment",
  "MUST be written in imperative voice (Do X, Check Y, Never Z)",
  "MUST avoid technical jargon unless defined in a glossary",
  "SHOULD include visual markers:   WARNING, ✓ CHECKPOINT, 🔴 DANGER, 🟡 CAUTION",
  "SHOULD include estimated time for each major step",
  "SHOULD include a 'References' section citing relevant regulations",
  "SHOULD include verification checkpoints at critical stages"
];

/**
 * Machine Operation Guide Rules
 */
const machineOperationRules = [
  "MUST start with a 'Safety Warnings' section listing all major hazards",
  "MUST include a 'Pre-Operation Safety Checks' section with a numbered checklist",
  "MUST include a detailed 'Startup Sequence' with exact button/switch positions",
  "MUST include 'Normal Operation Procedures' with step-by-step instructions",
  "MUST include a 'Shutdown Procedures' section with proper sequence",
  "MUST include a 'Troubleshooting' section for common issues with solutions",
  "MUST include a 'Maintenance Schedule Reference' section",
  "MUST include 'Emergency Stop Procedures' prominently at the beginning",
  "MUST include operator qualification and training requirements",
  "SHOULD include control panel descriptions with button/indicator meanings",
  "SHOULD include diagrams or descriptions of key components",
  "SHOULD include acceptable operating parameters (speeds, temperatures, pressures)",
  "SHOULD include a section on prohibited operations or common mistakes"
];

/**
 * Checklist Rules
 */
const checklistRules = [
  "MUST have clear checkbox items using ☐ symbol",
  "MUST group related items under descriptive section headings",
  "MUST include a header section with: Date, Inspector Name, Location fields",
  "MUST include a 'Corrective Actions Required' section at the end",
  "MUST have binary yes/no, pass/fail, or OK/NOT OK items only",
  "MUST include a signature line for the inspector",
  "MUST number all checklist items for easy reference (e.g., 1.1, 1.2, 2.1)",
  "MUST include a 'Follow-up Required' section for items that fail",
  "SHOULD be designed to fit on a single printed page (A4)",
  "SHOULD include frequency of inspection (daily, weekly, monthly)",
  "SHOULD include a 'Notes' section for additional observations",
  "SHOULD use clear, concise language (max 10 words per item)"
];

/**
 * Maintenance Instruction Rules
 */
const maintenanceInstructionRules = [
  "MUST include a 'Maintenance Schedule' table showing task frequency",
  "MUST list all required tools and materials in a dedicated section",
  "MUST include detailed safety precautions including lockout/tagout procedures",
  "MUST have step-by-step procedures with clear sequential numbering",
  "MUST include acceptance criteria for completed maintenance (how to verify success)",
  "MUST include proper waste disposal procedures for used materials",
  "MUST include torque specifications, clearances, or other technical requirements",
  "MUST include a section on parts replacement including part numbers if applicable",
  "SHOULD include troubleshooting guide for common maintenance issues",
  "SHOULD reference relevant manufacturer manuals or technical documents",
  "SHOULD include a 'Testing and Verification' section after maintenance completion",
  "SHOULD include estimated time required for each maintenance task",
  "SHOULD include a section on documentation requirements and record-keeping"
];

/**
 * Get rules for a specific document type
 */
function getRules(documentType) {
  const rulesMap = {
    safety_procedure: safetyProcedureRules,
    machine_operation: machineOperationRules,
    checklist: checklistRules,
    maintenance_instruction: maintenanceInstructionRules
  };
  
  return rulesMap[documentType] || safetyProcedureRules;
}

/**
 * Get all available document types
 */
function getDocumentTypes() {
  return [
    {
      id: 'safety_procedure',
      name: 'Safety Procedure',
      description: 'Step-by-step safety procedures for workplace tasks',
      icon: '📋',
      ruleCount: safetyProcedureRules.length
    },
    {
      id: 'machine_operation',
      name: 'Machine Operation Guide',
      description: 'Comprehensive guides for operating machinery safely',
      icon: '⚙️',
      ruleCount: machineOperationRules.length
    },
    {
      id: 'checklist',
      name: 'Safety Checklist',
      description: 'Inspection and verification checklists',
      icon: '✓',
      ruleCount: checklistRules.length
    },
    {
      id: 'maintenance_instruction',
      name: 'Maintenance Instruction',
      description: 'Detailed maintenance procedures and schedules',
      icon: '🔧',
      ruleCount: maintenanceInstructionRules.length
    }
  ];
}

module.exports = {
  getRules,
  getDocumentTypes,
  safetyProcedureRules,
  machineOperationRules,
  checklistRules,
  maintenanceInstructionRules
};
