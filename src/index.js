import { startCLI } from './cli.js';
import { startREPL } from './repl.js';
import { getOllamaClient } from './ollama.js';
import { getConfig, setConfig, listConfig } from './config.js';
import { executeToolCommand, listTools } from './tools/index.js';
import { parseToolCalls, extractCodeSnippets } from './utils/parsing.js';
import { checkPermission, clearSessionPermissions } from './permissions.js';

// Export the main components for potential programmatic use
export {
    startCLI,
    startREPL,
    getOllamaClient,
    getConfig,
    setConfig,
    listConfig,
    executeToolCommand,
    listTools,
    parseToolCalls,
    extractCodeSnippets,
    checkPermission,
    clearSessionPermissions
};

// Entry point when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startCLI(process.argv);
}