import { CorrectionProposal } from './types.ts';
import fs from 'fs';
import path from 'path';

export class Corrector {

    async applyCorrections(proposals: CorrectionProposal[]) {
        console.log(`Applying ${proposals.length} corrections...`);

        for (const proposal of proposals) {
            let targetFile = proposal.targetFile;
            let matchedId: string | null = null;

            // Resolve relative paths
            if (targetFile && !path.isAbsolute(targetFile)) {
                targetFile = path.resolve(process.cwd(), targetFile);
            }

            // Fallback: Search for file if not found
            if (!targetFile || !fs.existsSync(targetFile)) {
                console.log(`Target file not found: ${targetFile}. Searching codebase...`);
                const result = await this.searchFileForComponent(proposal);
                if (result) {
                    console.log(`Found matching file: ${result.file} (ID: ${result.matchedId})`);
                    targetFile = result.file;
                    matchedId = result.matchedId;
                } else {
                    console.log(`Skipping proposal for issue ${proposal.issueId}: File not found and search failed.`);
                    continue;
                }
            }

            try {
                const content = fs.readFileSync(targetFile, 'utf-8');
                const newContent = this.applyChange(content, proposal, matchedId);

                if (content !== newContent) {
                    fs.writeFileSync(targetFile, newContent);
                    console.log(`Applied fix for ${proposal.issueId} in ${path.basename(targetFile)}`);
                } else {
                    console.log(`No changes made for ${proposal.issueId} (content match or application failed)`);
                }
            } catch (error) {
                console.error(`Failed to apply fix for ${proposal.issueId}:`, error);
            }
        }
    }

    private async searchFileForComponent(proposal: CorrectionProposal): Promise<{ file: string, matchedId: string } | null> {
        const srcDir = path.resolve(process.cwd(), 'src');
        const files = this.getAllFiles(srcDir);

        // 1. Try to match filename from proposal if provided
        if (proposal.targetFile) {
            const basename = path.basename(proposal.targetFile);
            const found = files.find(f => path.basename(f) === basename);
            if (found) return { file: found, matchedId: '' }; // No specific ID matched, just file
        }

        // 2. Try to match component ID parts (e.g. spacing_main-content_padding -> main-content)
        if (proposal.issueId) {
            const parts = proposal.issueId.split('_');
            // Heuristic: assume the ID is the second part if it has 3 parts (type_id_subtype)
            // or just search for parts that look like IDs

            let searchTerm = '';
            if (parts.length >= 2) {
                // Try to find the part that is not 'spacing', 'padding', 'margin', 'color', etc.
                const keywords = ['spacing', 'padding', 'margin', 'color', 'typography', 'layout', 'z-index'];
                const potentialIds = parts.filter(p => !keywords.includes(p));
                if (potentialIds.length > 0) {
                    searchTerm = potentialIds.join('-'); // Rejoin if it was split by underscores but originally hyphens? 
                    // Actually, capture.ts generates IDs. If it's a real ID, it's preserved.
                    // If it's node_X, it's useless.
                }
            }

            if (searchTerm && !searchTerm.startsWith('node_')) {
                console.log(`Searching for ID "${searchTerm}" in codebase...`);
                for (const file of files) {
                    try {
                        const content = fs.readFileSync(file, 'utf-8');
                        // Search for id="searchTerm" or className="... searchTerm ..."
                        if (content.includes(`id="${searchTerm}"`) || content.includes(`id='${searchTerm}'`)) {
                            return { file, matchedId: searchTerm };
                        }
                        // Also check for className usage if ID search fails? 
                        // But ID is safer.
                    } catch (e) {
                        // Ignore read errors
                    }
                }
            }
        }

        return null;
    }

    private getAllFiles(dir: string, fileList: string[] = []): string[] {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.getAllFiles(filePath, fileList);
            } else {
                if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
                    fileList.push(filePath);
                }
            }
        });
        return fileList;
    }

    private applyChange(content: string, proposal: CorrectionProposal, matchedId: string | null): string {
        // Extract the new class from codeChange
        let newClass = proposal.codeChange;
        if (!newClass) return content;

        const classMatch = newClass.match(/className=['"]([^'"]+)['"]/);
        if (classMatch) {
            newClass = classMatch[1];
        } else if (newClass.startsWith('className:')) {
            newClass = newClass.replace(/className:\s*['"]?([^'"]+)['"]?/, '$1').trim();
        }

        if (!newClass) return content;

        // If we have a matched ID, try to find the element with that ID and update its className
        if (matchedId) {
            // Regex to find the element with id="matchedId"
            // <Tag ... id="matchedId" ... className="..." ...>
            // or <Tag ... className="..." ... id="matchedId" ...>

            // This is tricky with regex.
            // Simplified approach: find `id="matchedId"` and look for `className="..."` in the same tag.

            // We can assume the tag starts with < and ends with >.
            // We search for the tag containing id="matchedId".

            const tagRegex = new RegExp(`<[^>]*id=["']${matchedId}["'][^>]*>`, 'g');
            return content.replace(tagRegex, (match) => {
                // Inside the tag, replace className value
                if (match.includes('className=')) {
                    // Replace existing className
                    // We need to know WHAT to replace. The proposal says "change pt-14 to pt-16".
                    // But we only have the NEW class string "pt-16".
                    // Should we replace the ENTIRE className? No, that would wipe other classes.
                    // Should we append? 
                    // Should we try to replace the conflicting class?

                    // If proposal description says "change pt-14 to pt-16", we can try to replace 'pt-14' with 'pt-16'.
                    // But we don't have that structured info.

                    // Heuristic: If newClass is a single Tailwind class (e.g. pt-16), 
                    // try to find a class with the same prefix (pt-) and replace it.

                    const prefix = newClass.split('-')[0] + '-'; // e.g. pt-
                    if (prefix.length > 1) {
                        return match.replace(/className=(['"])(.*?)\1/, (m, quote, classes) => {
                            const classList = classes.split(/\s+/);
                            const newClassList = classList.map((c: string) => {
                                if (c.startsWith(prefix)) return newClass; // Replace existing
                                return c;
                            });
                            if (!newClassList.includes(newClass)) {
                                // If not replaced (maybe old class was different prefix or missing), append it?
                                // Or maybe the old class was `p-6` and we want `pt-16`?
                                // This is hard.
                                // Let's just append/replace if we find exact match?
                                // No, let's replace if same prefix, otherwise append.
                                // But checking if it's already there.

                                // Actually, if we just replace the whole className with newClass, it breaks everything.
                                // We MUST be careful.

                                // Let's try to parse the description?
                                // "Change the padding-top class from 'pt-14' to 'pt-12'"
                                const descMatch = proposal.description.match(/from '([^']+)' to '([^']+)'/);
                                if (descMatch) {
                                    const oldVal = descMatch[1];
                                    const newVal = descMatch[2];
                                    return match.replace(oldVal, newVal);
                                }
                            }
                            return `className=${quote}${newClassList.join(' ')}${quote}`;
                        });
                    }
                }
                return match;
            });
        }

        // Basic implementation: if codeChange is provided, try to replace relevant parts
        // This is a placeholder. Real implementation needs robust AST or regex replacement.

        // If the proposal has a specific code change like "className='pt-12'",
        // and we can find the old value, we replace it.
        // But we don't know the old value.

        // For now, let's assume the LLM provides a search/replace block if we asked for it,
        // OR we just append the fix if it's a style file? No.

        // Since we can't reliably apply changes without context, we will log a warning.
        // In a real agent, we would ask the LLM for a SEARCH/REPLACE block.

        console.warn(`[Corrector] applyChange not fully implemented for complex changes. Proposal: ${proposal.codeChange}`);
        return content;
    }
}
