// function_puppet.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const scan_html = async (page, filter, title, year) => {
  try {
    console.log(`[function_puppet] Searching: ${filter} ${title} ${year}`);

    const builtUrl = process.env.DL_TEMPLATE.replace(/\${(.*?)}/g, (_, key) => {
      return {
        domain: process.env.DL_DOMAIN,
        settings: process.env.DL_SETTINGS,
        filter: filter,
        title: title.replace(/[^\w\s]/g,''),
        year: year
      }[key] || '';
    });

    //console.log(`[function_puppet] Searching: ${builtUrl}`);
    await page.goto(builtUrl, { waitUntil: 'networkidle2' });
    
    return await page.evaluate((selector) => {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) { return elements[0].href || null; }
      return null;
    }, process.env.DL_SELECTOR);
  }
  catch (error) {
    console.error("[scan_html] Error: ", error);
    return { error: error.message };
  }
};

const download_file = async (page, fileUrl) => {
  try {
    //console.log(`[function_puppet] Downloading: ${fileUrl}`);
    const directory = process.env.DL_LOCALPATH;
    if (!directory) { throw new Error("DL_LOCALPATH is not defined."); }
    //console.log(`[function_puppet] Using download path: ${directory}`);
    if (!fs.existsSync(directory)) { throw new Error("Local path folder does not exist."); }
    const fileName = path.basename(new URL(fileUrl).pathname);
    const filePath = path.join(directory, fileName);
    //console.log(`[function_puppet] Final file path: ${filePath}`);
    const buffer = await page.evaluate(async (fileUrl) => {
      const response = await fetch(fileUrl);
      if (!response.ok) { throw new Error(`Failed to fetch file: ${response.statusText}`); }
      const arrayBuffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(arrayBuffer));
    }, fileUrl);
    await fs.promises.writeFile(filePath, Buffer.from(buffer));
    //console.log(`[function_puppet] File saved successfully: ${filePath}`);
    return filePath;
  }
  catch (error) {
    console.error("[download_file]: ", error);
    return { error: error.message };
  }
};

const function_puppet = async ({ title, year }) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    //console.log("[function_puppet] Function Called");

    if (process.env.DL_COOKIES) {
      try {
        const cookies = JSON.parse(process.env.DL_COOKIES);
        if (!Array.isArray(cookies)) { throw new Error("DL_COOKIES invalid JSON."); }
        await page.setCookie(...cookies.map(cookie => ({
          ...cookie,
          domain: process.env.DL_DOMAIN
        })));
        //console.log("[function_puppet] Set Cookies");
      }
      catch (error) { throw new Error(error); }
    }

    const filters = (process.env.DL_FILTERS || '').split(',').map(c => c.trim()).filter(Boolean);

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let link = null;
    for (let filter of filters) {
      link = await scan_html(page, filter, title, year);
      if (link && !link.error) {
        console.log(`[function_puppet] Found: ${link}`);
        break;
      }
      else { await sleep(5000); }
    }
    if (link.error) { throw new Error(link.error); }

    const filePath = await download_file(page, link);
    if (filePath.error) { throw new Error(filePath.error); }
    return filePath;
  }
  catch (error) {
    console.error("[function_puppet]: ", error);
    return { error: error.message };
  }
  finally { await browser.close(); }
};

module.exports = { function_puppet };