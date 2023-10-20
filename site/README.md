# clover

> node v16

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 参数配置
以 .env.local backup.js 为准  
应配置为 .env.local.js 文件

```
环境变量 flag
NODE_ENV = ''

IMGBB 图床 key（https://imgbb.com/ ）- 闲置
VUE_APP_IMGBB_KEY = ''

api 接口地址（server 启动地址）
VUE_APP_API_HOST = 'http://127.0.0.1:7002'

socket.io 地址（server 启动地址）
VUE_APP_WS_HOST = 'ws://127.0.0.1:7002'

```

---

## Production

### 参数配置
同上

### nginx 对应配置

```

user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;


events {
    worker_connections  2048;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;

    proxy_buffering off;
    proxy_max_temp_file_size 0;
    send_timeout 60;
    client_header_timeout 20;
    client_body_timeout 20;
    reset_timedout_connection on;

    server {
        listen       80; 
        server_name  asia4chan.duckdns.org;
        root /var/site/clover/site/dist/;
        index index.php index.html index.htm default.php default.htm default.html; 
        
        proxy_set_header Host $host; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Host $server_name; 
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_http_version 1.1; 
        #proxy_set_header Upgrade $http_upgrade; 
        #proxy_set_header Connection "upgrade"; 
        proxy_buffering off;

        location /\# {
            index index.html index.htm;
        }
        location / {
            index index.html index.htm;
        }

        location ^~ /_api/ {
            proxy_http_version 1.1;
            proxy_set_header Host $http_host;
            proxy_redirect off;
            proxy_set_header  X-Real-IP  $remote_addr; # 真实ip
            proxy_pass    http://localhost:7002/;
        }

        location ^~ /_file/ {
            proxy_pass    http://127.0.0.1:7002/;
            add_header Cache-Control "private,max-age=30*24*3600";
            expires 30d;
            access_log off;
        }

        location ~* \.(css|js)$ {
            add_header Cache-Control public;
            expires 30d;
            access_log off;
        }

        location ~/socket.io/(.*) {
            proxy_pass http://127.0.0.1:7002; 
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_redirect off;
        }
    }
}

```
