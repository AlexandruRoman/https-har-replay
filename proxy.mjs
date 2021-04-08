// var hoxy = require('hoxy');
import Sniffer from "web-proxy-sniffer";
import * as fs from "fs";

let rawdata = fs.readFileSync(process.argv[2]);
let har = JSON.parse(rawdata);
let responses = {};

try {
  buildResponse();
  runProxy();
} catch (error) {
  console.log("\n", error, "\n");
}

function buildResponse() {

  //change responses `httpVersion` and remove some headers
  for (let entry of har.log.entries) {
    if (!entry.response.content.text) continue;
    let encoding = "utf8";
    if (entry.response.content.encoding)
      encoding = entry.response.content.encoding;
    let text = entry.response.content.text;
    let buff = Buffer.from(text, encoding);

    let response = {};
    response.body = buff;
    response.headers = entry.response.headers
      .filter(
        (h) =>
          h.name != "content-encoding" &&
          h.name != "Content-Encoding" &&
          h.name != "content-length"
      );
    response.status = entry.response.status;

    responses[entry.request.url] = response;
  }
}

function runProxy() {
  const proxy = Sniffer.createServer({
    certAuthority: {
      key: fs.readFileSync("my-certificate.key"),
      cert: fs.readFileSync("my-certificate.crt"),
    },
  });

  proxy.intercept(
    {
      phase: "response",
    },
    (req, resp) => {
      let response = responses[fullUrl(req)];
      if (response) {
        if (response.body) resp.body = response.body;
        if (response.headers) resp.headers = composeHeaders(response.headers);
        if (response.status) resp.statusCode = response.status;
      }
      return resp;
    }
  );

  proxy.listen(8080);
}

function fullUrl(request) {
  return `${request.protocol}//${request.hostname}${request.url}`;
}

function composeHeaders(headers) {
  return headers.reduce(
    (acc, item) => ((acc[item.name] = item.value), acc),
    {}
  );
}
