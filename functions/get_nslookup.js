// get_nslookup.js

const fetch = require('node-fetch');
const RAPIDAPI_APIKEY = process.env.RAPIDAPI_APIKEY;

const get_nslookup = async ({ domain, record }) => {
  console.log("get_nslookup function was called");
  try {
    const url = `https://dns-lookup5.p.rapidapi.com/simple?domain=${domain}&recordType=${record}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_APIKEY,
        'X-RapidAPI-Host': 'dns-lookup5.p.rapidapi.com'
      }
    };
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
    return result;
  }
  catch (error) { return { error: error.message }; }
}

module.exports = { get_nslookup };

/*
{
  "name": "get_nslookup",
  "description": "This function connects to DNS Lookup API to determine DNS record information based on a particular domain name and record type.",
  "parameters": {
    "type": "object",
    "properties": {
      "domain": {
        "type": "string",
        "description": "The domain name in question."
      },
      "record": {
        "type": "string",
        "enum": ["A","AAAA","AFSDB","APL","CAA","CNAME","DNSKEY","CDS","CERT","CSYNC","DHCID","DLV","DNAME","DS","HINFO","HIP","SECKEY","IXFR","KEY","KX","LOC","MX","NAPTR","NS","NSEC","NSEC3","NSEC3PARAM","OPENPGPKEY","OPT","PTR","RP","RRSIG","SIG","SMIMEA","SOA","SRV","SSHFP","TA","TKEY","TXT"]
      }
    },
    "required": [
      "domain",
      "record"
    ]
  }
}
*/

/**
 * This function is an asynchronous function that connects to DNS Lookup API to determine DNS record information based on a particular domain name and record type.
 *
 * @param {Object} param - An object containing the 'domain' property (the domain name in question) and the 'record' property (the record type as a string).
 * @param {string} param.domain - The domain name in question.
 * @param {string} param.record - The record type as a string. Must be one of the following: "A","AAAA","AFSDB","APL","CAA","CNAME","DNSKEY","CDS","CERT","CSYNC","DHCID","DLV","DNAME","DS","HINFO","HIP","SECKEY","IXFR","KEY","KX","LOC","MX","NAPTR","NS","NSEC","NSEC3","NSEC3PARAM","OPENPGPKEY","OPT","PTR","RP","RRSIG","SIG","SMIMEA","SOA","SRV","SSHFP","TA","TKEY","TXT".
 * @return {Promise<string>|Promise<{error: string}>} - A promise that resolves to a string if the API call is successful, or a promise that resolves to an object with an 'error' property if the API call fails.
 */