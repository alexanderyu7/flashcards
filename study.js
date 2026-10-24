const STREAK_TARGET = 3;

function study(card, quality) {
    let { streak, misses } = card;
    let interval;

    if (quality === 1) {
        streak = 0;
        misses++;
        interval = 3;
    } else if (quality === 2){
        streak = 0;
        interval = 5;
    } else {
        streak++;
        interval = 8;
    }

    if (streak >= STREAK_TARGET) {
        interval = null;
        misses = Math.max(0, misses - 1);
    }

    return { card: { ...card, streak, misses }, interval };
}