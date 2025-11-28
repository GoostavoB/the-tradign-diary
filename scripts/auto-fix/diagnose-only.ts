import { VisualCapture } from './capture.ts';
import { Validator } from './validator.ts';
import { AutoFixConfig } from './types.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function diagnose() {
    const config: AutoFixConfig = {
        url: 'http://localhost:8080',
        viewports: [{ width: 1280, height: 800 }],
        headless: true,
    };

    const capture = new VisualCapture(config);
    const validator = new Validator();

    console.log('Starting diagnosis...');

    try {
        // 1. Capture
        const componentMap = await capture.capture();

        // 2. Validate
        const issues = validator.validate(componentMap);

        // Create a lookup for component details
        const componentLookup: Record<string, { tagName: string; className: string; text?: string }> = {};
        issues.forEach(issue => {
            const node = componentMap[issue.componentId];
            if (node) {
                componentLookup[issue.componentId] = {
                    tagName: node.tagName,
                    className: node.className,
                    text: node.text ? node.text.substring(0, 50) : undefined
                };
            }
        });

        // 3. Save Report
        const report = {
            timestamp: new Date().toISOString(),
            issueCount: issues.length,
            issues: issues,
            componentLookup: componentLookup
        };

        const reportPath = path.join(__dirname, 'diagnosis_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

        console.log(`Diagnosis complete. Found ${issues.length} issues.`);
        console.log(`Report saved to ${reportPath}`);

        process.exit(0);
    } catch (error) {
        console.error('Diagnosis failed:', error);
        process.exit(1);
    }
}

diagnose();
