//assistant bot
require('dotenv').config();
const functions = require("./functions.js");

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
  content = content.replace(/【[^】]*†[^】]*】/g, ''); // remove kb sourcing
  const splitContent = await splitMessage(content);
  for (const message of splitContent) {
    await sleep(500);
    await sendMessage(event, message);
  }
}

async function sendMessage(event, content) {
  console.log(`sending a message to discord`);
  try {
    const message = await event.reply(content);
    console.log(`message sent`);
  }
  catch (error) { await handleError(event, error); }
}

async function messageThread(event, threadID, content) {
  console.log(`creating a message on ${threadID}`);
  try { return openai.beta.threads.messages.create( threadID, { role: "user", content } ); }
  catch (error) { await handleError(event, error); return null; }
}

async function createRun(event, threadID) {
  console.log(`creating a run on ${threadID}`);
  try { return await openai.beta.threads.runs.createAndPoll(threadID, { assistant_id: process.env.OPENAI_ASSISTANTID }); }
  catch (error) { await handleError(event, error); return null; }
}

async function getRun(event, threadID, run) {
  console.log(`retrieving ${run} on ${threadID}`);
  try { return await openai.beta.threads.runs.retrieve(threadID, run); }
  catch (error) { await handleError(event, error); return null; }
}

async function cancelRun(event, threadID, run) {
  console.log(`canceling ${run} on ${threadID}`);
  try { return await openai.beta.threads.runs.cancel(threadID,run); }
  catch (error) { await handleError(event, error); return null; }
}

async function getResponse(event, threadID) {
  console.log(`retrieving message from ${threadID}`);
  try { const messages = await openai.beta.threads.messages.list( threadID, { limit: 1 } ); return messages.data; }
  catch (error) { await handleError(event, error); return null; }
}

async function uploadVectorStore(event, threadID, files) {
  console.log(`uploading files to vector store on ${threadID}`);
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{OpenAiThreadId}='${threadID}'` }).firstPage();
    let storeID = records.length > 0 ? records[0].get('OpenAiStoreId') : null;
    if (storeID) { await openai.beta.vectorStores.fileBatches.createAndPoll(storeID, { file_ids: files }); }
    console.log(`Files uploaded to vector store: ${files}`);
  }
  catch (error) { await handleError(event, error); }
}

async function uploadFiles(event, threadID) {
  console.log(`uploading files from ${threadID}`);
  let files = event.attachments;
  if (!files || files.size === 0) { return []; }
  const fileIds = [];
  let message = `the following files have been uploaded to ${threadID} for your reference: `;
  for (const [, file] of files) {
    try {
      const response = await Axios({ method: 'get', url: file.url, responseType: 'arraybuffer' });
      const fileObject = await toFile(Buffer.from(response.data), file.name);
      const fileData = await openai.files.create({ file: fileObject, purpose: 'assistants' });
      fileIds.push(fileData.id);
      await base(airtable_files).create({ 'OpenAiFileId': fileData.id, 'OpenAiThreadId': threadID });
      message += `${fileData.filename} (${fileData.id}, ${fileData.purpose})`;
      console.log(`file added to assistant: ${fileData.filename} (${fileData.id}, ${fileData.purpose})`);
    }
    catch (error) { await handleError(event, error); return null; }
  }
  await messageThread(event, threadID, message);
  console.log(message);
  return fileIds;
}

async function releaseThreadLock(event, threadId) {
  console.log(`releasing ${threadId}`);
  try {
    const records = await base('threadLocks').select({ filterByFormula: `{OpenAiThreadId} = "${threadId}"` }).firstPage();
    if (records.length > 0) {
      const recordId = records[0].id; await base('threadLocks').destroy(recordId);
      console.log(`${threadId} released`);
    }
  }
  catch (error) { await handleError(event, error); }
}

async function acquireThreadLock(event, threadId) {
  console.log(`locking ${threadId}`);
  try {
    const records = await base('threadLocks').select({ filterByFormula: `{OpenAiThreadId} = "${threadId}"` }).firstPage();
    if (records.length === 0) { await base('threadLocks').create({'OpenAiThreadId': threadId}); console.log(`${threadId} locked`); return true; }
    return false;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function saveThread(event, channel, threadID, store) {
  console.log(`saving ${threadID} to database`);
  try {
    await base(airtable_table).create({
      'DiscordThreadId': channel,
      'OpenAiThreadId': threadID,
      'OpenAiStoreId': store
    });
    console.log(`${threadID} saved to database`);
  }
  catch (error) { await handleError(event, error); return null; }
}

async function createVectorStore(event, threadID) {
  console.log(`creating vector store for ${threadID}`);
  try {
    const createdStore = await openai.beta.vectorStores.create({ name: `Thread ${threadID}` });
    console.log(`vector store ${createdStore.id} created`);
    return createdStore.id;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function createThread(event, channel) {
  console.log(`creating thread for channel ${channel}`);
  try {
    const createdThread = await openai.beta.threads.create();
    console.log(`${createdThread.id} created`);
    return createdThread.id;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function getStore(channel) {
  console.log(`retrieving store for channel ${channel}`);
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{DiscordThreadId} = "${channel}"` }).firstPage();
    if (records.length) { return records[0].get('OpenAiStoreId'); }
    else { return null; }
  }
  catch (error) { console.error(`error in getStore for channel ${channel}: ${error}`); }
}

async function prepNewThread(event, channel) {
  console.log(`thread does not exist for channel ${channel}`);
  try {
    const threadId = await createThread(event, channel);
    const vectorStoreId = await createVectorStore(event, threadId);
    await saveThread(event, channel, threadId, vectorStoreId);
    return threadId;
  }
  catch (error) { await handleError(event, error); return null; }
}

async function getThread(channel) {
  console.log(`rerieving thread for channel ${channel}`);
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{DiscordThreadId} = "${channel}"` }).firstPage();
    if (records.length) {
      const threadID = records[0].get('OpenAiThreadId');
      console.log(`recovered ${threadID} from table ${airtable_table}`);
      return threadID;
    }
    else { return null; }
  }
  catch (error) { await handleError(error); }
}

async function processMessage(event, channel, message) {
  console.log(`processing message on channel ${channel}`);
  let theThread, theStore, retries = 180;
  try {
    theThread = await getThread(channel) || await prepNewThread(event, channel);
    theStore = await getStore(channel);

    while (!(await acquireThreadLock(event, theThread)) && retries > 0) { await sleep(1000); retries--; }
    if (retries === 0) { throw new Error("there is an error in this message thread, make a new thread."); }
    
    sendTyping(event.channel);
    
    if (event.attachments.size > 0) {
      console.log(`user uploaded files.`);

      const supportedFileTypes = [".c", ".cs", ".cpp", ".doc", ".docx", ".html", ".java", ".json", ".md", ".pdf", ".php", ".pptx", ".py", ".rb", ".tex", ".txt", ".css", ".js", ".sh", ".ts"];
      const imageFileTypes = [".jpg", ".jpeg", ".png", ".webp"];

      let nonImageFiles = [];
      let imageUrls = [];

      event.attachments.forEach(attachment => { // Iterate over attachments and separate image files from non-image files
        const fileExtension = attachment.name.split('.').pop().toLowerCase();
        if (imageFileTypes.includes(`.${fileExtension}`)) { imageUrls.push(attachment.url); }
        else if (supportedFileTypes.includes(`.${fileExtension}`)) { nonImageFiles.push(attachment); }
      });

      if (imageUrls.length > 0) { // Append image URLs to the prompt
        console.log('image files were found attached to the message');
        const imageUrlText = imageUrls.map(url => `Image URL: ${url}`).join('\n');
        message += `\n${imageUrlText}`;
      }

      if (nonImageFiles.length > 0) { // Upload non-image files to the vector store
        console.log('documents were found attached to the message');
        const files = await uploadFiles(event, theThread, nonImageFiles);
        if (files.length > 0) { await uploadVectorStore(event, theThread, files); }
      }
    }

    await messageThread(event, theThread, message);
    let theRun = await createRun(event, theThread);

    if (theRun && theRun.status === "requires_action") {
      console.log(`function call initiated`);
      const getrun = await getRun(event, theThread, theRun.id);
      let functionCallPromises = getrun.required_action.submit_tool_outputs.tool_calls.map(async (functionCall) => {
        console.log(`assistant submitting function call`);
        console.log(JSON.stringify(functionCall));
        try {
          let callId = functionCall.id;
          let args = JSON.parse(functionCall.function.arguments);
          let result = await functions[functionCall.function.name](args);
          return {
            tool_call_id: callId,
            output: JSON.stringify(result)
          };
        }
        catch (error) { await handleError(event, error); }
      });

      let functionCalls = await Promise.all(functionCallPromises);
      functionCalls = functionCalls.filter(output => output !== null);
      theRun = await openai.beta.threads.runs.submitToolOutputsAndPoll(theThread, theRun.id, { tool_outputs: functionCalls });
    }
    
    if (theRun && theRun.status === "completed") {
      let response = await getResponse(event, theThread);
      response = response[0].content[0].text.value;
      await prepMessage(event, response);
      console.log(`--- Assistant: ${response}`);
    }
    else {
      await cancelRun(event, theThread, theRun.id);
      throw new Error(`something went wrong. cancelled ${theRun.id} on ${theThread}. try your prompt again.`);
    }

  }
  catch (error) { await handleError(event, error); }
  finally { if (theThread) { await releaseThreadLock(event, theThread); } }
}

async function deleteFiles(threadID) {
  console.log(`deleting files in ${threadID}`);
  try {
    const records = await base(airtable_files).select({ filterByFormula: `{OpenAiThreadId} = '${threadID}'` }).firstPage();
    if (records.length > 0) {
      const deletions = records.map(async record => {
        await openai.files.del(record.get('OpenAiFileId'));
        await base(airtable_files).destroy(record.id);
      });
      await Promise.all(deletions);
      console.log(`Files and records deleted for ${threadID}.`);
    }
    else { console.log(`No files to delete for ${threadID}.`); }
  }
  catch (error) { console.error(`Error in deleteFiles for ${threadID}: ${error}`); }
}

async function deleteVectorStore(store) {
  console.log(`deleting vector store ${store}`);
  await openai.beta.vectorStores.del(store);
  console.log(`vector store ${store} deleted`);
}

async function deleteLock(threadID) {
  console.log(`deleting lock on ${threadID}`);
  try {
    const records = await base(airtable_locks).select({ filterByFormula: `{OpenAiThreadId} = '${threadID}'` }).firstPage();
    if (records.length == 1) { await Promise.all(records.map(record => base(airtable_locks).destroy(record.id))); }
    else { console.log(`no thread to delete in ${airtable_locks}`); }
  }
  catch (error) { console.error(`Error in deleteLock for ${threadID}: ${error}`); }
}

async function deleteThread(channel) {
  console.log(`deleting thread for channel ${channel}`);
  try {
    const records = await base(airtable_table).select({ filterByFormula: `{DiscordThreadId} = '${channel}'` }).firstPage();
    if (records.length == 1) { await Promise.all(records.map(record => base(airtable_table).destroy(record.id))); }
    else { console.log(`no thread to delete in table ${airtable_table}`); }
  }
  catch (error) { console.error(`Error in deleteThread for channel ID ${channel}: ${error}`); }
}

async function processDeleteThread(channel) {
  console.log(`processing deletion of discord channel ${channel}`);
  try {
    const store = await getStore(channel);
    const threadID = await getThread(channel);
    await deleteVectorStore(store);
    await deleteThread(channel);
    await deleteLock(threadID);
    await deleteFiles(threadID);
    console.log(`channel cleanup completed`);
  }
  catch (error) { console.error(`Error in processDeleteThread for discord channel ${channel}: ${error}`); }
}

function sendTyping(channel) {
  if (!keepTyping) { return; }
  channel.sendTyping().then(() => { setTimeout(() => sendTyping(channel), 10000); });
}

let keepTyping = true;

//discord thread deleted
client.on('threadDelete', async event => {
  console.log(`event delete thread triggered`);
  await processDeleteThread(event.id);
  console.log(`event delete thread completed`);
});

//main logic
client.on('messageCreate', async event => {
  console.log(`event create message triggered`);
  if (event.author.bot || event.content.includes("@here") || event.content.includes("@everyone") || event.content.includes("@skynet") || !event.mentions.has(client.user.id)) { return; }
  let channel = event.channel.id;
  let authorID = event.author.id;
  let authorTag = `<@${authorID}>`;
  let isoDate = new Date().toISOString();
  let metaData = `${authorTag} (${isoDate}})`;
  let content = event.content;
  let message = content.replace(/<@\d+>/,'');
  message = `${metaData}: ${message}`;
  console.log(`--- User: ${message}`);
  try {
    keepTyping = true;
    sendTyping(event.channel);
    await processMessage(event, channel, message);
  }
  catch (error) { await handleError(event, error); }
  finally { keepTyping = false; }
  console.log(`event create message completed`);
});

//startup
client.once(Events.ClientReady, botUser => {
  updateBotStatus(`online`, 2, `you for input`);
  console.log(`Bot is ready.`);
});

//login
client.login(process.env.DISCORD_TOKEN);

/**
This is the entry point for the Discord bot.

The bot is initiated by calling `client.login(process.env.DISCORD_TOKEN)`, which authenticates the bot with the Discord API using the `DISCORD_TOKEN` environment variable.

The bot registers two event listeners:

- `threadDelete`: This event is triggered when a thread is deleted. It calls the `processDeleteThread` function to handle the deletion.
- `messageCreate`: This event is triggered when a message is created. It checks if the message is a valid user message by checking various conditions. If the message is valid, it injects the user's ID and timestamp into the message, sends a typing indicator while processing the message, and calls the `processMessage` function to handle the message.

The bot also has a `ClientReady` event listener that updates the bot's status to "online" and logs a message indicating that the bot is online.

The `keepTyping` variable is used to keep track of whether the bot is currently typing in a channel. This is used to control the sending of typing indicators.

Overall, this code sets up the Discord bot and handles various events and interactions with the Discord API.
*/