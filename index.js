const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // Run in non-headless mode to view interactions
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Docker
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });

    const page = await browser.newPage();
    
    // Create a folder for screenshots if it doesn't exist
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }
    
    let yPosition = 60; // Default y position
    let counter = 0; //Default counter

    // Expose a function to set the y position
    await page.exposeFunction('setYPosition', (newY) => {
        yPosition = newY;
    });

    // Expose a function to reset counter
    await page.exposeFunction('resetCounter', () => {
        counter = 0;
    })

    // Expose a function to capture screenshots
    await page.exposeFunction('captureScreenshot', async () => {
        counter++;
        const screenshotPath = path.join(screenshotDir, `${counter}.png`);
        await page.screenshot({ 
            path: screenshotPath,
            clip: {
                x: 0,
                y: yPosition,
                width: 1920,
                height: 880
            } 
        });
        console.log(`Screenshot taken: screenshot-${timestamp}.png`);
    });

    // Add an event listener for mouse clicks
    await page.evaluateOnNewDocument(() => {
        document.addEventListener('click', (event) => {
            if (event.ctrlKey) {
                window.captureScreenshot();
            }
            else if (event.altKey) {
                window.resetCounter();
            }
        });
    });

    // Open a page
    await page.goto('https://example.com')

    // // Wait for the login form to be available and enter credentials
    // await page.waitForSelector('#username'); // Replace with the actual selector for the username field
    // await page.type('#username', '<username_here>'); // Replace with your actual username
    // await page.type('#password', '<password_here>'); // Replace with your actual password
    // await page.click('#login'); // Replace with the actual selector for the login button

    console.log('Puppeteer script is running...');
})();
