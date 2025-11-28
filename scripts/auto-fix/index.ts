import { VisualCapture } from './capture.ts';
import { Validator } from './validator.ts';
import { Reasoner } from './reasoner.ts';
import { Corrector } from './corrector.ts';
import { QAEngine } from './qa.ts';
import { MemorySystem } from './memory.ts';
import { AutoFixConfig } from './types.ts';

async function main() {
    const config: AutoFixConfig = {
        url: 'http://localhost:8080', // Default to local dev server
        viewports: [{ width: 1280, height: 800 }],
        headless: true,
    };

    const capture = new VisualCapture(config);
    const validator = new Validator();
    const reasoner = new Reasoner();
    const corrector = new Corrector();
    const qa = new QAEngine(config);
    const memory = new MemorySystem();

    console.log('Starting Dashboard Auto-Correction System...');

    let iteration = 0;
    const MAX_ITERATIONS = 3; // Safety limit

    while (iteration < MAX_ITERATIONS) {
        console.log(`\n--- Iteration ${iteration + 1} ---`);

        // 1. Capture
        const componentMap = await capture.capture();

        // 2. Validate
        const issues = validator.validate(componentMap);
        if (issues.length === 0) {
            console.log('No issues found. Dashboard is clean!');
            break;
        }
        console.log(`Found ${issues.length} issues.`);

        // 3. Reason (Diagnose & Propose)
        // Limit to top 1 issue to avoid rate limits and debug speed
        const activeIssues = issues.slice(0, 1);
        console.log(`Processing top ${activeIssues.length} issues...`);

        const diagnosis = await reasoner.diagnose(componentMap, activeIssues);
        console.log('Diagnosis complete.');

        const proposals = await reasoner.proposeCorrections(componentMap, activeIssues, diagnosis);
        console.log(`Generated ${proposals.length} correction proposals.`);

        if (proposals.length === 0) {
            console.log('No corrections proposed. Exiting loop.');
            break;
        }

        // 4. Correct
        await corrector.applyCorrections(proposals);

        // 5. QA
        const qaResult = await qa.verify();

        // 6. Memory
        memory.logAttempt(issues, proposals, qaResult.passed, qaResult.remainingIssues);

        if (qaResult.passed) {
            console.log('All issues resolved successfully!');
            break;
        }

        iteration++;
    }

    if (iteration === MAX_ITERATIONS) {
        console.log('Reached maximum iterations. Some issues may persist.');
    }
}

main().catch(console.error);
