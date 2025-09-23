import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
    const username='anxeeee__';
    const profileUrl='https://www.instagram.com/anxeeee___/';

    const browser = await chromium.launch({headless:true});
    const context = await browser.newContext({
        userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    })
    const page = await context.newPage();
    await page.goto(profileUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('header');

    const data= await page.evaluate(()=>{
        const name = document.querySelector('header h2')?.textContent||'';
        const bio = document.querySelector('header section div.-vDIg span')?.textContent||'';
        const stats = Array.from(document.querySelectorAll('header li span span'))
        .map(el => el.textContent?.replace(',','')||'0');
        const [posts,followers,following]=stats;
        return{
            name,
            bio,
            posts,
            followers,
            following,
        };
    });
    console.log('[SCRAPED DATA]',data);

    await browser.close();
    return NextResponse.json({ success: true, data });
}
