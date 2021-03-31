1. Generate Certificate - Linux/Mac
```bash
openssl genrsa -out ./my-certificate.key.pem 2048

openssl req -x509 -new -nodes -key ./my-certificate.key.pem -days 1024 -out ./my-certificate.crt.pem -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=hoxyproxy.com"
```

2. Install certificate
- Linux: 
- Mac: https://www.eduhk.hk/ocio/content/faq-how-add-root-certificate-mac-os-x

3. Run proxy
```bash
node proxy.js <path_to_HAR_file>
```

4. SwitchyOmega Chrome extension

Install https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?hl=en

In your `proxy` profile, make sure that:
- the `server` is `localhost`
- the `port` is `8080`
- the `Bypass List` is empty

It should finally look like this:
![screenshot-nimbus-capture-2021 03 31-12_32_00](https://user-images.githubusercontent.com/17946780/113123369-307ae780-921d-11eb-8094-dfab467b0583.png)

Now, all you have to do is:
- change the proxy to `proxy` from the SwitchyOmega Chrome extension's popup panel
- navigate to the page where the HAR file was captured from
- be happy or sad (depending on the results)
