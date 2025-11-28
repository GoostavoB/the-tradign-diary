
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG = {
    url: 'http://localhost:8080/dashboard', // Targeting the specific route user is on
    width: 1440,
    height: 900,
};

async function debug() {
    console.log('Starting debug session...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: CONFIG.width, height: CONFIG.height });

        // Listen for console events
        page.on('console', async msg => {
            const type = msg.type();
            const args = await Promise.all(msg.args().map(arg => arg.jsonValue()));

            if (type === 'error' || type === 'warning') {
                console.log(`[Browser ${type.toUpperCase()}]:`, ...args);
            }
        });

        page.on('pageerror', err => {
            console.log(`[Browser PAGE ERROR]: ${err.toString()}`);
        });

        // Login Flow
        console.log('Navigating to login page...');
        await page.goto('http://localhost:8080/auth', { waitUntil: 'networkidle0' });

        console.log('Typing credentials...');
        await page.type('input[type="email"]', 'gustavo.belfiore@gmail.com');
        await page.type('input[type="password"]', 'Nadia123456789!');

        console.log('Submitting login form...');
        // Try to find the button - assuming it's a submit button or has specific text
        const submitButton = await page.$('button[type="submit"]');
        if (submitButton) {
            await submitButton.click();
        } else {
            console.log('Submit button not found, trying Enter key...');
            await page.keyboard.press('Enter');
        }

        console.log('Waiting for navigation to dashboard...');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(e => console.log('Navigation timeout or already there'));

        console.log(`Current URL: ${page.url()}`);

        // Check for "Loading..." text
        const bodyText = await page.evaluate(() => document.body.innerText);
        if (bodyText.includes('Loading...')) {
            console.log('DETECTED: Page is stuck on "Loading..."');
        }

        console.log('Waiting for 5 seconds to capture delayed errors...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Capture HTML to see if it's just empty
        const html = await page.content();
        console.log('Page HTML length:', html.length);
        console.log('Page Title:', await page.title());

    } catch (error) {
        console.error('Debug session failed:', error);
    } finally {
        await browser.close();
    }
}

debug();
