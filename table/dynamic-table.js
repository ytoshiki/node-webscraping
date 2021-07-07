const request = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');

async function main() {
  const result = await request.get('https://www.codingwithstefan.com/table-example/');
  const $ = cheerio.load(result);
  const rows = $('body > table > tbody > tr');
  let scrapedRows = [];
  let tableHeaders = [];

  rows.each((index, row) => {
    const tds = $(row).find('td');

    if (index === 0) {
      const ths = $(row).find('th');
      ths.each((index, th) => {
        tableHeaders.push($(th).text().toLowerCase());
      });

      return;
    }

    const tableRow = {};
    tds.each((index, element) => {
      tableRow[tableHeaders[index]] = $(element).text();
    });

    scrapedRows.push(tableRow);
  });

  fs.writeFileSync('data.json', JSON.stringify(scrapedRows));
}

main();
