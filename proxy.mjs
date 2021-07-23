// var hoxy = require('hoxy');
import Sniffer from "web-proxy-sniffer";
import * as fs from "fs";

let rawdata = fs.readFileSync(process.argv[2]);
let har = JSON.parse(rawdata);
let responses = {};

// TODO: improve on this approach as it only works if node is version 14 or lower
class Proxy extends Sniffer.Proxy {
  constructor(options) {
    super(options);
  }

  async onIntercept(phase, request, response) {
    if (phase === "request") {
      // Hacky way to handle the three initial requests sent by Chrome to random domains in order to verify whether ISPs intercept requests that cannot be resolved and serve their own error pages (https://www.ghacks.net/2012/02/18/chrome-connecting-to-random-domains-on-start-here-is-why/) . This case isn't considered by web-proxy-sniffer, causing our proxy server to fail when the proxy settings are configured manually. It seems that a proxy manager (e.g. SwitchyOmega browser extension) is handling this case behind the scenes and doesn't even send the random requests to our proxy server.
      if (request.hostname.match(/^[a-z]+$/g)) {
        return Promise.resolve();
      }
    }

    return super.onIntercept(phase, request, response);
  }
}

function createServer(certAuthority) {
  return new Proxy(certAuthority);
}

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
  const proxy = createServer({
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
