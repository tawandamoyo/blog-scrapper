const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://bigsr.africa/author/dr-alex-magaisa';
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(URL);

  const pagesToScrape = 44;
  let currentPage = 1;
  let postLinks = [];

  while (currentPage <= pagesToScrape) {
    const postLinksOnPage = await page.evaluate(() => {
      const links = [];
      const postDetails = document.querySelectorAll('h3 a');
      postDetails.forEach((post) => {
        links.push(post.href);
      });
      return links;
    });
    postLinks = postLinks.concat(postLinksOnPage);
    if (currentPage < pagesToScrape) {
      await page.goto(`${URL}/page/${currentPage + 1}`);
      page.waitForNetworkIdle;
    }
    currentPage += 1;
  }
  await page.close();

  postLinks = [...new Set(postLinks)];

  for (const link of postLinks) {
    try {
      const page = await browser.newPage();
      await page.goto(link, {
        waitUntil: 'networkidle2',
      });

      const postData = await page.evaluate(() => {
        const postTitle = document.querySelector('h1').innerText;
        const postDate = document.querySelector('.td-post-date').innerText;

        const dateDetails = postDate.split(' ');
        const month = dateDetails[0];
        const year = dateDetails[2];

        return {
          title: postTitle,
          month,
          year,
        };
      });

      const path = `bsr/${postData.year}/${postData.month}`;

      fs.mkdir(path, { recursive: true }, (error) => {
        if (error) throw error;
      });

      await page.pdf({
        path: `bsr/${postData.year}/${postData.month}/${postData.title}.pdf`,
      });

      await page.close();
    } catch (err) {
      console.error(err);
    }
  }
})();
