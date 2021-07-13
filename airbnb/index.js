const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const sample = {
  guests: 1,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  pesosPerNight: 350
};

let browser;

async function scrapeHomesIndexPage(url, page) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const homes = $("[itemprop='url']")
      .map((i, element) => {
        const url = $(element).attr('content');
        //I get undefined or null at the airbnb.com in content url for some reason, so I'll just take the end part
        const splitted = url.split('rooms');
        return 'https://airbnb.com/rooms' + splitted[1];
      })
      .get();
    console.log(homes);
    return homes;
  } catch (err) {
    console.error('Error scraping homes page');
    console.error(err);
  }
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    const pricePerNight = $('#room > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > span > span').text();
    console.log('price pr. night');
    console.log(pricePerNight);
  } catch (err) {
    console.error('error scraping description page');
    console.error(err);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: false });
  const homesIndexPage = await browser.newPage();

  //It's important to have a date selected to get prices in Airbnb
  const homes = await scrapeHomesIndexPage('https://www.airbnb.com/rooms/39113140?category_tag=Tag%3A8188&adults=1&check_in=2021-10-14&check_out=2021-10-21&federated_search_id=940b517b-9951-4802-a727-f687136301c5&source_impression_id=p3_1626099523_DM44GOzaEsrqiCNO&guests=1', homesIndexPage);

  const descriptionPage = await browser.newPage();

  for (var i = 0; i < homes.length; i++) {
    await scrapeDescriptionPage(homes[i], descriptionPage);
  }
  console.log(homes);
}

main();
