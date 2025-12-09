console.log("script.js loaded");

// Beispiel-IDs – später durch WebSocket ersetzt
let availablePlayerIDs = [12, 15, 19, 22, 31];

// Tabellenkörper holen
const tableBody = document.getElementById("playerTableBody");

/**
 * Beschränkt contenteditable Zellen auf maxLength Zeichen (Standard: 32)
 * und verhindert Layoutverschiebungen durch sofortige Kürzung.
 */
function enforceMaxLength(cell, maxLength = 32) {
    cell.addEventListener("input", () => {

        // Inhalt ohne unerwünschte Zeilenumbrüche
        let text = cell.innerText.replace(/\n/g, "");

        // Falls zu lang → kürzen
        if (text.length > maxLength) {
            text = text.substring(0, maxLength);
            cell.innerText = text;

            // Cursor ans Ende setzen (sonst springt er nach oben)
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(cell);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });
}

/**
 * Baut die Spieler-Tabelle komplett neu auf.
 * Für jede "availablePlayerID" wird eine Zeile erzeugt.
 * ID = fix, Name & Team = editierbar + jeweils max. 32 Zeichen.
 */
function renderPlayerTable() {
    if (!tableBody) return; // Falls wir nicht auf create.html sind

    tableBody.innerHTML = ""; // Tabelle leeren

    availablePlayerIDs.forEach(id => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="id-cell">${id}</td>
            <td class="name-cell" contenteditable="true"></td>
            <td class="team-cell" contenteditable="true"></td>
        `;

        tableBody.appendChild(row);

        // Maximale Länge für editierbare Zellen aktivieren
        enforceMaxLength(row.querySelector(".name-cell"), 32);
        enforceMaxLength(row.querySelector(".team-cell"), 32);
    });
}

// Beim Laden sofort ausführen
renderPlayerTable();
