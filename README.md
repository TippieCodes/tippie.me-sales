# tippie.me-sales
Logging website for sales

# How to run
First we need to create the neccesary configurations.
## back-end
In the back-end side of the application you need to create a `.env` file that looks as follows:
```
GLOBAL_DB=database
DB_HOST=host
DB_USER=user
DB_PASS=pass
API_PORT=3004
WS_PORT=3003 
API_ALLOWED_ORIGINS=regex
```
In this config the API_PORT is the port the api should be running on and WS_PORT is the port the websocket should be running on. The API_ALLOWED_ORIGINS should be a regex, an example
would be `sales\.tippie\.me$`

Now you can run the back-end by doing `node sales.js` in the folder where the back-end is located. Make sure to install all dependencies using `npm install` first.
## front-end
The frond-end side also needs a configuration, create a filed named `vars.js` file in the `src` folder containing the following configuration:
```
let vars = {'websocket_url': 'wss://some.domain','root_url': '/','api': 'https://some.domain/api','auth_url': 'https://some.domain/auth.html'}
```
Make sure that the websocket and auth_url are on the same domain, this is so the websocket knows the authentication cookies. If your instance is running in a sub folder update the root_url to that subfolder

Now you can run the back-end locally by running `node test-server.js` in the root folder of this repo or you can put the files on a webserver, the files are static.
