const puppeteer = require("puppeteer");

let URL = "https://bigsr.africa/bsr-presidential-decree-a-bout-of-economic-madness-and-a-cocktail-of-illegalities/";

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(URL, {
        waitUntil: "networkidle2"
    });

    let post = await page.evaluate(() => {
        let content = document.querySelector("article .td-post-content");
        return content.innerHTML;
    })
    console.log(post);

    await page.setContent(post, {waitUntil: "domcontentloaded"});
    await page.pdf({
        path: "here.pdf",
        format: "a4"
    })
}) ();