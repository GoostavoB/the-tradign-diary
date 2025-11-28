import { ComponentMap, ComponentNode, Issue } from './types.ts';
import fs from 'fs';
import path from 'path';

interface Rules {
    spacing: { allowedValues: string[] };
    typography: { minFontSize: string };
    colors: { minContrastRatio: number };
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Validator {
    private rules: Rules;

    constructor() {
        const rulesPath = path.join(__dirname, 'rules.json');
        this.rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
    }

    validate(componentMap: ComponentMap): Issue[] {
        const issues: Issue[] = [];

        Object.values(componentMap).forEach(node => {
            // 1. Check Spacing (Padding/Margin)
            this.checkSpacing(node, issues);

            // 2. Check Typography (Font Size)
            this.checkTypography(node, issues);

            // 3. Check Contrast (Placeholder logic for now as it requires background calculation)
            // this.checkContrast(node, issues);
        });

        return issues;
    }

    private checkSpacing(node: ComponentNode, issues: Issue[]) {
        if (typeof node.className === 'string' && node.className.includes('sr-only')) return; // Ignore screen reader only elements

        const { margin, padding } = node.styles;
        const validSpacings = this.rules.spacing.allowedValues;

        // Simple check: split by space and check each value
        // This is a basic implementation; robust parsing would handle '10px 20px' etc.
        [padding, margin].forEach((prop, index) => {
            const type = index === 0 ? 'padding' : 'margin';
            if (prop && prop !== '0px') {
                const values = prop.split(' ');
                values.forEach(val => {
                    if (!validSpacings.includes(val) && val !== '0px') {
                        // Heuristic: ignore auto or percentage for now to reduce noise
                        if (val.endsWith('px')) {
                            issues.push({
                                id: `spacing_${node.id}_${type}`,
                                componentId: node.id,
                                type: 'spacing',
                                severity: 'low',
                                message: `Invalid ${type} value: ${val}`,
                                description: `The ${type} '${val}' is not in the allowed spacing scale: ${validSpacings.join(', ')}.`
                            });
                        }
                    }
                });
            }
        });
    }

    private checkTypography(node: ComponentNode, issues: Issue[]) {
        const { fontSize } = node.styles;
        if (fontSize && fontSize.endsWith('px')) {
            const size = parseInt(fontSize, 10);
            const minSize = parseInt(this.rules.typography.minFontSize, 10);

            if (size < minSize) {
                issues.push({
                    id: `typo_${node.id}_size`,
                    componentId: node.id,
                    type: 'typography',
                    severity: 'medium',
                    message: `Font size too small: ${fontSize}`,
                    description: `Text element has font-size ${fontSize}, which is below the minimum of ${this.rules.typography.minFontSize}.`
                });
            }
        }
    }
}
