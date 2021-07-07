const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function main() {
  // headless: false = make browser unhidden from you
  const browswer = await puppeteer.launch({ headless: false });
  // open a new page
  const page = await browswer.newPage();
  // visit the page
  await page.goto('https://nagoya.craigslist.org/d/%E3%82%BD%E3%83%95%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A2-qa-dba-%E3%81%AA%E3%81%A9/search/sof');

  const html = await page.content();
  const $ = cheerio.load(html);
  $('.result-title').each((index, element) => {
    console.log($(element).text());
  });
}

main();
