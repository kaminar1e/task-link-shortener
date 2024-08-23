## Project

Simple link shortener api that uses Redis Cloud and MongoDB Atlas to persist data

## Installation

To run project locally you need:

1. Git clone this repository OR download zip and unpack it
2. Add .env file to project directory or include if you have existing one:

```bash
   # MongoDB Atlas connection URL
   MONGODB_URL = ""

   # Redis Cloud connection URL
   REDISCLOUD_URL = "" 
```

3. Open it in terminal (cmd/PowerShell/VScode terminal/other)
4. Run command:
```bash
  npm run start
```

## Documentation

To see all endpoints in Swagger, run project locally and go to http://your-ip-addr:your-port/docs
