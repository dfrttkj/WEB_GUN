# DemoTest Project

A Node.js application with Express (HTTP) and ws (WebSocket).

## Setup
1. Run `npm install`
2. Run `node server.js`
3. Open `http://localhost:3000`

## Datenaustausch

### Website -> Server: Game Start

Team Deathmatch:

```JSON
{
    "type": "startgame",
    "mode": "tdm",
    "cooldown": 500,
    "lives": 3,
    "gamelength": -1,
    "players": [
        {
            "playerID": 1,
            "teamID": 1
        },
        {
            "playerID": 2,
            "teamID": 2
        },
        {
            "playerID": 3,
            "teamID": 2
        },
        {
            "playerID": 4,
            "teamID": 1
        }
    ]  
}
```

Free for all:

```JSON
{
    "type": "startgame",
    "mode": "ffa",
    "cooldown": 500,
    "lives": 3,
    "gamelength": 10,
    "players": [
        {
            "playerID": 1,
            "teamID": 255
        },
        {
            "playerID": 2,
            "teamID": 255
        },
        {
            "playerID": 3,
            "teamID": 255
        }
    ]
}
```

- ```-1``` bedeutet das es für diesen Modus nicht gebraucht wird
- ```cooldown``` ist in Millisekunden
- ```gamelength``` ist in Minuten
- ```"teamID": 255``` = FFA
- ```"teamID": 0``` = idle mode

## Server

