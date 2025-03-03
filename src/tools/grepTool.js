import fs from 'fs/promises';
import path from 'path';
import { globTool } from './globTool.js';
import { fileReadTool } from './fileReadTool.js';
import { getConfig } from '../config.js';

/**
 * Tool for searching file contents for patterns
 * @param {Object} args - Tool arguments
 * @param {string} args.pattern - Pattern to search for
 * @param {string} [args.glob='**/*.{ js, jsx, ts, tsx, md, txt, json } '] - Glob pattern for files to search
    * @param { boolean } [args.caseSensitive = false] - Whether to perform case -sensitive search
        * @param { boolean } [args.regex = false] - Whether to interpret the pattern as a regex
            * @returns { Promise < Array >} - Search results
                */
export async function grepTool(args) {
    if (!args.pattern) {
        throw new Error('Pattern is required');
    }

    const glob = args.glob || '**/*.{js,jsx,ts,tsx,md,txt,json}';
    const caseSensitive = args.caseSensitive || false;
    const useRegex = args.regex || false;

    try {
        // Find files matching the glob pattern
        const files = await globTool({ pattern: glob });

        if (!files || files.length === 0) {
            return [];
        }

        // Prepare the pattern
        let pattern;
        if (useRegex) {
            pattern = new RegExp(args.pattern, caseSensitive ? 'g' : 'gi');
        } else {
            pattern = caseSensitive ? args.pattern : args.pattern.toLowerCase();
        }

        // Search in each file
        const results = [];

        for (const file of files) {
            try {
                const content = await fileReadTool({ path: file });

                // Split content into lines
                const lines = content.split('\n');

                // Search lines for the pattern
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];

                    let match = false;

                    if (useRegex) {
                        pattern.lastIndex = 0; // Reset regex state
                        match = pattern.test(line);
                    } else {
                        const lineToSearch = caseSensitive ? line : line.toLowerCase();
                        match = lineToSearch.includes(pattern);
                    }

                    if (match) {
                        results.push({
                            file,
                            line: i + 1,
                            content: line.trim(),
                        });
                    }
                }
            } catch (error) {
                // Skip files that can't be read
                continue;
            }
        }

        return results;
    } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
}