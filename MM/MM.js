const keyMapper = {
    '49': 1,
    '50': 2,
    '51': 3,
    '52': 4,
    '53': 5,
    '54': 6,
    '55': 7,
    '56': 8,
    '57': 9,
};

const cells = [];

function getCells() {
    for (let i = 0; i < 10; i++) {
        cells.push(document.getElementById(`c${i}`));
    };
};

let currentPlaceCell = 0;

function moveTo(place) {
    const nextPlace = cells[place];
    nextPlace.innerHTML = "🍌";
    currentPlaceCell = place;
}

function move(turns = 1) {
    for (let i = 1; i <= turns; i++) {
        setTimeout(() => {
            const currentPlace = cells[currentPlaceCell];
            currentPlace.innerHTML = "";
            moveTo((currentPlaceCell + 1) % cells.length);
        }, i * 250);
    };
};

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

function play() {
    move(randomIntFromInterval(1, 6));
};

function moveManually(keyCode) {
    if (keyMapper[keyCode]) {
        move(keyMapper[keyCode]);
    };
};

window.onload = () => {
    getCells();

    document.addEventListener("keydown", event => {
        if (!event.isComposing) {
            moveManually(event.keyCode);
        };
    });
};