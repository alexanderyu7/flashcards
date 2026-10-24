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

let decks = loadDecks();
let currentDeckId = null;
let currentCard = null;
let editCardId = null;
let sessionQueue = [];
let sessionStartingAmount = 0;

function findDeck(deckId) {
    for (const deck of decks) {
        if (deck.id === deckId) {
            return deck;
        }
    }
    return null;
}

function findCard(deck, cardId) {
    if (!deck) return null;
    for (const card of deck.cards) {
        if (card.id === cardId) {
            return card;
        }
    }
    return null;
}

function addDeck(name) {
    decks.push({ id: Date.now(), name, cards: [] });
    saveDecks(decks);
}

function resetCard() {
    editCardId = null;
    document.getElementById("card-front").value = "";
    document.getElementById("card-back").value = "";
    document.getElementById("add-card").textContent = "Add Card";
}

function addCard(deckId, front, back) {
    const deck = findDeck(deckId);
    deck.cards.push({
        id: Date.now(),
        front,
        back,
        streak: 0,
        misses: 0,
    });
    saveDecks(decks);
}

function editCard(deckId, cardId, front, back) {
    const card = findCard(findDeck(deckId), cardId);
    if (!card) return;
    card.front = front;
    card.back = back;
    saveDecks(decks);
}

function deleteCard(deckId, cardId) {
    if (!confirm("Delete this card?")) return;
    const deck = findDeck(deckId);
    deck.cards = deck.cards.filter(card => card.id !== cardId);
    sessionQueue = sessionQueue.filter(id => id !== cardId);
    if (editCardId === cardId) resetCard();
    saveDecks(decks);
    render();
}

function deleteDeck(deckId) {
    if (!confirm("Delete this deck?")) return;
    decks = decks.filter(deck => deck.id !== deckId);
    saveDecks(decks);
    currentDeckId = null;
    sessionQueue = [];
    currentCard = null;
    endSession();
    resetCard();
    render();
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
            sessionQueue = [];
            currentCard = null;
            endSession();
            resetCard();
            render();
        });
        li.appendChild(btn);
        deckList.appendChild(li);
    }

    const section = document.getElementById("card-section");
    const currentDeck = findDeck(currentDeckId);
    section.hidden = !currentDeck;
    if (!currentDeck) return;

    document.getElementById("deck-title").textContent = currentDeck.name;
    const cardList = document.getElementById("card-list");
    cardList.innerHTML = "";

    for (const card of currentDeck.cards) {
        const li = document.createElement("li");

        const editButton = document.createElement("button");

        editButton.textContent = `${card.front} - ${card.back}`;
        editButton.addEventListener("click", () => {
            editCardId = card.id;
            document.getElementById("card-front").value = card.front;
            document.getElementById("card-back").value = card.back;
            document.getElementById("add-card").textContent = "Save Card";
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteCard(currentDeckId, card.id));

        li.append(editButton, deleteButton);
        cardList.appendChild(li);
    }
}

function nextCard() {
    const deck = findDeck(currentDeckId);
    const front = document.getElementById("study-front");
    const back = document.getElementById("study-back");
    const bar = document.getElementById("progress-bar");
    back.hidden = true;
    document.getElementById("quality-buttons").hidden = true;

    if (sessionQueue.length === 0) {
        currentCard = null;
        front.textContent = "No cards left to review.";
        document.getElementById("show-answer").hidden = true;
        document.getElementById("progress").textContent = "";
        bar.max = Math.max(1, sessionStartingAmount);
        bar.value = bar.max;
        return;
    }

    currentCard = findCard(deck, sessionQueue[0]);
    front.textContent = currentCard.front;
    back.textContent = currentCard.back;
    document.getElementById("show-answer").hidden = false;
    const done = sessionStartingAmount - sessionQueue.length;
    document.getElementById("progress").textContent = `Finished ${done} of ${sessionStartingAmount}`;
    bar.max = sessionStartingAmount;
    bar.value = done;
}

function endSession() {
    document.getElementById("study-section").hidden = true;
    document.getElementById("card-section").hidden = false;
}

function startSession() {
    const deck = findDeck(currentDeckId);
    for (const card of deck.cards) {
        card.streak = 0;
    }
    sessionQueue = deck.cards.toSorted((a, b) => b.misses - a.misses).map(card => card.id);
    sessionStartingAmount = sessionQueue.length;
    document.getElementById("study-title").textContent = `Study: ${deck.name}`;
    document.getElementById("study-section").hidden = false;
    document.getElementById("card-section").hidden = true;
    nextCard();
}

function chooseQuality(quality) {
    if (!currentCard) return;
    const deck = findDeck(currentDeckId);
    const { card, interval } = study(currentCard, quality);

    for (let i = 0; i < deck.cards.length; i++) {
        if (deck.cards[i].id === card.id) {
            deck.cards[i] = card;
        }
    }
    saveDecks(decks);

    sessionQueue.shift();
    if (interval !== null) {
        sessionQueue.splice(interval, 0, card.id);
    }
    nextCard();
}

document.getElementById("add-deck").addEventListener("click", () => {
    const input = document.getElementById("deck-name");
    const name = input.value.trim();
    if (!name) return;
    addDeck(name);
    input.value = "";
    render();
});

document.getElementById("delete-deck").addEventListener("click", () => deleteDeck(currentDeckId));

document.getElementById("add-card").addEventListener("click", () => {
    const front = document.getElementById("card-front");
    const back = document.getElementById("card-back");
    if (!front.value.trim() || !back.value.trim()) return;

    if (editCardId) {
        editCard(currentDeckId, editCardId, front.value.trim(), back.value.trim());
    } else {
        addCard(currentDeckId, front.value.trim(), back.value.trim());
    }
    resetCard();
    render();
});

document.getElementById("start-study").addEventListener("click", startSession);

document.getElementById("show-answer").addEventListener("click", () => {
    document.getElementById("study-back").hidden = false;
    document.getElementById("quality-buttons").hidden = false;
    document.getElementById("show-answer").hidden = true;
});

for (const btn of document.querySelectorAll("#quality-buttons button")) {
    btn.addEventListener("click", () => chooseQuality(Number(btn.dataset.quality)));
}

document.getElementById("end-study").addEventListener("click", endSession);

render();