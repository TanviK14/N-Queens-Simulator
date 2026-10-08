let N = 4;

let board = [];

let solutions = [];

let currentSolution = [];

let currentColumn = 0;

let isRunning = false;

let isPaused = false;

let isStopped = false;

let timer = null;

let attempts = 0;

let backtracks = 0;

let solutionsFound = 0;

const boardElement =
    document.getElementById("board");

const nInput =
    document.getElementById("nInput");

const speedInput =
    document.getElementById("speedInput");

const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const stopButton =
    document.getElementById("stopButton");

const resetButton =
    document.getElementById("resetButton");

const statusText =
    document.getElementById("statusText");

const message =
    document.getElementById("message");

const solutionCount =
    document.getElementById("solutionCount");

const queensPlaced =
    document.getElementById("queensPlaced");

const attemptsDisplay =
    document.getElementById("attempts");

const backtracksDisplay =
    document.getElementById("backtracks");

function createBoard() {

    boardElement.innerHTML = "";

    boardElement.style.gridTemplateColumns =
        `repeat(${N}, 1fr)`;

    boardElement.style.gridTemplateRows =
        `repeat(${N}, 1fr)`;


    for (let row = 0; row < N; row++) {

        for (let column = 0; column < N; column++) {

            const cell =
                document.createElement("div");

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

function removeQueen(row, column) {

    const cell = getCell(row, column);

    if (!cell) {
        return;
    }

    cell.textContent = "";

    cell.classList.remove("queen");

    cell.classList.add("backtracking");
}

function placeQueen(row, column) {

    const cell = getCell(row, column);

    if (!cell) {
        return;
    }

    cell.textContent = "♛";

    cell.classList.add("queen");
}

async function solveAnimated(column) {

    if (isStopped) {

        return false;
    }

    await waitIfPaused();


    if (isStopped) {

        return false;
    }

    if (column === N) {

        solutionsFound++;

        currentSolution = [...board];

        updateStats();

        statusText.textContent = "Solution Found!";

        message.textContent = "A valid arrangement has been found.";

        return true;
    }

    for (let row = 0; row < N; row++) {

        if (isStopped) {

            return false;
        }


        await waitIfPaused();

        attempts++;

        updateStats();

        const cell = getCell(row, column);

        clearCellState(cell);

        cell.classList.add("checking");


        statusText.textContent = "Checking Position";

        message.textContent = `Checking row ${row + 1}, column ${column + 1}`;


        await wait(getSpeed());


        if (isStopped) {

            return false;
        }


        await waitIfPaused();

        if (isSafe(row, column)) {

            cell.classList.remove("checking");

            cell.classList.add("safe");


            statusText.textContent = "Safe Position";

            message.textContent = `Queen can be placed at row ${row + 1}, column ${column + 1}`;


            await wait(getSpeed());


            if (isStopped) {

                return false;
            }

            board[column] = row;

            placeQueen(row, column);

            updateStats();


            await wait(getSpeed());

            const result =
                await solveAnimated(column + 1);


            if (isStopped) {

                return false;
            }


            if (result) {

                return true;
            }

            await waitIfPaused();


            statusText.textContent = "Backtracking";

            message.textContent = `No solution from column ${column + 1}. Going back.`;


            cell.classList.remove("safe");

            cell.classList.add("backtracking");


            removeQueen(row, column);


            board[column] = -1;

            backtracks++;

            updateStats();


            await wait(getSpeed());

            clearCellState(cell);

        }
        else {

            cell.classList.remove("checking");

            cell.classList.add("unsafe");


            statusText.textContent =
                "Unsafe Position";

            message.textContent =
                `Queen cannot be placed at row ${row + 1}, column ${column + 1}`;


            await wait(getSpeed());


            clearCellState(cell);
        }
    }


    return false;
}

async function startSimulation() {

    if (isRunning) {

        return;
    }

    N = parseInt(nInput.value);

    if (isNaN(N) || N < 1 || N > 10) {

        message.textContent =
            "Please enter N between 1 and 10.";

        return;
    }

    clearTimeout(timer);

    board =
        new Array(N).fill(-1);

    solutions = [];

    currentSolution = [];

    currentColumn = 0;

    attempts = 0;

    backtracks = 0;

    solutionsFound = 0;

    isRunning = true;

    isPaused = false;

    isStopped = false;

    createBoard();

    startButton.disabled = true;

    pauseButton.disabled = false;

    stopButton.disabled = false;

    resetButton.disabled = false;

    nInput.disabled = true;


    statusText.textContent =
        "Starting";

    message.textContent =
        "Starting the backtracking algorithm...";


    updateStats();


    await wait(500);


    if (isStopped) {

        return;
    }

    const solved =
        await solveAnimated(0);

    if (!isStopped) {

        isRunning = false;

        isPaused = false;

        startButton.disabled = false;

        pauseButton.disabled = true;

        stopButton.disabled = true;

        nInput.disabled = false;


        if (solved) {

            statusText.textContent =
                "Simulation Complete";

            message.textContent =
                `Found a solution for N = ${N}.`;

        } else {

            statusText.textContent =
                "No Solution";

            message.textContent =
                `No solution exists for N = ${N}.`;
        }
    }
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
            "Resuming";

        message.textContent =
            "Simulation resumed.";

    }
    else {

        // Pause
        isPaused = true;

        pauseButton.textContent =
            "▶ Resume";

        statusText.textContent =
            "Paused";

        message.textContent =
            "Simulation is paused.";
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

    statusText.textContent =
        "Stopped";

    message.textContent =
        "Simulation stopped.";

    updateStats();
}

function resetSimulation() {

    isStopped = true;

    isRunning = false;

    isPaused = false;

    clearTimeout(timer);

    N = parseInt(nInput.value) || 4;


    if (N < 1 || N > 10) {

        N = 4;
    }


    board =
        new Array(N).fill(-1);

    solutions = [];

    currentSolution = [];

    attempts = 0;

    backtracks = 0;

    solutionsFound = 0;


    nInput.value = N;


    startButton.disabled = false;

    pauseButton.disabled = true;

    stopButton.disabled = true;

    nInput.disabled = false;


    pauseButton.textContent =
        "⏸ Pause";


    statusText.textContent =
        "Ready";

    message.textContent =
        "Enter N and press Start.";


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

resetSimulation();
