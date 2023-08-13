# clover

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
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  /var/log/nginx/access.log  main;
    access_log  off;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    # 开启压缩，效果拔群
    gzip  on;
    gzip_min_length 512k;
    gzip_comp_level 6;
    gzip_vary on;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;

    include /etc/nginx/conf.d/*.conf;

    server{
        listen       8080;
        server_name  clover;
        root        /clover/site/dist; #vue项目的打包后的dist

        location /_api/ {
            proxy_set_header  X-Real-IP  $remote_addr; # 真实ip
            proxy_pass	http://127.0.0.1:7002/;
        }

        location /_file/ {
            proxy_pass	http://127.0.0.1:7002/;

            add_header Cache-Control "private,max-age=30*24*3600";
            expires 30d;
            access_log off;
        }

        location ~* \.(css|js)$ {
            add_header Cache-Control "private,max-age=30*24*3600";
            expires 30d;
            access_log off;
        }
    }
}
```
