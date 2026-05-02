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
 * Toolbox Talk Rules — INC-01 compliant 10-section structure
 *
 * The LLM system prompt (llmService.buildSystemPrompt) enforces these as a
 * strict ordered template. Do NOT reorder or omit sections here.
 */
const toolboxTalkRules = [
  // ── Section 1 ──────────────────────────────────────────────────────────────
  "SECTION 1 — CRITICAL WARNING: Output a level-2 heading '## ⚠️ Critical Warning'. " +
  "Below it write a blockquote (> ...) containing exactly 4 lines, one per language, each prefixed with its language code: " +
  "'🇬🇧 EN:', '🇳🇱 NL:', '🇵🇱 PL:', '🇷🇴 RO:'. " +
  "Each line must be a single, imperative safety sentence directly relevant to the topic. " +
  "This section is ALWAYS in all 4 languages regardless of the requested body language.",

  // ── Section 2 ──────────────────────────────────────────────────────────────
  "SECTION 2 — EMERGENCY CONTACTS: Output a level-2 heading '## 🚨 Emergency Contacts'. " +
  "Below it output a markdown table with columns: Role | Name / Number | Action. " +
  "First row must always be: Emergency Services | 112 | Call immediately for fire, injury or spill. " +
  "Add at least 2 more rows using plausible site-specific roles (Site Safety Officer, First Aider) with placeholder values.",

  // ── Section 3 ──────────────────────────────────────────────────────────────
  "SECTION 3 — SCOPE OF WORK: Output a level-2 heading '## 📋 Scope of Work'. " +
  "Write 2–3 sentences identifying: the specific topic/hazard covered, the project name and location, " +
  "and the work type/trades involved. Use the project metadata provided.",

  // ── Section 4 ──────────────────────────────────────────────────────────────
  "SECTION 4 — RISK MATRIX WITH CONTROL MEASURES: Output a level-2 heading '## ⚡ Risk Matrix with Control Measures'. " +
  "Below it output a markdown table with columns: # | Hazard | Severity (S 1–5) | Probability (P 1–5) | Risk Level | Control Measures | Residual Risk. " +
  "Include a minimum of 5 rows. S and P are integers 1–5. " +
  "Risk Level = S×P: 1–4 = 🟢 Low, 5–9 = 🟡 Medium, 10–14 = 🔴 High, 15–25 = 🔴🔴 Critical. " +
  "Control Measures must be specific and actionable (not generic). " +
  "Residual Risk is the expected risk level AFTER applying controls.",

  // ── Section 5 ──────────────────────────────────────────────────────────────
  "SECTION 5 — REGULATORY REFERENCES: Output a level-2 heading '## 📖 Regulatory References'. " +
  "Output a bulleted list of at least 3 specific legal/standard references that directly apply to this topic. " +
  "Cite real Belgian/EU legislation: Codex Welzijn op het Werk (specify Book and Title, e.g., Book IX Title 2 Art. 168), " +
  "ARAB (Algemeen Reglement voor de Arbeidsbescherming, cite article number), " +
  "and relevant EN/ISO standards (e.g., EN 363 for fall arrest). " +
  "Each bullet must state: reference code, full title, and one sentence on why it applies.",

  // ── Section 6 ──────────────────────────────────────────────────────────────
  "SECTION 6 — DO / DON'T: Output a level-2 heading '## ✅❌ Do / Don't'. " +
  "Then output two sub-sections: '### ✅ DO' followed by a bulleted list of at least 5 items, " +
  "then '### ❌ DON'T' followed by a bulleted list of at least 5 items. " +
  "All items must use imperative verbs. Items must be specific to the topic, not generic safety platitudes.",

  // ── Section 7 ──────────────────────────────────────────────────────────────
  "SECTION 7 — PRACTICAL SCENARIOS: Output a level-2 heading '## 🎬 Practical Scenarios'. " +
  "Write exactly 2 realistic site scenarios. " +
  "Format each as: '**Scenario N:** [situation description]' on one line, " +
  "then '**Correct Response:** [step-by-step correct action]' on the next. " +
  "Scenarios must reflect real-world mistakes workers actually make on this topic.",

  // ── Section 8 ──────────────────────────────────────────────────────────────
  "SECTION 8 — GOLDEN RULE: Output a level-2 heading '## 🏆 Golden Rule'. " +
  "Output a single blockquote (> ...) containing one bold, memorable safety rule for this specific topic. " +
  "Maximum 20 words. Must be immediately actionable and memorable.",

  // ── Section 9 ──────────────────────────────────────────────────────────────
  "SECTION 9 — COMPREHENSION CHECK: Output a level-2 heading '## 🧠 Comprehension Check'. " +
  "Output exactly 3 multiple-choice questions. " +
  "Format each question as: '**Q[N]:** [question text]' followed by 4 options on separate lines: 'a) ... b) ... c) ... d) ...'. " +
  "Mark the correct answer with ✓ at the end of the correct option line. " +
  "Questions must test real understanding of the content above, not trivial recall.",

  // ── Section 10 ─────────────────────────────────────────────────────────────
  "SECTION 10 — SIGN-OFF TABLE: Output a level-2 heading '## ✍️ Sign-Off'. " +
  "Output a markdown table with columns: # | Full Name | Attended ☐ | Understood ☐ | Will Apply ☐ | Signature | Date. " +
  "Include exactly 15 empty data rows (numbered 1–15, all other cells blank). " +
  "This table must be the very last element in the document.",

  // ── Cross-cutting constraints ───────────────────────────────────────────────
  "OUTPUT CONSTRAINT: Output ONLY the 10 sections listed above. Do NOT add any introduction, summary, " +
  "preamble, postamble, or any section not in this list. The document begins with Section 1 heading and ends with Section 10 table.",
  "LANGUAGE CONSTRAINT: Write all sections in the requested body language. " +
  "Section 1 (Critical Warning) is the ONLY exception — it is always written in all 4 languages (EN/NL/PL/RO).",
  "MARKDOWN CONSTRAINT: All tables must be valid GitHub-flavoured markdown with a header separator row (| --- | --- |). " +
  "Do NOT use HTML tags. Blockquotes use '> '. Bold uses '**text**'.",
  "RISK MATRIX CONSTRAINT: S and P values must be integers 1–5. Risk Level is always computed as S×P. " +
  "Control Measures must reduce the residual risk by at least one level compared to the initial risk.",
  "REGULATORY CONSTRAINT: Only cite real, verifiable Belgian/EU legislation and standards. " +
  "Do NOT invent article numbers. If unsure of a specific article, cite the Book/Title level and note 'consult full text'."
];

/**
 * Get rules for a specific document type
 */
function getRules(documentType) {
  const rulesMap = {
    safety_procedure: safetyProcedureRules,
    machine_operation: machineOperationRules,
    checklist: checklistRules,
    maintenance_instruction: maintenanceInstructionRules,
    toolbox: toolboxTalkRules
  };
  
  return rulesMap[documentType] || safetyProcedureRules;
}

/**
 * Get all available document types
 */
function getDocumentTypes() {
  return [
    {
      id: 'toolbox',
      name: 'Toolbox Talk',
      description: 'INC-01 compliant 10-section toolbox talk with risk matrix, regulatory refs, MCQ and sign-off',
      icon: '🗣️',
      ruleCount: toolboxTalkRules.length,
      category: 'Project & Site-Specific'
    },
    {
      id: 'tra',
      name: 'TRA',
      description: 'Task Risk Analysis',
      icon: '📋',
      ruleCount: safetyProcedureRules.length,
      category: 'Project & Site-Specific'
    },
    {
      id: 'rie',
      name: 'RI&E',
      description: 'Risk Inventory & Evaluation',
      icon: '📊',
      ruleCount: checklistRules.length,
      category: 'Company/Structural'
    },
    {
      id: 'method_statement',
      name: 'Method Statement',
      description: 'Method Statement',
      icon: '📝',
      ruleCount: safetyProcedureRules.length,
      category: 'Company/Structural'
    },
    {
      id: 'safety_procedure',
      name: 'Safety Procedure',
      description: 'Step-by-step safety procedures for workplace tasks',
      icon: '📋',
      ruleCount: safetyProcedureRules.length,
      category: 'Company/Structural'
    },
    {
      id: 'machine_operation',
      name: 'Machine Operation Guide',
      description: 'Comprehensive guides for operating machinery safely',
      icon: '⚙️',
      ruleCount: machineOperationRules.length,
      category: 'Subcontractor Documentation'
    },
    {
      id: 'checklist',
      name: 'Safety Checklist',
      description: 'Inspection and verification checklists',
      icon: '✓',
      ruleCount: checklistRules.length,
      category: 'Other'
    },
    {
      id: 'maintenance_instruction',
      name: 'Maintenance Instruction',
      description: 'Detailed maintenance procedures and schedules',
      icon: '🔧',
      ruleCount: maintenanceInstructionRules.length,
      category: 'Other'
    }
  ];
}

module.exports = {
  getRules,
  getDocumentTypes,
  safetyProcedureRules,
  machineOperationRules,
  checklistRules,
  maintenanceInstructionRules,
  toolboxTalkRules
};
