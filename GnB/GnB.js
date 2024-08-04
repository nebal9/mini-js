const KeyMapper = {
    '87': { actor: "gorilla", action: "up" }, //w
    '65': { actor: "gorilla", action: "left" }, //a
    '83': { actor: "gorilla", action: "down" }, //s
    '68': { actor: "gorilla", action: "right" }, //d
    '38': { actor: "banana", action: "up" }, //up
    '37': { actor: "banana", action: "left" }, //left
    '40': { actor: "banana", action: "down" }, //down
    '39': { actor: "banana", action: "right" }, //right

    '189': { actor: 'system', action: 'decreaseSpeed' }, //-
    '187': { actor: 'system', action: 'increaseSpeed' }, //+
    '219': { actor: 'system', action: 'decreaseTrees' }, //[
    '221': { actor: 'system', action: 'increaseTrees' }, //]
};

const MapWidth = 8;
const MapHeight = 6;

let DelayTime = 1000;
let DelayTimeInterval = 200;

let NumberOfTrees = 3;

const suggestedBlockedTiles = [
    "c_1_4",
    "c_3_7",
    "c_5_5",
    "c_4_2",
    "c_3_3",
    "c_2_7",
    "c_4_5",
    "c_6_2",
    "c_1_3",
    "c_6_7",
];

let bloackedTiles = [...suggestedBlockedTiles.slice(0, NumberOfTrees)];
let gorillaPosition = "c_1_1";
let bananaPosition = "c_6_8";

let startTime = null;

const setStartDateMaybe = () => {
    if (!startTime) {
        startTime = new Date();
    };
};

const getTileContent = (cid) => {
    if (cid == gorillaPosition) {
        return "🦍";
    } else if (cid == bananaPosition) {
        return "🍌";
    } else if (bloackedTiles.includes(cid)) {
        return "🌳";
    } else {
        return "";
    };
};

const getInitialCells = () => {
    var x = 1;
    var y = 1;
    let arr = [];
    for (let i = 1; i <= MapWidth * MapHeight; i++) {
        var cid = `c_${x}_${y}`;
        if (y == MapWidth) {
            y = 1;
            x += 1;
        } else {
            y += 1;
        };
        arr.push({
            cid,
            content: getTileContent(cid),
            isBlocked: bloackedTiles.includes(cid),
            element: document.getElementById(cid),
        });
    };
    return arr;
};

const initiateMap = () => {
    const Board = getInitialCells();
    Board.map(tile => {
        tile.element.innerHTML = tile.content;
    });
};

const isCellBlocked = (x, y) => {
    var nextCell = `c_${y}_${x}`;
    return bloackedTiles.includes(nextCell);
};

const isCellOutOfMap = (x, y) => {
    if (x < 1 || x > MapWidth) {
        return true;
    } else if (y < 1 || y > MapHeight) {
        return true;
    } else {
        return false;
    };
};

const getNextPosition = (x, y, action) => {
    if (action == "up") {
        return [x, y - 1];
    } else if (action == "left") {
        return [x - 1, y];
    } else if (action == "down") {
        return [x, y + 1];
    } else { // right
        return [x + 1, y];
    };
};

const lastMovements = {
    gorilla: new Date(),
    banana: new Date(),
};

const actorCanPlay = (actor) => {
    if (new Date() - lastMovements[actor] >= DelayTime) {
        lastMovements[actor] = new Date();
        return true;
    } else {
        return false;
    };
};

const moveItem = (actor, action) => {
    if (!actorCanPlay(actor)) return;
    setStartDateMaybe();

    var isGorilla = actor == "gorilla";
    var currentPosition = isGorilla ? gorillaPosition : bananaPosition;

    var [c, y, x] = currentPosition.split("_");
    var [nx, ny] = getNextPosition(Number(x), Number(y), action);

    if (!isCellBlocked(nx, ny) && !isCellOutOfMap(nx, ny)) {
        let nextPosition = `c_${ny}_${nx}`;

        if (isGorilla) {
            gorillaPosition = nextPosition;
            if (nextPosition == bananaPosition) {
                endGame();
            };
        } else {
            bananaPosition = nextPosition;
            if (nextPosition == gorillaPosition) {
                endGame();
            };
        };
        initiateMap();
    };
};

const initiateSystemAction = (action) => {
    if (action == "decreaseSpeed") {
        DelayTime += DelayTimeInterval;
    } else if (action == "increaseSpeed") {
        if (DelayTime > 0) {
            DelayTime -= DelayTimeInterval;
        };
    } else if (action == "decreaseTrees") {
        if (NumberOfTrees >= 1) {
            NumberOfTrees -= 1;
            bloackedTiles = [...suggestedBlockedTiles.slice(0, NumberOfTrees)];
            initiateMap();
        };
    } else if (action == "increaseTrees") {
        if (NumberOfTrees < suggestedBlockedTiles.length) {
            NumberOfTrees += 1;
            bloackedTiles = [...suggestedBlockedTiles.slice(0, NumberOfTrees)];
            initiateMap();
        };
    };
};

const checkKeyAction = (keyCode) => {
    var keyParams = KeyMapper[keyCode];
    if (keyParams) {
        const { actor, action } = keyParams;
        if (actor == "system") {
            initiateSystemAction(action);
        } else {
            moveItem(actor, action);
        };
    };
};

const endGame = () => {
    const gameBoard = document.getElementById("board");
    const resultBoard = document.getElementById("result");
    const timeSpan = document.getElementById("timeTaken");

    const timeTaken = Math.round((new Date() - startTime) / 1000);

    gameBoard.style.display = "none";
    resultBoard.style.display = "block";
    timeSpan.innerHTML = timeTaken;
};

const restart = () => {
    window.location.reload();
};

window.onload = () => {
    initiateMap();

    document.addEventListener("keydown", event => {
        if (!event.isComposing) {
            checkKeyAction(event.keyCode);
        };
    });
};
