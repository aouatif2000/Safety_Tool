/**
 * AI Document Generation Service
 * 
 * In production, this would call OpenAI / Azure OpenAI API.
 * For now, it generates structured safety documents based on templates.
 */

function generateToolboxTalk(documentType, projectName, context) {
  const { location, tasks, parties, additionalContext } = context;

  const title = `Toolbox Talk: ${tasks || documentType}`;

  const sections = [
    {
      heading: "1. Introduction (2-3 minutes)",
      content: `Today's toolbox talk focuses on the safety requirements for ${tasks || "the planned work activities"}. This session is relevant to all workers involved in ${projectName} at ${location}. The involved parties include ${parties}. It is essential that everyone understands the risks, the controls in place, and their personal responsibilities before work begins.${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}`
    },
    {
      heading: "2. Scope of Work",
      content: `**Project:** ${projectName}\n**Location:** ${location}\n**Tasks:** ${tasks}\n**Involved Parties:** ${parties}\n\nBefore starting work, ensure you are familiar with the site layout, emergency exits, assembly points, and the location of first aid equipment. Report any changes in site conditions to your supervisor immediately.`
    },
    {
      heading: "3. Key Hazards & Risk Controls",
      content: generateHazardsSection(documentType, tasks)
    },
    {
      heading: "4. Required PPE",
      content: generatePPESection(documentType, tasks)
    },
    {
      heading: "5. Emergency Procedures",
      content: `In case of an emergency:\n• Stop all work immediately\n• Alert your supervisor and nearby workers\n• Call emergency services if required\n• Proceed to the nearest assembly point\n• Do not re-enter the work area until cleared by the safety officer\n\nFirst aid kit location: Check with your site supervisor\nNearest hospital: As per project emergency plan`
    },
    {
      heading: "6. Discussion & Questions (3-5 minutes)",
      content: "Before we finish, does anyone have questions or concerns about today's work? Have you noticed any hazards on site that we haven't discussed? Remember: if you see something unsafe, stop work and report it. No task is so urgent that it cannot be done safely."
    },
    {
      heading: "7. Summary & Commitment",
      content: `By signing this document, you confirm that:\n• You have attended this toolbox talk\n• You understand the hazards and controls discussed\n• You will follow the safety procedures outlined\n• You will report any unsafe conditions immediately\n\nStay safe. Look out for each other. Let's have a productive and incident-free day.`
    }
  ];

  return { title, sections };
}

function generateHazardsSection(documentType, tasks) {
  const taskLower = (tasks || "").toLowerCase();

  let hazards = [];

  if (taskLower.includes("height") || taskLower.includes("elevated") || taskLower.includes("scaffold")) {
    hazards.push(
      "**Fall from Height**\n- Use full-body harness with shock-absorbing lanyard\n- Ensure guardrails are in place on all open edges\n- Inspect scaffolding before each use\n- Never work at height in adverse weather conditions"
    );
  }

  if (taskLower.includes("weld") || taskLower.includes("hot work") || taskLower.includes("cutting")) {
    hazards.push(
      "**Fire & Burns**\n- Maintain fire watch for 30 minutes after hot work\n- Keep fire extinguisher within 10 meters\n- Use welding screens to protect nearby workers\n- Wear flame-resistant clothing and welding gloves"
    );
  }

  if (taskLower.includes("electr") || taskLower.includes("wiring") || taskLower.includes("power")) {
    hazards.push(
      "**Electrical Hazards**\n- Lock out/tag out all energy sources before work\n- Use insulated tools rated for the voltage\n- Never work on live circuits unless absolutely necessary\n- Ensure GFCI protection on all temporary power"
    );
  }

  if (taskLower.includes("excavat") || taskLower.includes("trench") || taskLower.includes("digging")) {
    hazards.push(
      "**Excavation & Trench Collapse**\n- Shore or slope all trenches deeper than 1.2m\n- Keep spoil piles at least 1m from the edge\n- Never enter an unsupported excavation\n- Check for underground utilities before digging"
    );
  }

  // Default hazards always included
  hazards.push(
    "**Struck-by / Falling Objects**\n- Wear hard hat at all times in designated areas\n- Secure all tools and materials against falling\n- Establish exclusion zones below overhead work\n- Use toe boards and debris nets where required"
  );

  hazards.push(
    "**Slips, Trips & Falls**\n- Keep walkways clear of obstacles and debris\n- Clean up spills immediately\n- Wear appropriate safety footwear with non-slip soles\n- Use designated access routes only"
  );

  hazards.push(
    "**Manual Handling**\n- Assess the load before lifting\n- Use mechanical aids where possible\n- Lift with your legs, not your back\n- Ask for help with heavy or awkward loads"
  );

  return hazards.join("\n\n");
}

function generatePPESection(documentType, tasks) {
  let ppe = [
    "✅ Safety helmet (hard hat)",
    "✅ High-visibility vest",
    "✅ Safety boots with steel toe caps",
    "✅ Safety glasses / goggles",
    "✅ Work gloves appropriate for the task"
  ];

  const taskLower = (tasks || "").toLowerCase();

  if (taskLower.includes("height")) {
    ppe.push("✅ Full-body harness with shock absorber");
    ppe.push("✅ Safety lanyard and anchor point connector");
  }
  if (taskLower.includes("weld") || taskLower.includes("hot work")) {
    ppe.push("✅ Welding helmet with appropriate shade");
    ppe.push("✅ Flame-resistant clothing");
    ppe.push("✅ Welding gauntlets");
  }
  if (taskLower.includes("dust") || taskLower.includes("demolition") || taskLower.includes("concrete")) {
    ppe.push("✅ Respiratory protection (dust mask / P3 filter)");
  }
  if (taskLower.includes("noise") || taskLower.includes("drill") || taskLower.includes("hammer")) {
    ppe.push("✅ Hearing protection (ear plugs / ear muffs)");
  }

  return ppe.join("\n");
}

function generateInspectionReport(findings) {
  return {
    title: "AI Safety Inspection Report",
    date: new Date().toISOString(),
    status: findings.length > 0 ? "Issues Found" : "No Issues Detected",
    findings: findings,
    disclaimer: "This AI inspection is experimental and should not replace a certified human safety inspection. Always verify findings with a qualified safety officer."
  };
}

module.exports = {
  generateToolboxTalk,
  generateInspectionReport
};
