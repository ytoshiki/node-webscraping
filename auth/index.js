const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

async function init() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://accounts.craigslist.org/login?lang=ja');

    await page.type('input#inputEmailHandle', process.env.CRAIGSLIST_EMAIL);
    await page.type('input#inputPassword', process.env.CRAIGSLIST_PASS);
    await page.click('button#login');
    await page.goto('https://accounts.craigslist.org/login/home?show_tab=settings&lang=ja');

    const content = await page.content();
    const $ = await cheerio.load(content);

    // const html = await request.post('https://accounts.craigslist.org/login?lang=ja', {
    //   form: {
    //     inputEmailHandle: process.env.CRAIGSLIST_EMAIL,
    //     inputPassword: process.env.CRAIGSLIST_PASS
    //   },
    //   headers: {
    //     Referer: 'https://accounts.craigslist.org/login?lang=ja'
    //   },
    //   simple: false,
    //   followAllRedirects: true
    // });

    // fs.writeFileSync('./auth/login.html', html);

    // const billingHtml = await request.get('https://accounts.craigslist.org/login/home?show_tab=settings&lang=ja');
    // fs.writeFileSync('./auth/billing.html', billingHtml);
  } catch (error) {
    console.error(error);
  }
}

init();
