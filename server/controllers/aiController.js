const { GoogleGenAI } = require("@google/genai");

let aiClient = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback intelligent generator if API key is not configured
function generateLocalFallbackDescription({ title, category, priority, tone, currentDescription }) {
  const trimmedTitle = title || "Task Assignment";
  const cat = category || "General";
  const prio = priority || "Medium";

  if (tone === "user-story") {
    return {
      description: `### User Story\n**As a** team member / end-user,\n**I want** to ${trimmedTitle.toLowerCase()},\n**So that** we achieve our project milestone reliably and maintain high code quality.\n\n### Context & Overview\n${currentDescription || `Implement and verify ${trimmedTitle} according to standard specifications.`}\n\n### Acceptance Criteria\n- [ ] Requirements are fully defined and reviewed.\n- [ ] Core implementation for ${trimmedTitle} is completed.\n- [ ] Unit and integration tests pass without regression.\n- [ ] Documentation and comments updated.`,
      acceptanceCriteria: [
        `Requirements for ${trimmedTitle} are clearly outlined`,
        `Core logic passes all unit and integration tests`,
        `Code meets security and performance standards`,
        `Peer review completed and merged`,
      ],
      subtasks: [
        `Analyze requirements and dependencies for ${trimmedTitle}`,
        `Draft core implementation and error handling`,
        `Execute verification tests and edge case checks`,
        `Review performance and deploy changes`,
      ],
      estimatedTime: prio === "High" || prio === "Urgent" ? "2-4 hours" : "1-2 days",
      suggestedTags: [cat.toLowerCase(), "task", prio.toLowerCase()],
    };
  }

  if (tone === "concise") {
    return {
      description: `**Objective:** ${trimmedTitle}\n\n**Scope:** ${currentDescription || `Complete the required work for ${trimmedTitle} in ${cat}.`}\n\n**Key Deliverables:**\n- Working solution verified against test cases\n- Zero breaking changes\n- Ready for production review`,
      acceptanceCriteria: [
        `Functional solution for ${trimmedTitle}`,
        `Passed verification tests`,
      ],
      subtasks: [
        `Execute implementation`,
        `Run verification tests`,
      ],
      estimatedTime: "2-3 hours",
      suggestedTags: [cat.toLowerCase(), "quick-win"],
    };
  }

  // Default Actionable & Detailed format
  return {
    description: `### 🎯 Objective\n${trimmedTitle}\n\n### 📋 Detailed Scope\n${currentDescription ? currentDescription + '\n\n' : ''}Execute the end-to-end implementation for **${trimmedTitle}** within the **${cat}** domain. Ensure high reliability, proper exception handling, and smooth integration with existing modules.\n\n### 🛠️ Key Technical Deliverables\n1. Design and develop the core logic for ${trimmedTitle}.\n2. Validate data consistency and edge case scenarios.\n3. Integrate appropriate caching or performance optimizations where applicable.\n4. Ensure compliance with ${prio.toLowerCase()} priority SLAs.\n\n### ✅ Definition of Done (DoD)\n- [ ] All primary functional paths verified.\n- [ ] Error logging and graceful fallback handling in place.\n- [ ] Passed code review and ready for merge.`,
    acceptanceCriteria: [
      `Primary workflow for "${trimmedTitle}" functions seamlessly`,
      `Proper error validation and boundary checks implemented`,
      `Performance and response time meet SLA targets`,
      `Code formatted and peer-reviewed`,
    ],
    subtasks: [
      `Step 1: Review prerequisites and environment setup`,
      `Step 2: Implement core functionality for ${trimmedTitle}`,
      `Step 3: Add unit tests and validate edge cases`,
      `Step 4: Conduct final code review and documentation update`,
    ],
    estimatedTime: prio === "Urgent" ? "1-2 hours" : prio === "High" ? "3-5 hours" : "1 day",
    suggestedTags: [cat.toLowerCase(), "priority-" + prio.toLowerCase(), "feature"],
  };
}

// @desc    Generate an enhanced task description with Gemini AI
// @route   POST /api/ai/generate-description
// @access  Public or Protected
const generateTaskDescription = async (req, res, next) => {
  try {
    const { 
      title, 
      currentDescription = "", 
      category = "General", 
      priority = "Medium", 
      tone = "actionable", 
      additionalContext = "" 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a task title to generate a description.",
      });
    }

    const ai = getAIClient();

    if (!ai) {
      // Return structured fallback generator if API key is not yet set
      const fallback = generateLocalFallbackDescription({
        title: title.trim(),
        category,
        priority,
        tone,
        currentDescription: currentDescription.trim(),
      });

      return res.status(200).json({
        success: true,
        source: "smart-template",
        data: fallback,
        notice: "Generated using smart task templates. Set GEMINI_API_KEY in Settings > Secrets for customized neural generation.",
      });
    }

    // Build the prompt for Gemini
    const prompt = `You are an expert Agile project manager, technical lead, and productivity assistant.
Create a comprehensive, crisp, and high-quality task description for a task management application.

Task Information:
- Title: "${title.trim()}"
- Category: "${category}"
- Priority: "${priority}"
- Desired Style/Tone: "${tone}" (Options: actionable, detailed, concise, user-story, bug-report, technical)
- Existing notes/draft: "${currentDescription.trim() || 'None'}"
- Extra instructions/context: "${additionalContext.trim() || 'None'}"

Requirements:
1. Provide a well-structured markdown description that includes clear Objectives, Context/Scope, Key Deliverables, and a checklist of Definition of Done.
2. Provide a list of 3-5 clear Acceptance Criteria.
3. Provide a list of 3-5 logical subtasks/steps to complete this task.
4. Estimate realistic completion time (e.g. "2-4 hours", "1-2 days").
5. Suggest 2-4 relevant short category/tag keywords.

Format your response as a valid JSON object matching this schema:
{
  "description": "Full markdown formatted description string with markdown headings (###), bullet points, and checkbox lists (- [ ])",
  "acceptanceCriteria": ["criterion 1", "criterion 2", "criterion 3"],
  "subtasks": ["step 1", "step 2", "step 3", "step 4"],
  "estimatedTime": "e.g., 2-4 hours",
  "suggestedTags": ["tag1", "tag2"]
}

Respond ONLY with the raw JSON object. Do not include markdown code block markers (like \`\`\`json) outside the JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional task architecture assistant. Always return valid, well-structured JSON.",
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text ? response.text.trim() : "";
    let parsedData = null;

    try {
      // Clean potential code fences
      const cleaned = responseText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn("Failed to parse Gemini JSON output, using raw text", parseErr);
      parsedData = {
        description: responseText,
        acceptanceCriteria: [
          `Complete primary requirements for ${title}`,
          `Validate testing and edge cases`,
          `Peer review and deploy`,
        ],
        subtasks: [
          `Review requirements for ${title}`,
          `Execute implementation`,
          `Verify and document`,
        ],
        estimatedTime: "2-4 hours",
        suggestedTags: [category.toLowerCase(), "gemini-ai"],
      };
    }

    return res.status(200).json({
      success: true,
      source: "gemini-3.7-flash",
      data: parsedData,
    });
  } catch (error) {
    console.error("Gemini AI task generation error:", error);
    // Graceful fallback to smart template so user workflow is never interrupted
    const fallback = generateLocalFallbackDescription({
      title: req.body.title || "Task",
      category: req.body.category || "General",
      priority: req.body.priority || "Medium",
      tone: req.body.tone || "actionable",
      currentDescription: req.body.currentDescription || "",
    });

    return res.status(200).json({
      success: true,
      source: "smart-template-fallback",
      data: fallback,
      errorDetail: error.message,
    });
  }
};

// @desc    Refine / transform existing task description
// @route   POST /api/ai/refine-description
// @access  Public or Protected
const refineTaskDescription = async (req, res, next) => {
  try {
    const { title = "Task", description, action = "expand" } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a description to refine.",
      });
    }

    const ai = getAIClient();

    if (!ai) {
      let refined = description;
      if (action === "add_acceptance_criteria") {
        refined = `${description}\n\n### ✅ Acceptance Criteria\n- [ ] Requirements verified\n- [ ] Edge cases handled\n- [ ] Solution tested and documented`;
      } else if (action === "summarize") {
        refined = `**Summary:** ${description.substring(0, 150)}...`;
      } else if (action === "bullet_points") {
        refined = `### 📋 Key Points\n` + description.split('\n').filter(Boolean).map(line => `- ${line}`).join('\n');
      }

      return res.status(200).json({
        success: true,
        source: "smart-template",
        refinedText: refined,
      });
    }

    let instruction = "";
    switch (action) {
      case "summarize":
        instruction = "Summarize this task description into 2-3 concise, high-impact bullet points.";
        break;
      case "add_acceptance_criteria":
        instruction = "Keep the existing description and append a comprehensive, testable Acceptance Criteria checklist with markdown checkboxes (- [ ]).";
        break;
      case "expand":
        instruction = "Expand this task description with technical depth, implementation steps, and edge-case testing considerations.";
        break;
      case "make_professional":
        instruction = "Rewrite this description using professional, clear, and unambiguous project management and engineering language.";
        break;
      case "bullet_points":
        instruction = "Convert this description into clear, formatted bullet points and action items.";
        break;
      default:
        instruction = "Improve the clarity, organization, and actionability of this task description.";
    }

    const prompt = `Task Title: "${title}"
Current Description:
"""
${description}
"""

Goal: ${instruction}
Format the response cleanly in markdown. Do not include introductory conversational text like "Here is the refined description:". Output only the refined description content.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    const refinedText = response.text ? response.text.trim() : description;

    return res.status(200).json({
      success: true,
      source: "gemini-3.7-flash",
      refinedText,
    });
  } catch (error) {
    console.error("Gemini AI refine description error:", error);
    return res.status(200).json({
      success: true,
      source: "fallback",
      refinedText: req.body.description,
    });
  }
};

module.exports = {
  generateTaskDescription,
  refineTaskDescription,
};
