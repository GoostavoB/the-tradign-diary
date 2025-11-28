import OpenAI from 'openai';
import { ComponentMap, Issue, CorrectionProposal } from './types.ts';
import dotenv from 'dotenv';

dotenv.config();

export class Reasoner {
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables.');
        }
        this.openai = new OpenAI({ apiKey });
    }

    async diagnose(componentMap: ComponentMap, issues: Issue[]): Promise<string> {
        if (issues.length === 0) return 'No issues found.';

        const filteredMap = this.filterComponentMap(componentMap, issues);
        const prompt = `
        You are a UX/UI expert debugger.
        Here is a map of the relevant parts of the DOM:
        ${JSON.stringify(filteredMap, null, 2)}

        Here are the visual issues identified:
        ${JSON.stringify(issues, null, 2)}

        Please analyze these issues and explain the root cause for each.
        Focus on Tailwind classes, CSS properties, and layout structure.
        `;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });

        return response.choices[0].message.content || 'No diagnosis provided.';
    }

    async proposeCorrections(componentMap: ComponentMap, issues: Issue[], diagnosis: string): Promise<CorrectionProposal[]> {
        if (issues.length === 0) return [];

        const filteredMap = this.filterComponentMap(componentMap, issues);
        const prompt = `
        Based on the diagnosis:
        ${diagnosis}

        And the relevant DOM structure:
        ${JSON.stringify(filteredMap, null, 2)}

        Propose specific code corrections for the issues.
        Return a JSON array of CorrectionProposal objects.
        
        Context:
        - This is a React project using Tailwind CSS.
        - Global styles are in 'src/index.css'.
        - Components are in 'src/components/'.
        - Most styling is done via Tailwind utility classes in the 'className' attribute.
        - Avoid proposing changes to non-existent files like 'style.css'.
        - IMPORTANT: You MUST preserve the exact "issueId" from the input issues. Do not modify it.
        
        Format:
        [
            {
                "issueId": "string (MUST match input issueId exactly)",
                "action": "update_style" | "update_structure",
                "targetFile": "string (e.g., 'src/index.css' or 'src/components/MyComponent.tsx')",
                "targetLine": number (if known),
                "codeChange": "string (the new class string or style)",
                "description": "string"
            }
        ]
        `;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        console.log('OpenAI Response Content:', content);
        if (!content) return [];

        try {
            const result = JSON.parse(content);
            console.log('Parsed Result:', result);
            let proposals = result.proposals || result.CorrectionProposal || result;

            // Handle single object response
            if (!Array.isArray(proposals) && typeof proposals === 'object' && proposals !== null) {
                if (proposals.issueId && proposals.action) {
                    proposals = [proposals];
                }
            }

            if (!Array.isArray(proposals)) {
                console.error('Proposals is not an array:', proposals);
                return [];
            }
            return proposals;
        } catch (e) {
            console.error('Failed to parse correction proposals:', e);
            return [];
        }
    }

    private filterComponentMap(componentMap: ComponentMap, issues: Issue[]): any {
        const relevantIds = new Set<string>();

        // Add all issue component IDs
        issues.forEach(issue => relevantIds.add(issue.componentId));

        // Add parents of issue components for context
        issues.forEach(issue => {
            const node = componentMap[issue.componentId];
            if (node && node.parentId) {
                relevantIds.add(node.parentId);
            }
        });

        const filteredMap: any = {};
        relevantIds.forEach(id => {
            if (componentMap[id]) {
                filteredMap[id] = this.simplifyComponentNode(componentMap[id]);
            }
        });

        return filteredMap;
    }

    private simplifyComponentNode(node: any): any { // Assuming ComponentNode is implicitly 'any' or defined elsewhere
        return {
            id: node.id,
            tagName: node.tagName,
            className: node.className,
            // Only include relevant styles or a subset
            styles: {
                display: node.styles.display,
                position: node.styles.position,
                flex: node.styles.display === 'flex' ? 'flex' : undefined,
                grid: node.styles.display === 'grid' ? 'grid' : undefined,
                padding: node.styles.padding,
                margin: node.styles.margin,
                width: node.styles.width,
                height: node.styles.height,
                color: node.styles.color,
                backgroundColor: node.styles.backgroundColor,
                fontSize: node.styles.fontSize,
                fontWeight: node.styles.fontWeight,
            },
            rect: {
                width: node.rect.width,
                height: node.rect.height,
            }
        };
    }
}
