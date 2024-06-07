// get_nslookup.js

const fetch = require('node-fetch');

const get_nslookup = async ({ domain, record }) => {
  console.log("get_nslookup function was called");
  try {
    const url = `https://dns-lookup5.p.rapidapi.com/simple?domain=${domain}&recordType=${record}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': `${process.env.RAPIDAPI_APIKEY}`,
        'X-RapidAPI-Host': 'dns-lookup5.p.rapidapi.com'
      }
    };
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
    return result;
  }
  catch (error) {
    console.error("Error in get_nslookup:", error);
    return { error: error.message };
  }
}

module.exports = { get_nslookup };

/*
{
  "name": "get_nslookup",
  "description": "Retrieve DNS record information from DNSLookup API. Useful when asked about the domain name records of a domain.",
  "parameters": {
    "type": "object",
    "properties": {
      "domain": {
        "type": "string",
        "description": "The domain name."
      },
      "record": {
        "type": "string",
        "description": "The record type.",
        "enum": [
          "A",
          "AAAA",
          "AFSDB",
          "APL",
          "CAA",
          "CNAME",
          "DNSKEY",
          "CDS",
          "CERT",
          "CSYNC",
          "DHCID",
          "DLV",
          "DNAME",
          "DS",
          "HINFO",
          "HIP",
          "SECKEY",
          "IXFR",
          "KEY",
          "KX",
          "LOC",
          "MX",
          "NAPTR",
          "NS",
          "NSEC",
          "NSEC3",
          "NSEC3PARAM",
          "OPENPGPKEY",
          "OPT",
          "PTR",
          "RP",
          "RRSIG",
          "SIG",
          "SMIMEA",
          "SOA",
          "SRV",
          "SSHFP",
          "TA",
          "TKEY",
          "TXT"
        ]
      }
    },
    "required": [
      "domain",
      "record"
    ]
  }
}
*/