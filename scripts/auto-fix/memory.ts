import fs from 'fs';
import path from 'path';
import { Issue, CorrectionProposal } from './types.ts';

interface MemoryEntry {
    timestamp: string;
    issues: Issue[];
    proposals: CorrectionProposal[];
    success: boolean;
    remainingIssues?: Issue[];
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class MemorySystem {
    private memoryPath: string;

    constructor() {
        this.memoryPath = path.join(__dirname, 'memory.json');
        if (!fs.existsSync(this.memoryPath)) {
            fs.writeFileSync(this.memoryPath, '[]', 'utf-8');
        }
    }

    logAttempt(issues: Issue[], proposals: CorrectionProposal[], success: boolean, remainingIssues?: Issue[]) {
        const entry: MemoryEntry = {
            timestamp: new Date().toISOString(),
            issues,
            proposals,
            success,
            remainingIssues
        };

        const memory = JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
        memory.push(entry);
        fs.writeFileSync(this.memoryPath, JSON.stringify(memory, null, 2), 'utf-8');
        console.log('Logged attempt to memory.');
    }
}
