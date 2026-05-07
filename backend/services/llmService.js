/**
 * LLM Service — Groq API
 * Uses Groq cloud inference (free tier) for fast document generation.
 * Sign up and get a free API key at https://console.groq.com
 */

const Groq = require('groq-sdk');

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in .env');
  return new Groq({ apiKey });
}

/**
 * Build system prompt with document-specific rules.
 * Toolbox talks receive a dedicated strict template prompt; all other
 * document types use the generic rules-driven prompt.
 */
function buildSystemPrompt(documentType, rules) {
  // ── Toolbox Talk: strict 10-section template enforcement ──────────────────
  if (documentType === 'toolbox') {
    return `You are a workplace safety consultant. Generate a Toolbox Talk safety document.
Use markdown with ## headings for each section.
Rules:
${rules.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')}
Do NOT use HTML. Start immediately with the first ## heading.`;
  }

  // ── All other document types: generic rules-driven prompt ─────────────────
  const typeNames = {
    safety_procedure: 'Safety Procedure',
    machine_operation: 'Machine Operation Guide',
    checklist: 'Safety Checklist',
    maintenance_instruction: 'Maintenance Instruction'
  };

  const typeName = typeNames[documentType] || documentType;

  return `You are an expert technical writer specializing in workplace safety documentation.

CRITICAL REQUIREMENTS:
You MUST follow ALL of these rules when generating the ${typeName}:

${rules.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')}

STRUCTURE REQUIREMENTS:
- Use clear hierarchical headings (##, ###)
- Write in active, direct language
- Include specific, actionable instructions
- Prioritize safety and clarity over brevity
- Use appropriate safety symbols ( , ✓, ☐, 🔴, 🟡, 🟢)
- Number all procedural steps sequentially
- Bold important warnings and key terms

OUTPUT FORMAT:
Return a well-structured document in Markdown format with clearly defined sections.
The document should be professional, comprehensive, and immediately usable in a workplace setting.`;
}

/**
 * Build user prompt with context details.
 * If documentContext is provided (retrieved from the company Knowledge Base),
 * it is prepended as the primary reference before the generation request.
 */
function buildUserPrompt(context, documentContext = null) {
  let prompt = '';

  if (documentContext) {
    // Enforce hard cap of 1500 chars
    const cappedContext = documentContext.slice(0, 1500);
    prompt +=
      '=== COMPANY KNOWLEDGE BASE ===\n' +
      'The following content was retrieved from the company\'s own documents.\n' +
      'Use this as your PRIMARY reference. Reflect the company\'s exact terminology,\n' +
      'equipment names, process steps, roles, and standards found in this content.\n' +
      'Generic advice should only be used to fill gaps not covered by these documents.\n\n' +
      cappedContext +
      '\n\n=== END OF COMPANY KNOWLEDGE BASE ===\n\n';
  }

  prompt += `Generate a ${context.documentType.replace('_', ' ')} with the following specifications:\n\n**Title:** ${context.title}`;

  // Language instruction — toolbox talks honour an explicit language selection
  if (context.language) {
    const langLabels = { nl: 'Dutch (NL)', en: 'English (EN)', pl: 'Polish (PL)', ro: 'Romanian (RO)' };
    const langLabel = langLabels[context.language] || 'English (EN)';
    prompt += `\n**Body Language:** ${langLabel} — write all sections in this language except Section 1 (Critical Warning) which is always EN/NL/PL/RO`;
  }

  if (context.company) {
    prompt += `\n**Company / Client:** ${context.company}`;
  }

  if (context.subcontractors && context.subcontractors.length > 0) {
    prompt += `\n**Subcontractors on site:** ${context.subcontractors.join(', ')}`;
  }

  if (context.equipment) {
    prompt += `\n**Equipment/Machinery:** ${context.equipment}`;
  }

  if (context.location) {
    prompt += `\n**Location/Area:** ${context.location}`;
  }

  if (context.tasks && context.tasks.length > 0) {
    prompt += `\n\n**Tasks/Operations to Cover:**\n${context.tasks.map(t => `- ${t}`).join('\n')}`;
  }

  if (context.hazards && context.hazards.length > 0) {
    prompt += `\n\n**Known Hazards/Risks:**\n${context.hazards.map(h => `- ${h}`).join('\n')}`;
  }

  if (context.regulations && context.regulations.length > 0) {
    prompt += `\n\n**Applicable Regulations/Standards:**\n${context.regulations.map(r => `- ${r}`).join('\n')}`;
  }

  if (context.ppe && context.ppe.length > 0) {
    prompt += `\n\n**Required Personal Protective Equipment:**\n${context.ppe.map(p => `- ${p}`).join('\n')}`;
  }

  if (context.tools && context.tools.length > 0) {
    prompt += `\n\n**Required Tools/Materials:**\n${context.tools.map(t => `- ${t}`).join('\n')}`;
  }

  if (context.frequency) {
    prompt += `\n\n**Frequency/Schedule:** ${context.frequency}`;
  }

  if (context.customInstructions) {
    prompt += `\n\n**Additional Instructions:**\n${context.customInstructions}`;
  }

  return prompt;
}

/**
 * Generate document using Ollama LLM.
 * @param {string} documentType
 * @param {object} context        - User-supplied generation context
 * @param {string[]} rules        - Document-type-specific rules
 * @param {string|null} documentContext - Pre-retrieved KB text (optional)
 */
async function generateDocument(documentType, context, rules, documentContext = null) {
  const systemPrompt = buildSystemPrompt(documentType, rules);
  const userPrompt = buildUserPrompt(context, documentContext);
  if (documentContext) {
    console.log(`[LLM] Knowledge Base context injected (${documentContext.length} chars)`);
    console.log('[LLM] --- KB CONTEXT START ---');
    console.log(documentContext);
    console.log('[LLM] --- KB CONTEXT END ---');
  }

  try {
    console.log(`[LLM] Generating ${documentType} document: "${context.title}"`);
    console.log(`[LLM] Using model: ${GROQ_MODEL} via Groq API`);

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 3000
    });

    const generatedContent = completion.choices[0].message.content;

    console.log(`[LLM] Document generated successfully (${generatedContent.length} characters)`);

    // Parse the markdown into structured sections
    const document = parseMarkdownToSections(generatedContent, context.title);

    return {
      success: true,
      document,
      rawMarkdown: generatedContent,
      metadata: {
        model: GROQ_MODEL,
        generatedAt: new Date().toISOString(),
        wordCount: generatedContent.split(/\s+/).length,
        characterCount: generatedContent.length,
        documentType: documentType
      }
    };

  } catch (error) {
    console.error('[LLM] Generation failed:', error.message);

    if (error.status === 401) {
      throw new Error('Invalid GROQ_API_KEY. Check your .env file.');
    }
    if (error.status === 429) {
      throw new Error('Groq rate limit reached. Please wait a moment and try again.');
    }

    throw new Error(`Document generation failed: ${error.message}`);
  }
}

/**
 * Parse markdown content into structured sections
 */
function parseMarkdownToSections(markdown, defaultTitle) {
  const sections = [];
  const lines = markdown.split('\n');
  let currentSection = null;
  let documentTitle = defaultTitle;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for main title (# heading)
    const mainTitleMatch = line.match(/^#\s+(.+)$/);
    if (mainTitleMatch && i === 0) {
      documentTitle = mainTitleMatch[1].trim();
      continue;
    }
    
    // Check for section headings (##, ###)
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    
    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentSection.content.trim();
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        heading: headingMatch[2].trim(),
        content: '',
        level: headingMatch[1].length,
        order: sections.length + 1
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += line + '\n';
    } else if (line.trim()) {
      // Content before first heading - create introduction section
      if (!currentSection) {
        currentSection = {
          heading: 'Overview',
          content: line + '\n',
          level: 2,
          order: 1
        };
      }
    }
  }
  
  // Save last section
  if (currentSection) {
    currentSection.content = currentSection.content.trim();
    sections.push(currentSection);
  }
  
  return {
    title: documentTitle,
    sections: sections,
    fullMarkdown: markdown
  };
}

/**
 * Check Groq API health / connectivity
 */
async function checkOllamaHealth() {
  try {
    const groq = getGroqClient();
    const list = await groq.models.list();
    const models = (list.data || []).map(m => m.id);
    const hasModel = models.includes(GROQ_MODEL);

    return {
      healthy: true,
      provider: 'groq',
      model: GROQ_MODEL,
      modelAvailable: hasModel,
      availableModels: models
    };
  } catch (error) {
    return {
      healthy: false,
      provider: 'groq',
      error: error.message
    };
  }
}

module.exports = {
  generateDocument,
  checkOllamaHealth
};
