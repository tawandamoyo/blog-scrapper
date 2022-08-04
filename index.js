const puppeteer = require('puppeteer');
const fs = require('fs');

let URL = "https://bigsr.africa/author/dr-alex-magaisa";
(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(URL);

    let pagesToScrape = 1;
    let currentPage = 1;
    let postLinks = [];

    while (currentPage <= pagesToScrape) {
        let postLinksOnPage = await page.evaluate(() => {
            let links = [];
            let postDetails = document.querySelectorAll("h3 a");
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
        currentPage++;
    }
    postLinks = [...new Set(postLinks)];

   for (let link of postLinks) {
        try {
            const page = await browser.newPage();
            await page.goto(link, {
                waitUntil: 'networkidle2'
            });

            let postData = await page.evaluate(() => {
                const postTitle = document.querySelector("h1").innerText;
                const postDate = document.querySelector(".td-post-date").innerText;

                const dateDetails = postDate.split(" ");
                const month = dateDetails[0];
                const year = dateDetails[2];

                return {
                    title: postTitle,
                    month: month,
                    year: year
                }

            });

            const path = `bsr/${postData.year}/${postData.month}`;
            console.log(path);

            fs.mkdir(path, { recursive: true }, (error) => {
                if (error) throw error;
            })

            // await page.pdf({
            //     path: `bsr/${postData.year}/${postData.month}/${postData.title}.pdf`
            // })

        } catch (err) {
            console.error(err)
        } finally {
            // await page.close();
        }
   }
})();