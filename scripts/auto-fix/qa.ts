import { VisualCapture } from './capture.ts';
import { Validator } from './validator.ts';
import { Issue, AutoFixConfig } from './types.ts';

export class QAEngine {
    private capture: VisualCapture;
    private validator: Validator;

    constructor(config: AutoFixConfig) {
        this.capture = new VisualCapture(config);
        this.validator = new Validator();
    }

    async verify(): Promise<{ passed: boolean; remainingIssues: Issue[] }> {
        console.log('Running QA verification...');

        // 1. Re-capture
        const componentMap = await this.capture.capture();

        // 2. Re-validate
        const remainingIssues = this.validator.validate(componentMap);

        if (remainingIssues.length === 0) {
            console.log('QA Passed: No issues found.');
            return { passed: true, remainingIssues: [] };
        } else {
            console.log(`QA Failed: ${remainingIssues.length} issues remain.`);
            return { passed: false, remainingIssues };
        }
    }
}
