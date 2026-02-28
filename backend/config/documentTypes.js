const documentTypes = [
  {
    category: "Project & Site-Specific",
    icon: "🏗️",
    types: [
      { id: "tra", name: "TRA – Task Risk Analysis" },
      { id: "lmra", name: "LMRA – Last Minute Risk Analysis" },
      { id: "method-statement", name: "Method Statement" },
      { id: "task-risk", name: "Task-Specific Risk Analysis" },
      { id: "vgm-plan", name: "Project Safety & Health Plan (VGM)" },
      { id: "safety-health-plan", name: "Safety & Health Plan (Site/Project)" },
      { id: "project-rie", name: "Project RI&E" },
      { id: "incident-report", name: "Incident & Accident Report" },
      { id: "capa", name: "Corrective & Preventive Action Plans (CAPA)" },
      { id: "emergency-plan", name: "Emergency & Evacuation Plan (Project/Site)" },
      { id: "lifting-risk", name: "Lifting Operations Risk Analysis" },
      { id: "working-height", name: "Working at Height Risk Analysis" },
      { id: "confined-space", name: "Confined Space Risk Analysis" },
      { id: "hot-work", name: "Hot Work Risk Analysis" },
      { id: "traffic-plan", name: "Traffic & Logistics Plan (Site)" }
    ]
  },
  {
    category: "Company / Structural",
    icon: "🏢",
    types: [
      { id: "company-rie", name: "Company RI&E" },
      { id: "gpp", name: "Global Prevention Plan (GPP)" },
      { id: "jap", name: "Annual Action Plan (JAP)" },
      { id: "vgm-policy", name: "Safety & Health Policy Statement" }
    ]
  },
  {
    category: "Subcontractor Documentation",
    icon: "👷",
    types: [
      { id: "sub-prequalification", name: "Subcontractor Safety Pre-qualification" },
      { id: "sub-assessment", name: "Subcontractor Assessment Forms" },
      { id: "sub-checklists", name: "Safety Document Checklists" },
      { id: "sub-dossier", name: "Subcontractor Dossier (Complete)" },
      { id: "sub-communication", name: "Communication & Instruction Documents" },
      { id: "sub-compliance", name: "Compliance Status Overview per Subcontractor" }
    ]
  },
  {
    category: "Other",
    icon: "📄",
    types: [
      { id: "other", name: "Other document..." }
    ]
  }
];

module.exports = documentTypes;
