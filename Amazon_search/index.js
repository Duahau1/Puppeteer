const puppeteer = require("puppeteer");
const nodemailer = require('nodemailer');

async function webConfigure(url, callback) {
    let options = {
        headless: true,
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    };
    const browser = await puppeteer.launch(options);
    var page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    callback(page, browser);

}
//This function fill out the search bar and find the highrated products
async function checkPrice(page, item, browser) {
    let searchbox = await page.$('#twotabsearchtextbox');
    let search = await page.$('.nav-input');
    await searchbox.type(item);
    await search.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' }),
        console.log(page.url());
    try {
        let pro_options = await page.evaluate(() => {
            // The list of product name, rate, price
            let name_list = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');
            let rate_list = document.querySelectorAll('.a-icon.a-icon-star-small[class].aok-align-bottom > .a-icon-alt');
            let price_list = document.querySelectorAll('div[data-index]');
            name_list = [...name_list];
            rate_list = [...rate_list];
            price_list = [...price_list];
            let price_result = [];
            for (var j = 0; j < price_list.length; j++) {
                if (price_list[j] != null) {
                    let temp = price_list[j].querySelector('span.a-price[data-a-size=\'l\']');
                    if (temp != null) {
                        let price = temp.querySelector('.a-offscreen').innerHTML;
                        price_result.push(price);
                    }
                }
            }
            let product_list = {};
            for (var i = 1; i < name_list.length - 1; i++) {
                let obj = {};
                if(name_list[i]!=='undefined' && rate_list[i]!=='undefined' ){
                obj.name = name_list[i].innerHTML;
                obj.rate = rate_list[i].innerHTML;
                obj.price = price_result[i];
                product_list[i] = obj;
                }
            }
            return product_list;
        })

        // This let you get the cheapest available searched item
        let min = Number.MAX_VALUE;
        let retVal = '';
        for (var product in pro_options) {
            if (pro_options[product].price.replace('\$', '') <= min) {
                min = pro_options[product].price.replace('\$', '');
                retVal = pro_options[product];
            }
        }
        console.log(retVal);
        // await pushNotification(retVal);
    }
    catch (err) {
        console.log(err);
    }
    await browser.close();
}

webConfigure("https://www.amazon.com/", (value, browser) => {
    checkPrice(value, 'nintendo', browser);
});

//This function is used to send email about cheapest item
// async function pushNotification(product) {
//     let info = JSON.stringify(product);
//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//         host: "smtp.mailspons.com",
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//           user: 'ffcedbf7e98144389e96', // generated ethereal user
//           pass: '2d869dba0bea45ad85ac0fd6dad9b38d', // generated ethereal password
//         },
//       });
//     let textToSend =`Hello, this is the cheapest product found with your searched keyword\n ${info}`;
//     let mail = await transporter.sendMail({
//         from: '"Price Tracker" <welcome@mailspons.com>',
//         to: "udxercjjiikloulysf@ttirv.net",
//         subject: 'It\'s time to check out ', 
//         text: textToSend,
//       });

//       console.log("Message sent: %s", mail.messageId); 

// }
