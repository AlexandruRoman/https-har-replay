1. Generate Self-Signed Certificate - Linux/Mac

```bash
openssl genrsa -out ./my-certificate.key 2048

openssl req -x509 -new -nodes -key ./my-certificate.key -days 1024 -out ./my-certificate.crt -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=hoxyproxy.com"
```

&nbsp;&nbsp;&nbsp;or the one-liner which generates both the certificate and the key

```bash
openssl req -x509 -new -nodes -newkey rsa:2048 -keyout ./my-certificate.key -days 1024 -out ./my-certificate.crt -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=hoxyproxy.com"
```

2. Install certificate

- Linux: neeed to make Chrome trust the self-signed certificate - Settings &rightarrow; Privacy and security &rightarrow; Security &rightarrow; Manage certificates &rightarrow; Authorities - Click on Import and then import the generated certificate (e.g. `my-certificate.crt`) - In Trust Settings check the "Trust this certificate for identifying websites" checkbox and save the modifications
  ![Screenshot 2021-04-05 at 17 22 39](https://user-images.githubusercontent.com/33263352/113584500-a4f5c200-9633-11eb-9747-6396c52b437d.png)

- Mac: https://www.eduhk.hk/ocio/content/faq-how-add-root-certificate-mac-os-x

3. Install npm packages

- this project uses the [Web Sniffer](https://www.npmjs.com/package/web-proxy-sniffer) npm package which needs to be installed

```bash
npm install web-proxy-sniffer
```

4. Run proxy

```bash
node proxy.mjs <path_to_HAR_file>
```

5. SwitchyOmega Chrome extension

&nbsp;&nbsp;&nbsp;Install https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?hl=en

&nbsp;&nbsp;&nbsp;In your `proxy` profile, make sure that:

- the `server` is `localhost`
- the `port` is `8080`
- the `Bypass List` is empty

&nbsp;&nbsp;It should finally look like this:
![screenshot-nimbus-capture-2021 03 31-12_32_00](https://user-images.githubusercontent.com/17946780/113123369-307ae780-921d-11eb-8094-dfab467b0583.png)

Now, all you have to do is:

- change the proxy to `proxy` from the SwitchyOmega Chrome extension's popup panel
- navigate to the page where the HAR file was captured from
- be happy or sad (depending on the results)

###### Alternative: configure proxy settings for Chromium/Google Chrome from Command Line

_Warning: This approach is still in its early stages and experimental, please use `node` v14.x.x_

Here is how to configure the proxy settings manually for your browser session, in case you don't want to use SwitchyOmega.

After you started the proxy server (as indicated in step 4), open a separate terminal window and run:

```bash
google-chrome-stable  --proxy-server="http://localhost:8080" --proxy-bypass-list="<-loopback>"
```

`google-chrome-stable` can also be replaced with `google-chrome-beta` or `chromium` (or the path to the Chrome/Chromium executable on your machine)
