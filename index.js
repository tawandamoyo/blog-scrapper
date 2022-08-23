const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://bigsr.africa/author/dr-alex-magaisa';
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(URL);

  const pagesToScrape = 1;
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
  let bigSaturdayRead = [];

  for (const link of postLinks) {
    try {
      const page = await browser.newPage();
      await page.goto(link, {
        waitUntil: 'networkidle2',
      });

      const postData = await page.evaluate(() => {
        const postTitle = document.querySelector('h1').innerText;
        const postDate = document.querySelector('.td-post-date').innerText;
        const content = document.querySelector('article .td-post-content').innerHTML;

        const dateDetails = postDate.split(' ');
        const month = dateDetails[0];
        const year = dateDetails[2];

        return {
          title: postTitle,
          month,
          year,
          content,
        };
      });

      bigSaturdayRead.push(postData);

    //   await page.setContent(postData.content, { waitUntil: 'domcontentloaded' });

    //   const path = `bsr/${postData.year}/${postData.month}`;

    //   fs.mkdir(path, { recursive: true }, (error) => {
    //     if (error) throw error;
    //   });

    //   await page.pdf({
    //     path: `bsr/${postData.year}/${postData.month}/${postData.title}.pdf`,
    //   });

      await page.close();
    } catch (err) {
      console.error(err);
    }
  }
  const postsJson = JSON.stringify(bigSaturdayRead);
  fs.writeFile('./posts.json', postsJson, 'utf8', (err, data)=> {
    if(err) {
        console.error(err);
    }
  })

})();
