function sm2(card, quality) {
    let { streak, interval, easiness } = card;

    if (quality < 3) {
        streak = 0;
        interval = 1;
    } else {
        if (streak === 0) {
            interval = 1;
        } else if (streak === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easiness);
        }
        streak ++;

        easiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }

    return { ...card, streak, interval, easiness };
}

module.exports = { sm2 };