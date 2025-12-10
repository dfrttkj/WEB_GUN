function startGame(message) {
    const newGame = new Game(message.mode, message.cooldown, message.lives, message.gamelength, structuredClone(message.players));
    newGame.start();
    return newGame;
}


class Game {
    constructor(mode, cooldown, lives, gamelength, players) {
        this.mode = mode;
        this.cooldown = cooldown;
        this.lives = lives;
        this.gamelength = gamelength;
        this.players = players;
        this.GameID = 0;
    }

    start() {
        setTimeout(() => {
            if (this.gamelength !== -1) {
                setTimeout(() => {

                }, this.gamelength);
            } else {

            }
        });
    }

    end() {
        
    }
}

module.exports = {
    startGame
}