import fs from "fs";

init();

const playersArr = JSON.parse(fs.readFileSync("../data/players.json", "utf-8"));
const teams = JSON.parse(fs.readFileSync("../data/teams.json", "utf-8"));

function init() {
    const AddNameButton = document.getElementById("add-name");

    AddNameButton.addEventListener("click", () => {
        renderAddName();
    });

}

function renderAddName() {
    const container = document.getElementById("names");
    const button = document.getElementById("add-name");

    const newDiv = document.createElement("div");
    const finishButton = document.createElement("button");
    const newInput = document.createElement("input");

    newDiv.id = "nameInputDiv";
    finishButton.id = "namefinishButton";
    newInput.id = "nameNewInput";

    finishButton.textContent = "Speichern";

    finishButton.addEventListener("click", () => {
        addedName(container);
    })

    newDiv.appendChild(newInput);
    newDiv.appendChild(finishButton);
    container.appendChild(newDiv);
    button.remove();
}

function addedName(container) {
    const newButton = document.createElement("button");
    const nameInput = document.getElementById("nameInputDiv");
    const finishButton = document.getElementById("button");
    const newInput = document.getElementById("input");
    const newOBJ = {};

    newOBJ.playerID = playersArr.length;
    newOBJ.teamID = teams.length;
    newOBJ.name = newInput.value;

    playersArr.push(newOBJ);
    saveJSONS();

    newInput.remove();
    finishButton.remove();
    nameInput.remove();

    newButton.id = "add-name";
    newButton.textContent = "Add Name";

    container.appendChild(newButton);
}

function saveJSONS() {
    JSON.stringify(fs.writeFileSync("../data/players.json", playersArr));
    JSON.stringify(fs.writeFileSync("../data/teams.json", teams));
}