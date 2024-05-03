//assistant bot
require('dotenv').config();
const toolbox = require("./functions.js");

//discord
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

//airtable
const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_APIKEY}).base(process.env.AIRTABLE_BASE);
const airtable_table = 'threadList';
const airtable_locks = 'threadLocks';
const airtable_files = 'fileUploads';

//openai
const { OpenAI, toFile } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });

//axios
const Axios = require('axios');
const { Readable } = require('stream');

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
  let lastSafeIndex = start;
  let foundSentenceEnd = false;
  let inCodeBlock = false;
  let inParentheses = false;
  let inQuotes = false;
  let quoteChar = '';
  for (let i = end; i > start; i--) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';
    const nextChar = i < content.length - 1 ? content[i + 1] : '';
    if (char === '`' || char === "'") {
      if (content.substring(i - 2, i + 1) === '```' || content.substring(i - 2, i + 1) === "'''") {
        inCodeBlock = !inCodeBlock;
        i -= 2; // Skip the next two characters since they are part of the block syntax
        continue;
      }
    }
    if (char === '(') { inParentheses = true; }
    else if (char === ')' && inParentheses) { inParentheses = false; }
    if ((char === '"' || char === "'") && !inQuotes) { inQuotes = true; quoteChar = char; } // Avoid splitting inside quotes
    else if (char === quoteChar && inQuotes) { inQuotes = false; quoteChar = ''; }
    if (!inCodeBlock && !inParentheses && !inQuotes && ['.', '?', '!'].includes(char)) { lastSafeIndex = i + 1; foundSentenceEnd = true; break; }
    if (!foundSentenceEnd && !inCodeBlock && !inParentheses && !inQuotes && /[\s,;:()'"`]/.test(char)) { lastSafeIndex = i + 1; }
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
  try {
    const message = await event.reply(content);
    console.log(`openai returned message.`);
  }
  catch (error) { await handleError(event, error); }
}

async function messageThread(event, thread, content) {
  try { return openai.beta.threads.messages.create( thread, { role: "user", content } ); }
  catch (error) { await handleError(event, error); return null; }
}

async function createRun(event, thread) {
  try { return await openai.beta.threads.runs.createAndPoll(thread, { assistant_id: process.env.OPENAI_ASSISTANTID }); }
  catch (error) { await handleError(event, error); return null; }
}

async function getRun(event, thread, run) {
  try { return await openai.beta.threads.runs.retrieve(thread, run); }
  catch (error) { await handleError(event, error); return null; }
}

async function getResponse(event, thread) {
  try { const messages = await openai.beta.threads.messages.list( thread, { limit: 1 } ); return messages.data; }
  catch (error) { await handleError(event, error); return null; }
}

async function uploadVectorStore(event, thread, files) {
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{OpenAiThreadId}='${thread}'` }).firstPage();
    let storeID = records.length > 0 ? records[0].get('OpenAiStoreId') : null;
    if (storeID) { await openai.beta.vectorStores.fileBatches.createAndPoll(storeID, { file_ids: files }); }
    console.log(`Files uploaded to vector store: ${files}`);
  }
  catch (error) { await handleError(event, error); }
}

async function uploadFiles(event, thread) {
  let files = event.attachments;
  if (!files || files.size === 0) { return []; }
  const fileIds = [];
  for (const [, file] of files) {
    try {
      const response = await Axios({ method: 'get', url: file.url, responseType: 'arraybuffer' });
      const fileObject = await toFile(Buffer.from(response.data), file.name);
      const fileData = await openai.files.create({ file: fileObject, purpose: 'assistants' });
      fileIds.push(fileData.id);
      console.log(`File ${fileData.id} uploaded to assistant.`);
      await base(airtable_files).create({ 'OpenAiFileId': fileData.id, 'OpenAiThreadId': thread });
    }
    catch (error) { throw error; }
  }
  return fileIds;
}

async function releaseThreadLock(event, threadId) {
  try {
    const records = await base('threadLocks').select({ filterByFormula: `{OpenAiThreadId} = "${threadId}"` }).firstPage();
    if (records.length > 0) { const recordId = records[0].id; await base('threadLocks').destroy(recordId); }
  }
  catch (error) { await handleError(event, error); }
}

async function acquireThreadLock(event, threadId) {
  try {
    const records = await base('threadLocks').select({ filterByFormula: `{OpenAiThreadId} = "${threadId}"` }).firstPage();
    if (records.length === 0) { await base('threadLocks').create({'OpenAiThreadId': threadId}); return true; }
    return false;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function saveThread(event, channel, thread, store) {
  try {
    await base(airtable_table).create({
      'DiscordThreadId': channel,
      'OpenAiThreadId': thread,
      'OpenAiStoreId': store
    });
  }
  catch (error) { await handleError(event, error); return null; }
}

async function createVectorStore(event, thread) {
  try {
    const createdStore = await openai.beta.vectorStores.create({ name: `Thread ${thread}` });
    return createdStore.id;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function createThread(event, channel) {
  try {
    const createdThread = await openai.beta.threads.create();
    return createdThread.id;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function getStore(channel) {
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{DiscordThreadId} = "${channel}"` }).firstPage();
    if (records.length) { return records[0].get('OpenAiStoreId'); }
    else { return null; }
  }
  catch (error) { console.error(`Error in getStore for channel ID ${channel}: ${error}`); }
}

async function prepNewThread(event, channel) {
  try {
    const threadId = await createThread(event, channel);
    const vectorStoreId = await createVectorStore(event, threadId);
    await saveThread(event, channel, threadId, vectorStoreId);
    return threadId;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function getThread(channel) {
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{DiscordThreadId} = "${channel}"` }).firstPage();
    if (records.length) {
      const thread = records[0].get('OpenAiThreadId');
      console.log(`recovered thread ${thread} from table ${airtable_table}`);
      return thread;
    }
    else { return null; }
  }
  catch (error) { await handleError(error); }
}

async function processMessage(event, channel, message) {
  let theThread, theStore, retries = 180;
  try {
    theThread = await getThread(channel) || await prepNewThread(event, channel);
    theStore = await getStore(channel);

    while (!(await acquireThreadLock(event, theThread)) && retries > 0) { await sleep(1000); retries--; }
    if (retries === 0) { throw new Error("There is an error in this message thread, make a new thread."); }
    
    sendTyping(event.channel);
    
    if (event.attachments.size > 0) {
      console.log(`User uploaded files.`);
      const files = await uploadFiles(event, theThread);
      if (files.length > 0) { await uploadVectorStore(event, theThread, files); }
    }

    await messageThread(event, theThread, message);
    let theRun = await createRun(event, theThread);

    if (theRun && theRun.status === "requires_action") {
      console.log(`User initiated run.`);
      const getrun = await getRun(event, theThread, theRun.id);
      let toolOutputsPromises = getrun.required_action.submit_tool_outputs.tool_calls.map(async (callDetails) => {
        console.log(`User initiated function calling.`);
        try {
          let callId = callDetails.id;
          let args = JSON.parse(callDetails.function.arguments);
          let result = await toolbox[callDetails.function.name](args);
          return {
            tool_call_id: callId,
            output: JSON.stringify(result)
          };
        }
        catch (error) { await handleError(event, error); }
      });

      let toolOutputs = await Promise.all(toolOutputsPromises);
      toolOutputs = toolOutputs.filter(output => output !== null);
      theRun = await openai.beta.threads.runs.submitToolOutputsAndPoll(theThread, theRun.id, { tool_outputs: toolOutputs }); // Changed `thread` to `theThread`
    }
    
    if (theRun && theRun.status === "completed") {
      const responses = await getResponse(event, theThread); // Changed `thread` to `theThread`
      await prepMessage(event, responses[0].content[0].text.value);
    }
    else { throw new Error(`Debug: Something went wrong with OpenAI, please try your prompt again.`); }

  }
  catch (error) { await handleError(event, error); }
  finally {
    if (theThread) { await releaseThreadLock(event, theThread); } // Changed `thread` to `theThread`
  }
}

async function deleteFiles(thread) {
  try {
    const records = await base(airtable_files).select({ filterByFormula: `{OpenAiThreadId} = '${thread}'` }).firstPage();
    if (records.length > 0) {
      const deletions = records.map(async record => {
        await openai.files.del(record.get('OpenAiFileId'));
        await base(airtable_files).destroy(record.id);
      });
      await Promise.all(deletions);
      console.log(`Files and records deleted for thread ID ${thread}.`);
    }
    else { console.log(`No files to delete for thread ID ${thread}.`); }
  }
  catch (error) { console.error(`Error in deleteFiles for thread ID ${thread}: ${error}`); }
}

async function deleteVectorStore(store) {
  try { await openai.beta.vectorStores.del(store); }
  catch (error) { console.error(`Error in deleteVectorStore for store ID ${store}: ${error}`); }
}

async function deleteLock(thread) {
  try {
    const records = await base(airtable_locks).select({ filterByFormula: `{OpenAiThreadId} = '${thread}'` }).firstPage();
    if (records.length == 1) { await Promise.all(records.map(record => base(airtable_locks).destroy(record.id))); }
    else { console.log(`no thread to delete in table ${airtable_locks}`); }
  }
  catch (error) { console.error(`Error in deleteLock for thread ID ${thread}: ${error}`); }
}

async function deleteThread(channel) {
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{DiscordThreadId} = '${channel}'` }).firstPage();
    if (records.length == 1) { await Promise.all(records.map(record => base(airtable_table).destroy(record.id))); }
    else { console.log(`no thread to delete in table ${airtable_table}`); }
  }
  catch (error) { console.error(`Error in deleteThread for channel ID ${channel}: ${error}`); }
}

async function processDeleteThread(channel) {
  try {
    const store = await getStore(channel);
    const thread = await getThread(channel);
    await deleteVectorStore(store);
    await deleteThread(channel);
    await deleteLock(thread);
    await deleteFiles(thread);
  }
  catch (error) { console.error(`Error in processDeleteThread for thread ID ${channel}: ${error}`); }
}

function sendTyping(channel) {
  if (!keepTyping) { return; }
  channel.sendTyping().then(() => { setTimeout(() => sendTyping(channel), 10000); });
}

let keepTyping = true;

//discord thread deleted
client.on('threadDelete', async event => {
  await processDeleteThread(event.id);
  console.log(`User deleted thread.`);
});

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
  console.log(`User submitted message.`);
  try {
    keepTyping = true;
    sendTyping(event.channel);
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