const axios = require("axios");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");

let authorizationURL = "https://identity.primaverabss.com/core/connect/token";
const client_id = process.env.JASMIN_CLIENT_ID;
const client_secret = process.env.JASMIN_CLIENT_SECRET;
const accountId = "219692";
const subscriptionId = "219692-0001";
let authorizationToken = "";
const baseAppURL = `https://my.jasminsoftware.com/api/${accountId}/${subscriptionId}`;

const authorizationData = {
  client_id,
  client_secret,
  scope: "application",
  grant_type: "client_credentials",
};

async function main() {
  const { data } = await axios.post(authorizationURL, querystring.stringify(authorizationData));

  authorizationToken = data.access_token;

  const { data: invoices } = await axios.get(`${baseAppURL}/billing/invoices`, {
    headers: {
      Authorization: `Bearer ${authorizationToken}`,
    },
  });


  invoices.forEach(async ({ id, naturalKey }) => {
    const filename = naturalKey;
    const wpath = path.resolve(__dirname, "pdfs", `${naturalKey}.pdf`);
    const writer = fs.createWriteStream(wpath);

    const response = await axios({
      url: `${baseAppURL}/billing/invoices/${id}/print`,
      method: "GET",
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${authorizationToken}`,
      },
    });

    response.data.pipe(writer);
  });
}

main();
