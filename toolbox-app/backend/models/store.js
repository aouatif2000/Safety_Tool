const { v4: uuidv4 } = require("uuid");

// In-memory store - replace with real DB in production
const store = {
  projects: [
    {
      id: uuidv4(),
      name: "working on height",
      location: "maasmechelen",
      company: "Apex Strategies",
      subcontractors: ["TeamBuild NV", "SafeWork BV"],
      createdAt: "2026-01-15T10:00:00Z"
    },
    {
      id: uuidv4(),
      name: "office renovation",
      location: "maasmechelen",
      company: "Apex Strategies",
      subcontractors: ["InterieurPro"],
      createdAt: "2026-01-20T09:00:00Z"
    },
    {
      id: uuidv4(),
      name: "kantoorvrbouwing",
      location: "Maasmechelen",
      company: "Apex Strategies",
      subcontractors: [],
      createdAt: "2026-02-01T14:00:00Z"
    }
  ],
  sessions: [
    {
      id: uuidv4(),
      projectId: null, // will be linked on init
      title: " ",
      status: "Open",
      category: "safety",
      documentType: "TRA – Task Risk Analysis",
      date: "2026-02-16T19:45:00Z",
      location: "working on height",
      attendees: 2,
      signatures: 0,
      version: 1,
      context: {
        location: "Building A, Level 3",
        tasks: "Welding steel beams at elevated positions using arc welding equipment",
        parties: "Team Alpha, SafeWork BV",
        additionalContext: ""
      },
      document: {
        title: "Toolbox Talk: Welding at Height",
        sections: [
          {
            heading: "1. Introduction (2-3 minutes)",
            content: "Welding is a high-risk activity on its own, but when we move that work to an elevated position, the risks multiply. We aren't just dealing with sparks and heat; we are dealing with gravity. Welding at height requires a double focus: you must protect yourself from falling and protect everyone below you from fire and falling objects. Today, we will discuss how to manage these combined risks to ensure everyone goes home safe at the end of the shift."
          },
          {
            heading: "2. Key Points (5-7 minutes)",
            content: "**Point 1: Secure Your Equipment**\nWhen you are working at height, anything you drop becomes a dangerous projectile. Use tool tethers for all hand tools, including chipping hammers and wire brushes. Ensure your welding lead and electrode holder are secured so they cannot slip and fall. Never leave loose rods or stubs on a grating; use a fire-resistant container to collect them immediately.\n\n**Point 2: Fire Prevention and the \"Drop Zone\"**\nSparks and molten slag can travel a long distance horizontally and vertically. Establish a clear exclusion zone below the work area using barricades and warning signs. Use fire-resistant blankets or welding curtains to catch sparks and slag before they fall to lower levels.\n\n**Point 3: Fall Protection**\nAlways wear a full-body harness with a shock-absorbing lanyard. Anchor points must be rated for at least 12 kN. Inspect your harness and lanyard before every shift — check for burns, cuts, and frayed stitching."
          },
          {
            heading: "3. Discussion & Questions (3-5 minutes)",
            content: "Have any of you experienced a near-miss while welding at height? What additional measures could we put in place? Let's discuss any concerns about today's specific work area and conditions."
          },
          {
            heading: "4. Summary & Commitment",
            content: "Remember: secure your tools, maintain the drop zone, and never compromise on fall protection. If something doesn't feel right, stop work and speak up. Safety is everyone's responsibility."
          }
        ]
      },
      qrCode: null,
      signatureList: [],
      createdAt: "2026-02-16T19:45:00Z"
    }
  ],
  users: [
    {
      id: uuidv4(),
      name: "Saad Salhane",
      initials: "SS",
      email: "saad@apexstrategies.com",
      role: "Safety Officer",
      company: "Apex Strategies"
    }
  ],
  inspections: []
};

// Link session to first project
store.sessions[0].projectId = store.projects[0].id;

module.exports = store;
