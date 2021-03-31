var hoxy = require('hoxy');
var fs = require("fs");
let rawdata = fs.readFileSync(process.argv[2]);
let har = JSON.parse(rawdata);
let responses = {};

buildResponse();
runProxy();

function buildResponse() {
  //filter entries by response `content-type`
  har.log.entries = har.log.entries.filter((entry) => {
    header = entry.response.headers.find((h) => h.name == "content-type");
    if (!header) return false;
    if (/text\/html|text\/javascrip|application\/json/.test(header.value))
      return true;
    return false;
  });

  //change responses `httpVersion` and remove some headers
  for (let entry of har.log.entries) {
    if (!entry.response.content.text)
      continue;
    let encoding = entry.response.content.encoding;
    let text = entry.response.content.text;
    if (encoding) {
      let buff = Buffer.from(text, encoding);
      text = buff.toString();
    }

    let response = {};
    response.string = text;
    response.headers = entry.response.headers.filter(
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
  var proxy = hoxy.createServer({
    certAuthority: {
      key: fs.readFileSync('my-certificate.key.pem'),
      cert: fs.readFileSync('my-certificate.crt.pem')
    }
  }).listen(8080);

  proxy.intercept({
    phase: 'response',
    as: 'string'
  }, (req, resp) => {
    let response = responses[req.fullUrl()];
    if (!response)
      return;
    if (response.string)
      resp.string = response.string;
    if (response.headers)
      resp.headers = response.headers;
    if (response.status)
      resp.statusCode = response.status;
  });
}