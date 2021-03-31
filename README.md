1. Certificate - Linux/MAC
   
```bash
openssl genrsa -out ./my-certificate.key.pem 2048

openssl req -x509 -new -nodes -key ./my-certificate.key.pem -days 1024 -out ./my-certificate.crt.pem -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=hoxyproxy.com"
```

1. Run proxy
2. SwitchyOmega