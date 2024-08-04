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

let AIMoveInterval = 1100;

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
let gorillaPosition = "c_3_1";
let bananaPosition = "c_4_8";

const Roles = {
    gorilla: null,
    banana: null,
};

const lastMovements = {
    gorilla: new Date(),
    banana: new Date(),
};

let startTime = null;
let aiStartTime = null;

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

const isInvalidTile = (tile) => {
    var [c, y, x] = tile.split("_");

    if (isCellBlocked(x, y) || isCellOutOfMap(Number(x), Number(y))) {
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

const actorCanPlay = (actor) => {
    if (Roles[actor] !== "player") {
        return false
    } else if (new Date() - lastMovements[actor] >= DelayTime) {
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

const moveGorilla = () => {
    if (startTime || Roles.banana == "ai") {
        var nextPosition = getShorterMove(gorillaPosition, bananaPosition);
        if (nextPosition) {
            gorillaPosition = nextPosition;
            initiateMap();
            if (nextPosition == bananaPosition) {
                endGame();
            };
        };
    };
};

const moveBanana = () => {
    if (startTime || Roles.gorilla == "ai") {
        var nextPosition = getLongerMove(bananaPosition, gorillaPosition);
        if (nextPosition) {
            bananaPosition = nextPosition;
            initiateMap();
            if (nextPosition == gorillaPosition) {
                endGame();
            };
        };
    };
};

let gorillaIntervalId = null;
let bananaIntervalId = null;

const initiateGorillaAsAI = () => {
    if (Roles.gorilla == "ai") {
        aiStartTime = new Date();
        gorillaIntervalId = setInterval(function () {
            moveGorilla();
        }, AIMoveInterval);
    };
};

const initiateBananaAsAI = () => {
    if (Roles.banana == "ai") {
        aiStartTime = new Date();
        bananaIntervalId = setInterval(function () {
            moveBanana();
        }, AIMoveInterval);
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

const settingsBoard = document.getElementById("settings");
const gameBoard = document.getElementById("board");
const resultBoard = document.getElementById("result");

const startGame = () => {
    const gorillaRole = document.getElementById("gorillaRole").value;
    const bananaRole = document.getElementById("bananaRole").value;

    Roles.gorilla = gorillaRole;
    Roles.banana = bananaRole;

    initiateGorillaAsAI();
    initiateBananaAsAI();

    settingsBoard.style.display = "none";
    gameBoard.style.display = "block";
};

const endGame = () => {
    const timeSpan = document.getElementById("timeTaken");
    const actualStartTime = startTime ? startTime : aiStartTime;
    const timeTaken = Math.round((new Date() - actualStartTime) / 1000);

    if (gorillaIntervalId) {
        clearInterval(gorillaIntervalId);
    };
    if (bananaIntervalId) {
        clearInterval(bananaIntervalId);
    };

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

const getShorterMove = (a, b) => {
    const [ac, ayS, axS] = a.split("_");
    const [bc, byS, bxS] = b.split("_");

    const [ay, ax, by, bx] = [Number(ayS), Number(axS), Number(byS), Number(bxS)];

    const xDistance = Math.abs(ax - bx);
    const yDistance = Math.abs(ay - by);

    if (xDistance >= yDistance) {
        const nextXMoveMaybe = getNextX(ax, bx, ay);
        if (isInvalidTile(nextXMoveMaybe)) {
            const nextYMoveMaybe = getNextY(ay, by, ax);
            if (isInvalidTile(nextYMoveMaybe)) {
                return null;
            } else {
                return nextYMoveMaybe;
            };
        } else {
            return nextXMoveMaybe;
        };
    } else {
        const nextYMoveMaybe = getNextY(ay, by, ax);
        if (isInvalidTile(nextYMoveMaybe)) {
            const nextXMoveMaybe = getNextX(ax, bx, ay);
            if (isInvalidTile(nextXMoveMaybe)) {
                return null;
            } else {
                return nextXMoveMaybe;
            };
        } else {
            return nextYMoveMaybe;
        };
    };
};

const getLongerMove = (a, b) => {
    const [ac, ayS, axS] = a.split("_");
    const [bc, byS, bxS] = b.split("_");

    const [ay, ax, by, bx] = [Number(ayS), Number(axS), Number(byS), Number(bxS)];

    const xDistance = Math.abs(ax - bx);
    const yDistance = Math.abs(ay - by);

    if (xDistance < yDistance) {
        const prevXMoveMaybe = getPrevX(ax, bx, ay);
        if (isInvalidTile(prevXMoveMaybe)) {
            const prevYMoveMaybe = getPrevY(ay, by, ax);
            if (isInvalidTile(prevYMoveMaybe)) {
                const nextXMoveMaybe = getNextX(ax, bx, ay);
                if (isInvalidTile(nextXMoveMaybe)) {
                    const nextYMoveMaybe = getNextY(ay, by, ax);
                    if (isInvalidTile()) {
                        return null;
                    } else {
                        return nextYMoveMaybe;
                    };
                } else {
                    return nextXMoveMaybe;
                };
            } else {
                return prevYMoveMaybe;
            };
        } else {
            return prevXMoveMaybe;
        };
    } else {
        const prevYMoveMaybe = getPrevY(ay, by, ax);
        if (isInvalidTile(prevYMoveMaybe)) {
            const prevXMoveMaybe = getPrevX(ax, bx, ay);
            if (isInvalidTile(prevXMoveMaybe)) {
                const nextYMoveMaybe = getNextY(ay, by, ax);
                if (isInvalidTile(nextYMoveMaybe)) {
                    const nextXMoveMaybe = getNextX(ax, bx, ay);
                    if (isInvalidTile(nextXMoveMaybe)) {
                        return null;
                    } else {
                        return nextXMoveMaybe;
                    };
                } else {
                    return nextYMoveMaybe;
                };
            } else {
                return prevXMoveMaybe;
            };
        } else {
            return prevYMoveMaybe;
        };
    };
};

const getNextX = (ax, bx, ay) => {
    const nextX = ax > bx ? ax - 1 : ax + 1;
    return `c_${ay}_${nextX}`;
};

const getNextY = (ay, by, ax) => {
    const nextY = ay > by ? ay - 1 : ay + 1;
    return `c_${nextY}_${ax}`;
};

const getPrevX = (ax, bx, ay) => {
    const prevX = ax <= bx ? ax - 1 : ax + 1;
    return `c_${ay}_${prevX}`;
};

const getPrevY = (ay, by, ax) => {
    const prevY = ay <= by ? ay - 1 : ay + 1;
    return `c_${prevY}_${ax}`;
};
