/**
 * Parse tool calls from AI response text
 * @param {string} text - Response text from AI
 * @returns {Array<Object>} - Array of tool call objects
 */
export function parseToolCalls(text) {
    const toolCalls = [];

    // Look for JSON objects in code blocks
    const codeBlockRegex = /```(?:json)?\n([\s\S]*?)\n```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        try {
            const jsonContent = match[1].trim();
            const parsed = JSON.parse(jsonContent);

            // Check if it's a valid tool call
            if (parsed && parsed.name && parsed.arguments) {
                toolCalls.push({
                    name: parsed.name,
                    arguments: parsed.arguments
                });
            }
        } catch (error) {
            // Not valid JSON, skip this block
        }
    }

    // Also look for inline JSON objects
    const inlineJsonRegex = /\{[\s\S]*?"name"[\s\S]*?"arguments"[\s\S]*?\}/g;
    while ((match = inlineJsonRegex.exec(text)) !== null) {
        try {
            const jsonContent = match[0].trim();
            const parsed = JSON.parse(jsonContent);

            // Check if it's a valid tool call and not a duplicate
            if (parsed && parsed.name && parsed.arguments) {
                const isDuplicate = toolCalls.some(
                    call => call.name === parsed.name &&
                        JSON.stringify(call.arguments) === JSON.stringify(parsed.arguments)
                );

                if (!isDuplicate) {
                    toolCalls.push({
                        name: parsed.name,
                        arguments: parsed.arguments
                    });
                }
            }
        } catch (error) {
            // Not valid JSON, skip this match
        }
    }

    return toolCalls;
}

/**
 * Extract code snippets from AI response text
 * @param {string} text - Response text from AI
 * @returns {Array<Object>} - Array of code snippet objects
 */
export function extractCodeSnippets(text) {
    const snippets = [];

    // Match code blocks with language specifier
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        snippets.push({
            language: match[1] || 'text',
            code: match[2]
        });
    }

    return snippets;
}

/**
 * Parse command and arguments from a user input string
 * @param {string} input - User input string
 * @returns {Object} - Command and arguments object
 */
export function parseCommand(input) {
    // Split the input by spaces, but respect quoted strings
    const parts = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (escapeNext) {
            current += char;
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"' && !inQuotes) {
            inQuotes = true;
            continue;
        }

        if (char === '"' && inQuotes) {
            inQuotes = false;
            continue;
        }

        if (char === ' ' && !inQuotes) {
            if (current) {
                parts.push(current);
                current = '';
            }
            continue;
        }

        current += char;
    }

    if (current) {
        parts.push(current);
    }

    // The first part is the command, the rest are arguments
    const command = parts[0] || '';
    const args = parts.slice(1);

    return { command, args };
}