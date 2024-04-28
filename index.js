//assistant bot
require('dotenv').config();

//discord
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

//airtable
const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_APIKEY}).base(process.env.AIRTABLE_BASE);
const airtable_table = 'threadList';

//openai
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });

//functions
async function handleError(event, error) {
  let errorMessage = `${error || 'Unknown error'}.`;
  console.error(errorMessage);
  await prepMessage(event, errorMessage);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateBotStatus(statusType, activityType, statusName) {
  if (client.user.presence.status !== statusType) { client.user.setStatus(statusType); }  // rate limited, unknown duration // online, idle, dnd, invisible
  if (client.user.presence.type !== statusName) { client.user.setActivity(statusName, {type: activityType}); } // playing = 0, listening (to) = 2, watching = 3
}

async function findSplit(content, start, end) {
  let inMarkdown = false;
  let lastSafeIndex = start;
  let foundSentenceEnd = false;
  for (let i = end; i > start; i--) {
    const char = content[i];
    if (['.', '?', '!'].includes(char)) {
      lastSafeIndex = i + 1;
      foundSentenceEnd = true;
      break;
    }
    if (!foundSentenceEnd && /[\s,;:()'"`]/.test(char)) {
      lastSafeIndex = i + 1;
      continue;
    }
    if (['*', '_', '`', '~'].includes(char)) {
      if(!inMarkdown) { lastSafeIndex = foundSentenceEnd ? lastSafeIndex : i; inMarkdown = true; }
      else { inMarkdown = false; }
    }
  }
  return lastSafeIndex;
}

async function splitMessage(content, maxLength = 1970) {
  const splitContent = [];
  let start = 0;
  while (start < content.length) {
    let end = Math.min(start + maxLength, content.length);
    if (end < content.length) {
      const lastSafeIndex = await findSplit(content, start, end);
      splitContent.push(content.substring(start, lastSafeIndex));
      start = lastSafeIndex;
    }
    else { splitContent.push(content.substring(start)); break; }
  }
  return splitContent;
}

async function prepMessage(event, content) {
  const splitContent = await splitMessage(content);
  for (const message of splitContent) {
    await sleep(500);
    await sendMessage(event, message);
  }
}

async function sendMessage(event, content) {
  try { const message = await event.reply(content); }
  catch (error) { await handleError(event, error); }
}

async function getThread(event, channel) {
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{DiscordThreadId} = "${channel}"` }).firstPage();
    if (records.length) { return records[0].get('OpenAiThreadId'); }
    else { return null; }
  }
  catch (error) { await handleError(event, error); }
}

async function createThread(event, channelId) {
  try {
    const createdThread = await openai.beta.threads.create();
    await saveThread(event, channelId, createdThread.id);
    return createdThread.id;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function saveThread(event, channelId, threadId) {
  try { await base(airtable_table).create({ 'DiscordThreadId': channelId, 'OpenAiThreadId': threadId }); }
  catch (error) { await handleError(event, error); return null; }
}

async function messageThread(event, thread, content) {
  try { return openai.beta.threads.messages.create( thread, { role: "user", content } ); }
  catch (error) { await handleError(event, error); return null; }
}

async function createRun(event, thread) {
  try { return await openai.beta.threads.runs.createAndPoll(thread, { assistant_id: process.env.OPENAI_ASSISTANTID }); }
  catch (error) { await handleError(event, error); return null; }
}

async function getResponse(event, thread) {
  try { const messages = await openai.beta.threads.messages.list( thread, { limit: 1 } ); return messages.data; }
  catch (error) { await handleError(event, error); return null; }
}

async function acquireThreadLock(event, threadId) {
  try {
    const records = await base('threadLocks').select({ filterByFormula: `{OpenAiThreadId} = "${threadId}"` }).firstPage();
    if (records.length === 0) { await base('threadLocks').create({'OpenAiThreadId': threadId}); return true; }
    return false;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function releaseThreadLock(event, threadId) {
  try {
    const records = await base('threadLocks').select({ filterByFormula: `{OpenAiThreadId} = "${threadId}"` }).firstPage();
    if (records.length > 0) { const recordId = records[0].id; await base('threadLocks').destroy(recordId); }
  }
  catch (error) { await handleError(event, error); }
}

async function processMessage(event, channel, message) {
  let theThread, retries = 300;
  try {
    theThread = await getThread(event, channel) || await createThread(event, channel);
    while (!(await acquireThreadLock(event, theThread)) && retries > 0) { await sleep(1000); retries--; }
    if (retries === 0) { throw new Error("Failed to acquire thread lock."); }
    await messageThread(event, theThread, message);
    const theRun = await createRun(event, theThread);
    if (theRun && theRun.status === "completed") {
      const responses = await getResponse(event, theThread);
      await prepMessage(event, responses[0].content[0].text.value);
    }
    else { throw new Error(`Debug: OpenAI failure (status unavailable)`); }
  }
  catch (error) { await handleError(event, error); }
  finally {
    if (theThread) { await releaseThreadLock(event, theThread); }
  }
}

function sendTyping(channel) {
  if (!keepTyping) { return; }
  channel.sendTyping().then(() => { setTimeout(() => sendTyping(channel), 10000); });
}

let keepTyping = true;

//main logic
client.on('messageCreate', async event => {
  if (event.author.bot || event.content.includes("@here") || event.content.includes("@everyone") || event.content.includes("@skynet") || !event.mentions.has(client.user.id)) { return; }
  let channel = event.channel.id;
  let authorID = event.author.id;
  let authorTag = `<@${authorID}>`;
  let isoDate = new Date().toISOString();
  let injectData = `${authorTag} (${isoDate}})`;
  let content = event.content;
  let message = content.replace(/<@\d+>/, injectData);
  try {
    keepTyping = true;
    sendTyping(event.channel);
    if (event.attachments.size) { throw new Error(`The ChatGPT bot is unable to interpret images or files at this time. Please use the DALL·E bot.`); }
    await processMessage(event, channel, message);
  }
  catch (error) { await handleError(event, error); }
  finally { keepTyping = false; }
});

//startup
client.once(Events.ClientReady, botUser => {
  updateBotStatus(`online`, 2, `you for input`);
  console.log(`Bot is online.`);
});

//login
client.login(process.env.DISCORD_TOKEN);