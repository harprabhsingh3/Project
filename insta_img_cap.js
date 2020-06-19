let puppeteer = require("puppeteer");
let fs = require("fs");
const download = require('image-downloader')
const iPhone = puppeteer.devices['iPhone 6'];
let credentialsFile = process.argv[2];

let url,pwd,user;
(async function(){

    let data = await fs.promises.readFile(credentialsFile,"utf-8");
    let credentials = JSON.parse(data);
    url = credentials.login;
    url2 = credentials.url;
    email = credentials.email;
    pwd = credentials.pwd;

    let browser = await puppeteer.launch({
        slowMo: 10,
        headless : false,
        defaultViewport: null,
        args:["--start-maximized","--disable-notifications"]
    });
    let numberofPages = await browser.pages();
    let tab = numberofPages[0];
    //====================================================
    //1.  go to instagram to download saved posts
    //====================================================

    await tab.goto(url, {
        waitUntil: "networkidle2",timeout: 0
    });
    await tab.waitForSelector("input[aria-label='Phone number, username, or email']");
    await tab.type("input[aria-label='Phone number, username, or email']", email, { delay: 100 });
    await tab.waitForSelector("input[aria-label='Password']");
    await tab.type("input[aria-label='Password']", pwd, { delay: 100 });
    await tab.keyboard.press("Enter");
    await tab.waitForSelector("span[class='TqC_a']");
    await tab.click("span[class='TqC_a']");
    await tab.keyboard.type('khaleeljamundae10',{ delay: 300 })
    await tab.waitForSelector(".z556c",{ visible: true });
    await tab.click(".z556c",{ waitUntil: "networkidle2" })
    
    //open saved posts------------------------------------
    await tab.waitForSelector("svg[aria-label='Saved']",{ visible: true });
    await tab.click("svg[aria-label='Saved']");
    
    //----------------------------------------------------
    let images = await tab.$$('.KL4Bh img');
    // to download the saved posts------------------------

    for(let i=0; i<images.length; i++){
    let src = await tab.evaluate(function (q) {
        return q.getAttribute('src');
      }, images[i]);
      console.log(src);
      
      let options = {
        url: src,
        dest: `photo${i}.jpg`     // will be saved to /path/to/dest/photo.jpg
      }
      download.image(options)
        .then(({ filename }) => {
          console.log('Saved to', filename)  // saved to /path/to/dest/photo.jpg
        })
        .catch((err) => console.error(err))
    }
    //==============================================================
    //2. open image captioning website
    //==============================================================
    let tabnew = numberofPages[0];
    await tabnew.goto(url2, {
        waitUntil: "networkidle2",timeout: 0
    });
    var captions=[];
    await tabnew.waitForSelector('input[type=file]');
    await tabnew.waitFor(1000);
    
    const input_UploadHandle = await tabnew.$('input[type=file]');
    await tabnew.waitForSelector("a[class='cc-btn cc-allow']",{ waitUntil: "networkidle2" });
    await tabnew.click("a[class='cc-btn cc-allow']");
   for(let i=0;i<11;i++)
    { 
    let file_ToUpload = 'photo'+(i)+'.jpg';
	  // Sets the value of the file input to fileToUpload
	  input_UploadHandle.uploadFile(file_ToUpload);
    await tabnew.waitFor(2000);
	  // doing click on button to trigger upload file
	  await tabnew.waitForSelector('button[type="submit"]');
	  await tabnew.click('button[type="submit"]',{ waitUntil: "networkidle2" });
    await tabnew.waitFor(5000);

    const element = await tabnew.$('ul > li> div > p');
    const text = await (await element.getProperty('textContent')).jsonValue();
    captions.push(text);
    console.log(text); 
    
  }
       
    //===================================================================
    // 3. Open instagram in emulator mode to upload images with captions
    // ==================================================================
    
    
    const page = await browser.newPage();
    await page.emulate(iPhone);
    await page.goto("https://www.instagram.com/");
    await page.waitForSelector('button.aOOlW.HoLwm');
    await page.click('button.aOOlW.HoLwm');
    
    for(let i = 0;i < 11;i++){
    await page.waitForSelector("svg[aria-label='New Post']");
    
    var futureFileChooser = page.waitForFileChooser();
    // some button that triggers file selection
    
    await page.click("svg[aria-label='New Post']");
    await page.waitFor(1000);
    const inputUploadHandle = await page.$("input[type=file]");
    let fileToUpload = 'photo'+(i)+'.jpg';
    inputUploadHandle.uploadFile(fileToUpload);
    await page.waitFor(5000);

    var fileChooser = await futureFileChooser;
    await fileChooser.cancel();
  //caption typing----------------------------------------
    await page.waitForSelector('.UP43G');
    await page.click('.UP43G');
    await page.waitFor(3000);
    await page.waitForSelector('div.NfvXc')
    await page.click('div.NfvXc');
    await page.type("textarea[aria-label='Write a caption…']", captions[i], { delay: 200 });
    await page.waitFor(3000);
    await page.waitForSelector('button.UP43G');
    await page.click('button.UP43G');
    await page.waitFor(3000);
    }
})();
