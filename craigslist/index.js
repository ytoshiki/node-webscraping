const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Listing = require('./model/Listing');

dotenv.config();

async function connectToMongoDb() {
  await mongoose.connect(process.env.DB_ROOT, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('DB connected');
}

async function scrapeListings(page) {
  // visit the page
  await page.goto('https://tokyo.craigslist.org/search/sof?');

  const html = await page.content();
  const $ = cheerio.load(html);

  // With cheerio, need to use .get() to get from map
  const data = $('.result-info')
    .map((index, element) => {
      const titleElement = $(element).find('.result-title');
      const dateElement = $(element).find('.result-date');
      const locationElement = $(element).find('.result-hood');
      const title = $(titleElement).text().trim();
      const url = $(titleElement).attr('href').trim();
      const date = new Date($(dateElement).attr('datetime'));
      const location = $(locationElement).text().replace(')', '').replace('(', '').trim();

      return {
        title,
        url,
        date,
        location
      };
    })
    .get();

  return data;
}

function trim(element) {
  return element.trim();
}

async function scrapeJobDescriptions(list, page) {
  // forEach does things concurrently in pararrel. so does not work well with puppeteer
  for (const item of list) {
    await page.goto(item.url);
    const html = await page.content();
    const $ = cheerio.load(html);
    const jobDescription = $('#postingbody').text();
    const compensation = $('p.attrgroup > span:nth-child(1) > b').text();

    item.jobDescription = trim(jobDescription);
    item.compensation = trim(compensation);

    const listingModel = new Listing(item);
    await listingModel.save();
    // Limit the number of requests
    await sleep(1000); // 1 sec
  }
}

async function sleep(miliseconds) {
  return new Promise((resolve) =>
    setTimeout(() => {
      return resolve();
    }, miliseconds)
  );
}

async function init() {
  await connectToMongoDb();
  // headless: false = make browser unhidden from you
  const browswer = await puppeteer.launch({ headless: false });
  // open a new page
  const page = await browswer.newPage();

  const listings = await scrapeListings(page);
  if (listings.length === 0) return true;
  const listingsWithJobDescriptions = await scrapeJobDescriptions(listings, page);

  console.log(listings);
}

init();
