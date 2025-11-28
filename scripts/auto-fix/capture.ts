import puppeteer, { Page } from 'puppeteer';
import { ComponentMap, ComponentNode, AutoFixConfig } from './types.ts';

export class VisualCapture {
    private config: AutoFixConfig;

    constructor(config: AutoFixConfig) {
        this.config = config;
    }

    async capture(): Promise<ComponentMap> {
        console.log(`Launching browser to capture ${this.config.url}...`);
        const browser = await puppeteer.launch({
            headless: this.config.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();

            // Capture for the first viewport (desktop default)
            // In a full implementation, we might return a map per viewport
            const viewport = this.config.viewports[0];
            await page.setViewport(viewport);

            console.log(`Navigating to ${this.config.url}...`);
            await page.goto(this.config.url, { waitUntil: 'networkidle0' });

            // Inject script to traverse DOM and extract data
            // We use a string to avoid tsx/esbuild injecting helpers like __name
            const script = `
                (() => {
                    try {
                        const map = {};
                        let idCounter = 0;

                        function generateId(el) {
                            if (el.id) return el.id;
                            return "node_" + idCounter++;
                        }

                        function traverse(element, parentId) {
                            if (!element) return;
                            
                            // Skip invisible elements or script/style tags
                            const style = window.getComputedStyle(element);
                            if (style.display === 'none' || style.visibility === 'hidden' || element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                                return;
                            }

                            const id = generateId(element);
                            const rect = element.getBoundingClientRect();
                            
                            // Serialize computed styles of interest
                            const computedStyles = {
                                color: style.color,
                                backgroundColor: style.backgroundColor,
                                fontSize: style.fontSize,
                                fontWeight: style.fontWeight,
                                textAlign: style.textAlign,
                                display: style.display,
                                visibility: style.visibility,
                                opacity: style.opacity,
                                zIndex: style.zIndex,
                                position: style.position,
                                padding: style.padding,
                                margin: style.margin,
                                border: style.border,
                                borderRadius: style.borderRadius,
                            };

                            const attributes = {};
                            if (element.attributes) {
                                Array.from(element.attributes).forEach(attr => {
                                    attributes[attr.name] = attr.value;
                                });
                            }

                            const node = {
                                id,
                                tagName: element.tagName.toLowerCase(),
                                className: element.className,
                                rect: {
                                    x: rect.x,
                                    y: rect.y,
                                    width: rect.width,
                                    height: rect.height,
                                    top: rect.top,
                                    right: rect.right,
                                    bottom: rect.bottom,
                                    left: rect.left,
                                },
                                styles: computedStyles,
                                text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 // Node.TEXT_NODE is 3
                                    ? element.textContent?.trim() 
                                    : undefined,
                                children: [],
                                parentId,
                                attributes,
                            };

                            map[id] = node;

                            if (parentId && map[parentId]) {
                                map[parentId].children.push(id);
                            }

                            if (element.children) {
                                Array.from(element.children).forEach(child => {
                                    traverse(child, id);
                                });
                            }
                        }

                        if (document.body) {
                            traverse(document.body);
                        }
                        return map;
                    } catch (e) {
                        return { error: e.toString(), stack: e.stack };
                    }
                })()
            `;

            const componentMap = await page.evaluate(script);

            if (componentMap.error) {
                console.error('Browser Evaluation Error:', componentMap.error);
                throw new Error(componentMap.error);
            }

            console.log(`Captured ${Object.keys(componentMap).length} nodes.`);
            return componentMap;

        } catch (error) {
            console.error('Error during visual capture:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }
}
