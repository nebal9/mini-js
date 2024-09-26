const allowedInputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
let currentInputValue = "";
const items = [];

const generateNumber = () => {
    let digits = [];
    while (digits.length < 4) {
        let num = Math.floor(Math.random() * 10);
        if (!digits.includes(num)) {
            digits.push(num);
        };
    };
    return digits.join('');
};
const generatedNumber = generateNumber();

const registerInput = (guess) => {
    let correct = 0;
    let inPlace = 0;

    guess.split("").map((char, i) => {
        if (generatedNumber.includes(char)) {
            correct += 1;
            if (generatedNumber.charAt(i) == char) {
                inPlace += 1;
            };
        };
    });

    items.push({
        guess,
        correct,
        inPlace,
    });

    let html = "";
    items.map((i, n) => {
        html += `<div>#${n + 1}: <b>${i.guess}</b> ✔️<span>${i.correct}</span> 🎯 <span>${i.inPlace}</span></div>`
    });

    document.getElementById("items").innerHTML = html;

    if (inPlace == 4) {
        document.getElementById("attempts").innerHTML = items.length;
        document.getElementById("win").style.display = "block";
        document.getElementById("inputs").style.display = "none";
        scrollTo(0,0);
    };
};

const validateInput = (element) => {
    const lastChar = element.value.charAt(element.value.length - 1);

    if (element.value.length < currentInputValue.length) {
        currentInputValue = element.value;
    } else if (!currentInputValue.includes(lastChar) && allowedInputs.includes(Number(lastChar))) {
        currentInputValue = element.value;
    } else {
        element.value = currentInputValue;
    };

    const trimmedValue = currentInputValue.replace(/\s/g, '');
    if (trimmedValue.length == 4) {
        registerInput(trimmedValue);
        element.value = "";
        currentInputValue = "";
    };
};

const changeBG = (element) => {
    const currentBG = element.style.backgroundColor;

    if (currentBG == "rgb(226, 84, 84)") {
        element.style.backgroundColor = "rgb(3, 219, 3)";
    } else if (currentBG == "rgb(3, 219, 3)") {
        element.style.backgroundColor = "#ffffff";
    } else {
        element.style.backgroundColor = "rgb(226, 84, 84)";
    };
};