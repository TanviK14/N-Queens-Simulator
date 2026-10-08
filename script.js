let N = 4;

let board = [];

let solutions = [];

let isRunning = false;

let isPaused = false;

let isStopped = false;

let timer = null;

let attempts = 0;

let backtracks = 0;

let solutionsFound = 0;

let displayedSolution = 0;

const boardElement = document.getElementById("board");

const nInput = document.getElementById("nInput");

const speedInput = document.getElementById("speedInput");

const startButton = document.getElementById("startButton");

const pauseButton = document.getElementById("pauseButton");

const stopButton = document.getElementById("stopButton");

const resetButton = document.getElementById("resetButton");

const previousButton = document.getElementById("previousButton");

const nextButton = document.getElementById("nextButton");

const solutionDisplay = document.getElementById("solutionDisplay");

const statusText = document.getElementById("statusText");

const message = document.getElementById("message");

const solutionCount = document.getElementById("solutionCount");

const queensPlaced = document.getElementById("queensPlaced");

const attemptsDisplay = document.getElementById("attempts");

const backtracksDisplay = document.getElementById("backtracks");


function createBoard() {

    boardElement.innerHTML = "";

    boardElement.style.gridTemplateColumns =
        `repeat(${N}, 1fr)`;

    boardElement.style.gridTemplateRows =
        `repeat(${N}, 1fr)`;

    for (let row = 0; row < N; row++) {

        for (let column = 0; column < N; column++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            if ((row + column) % 2 === 0) {
                cell.classList.add("white");
            } else {
                cell.classList.add("black");
            }

            cell.dataset.row = row;

            cell.dataset.column = column;

            boardElement.appendChild(cell);
        }
    }
}


function getCell(row, column) {

    return document.querySelector(
        `.cell[data-row="${row}"][data-column="${column}"]`
    );
}


function isSafe(row, column) {

    for (
        let previousColumn = 0;
        previousColumn < column;
        previousColumn++
    ) {

        const previousRow =
            board[previousColumn];

        if (previousRow === row) {
            return false;
        }

        if (
            Math.abs(previousRow - row) ===
            Math.abs(previousColumn - column)
        ) {
            return false;
        }
    }

    return true;
}


function wait(ms) {

    return new Promise(resolve => {

        timer = setTimeout(resolve, ms);

    });
}


async function waitIfPaused() {

    while (isPaused && !isStopped) {

        await new Promise(resolve => {

            setTimeout(resolve, 100);

        });
    }
}


function getSpeed() {

    return parseInt(speedInput.value);
}


function updateStats() {

    let placed = 0;

    for (let column = 0; column < N; column++) {

        if (board[column] !== -1) {
            placed++;
        }
    }

    queensPlaced.textContent = placed;

    attemptsDisplay.textContent = attempts;

    backtracksDisplay.textContent = backtracks;

    solutionCount.textContent = solutionsFound;

    solutionDisplay.textContent =
        `Solution ${
            solutions.length === 0
                ? 0
                : displayedSolution + 1
        } / ${solutions.length}`;

    updateNavigationButtons();
}


function clearCellState(cell) {

    if (!cell) {
        return;
    }

    cell.classList.remove(
        "checking",
        "safe",
        "unsafe",
        "backtracking"
    );
}


function placeQueen(row, column) {

    const cell =
        getCell(row, column);

    if (!cell) {
        return;
    }

    cell.textContent = "♛";

    cell.classList.add("queen");
}


function removeQueen(row, column) {

    const cell =
        getCell(row, column);

    if (!cell) {
        return;
    }

    cell.textContent = "";

    cell.classList.remove("queen");

    cell.classList.add("backtracking");
}


function saveSolution() {

    const solution = [...board];

    solutions.push(solution);

    solutionsFound++;

    displayedSolution =
        solutions.length - 1;

    updateStats();
}


async function solveAnimated(column) {

    if (isStopped) {
        return;
    }

    await waitIfPaused();

    if (isStopped) {
        return;
    }

    if (column === N) {

        saveSolution();

        statusText.textContent =
            "Solution Found";

        message.textContent =
            `Solution ${solutionsFound} found! Continuing search for more solutions...`;

        await wait(getSpeed());

        return;
    }

    for (let row = 0; row < N; row++) {

        if (isStopped) {
            return;
        }

        await waitIfPaused();

        if (isStopped) {
            return;
        }

        attempts++;

        updateStats();

        const cell =
            getCell(row, column);

        clearCellState(cell);

        cell.classList.add("checking");

        statusText.textContent =
            "Checking Position";

        message.textContent =
            `Checking row ${row + 1}, column ${column + 1}`;

        await wait(getSpeed());

        if (isStopped) {
            return;
        }

        await waitIfPaused();

        if (isSafe(row, column)) {

            cell.classList.remove("checking");

            cell.classList.add("safe");

            statusText.textContent =
                "Safe Position";

            message.textContent =
                `Safe: row ${row + 1}, column ${column + 1}`;

            await wait(getSpeed());

            if (isStopped) {
                return;
            }

            board[column] = row;

            placeQueen(row, column);

            updateStats();

            await wait(getSpeed());

            await solveAnimated(column + 1);

            if (isStopped) {
                return;
            }

            await waitIfPaused();

            statusText.textContent =
                "Backtracking";

            message.textContent =
                `Going back from column ${column + 1}...`;

            cell.classList.remove("safe");

            cell.classList.add("backtracking");

            removeQueen(row, column);

            board[column] = -1;

            backtracks++;

            updateStats();

            await wait(getSpeed());

            clearCellState(cell);

        } else {

            cell.classList.remove("checking");

            cell.classList.add("unsafe");

            statusText.textContent =
                "Unsafe Position";

            message.textContent =
                `Unsafe: row ${row + 1}, column ${column + 1}`;

            await wait(getSpeed());

            clearCellState(cell);
        }
    }
}


async function startSimulation() {

    if (isRunning) {
        return;
    }

    N =
        parseInt(nInput.value);

    if (isNaN(N) || N < 1 || N > 10) {

        message.textContent =
            "Please enter N between 1 and 10.";

        return;
    }

    clearTimeout(timer);

    board =
        new Array(N).fill(-1);

    solutions = [];

    attempts = 0;

    backtracks = 0;

    solutionsFound = 0;

    displayedSolution = 0;

    isRunning = true;

    isPaused = false;

    isStopped = false;

    createBoard();

    startButton.disabled = true;

    pauseButton.disabled = false;

    stopButton.disabled = false;

    resetButton.disabled = false;

    previousButton.disabled = true;

    nextButton.disabled = true;

    nInput.disabled = true;

    pauseButton.textContent =
        "⏸ Pause";

    statusText.textContent =
        "Starting";

    message.textContent =
        "Starting backtracking search...";

    updateStats();

    await wait(500);

    if (isStopped) {
        return;
    }

    await solveAnimated(0);

    if (!isStopped) {

        isRunning = false;

        isPaused = false;

        startButton.disabled = false;

        pauseButton.disabled = true;

        stopButton.disabled = true;

        nInput.disabled = false;

        if (solutions.length > 0) {

            displayedSolution = 0;

            showSolution(0);

            statusText.textContent =
                "Search Complete";

            message.textContent =
                `Found all ${solutions.length} solution(s) for N = ${N}.`;

        } else {

            statusText.textContent =
                "No Solution";

            message.textContent =
                `No solution exists for N = ${N}.`;
        }

        updateStats();
    }
}


function showSolution(index) {

    if (
        index < 0 ||
        index >= solutions.length
    ) {
        return;
    }

    displayedSolution = index;

    const solution =
        solutions[index];

    createBoard();

    for (let column = 0; column < N; column++) {

        const row =
            solution[column];

        if (row !== -1) {

            const cell =
                getCell(row, column);

            cell.textContent = "♛";

            cell.classList.add("queen");
        }
    }

    solutionDisplay.textContent =
        `Solution ${index + 1} / ${solutions.length}`;

    updateNavigationButtons();
}


function previousSolution() {

    if (displayedSolution > 0) {

        displayedSolution--;

        showSolution(displayedSolution);
    }
}


function nextSolution() {

    if (
        displayedSolution <
        solutions.length - 1
    ) {

        displayedSolution++;

        showSolution(displayedSolution);
    }
}


function updateNavigationButtons() {

    previousButton.disabled =
        solutions.length === 0 ||
        displayedSolution <= 0;

    nextButton.disabled =
        solutions.length === 0 ||
        displayedSolution >= solutions.length - 1;
}


function togglePause() {

    if (!isRunning) {
        return;
    }

    if (isPaused) {

        isPaused = false;

        pauseButton.textContent =
            "⏸ Pause";

        statusText.textContent =
            "Running";

        message.textContent =
            "Simulation resumed.";

    } else {

        isPaused = true;

        pauseButton.textContent =
            "▶ Resume";

        statusText.textContent =
            "Paused";

        message.textContent =
            "Simulation paused.";
    }
}


function stopSimulation() {

    if (!isRunning) {
        return;
    }

    isStopped = true;

    isRunning = false;

    isPaused = false;

    clearTimeout(timer);

    startButton.disabled = false;

    pauseButton.disabled = true;

    stopButton.disabled = true;

    nInput.disabled = false;

    pauseButton.textContent =
        "⏸ Pause";

    statusText.textContent =
        "Stopped";

    message.textContent =
        `Simulation stopped. ${solutionsFound} solution(s) found so far.`;

    updateStats();
}


function resetSimulation() {

    isStopped = true;

    isRunning = false;

    isPaused = false;

    clearTimeout(timer);

    N =
        parseInt(nInput.value) || 4;

    if (N < 1 || N > 10) {
        N = 4;
    }

    board =
        new Array(N).fill(-1);

    solutions = [];

    attempts = 0;

    backtracks = 0;

    solutionsFound = 0;

    displayedSolution = 0;

    startButton.disabled = false;

    pauseButton.disabled = true;

    stopButton.disabled = true;

    previousButton.disabled = true;

    nextButton.disabled = true;

    nInput.disabled = false;

    pauseButton.textContent =
        "⏸ Pause";

    statusText.textContent =
        "Ready";

    message.textContent =
        "Enter N and press Start.";

    solutionDisplay.textContent =
        "Solution 0 / 0";

    updateStats();

    createBoard();
}


startButton.addEventListener(
    "click",
    startSimulation
);

pauseButton.addEventListener(
    "click",
    togglePause
);

stopButton.addEventListener(
    "click",
    stopSimulation
);

resetButton.addEventListener(
    "click",
    resetSimulation
);

previousButton.addEventListener(
    "click",
    previousSolution
);

nextButton.addEventListener(
    "click",
    nextSolution
);

resetSimulation();
