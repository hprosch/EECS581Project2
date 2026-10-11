// set the size of the minesweeper board (rpm 10.10)
var ROWS = 10;
var COLS = 10;
var MAX_MINES = 20;
var MIN_MINES = 10;
// keep track of the game and who is playing (rpm 10.10)
var firstTurn = true;
var board, mineGrid, flagGrid, gameOver, winState, tag, ai, difficulty;
// track the game timer and the 3x3 reveal ability (rpm 10.10)
var stopwatchInterval,
        stopwatchStart,
        revealAbilityAvailable,
        revealAbilityActive;

function initializeBoard(board) {
        //go thorugh every row and col, populating the board with 9s
        for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                        board[row][col] = 9;
                }
        }
        return board;
}
function initializeMineGrid(mineGrid) {
        //go thorugh every row and col, populating the board with false
        for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                        mineGrid[row][col] = false;
                }
        }
        return mineGrid;
}

function initializeFlagGrid(flagGrid) {
        //go thorugh every row and col, populating the board with false
        for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                        flagGrid[row][col] = false;
                }
        }
        return flagGrid;
}

// randomly put the chosen number of mines on the board (rpm 10.10)
function placeMines(mineGrid, mineCount) {
        let placedMines = 0;

        // keep picking spots until all the mines are placed (rpm 10.10)
        while (placedMines < mineCount) {
                let row = Math.floor(Math.random() * ROWS); //get random row number
                let col = Math.floor(Math.random() * COLS); //ger random column number

                if (!mineGrid[row][col]) {
                        //if theres not a mine there
                        mineGrid[row][col] = true; //set cell to true
                        placedMines++;
                }
        }
        return mineGrid;
}

// figure out what happens when a tile gets revealed (rpm 10.10)
function revealTile(board, mineGrid, row, col) {
        let adjacentMines = 0;
        if (mineGrid[row][col]) {
                // Check for mine
                if (firstTurn) {
                        // Cannot hit mine on first turn.
                        placeMines(mineGrid, 1);
                        mineGrid[row][col] = false;
                } else {
                        return 2; // Hit a mine.
                }
        }
        firstTurn = false;
        if (board[row][col] == 9) {
                for (let tiles = 0; tiles < 9; tiles++) {
                        //starting from top left, go through every adjacent tile
                        let rowPos = row - 1 + Math.floor(tiles / 3);
                        let colPos = col - 1 + (tiles % 3);

                        if (
                                rowPos >= 0 &&
                                rowPos < ROWS &&
                                colPos >= 0 &&
                                colPos < COLS &&
                                mineGrid[rowPos][colPos]
                        )
                                //if tile in bounds and contains a mine
                                adjacentMines++;
                }
                board[row][col] = adjacentMines;

                if (adjacentMines == 0) {
                        //If user selects a tile with no near mines reveal surroundin tiles
                        for (let rowPos = row - 1; rowPos <= row + 1; rowPos++) {
                                for (let colPos = col - 1; colPos <= col + 1; colPos++) {
                                        if (rowPos >= 0 && rowPos < ROWS && colPos >= 0 && colPos < COLS) {
                                                revealTile(board, mineGrid, rowPos, colPos);
                                        }
                                }
                        }
                }
                return 1; // Success.
        }
        return 0; // Nothing Occured.
}

function checkWin(board, mineGrid) {
        //Goes through the board to see if every non-mine cell has been revealed, signifying a win
        for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                        if (!mineGrid[row][col] && board[row][col] == 9) {
                                return false; //If a non-mine cell is not revealed, continue playing
                        }
                }
        }
        return true; //If every non-mine cell has been revealed, the game has been won
}

// place or remove a flag on an unopened tile (rpm 10.10)
function flagCell(flagGrid, board, row, col) {
        if (board[row][col] != 9) {
                console.log("Invalid flag placement. Place flag on unrevealed tile");
                return flagGrid;
        }

        let placedFlags = 0;

        // go through every cell and count placed flags
        for (let rowPos = 0; rowPos < ROWS; rowPos++) {
                for (let colPos = 0; colPos < COLS; colPos++) {
                        if (flagGrid[rowPos][colPos]) {
                                placedFlags++;
                        }
                }
        }

        let mineCount = Number(document.getElementById("mineSlider").value);

        // prevent placing more flags than there are mines
        if (!flagGrid[row][col] && placedFlags >= mineCount) {
                return flagGrid;
        }
        flagGrid[row][col] = !flagGrid[row][col];

        return flagGrid;
}

// update the number of flags left on the screen (rpm 10.10)
function updateFlagCount() {
        let placedFlags = 0;

        // go through every cell and count placed flags
        for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                        if (flagGrid[row][col]) {
                                placedFlags++;
                        }
                }
        }

        let mineCount = Number(document.getElementById("mineSlider").value);
        document.getElementById("flagCount").textContent = mineCount - placedFlags;
}

/*Functions for tracking game duration written by the Project 2 team 10/5/26*/
function updateStopwatch() {
        let elapsedSeconds = Math.floor((Date.now() - stopwatchStart) / 1000);
        let minutes = Math.floor(elapsedSeconds / 60)
                .toString()
                .padStart(2, "0");
        let seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
        document.getElementById("timer").textContent = minutes + ":" + seconds;
}

// stop the timer once the game is finished (rpm 10.10)
function stopStopwatch() {
        clearInterval(stopwatchInterval);
        updateStopwatch();
}

// turn the 3x3 reveal mode on or off (rpm 10.10)
function activateRevealAbility() {
        if (gameOver || !revealAbilityAvailable) return;
        revealAbilityActive = !revealAbilityActive;
        document.getElementById("revealButton").textContent = revealAbilityActive
                ? "Select 3x3 Area"
                : "Use 3x3 Reveal";
}

// find the number for a safe tile revealed by the ability (rpm 10.10)
function revealAbilityTile(row, col) {
        let adjacentMines = 0;
        for (let rowPos = row - 1; rowPos <= row + 1; rowPos++) {
                for (let colPos = col - 1; colPos <= col + 1; colPos++) {
                        if (
                                rowPos >= 0 &&
                                rowPos < ROWS &&
                                colPos >= 0 &&
                                colPos < COLS &&
                                mineGrid[rowPos][colPos]
                        ) {
                                adjacentMines++;
                        }
                }
        }
        board[row][col] = adjacentMines;
}

/*Ability for revealing a 3x3 area and flagging mines written by the Project 2 team 10/5/26*/
function revealAbility(row, col) {
        if (gameOver || !revealAbilityAvailable || !revealAbilityActive) return;

        for (let rowPos = row - 1; rowPos <= row + 1; rowPos++) {
                for (let colPos = col - 1; colPos <= col + 1; colPos++) {
                        if (
                                rowPos >= 0 &&
                                rowPos < ROWS &&
                                colPos >= 0 &&
                                colPos < COLS &&
                                !flagGrid[rowPos][colPos]
                        ) {
                                if (mineGrid[rowPos][colPos]) {
                                        flagGrid[rowPos][colPos] = true;
                                } else if (board[rowPos][colPos] == 9) {
                                        revealAbilityTile(rowPos, colPos);
                                }
                        }
                }
        }

        // mark the reveal ability as used so it cannot be used again (rpm 10.10)
        firstTurn = false;
        revealAbilityAvailable = false;
        revealAbilityActive = false;
        document.getElementById("revealButton").textContent = "3x3 Reveal Used";
        render();
        updateFlagCount();

        if (checkWin(board, mineGrid)) {
                gameOver = true;
                winState = true;
                stopStopwatch();
                render();
                document.getElementById("status").textContent = "Game Over: You Win!";
        }
}

// Code chunk below replaces prompt-based input
// ========================================================================================================================================

// create the clickable board and its row and column labels (rpm 10.10)
function buildGrid() {
        const gameBoard = document.getElementById("board");
        gameBoard.innerHTML = ""; // clear previous game

        const headerRow = document.createElement("tr");
        const corner = document.createElement("th");
        headerRow.appendChild(corner);

        // add column labels A-J
        for (let col = 0; col < COLS; col++) {
                const th = document.createElement("th");
                th.textContent = String.fromCharCode(65 + col);
                headerRow.appendChild(th);
        }

        gameBoard.appendChild(headerRow);

        // create table rows and cells
        for (let row = 0; row < ROWS; row++) {
                const tr = document.createElement("tr");

                // add row labels 1-10
                const rowLabel = document.createElement("th");
                rowLabel.textContent = row + 1;
                tr.appendChild(rowLabel);

        for (let col = 0; col < COLS; col++) {
            const td = document.createElement('td'); // table cell data
            td.id = 'cell-' + row + '-' + col; // Unique ID for each cell
            td.onclick = (e) => {
                if (e.ctrlKey) {
                    handleFlag(row, col); //Holding ctrl with left click will toggle flag
                } else {
            //Use the 3x3 reveal ability on the selected tile
            if (revealAbilityActive) {
            revealAbility(row, col);
            return;
            }
                    //Checks if the tile has been revealed (unrevealed tiles have a board array value of 9)
                    let check = board[row][col];
                    //Handle the revealing process of the chosen tile
                    handleReveal(row, col);
                    //Checks if the game is in Tag-Team mode, not won, not lost, and if the tile is not flagged and unrevealed
                    if(tag && !winState && !gameOver && !flagGrid[row][col] && check == 9){
                        ai = true;
                        //If AI is in easy
                        if(difficulty == 0){
                            //Easy difficulty AI takes a turn after a valid revealing
                            easy();
                        //If AI is in medium
                        }else if(difficulty == 1){
                            //Medium  difficulty AI takes a turn after a valid revealing
                            medium();
                        //If AI is in hard
                        }else{
                            //Hard difficulty AI takes a turn after a valid revealing
                    hard();
                        }
                        ai = false;
                    }
                }
            };
            td.ondblclick = (e) => {
                if (e.ctrlKey) {
                    return; //Handles double reveal
                }
                handleDoubleReveal(row, col);
            }
            td.oncontextmenu = (e) => {
                e.preventDefault(); // allows right click without browser menu popup
                handleFlag(row, col);
            };
            tr.appendChild(td); // append cell to row
        }

                gameBoard.appendChild(tr); // append row to table
        }
}

function render() {
        // Update the display based on current state of the board and flagGrid
        for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                        const td = document.getElementById("cell-" + row + "-" + col);
                        const val = board[row][col];
                        td.className = "";
                        td.textContent = "";

            // flag
            if (val === 9) {
                if (flagGrid[row][col]) {
                    td.textContent = '🚩'; // changed F to be flag emoji
                } else if (winState && mineGrid[row][col]) {
                    td.textContent = '💣'; // If bombs unflagged after win, they're marked with bomb icon
                }
            // mine
            } else if (val === -1) {
                td.textContent = '💥';
            // mine ai hit
            } else if (val === -2) {
                td.className = 'aiHit';
                td.textContent = '💥';
            // safe cell
            } else {
                td.className = 'revealed';
                if (val > 0) {
                    td.textContent = val;
                }
            }
        }
    }
}

// show where the mines were after a loss (rpm 10.10)
function revealAllMines(aiRow, aiCol) {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (mineGrid[row][col]) {
                //If the ai hit the mine
                if(ai && row === aiRow && col === aiCol){
                    board[row][col] = -2; //represents the mine the algorithm hit
                }else{
                        board[row][col] = -1; // -1 represents a mine
                }
            }
        }
    }
}

// handle a tile click and check if the game ended (rpm 10.10)
function handleReveal(row, col) {
        if (gameOver) return;
        if (flagGrid[row][col]) {
        console.error("Invalid reveal!");

        return; // flagged cells cannot be revealed
    }
        let revealResult = revealTile(board, mineGrid, row, col);
        render();

    // revealResult === 2 reprensents hitting a mine
    if (revealResult === 2) {
        gameOver = true;
        revealAllMines(row, col);
        render();
        stopStopwatch();
    } else if (checkWin(board, mineGrid)) {
        gameOver = true;
        winState = true;
        stopStopwatch();
        render(); //Re-renders board so show unflagged bombs
    }
    if (gameOver) {
        if(ai){
            document.getElementById('status').textContent = `Game Over: The AI ${checkWin(board, mineGrid) ? "Wins!" : "Hit a Mine..."}`;
        }else{
            document.getElementById('status').textContent = `Game Over: You ${checkWin(board, mineGrid) ? "Win!" : "Hit a Mine..."}`;
        }
    } else {
        document.getElementById('status').textContent = '';
    }
}

function handleDoubleReveal(row, col) {
        //Reveal surrounding tiles when a numbered tile is double-clicked
        if (gameOver) return;
        if (board[row][col] < 1 || board[row][col] > 8) {
                return;
        }

        let hitMine = false;
        for (let rowPos = row - 1; rowPos <= row + 1; rowPos++) {
                for (let colPos = col - 1; colPos <= col + 1; colPos++) {
                        if (rowPos >= 0 && rowPos < ROWS && colPos >= 0 && colPos < COLS) {
                                if (flagGrid[rowPos][colPos] || board[rowPos][colPos] != 9) {
                                        continue;
                                }
                                if (mineGrid[rowPos][colPos]) {
                                        hitMine = true;
                                        break;
                                }
                                revealTile(board, mineGrid, rowPos, colPos);
                        }
                }
                if (hitMine) {
                        break;
                }
        }

    if (hitMine) { //If a mine is revealed in the surrounding tiles, the game ends
        gameOver = true;
        revealAllMines();
        render();
        stopStopwatch();
        if(ai){
            document.getElementById('status').textContent = 'Game Over: The AI Hit a Mine...';

        }else{
            document.getElementById('status').textContent = 'Game Over: You Hit a Mine...';
        }
        return;
    }

        render();
        if (checkWin(board, mineGrid)) {
                //If all non-mine cells are revealed after the surrounding tiles are opened, the player wins
                gameOver = true;
                winState = true;
                stopStopwatch();
                render();
        }

        if (gameOver) {
                document.getElementById("status").textContent =
                        `Game Over: You ${checkWin(board, mineGrid) ? "Win!" : "Hit a Mine..."}`;
        } else {
                document.getElementById("status").textContent = "";
        }
}

// update the board and flag counter after a flag click (rpm 10.10)
function handleFlag(row, col) {
        if (gameOver) return;
        flagGrid = flagCell(flagGrid, board, row, col); // Update the flagGrid
        render();
        updateFlagCount();
}

// reset everything needed to start another game (rpm 10.10)
function newGame() {
    // Create 2D arrays for board, mineGrid, and flagGrid
    tag = false; //Automatically sets Tag-Team mode variable to false, will be set to true in tagTeam() function if Tag-Team mode is being played
    //Sets the ai varaible to false, will be set to true in AIPlayer and TagTeam modes when relevant
    ai = false;
    // make new arrays for the tiles, mines, and flags (rpm 10.10)
    board = Array(ROWS);
    mineGrid = Array(ROWS);
    flagGrid = Array(ROWS);
    for (let i = 0; i < ROWS; i++) {
        board[i] = Array(COLS);
        mineGrid[i] = Array(COLS);
        flagGrid[i] = Array(COLS);
    }
    board = initializeBoard(board);
    mineGrid = initializeMineGrid(mineGrid);
    flagGrid = initializeFlagGrid(flagGrid);

        let mineCount = Number(document.getElementById("mineSlider").value); // gets selected mine count
        mineGrid = placeMines(mineGrid, mineCount); // place selected number of mines (1-20)

        // clear the old game results and reset the reveal ability (rpm 10.10)
        firstTurn = true;
        gameOver = false;
        winState = false;
        revealAbilityAvailable = true;
        revealAbilityActive = false;
        document.getElementById("revealButton").textContent = "Use 3x3 Reveal";
        // restart the timer for the new game (rpm 10.10)
        stopwatchStart = Date.now();
        clearInterval(stopwatchInterval);
        stopwatchInterval = setInterval(updateStopwatch, 1000);
        updateStopwatch();
        // redraw the board so the new game starts with hidden tiles (rpm 10.10)
        buildGrid();
        render();
        updateFlagCount();
        document.getElementById("status").textContent = "";
}

/*
Algorithm for detecting a 1-2-1 pattern
 */
function hard() {
        for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                        if (board[i][j] == 2) {
                                // only care about tiles with 2 bombs around them

                                // checking for corners flag edge case
                                // Section added by Ian Ruebelmann on 10/9/26
                                let corners = 0;
                                // A for loop to count the # of unrevealed or flagged corners, if it's greater than 2 we can use it
                                for(let k = 0; k <= 4; k++)
                                {
                                        let x = (k % 2) * 2 - 1 + j;
                                        let y = Math.floor(k / 2) * 2 - 1 + i;

                                        // check out of bounds
                                        if (x < 0 || x >= COLS || y < 0 || y >= ROWS)
                                        {
                                                // do nothing... I refuse to use my brain and reverse this boolean statement
                                        }
                                        else
                                        {
                                                // count a corner
                                                if(board[y][x] == 9 || flagGrid[y][x] == true)
                                                {
                                                        corners += 1;
                                                }
                                        }
                                }


                                // We had 2 unrevealed or flagged corners
                                if (corners == 2)
                                {
                                        // Vertical 1-2-1 test:
                                        if (i + 1 != ROWS && i != 0) {
                                                // making sure we're not on an edge top/bottom
                                                if (board[i + 1][j] == 1 && board[i - 1][j] == 1) {
                                                        // if the chosen tile follows the 2-1-2 pattern
                                                        if (j + 1 == COLS) {
                                                                // on right edge
                                                                if (board[i][j - 1] == 9 && flagGrid[i][j - 1] == false) {
                                                                        // if tile to our left is unrevealed
                                                                        handleFlag(i - 1, j - 1);
                                                                        handleFlag(i + 1, j - 1);
                                                                        handleReveal(i, j - 1); // Reveal the tile left of us
                                                                        return; // end our turn
                                                                }
                                                        }
                                                        else if (j == 0) {
                                                                // if we're on left edge
                                                                if (board[i][j + 1] == 9 && flagGrid[i][j + 1] == false && flagGrid[i-1][j + 1] == false && flagGrid[i+1][j + 1] == false) {
                                                                        // if tile on our right is unrevealed
                                                                        handleFlag(i - 1, j + 1);
                                                                        handleFlag(i + 1, j + 1);
                                                                        handleReveal(i, j + 1); // Reveal the tile right of us
                                                                        return; // end our turn
                                                                }
                                                        } else {
                                                                // if we're not on any edge
                                if(j+1<=COLS){
                                                                if (board[i][j + 1] == 9 && flagGrid[i][j + 1] == false && flagGrid[i-1][j + 1] == false && flagGrid[i+1][j + 1] == false) {
                                                                        // if right tile is unrevealed
                                                                        handleFlag(i - 1, j + 1);
                                                                        handleFlag(i + 1, j + 1);
                                                                        handleReveal(i, j + 1); // Reveal the tile right of us
                                                                        return; // end our turn
                                                                }
                                }
                                if(j-1>=0){
                                                                if (board[i][j - 1] == 9 && flagGrid[i][j - 1] == false && flagGrid[i-1][j - 1] == false && flagGrid[i+1][j - 1] == false) {
                                                                        handleFlag(i - 1, j - 1);
                                                                        handleFlag(i + 1, j - 1);
                                                                        handleReveal(i, j - 1); // Reveal the tile right of us
                                                                        return; // end our turn
                                                                }
                            }
                                                }
                                                //  if the program has reached this point without returning, the vertical 1-2-1 pattern has already been revealed
                                        }
                                }

                                // At this point, we know there is no 1-2-1 vertical pattern that hasn't been revealed for this tile
                                if (j + 1 != COLS && j != 0) {
                                        // making sure we're not on an edge left/right
                                        if (board[i][j + 1] == 1 && board[i][j - 1] == 1) {
                                                // if the chosen tile follows the 2-1-2 pattern
                                                if (i + 1 == ROWS) {
                                                        // on bottom edge
                                                        if (board[i - 1][j] == 9 && flagGrid[i - 1][j] == false && flagGrid[i - 1][j-1] == false && flagGrid[i - 1][j+1] == false) {
                                                                // if tile to our up is unrevealed
                                                                handleFlag(i - 1, j - 1);
                                                                handleFlag(i - 1, j + 1);
                                                                handleReveal(i - 1, j); // Reveal the tile up of us
                                                                return; // end our turn
                                                        }
                                                }
                                                else if (i == 0) {
                                                        // if we're on top edge
                                                        if ( board[i + 1][j] == 9 && flagGrid[i + 1][j] == false && flagGrid[i + 1][j-1] == false && flagGrid[i + 1][j+1] == false) {
                                                                // if tile on our bottom is unrevealed
                                                                handleFlag(i + 1, j + 1);
                                                                handleFlag(i + 1, j - 1);
                                                                handleReveal(i + 1, j); // Reveal the below right of us
                                                                return; // end our turn
                                                        }
                                                } else {
                                                        // if we're not on any edge
                            if(i+1<=ROWS){
                                                        if (board[i - 1][j] == 9 && flagGrid[i - 1][j] == false && flagGrid[i - 1][j-1] == false && flagGrid[i - 1][j+1] == false) {
                                                                // if right tile is unrevealed
                                                                handleFlag(i - 1, j - 1);
                                                                handleFlag(i - 1, j + 1);
                                                                handleReveal(i - 1, j); // Reveal the tile up of us
                                                                return; // end our turn
                                                        }
                        }
                        if(i-1>=0){
                                                        if (board[i + 1][j] == 9 && flagGrid[i + 1][j] == false && flagGrid[i + 1][j-1] == false && flagGrid[i + 1][j+1] == false) {
                                                                        // if tile on our bottom is unrevealed
                                                                        handleFlag(i + 1, j + 1);
                                                                        handleFlag(i + 1, j - 1);
                                                                        handleReveal(i + 1, j); // Reveal the below right of us
                                    return; // end our turn


                                                        }
                                                }
                                }

                        }
                                        }
                                }
                        }
                }
        }
        // At this point, we know there is no 1-2-1 patterns, so we just pass it off to medium
        // use the medium strategy if the hard pattern was not found (rpm 10.10)
        console.log("passing to medium");
        medium();
}
/*
Algorithm for taking one turn under the Medium Difficulty AI

goes over all tiles one by one, if they are revealed we check if
    1) the # of adjacent unrevealed tiles + flagged tiles = the # of adjacent bomb, if so, flag all adjacent tiles
    2) the # of adjacent flagged tiles = the # adjacent bombs, if so reveal all adjacent unflagged tiles
if we find no tiles that meet these rules, we just call the easy algorithm to reveal a random tile

- function and comment written by Ian Ruebelmann on 9/30/2026 @ 11:25pm
*/
function medium() {
        for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                        // if the tile is unrevealed we dont care about it
                        if (board[i][j] != 9 && board[i][j] != 0) {
                                let adjacentFlags = 0;
                                let adjacentUnrevealedTiles = 0;
                                for (let tiles = 0; tiles < 9; tiles++) {
                                        //starting from top left, go through every adjacent tile
                                        let rowPos = i - 1 + Math.floor(tiles / 3);
                                        let colPos = j - 1 + (tiles % 3);

                                        if (rowPos >= 0 && rowPos < ROWS && colPos >= 0 && colPos < COLS) {
                                                if (flagGrid[rowPos][colPos]) {
                                                        adjacentFlags++; // Count flags
                                                } else if (board[rowPos][colPos] == 9) {
                                                        adjacentUnrevealedTiles++; // Count unrevealed tiles with no flags
                                                }
                                        }
                                }
                                if (adjacentUnrevealedTiles != 0) {
                                        if (adjacentFlags == board[i][j]) {
                                                // Reveal all adjacent unflagged tiles
                                                for (let tiles = 0; tiles < 9; tiles++) {
                                                        //starting from top left, go through every adjacent tile
                                                        let rowPos = i - 1 + Math.floor(tiles / 3);
                                                        let colPos = j - 1 + (tiles % 3);

                                                        if (
                                                                rowPos >= 0 &&
                                                                rowPos < ROWS &&
                                                                colPos >= 0 &&
                                                                colPos < COLS
                                                        ) {
                                                                if (board[rowPos][colPos] == 9 && !flagGrid[rowPos][colPos]) {
                                                                        handleReveal(rowPos, colPos);
                                                                }
                                                        }
                                                }
                                                return; // End Turn
                                        } else if (adjacentFlags + adjacentUnrevealedTiles == board[i][j]) {
                                                // Flag all adjacent unflagged tiles
                                                for (let tiles = 0; tiles < 9; tiles++) {
                                                        //starting from top left, go through every adjacent tile
                                                        let rowPos = i - 1 + Math.floor(tiles / 3);
                                                        let colPos = j - 1 + (tiles % 3);

                                                        if (
                                                                rowPos >= 0 &&
                                                                rowPos < ROWS &&
                                                                colPos >= 0 &&
                                                                colPos < COLS
                                                        ) {
                                                                if (board[rowPos][colPos] == 9 && !flagGrid[rowPos][colPos]) {
                                                                        handleFlag(rowPos, colPos);
                                                                }
                                                        }
                                                }
                                                return; //End Turn
                                        }
                                }
                        }
                }
        }
        // use a random move if the medium rules did not work (rpm 10.10)
        console.log("Passing to easy");
        // If we find no valid tiles we just pick a random tile (easy)
        easy();
}

function easy() {
        /*Algorithm for taking one turn under the Easy Difficulty AI written by Wyatt Payne 9/29/26*/
        //Keep randomly choosing squares until a valid one reached
        while (true) {
                //Get random row number
                let row = Math.floor(Math.random() * ROWS);
                //Get random collumn number
                let col = Math.floor(Math.random() * COLS);
                //If chosen square not flagged or revealed
                if (!flagGrid[row][col] && board[row][col] == 9) {
                        //Reveal randomly chosen grid square
                        handleReveal(row, col);
                        //End turn
                        break;
                }
        }
}

function aiPlayer(){
/*Game mode for AI gameplay written by Wyatt Payne 9/29/26*/
    //Resets the board and restarts the game
    newGame();
    //Sets the ai variable to true to track that the algorithm is playing
    ai = true;
    //Sets difficulty of AI to difficulty value of difficultySlider in index.html
    difficulty = Number(document.getElementById('difficultySlider').value);
    //Easy Difficulty
    if (difficulty == 0){
        //Plays until game won or lost
        while (winState == false && gameOver == false){
            //Algorithm for taking a turn in Easy difficulty
            easy();
        }
    //Medium Difficulty
    }else if (difficulty == 1){
        while (winState == false && gameOver == false){
            //Algorithm for taking a turn in Easy difficulty
            medium();
        }
    //Hard Difficulty
    }else{
        while (winState == false && gameOver == false){
            //Algorithm for taking a turn in Easy difficulty
            hard();
        }
    }
}

function tagTeam() {
        /*Game mode for player and AI turn alternating written by Wyatt Payne 9/29/26*/
        //Resets the board and restarts the game
        newGame();
        //Sets tag mode to true
        tag = true;
        //Sets difficulty of AI to difficulty value of difficultySlider in index.html
        difficulty = Number(document.getElementById("difficultySlider").value);
}

function updateDifficulty() {
        /*Function for updating text on difficulty slider in index.html
  written by Wyatt Payne 9/29/26*/
        //Sets difficulty to slider value (0,1,2)
        difficulty = Number(document.getElementById("difficultySlider").value);
        //0 is Easy, 1 is Medium, 2 is Hard
        let difficultyArray = ["Easy", "Medium", "Hard"];
        //Returns the string displayed in difficulty textContent in index.html
        return difficultyArray[difficulty];
}

function userPlayer() {
        /*Game mode for single user player written by Wyatt Payne 9/29/26*/
        //Resets the board and restarts the game
        newGame();
}

// start a user game when the page first loads (rpm 10.10)
newGame();

// ========================================================================================================================================