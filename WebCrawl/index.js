const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
    const url = "https://snh48g.fandom.com/wiki/SNH48_Team_SII";
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    let member_info = await page.evaluate(() => {
        const domain = "https://snh48g.fandom.com";
        let member = document.querySelectorAll('.member_h');
        member = [...member];
        //get data from the big page
        let list = member.map((value) => {
            let obj = {};
            let mem_name = value.querySelector('.mh_w2');
            let mem_page = domain + value.querySelector('.mh_l.mh_l_s > a').getAttribute('href');
            obj.name = mem_name.innerHTML;
            obj.page = mem_page;
            return obj;
        });
        return list;
    })

    try {
        let teamSII = {};
        for (let current_mem of member_info) {
            var mempage = await browser.newPage();
            await mempage.goto(current_mem.page);
            //Evaluate page
            teamSII[current_mem.name] = await mempage.evaluate(output => {
                console.log(output);
                let list_info = document.querySelectorAll("ul > li");
                list_info = [...list_info];
                let info = list_info.map((value) => {
                    let tag = value.querySelectorAll('b');
                    tag = [...tag];
                    let obj = [];
                    tag.forEach((n) => {
                        if (typeof n !== 'undefined' && typeof value !== 'undefined') {
                            var temp = value.textContent;
                            var key = n.innerHTML;
                            // regex to get rid of the white space -> make it a key 
                            key = key.replace(/\s/g, '');
                            var input = temp.split(':');
                            key = key.replace(/\s/g, '');
                            let reg = key.match(/\((\w+\s*)*\)/g);
                            let rep = reg[0].match(/\w+/g);
                            var input = temp.split(':');
                            input[1] = input[1].replace(/\n/g, '');
                            output[rep.toString().replace(',', '')] = input[1];
                            delete output.name;
                            delete output.page;
                            obj.push(key + " , " + input[1]);
                        }
                    });
                    return output;
                });
                return info[0];

            }, current_mem);
            await mempage.close();
        }
        console.log(teamSII);

          fs.writeFileSync('./data.json', JSON.stringify(teamSII));
    }
    catch (err) {
        console.log(err);
    }
    await browser.close();


})();