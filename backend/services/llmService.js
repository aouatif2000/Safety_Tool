/**
 * Ollama LLM Service
 * Provides AI-powered document generation using local Ollama models
 * NO PAID APIs - Completely free and open-source
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';
const REQUEST_TIMEOUT = 120000; // 120 seconds for longer documents

/**
 * Build system prompt with document-specific rules
 */
function buildSystemPrompt(documentType, rules) {
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
 * Build user prompt with context details
 */
function buildUserPrompt(context) {
  let prompt = `Generate a ${context.documentType.replace('_', ' ')} with the following specifications:

**Title:** ${context.title}`;

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
 * Generate document using Ollama LLM
 */
async function generateDocument(documentType, context, rules) {
  const systemPrompt = buildSystemPrompt(documentType, rules);
  const userPrompt = buildUserPrompt(context);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    console.log(`[LLM] Generating ${documentType} document: "${context.title}"`);
    console.log(`[LLM] Using model: ${OLLAMA_MODEL}`);
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 3000 // Allow longer documents
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.message.content;
    
    console.log(`[LLM] Document generated successfully (${generatedContent.length} characters)`);
    
    // Parse the markdown into structured sections
    const document = parseMarkdownToSections(generatedContent, context.title);
    
    return {
      success: true,
      document,
      rawMarkdown: generatedContent,
      metadata: {
        model: OLLAMA_MODEL,
        generatedAt: new Date().toISOString(),
        wordCount: generatedContent.split(/\s+/).length,
        characterCount: generatedContent.length,
        documentType: documentType
      }
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[LLM] Generation failed:', error.message);
    
    if (error.name === 'AbortError') {
      throw new Error('Document generation timed out. Please try again or use a shorter specification.');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Cannot connect to Ollama. Please ensure Ollama is running on ' + OLLAMA_BASE_URL);
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
 * Check Ollama health status
 */
async function checkOllamaHealth() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      return { healthy: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    const models = data.models || [];
    const hasModel = models.some(m => m.name.includes(OLLAMA_MODEL));
    
    return {
      healthy: true,
      url: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      modelInstalled: hasModel,
      availableModels: models.map(m => m.name)
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      url: OLLAMA_BASE_URL
    };
  }
}

module.exports = {
  generateDocument,
  checkOllamaHealth
};
