const STORAGE_KEY = "flashcard-data";

function loadDecks() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveDecks(decks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

function todayString() {
    return new Date().toLocaleDateString("en-US");
}

function findDeck(deckId) {
    for (const deck of decks) {
        if (deck.id === deckId) {
            return deck;
        }
    }
    return null;
}

let decks = loadDecks();
let currentDeckId = null;

function addDeck(name) {
    decks.push({ id: Date.now(), name, cards: [] });
    saveDecks(decks);
}

function addCard(deckId, front, back) {
    const deck = findDeck(deckId);
    deck.cards.push({
        id: Date.now(),
        front,
        back,
        streak: 0,
        interval: 0,
        easiness: 2.5,
        dueDate: todayString(),
    });
    saveDecks(decks);
}

function render() {
    const deckList = document.getElementById("deck-list");
    deckList.innerHTML = "";

    for (const deck of decks) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.textContent = `${deck.name} (Number of Cards:${deck.cards.length})`;
        btn.addEventListener("click", () => {
            currentDeckId = deck.id;
            render();
        });
        li.appendChild(btn);
        deckList.appendChild(li);
    }

    const section = document.getElementById("card-section");
    const current = findDeck(currentDeckId);
    section.hidden = !current;
    if (!current) return;

    document.getElementById("deck-title").textContent = current.name;
    const cardList = document.getElementById("card-list");
    cardList.innerHTML = "";

    for (const card of current.cards) {
        const li = document.createElement("li");
        li.textContent = `${card.front} - ${card.back}`;
        cardList.appendChild(li);
    }
}

document.getElementById("add-deck").addEventListener("click", () => {
    const input = document.getElementById("deck-name");
    const name = input.value.trim();
    if (!name) return;
    addDeck(name);
    input.value = "";
    render();
});

document.getElementById("add-card").addEventListener("click", () => {
    const front = document.getElementById("card-front");
    const back = document.getElementById("card-back");
    if (!front.value.trim() || !back.value.trim()) return;
    addCard(currentDeckId, front.value.trim(), back.value.trim());
    front.value = "";
    back.value = "";
    render();
});

render();