var ROWS = 10;
var COLS = 10;
var MAX_MINES = 20;
var MIN_MINES = 10;
var firstTurn = true;
var board, mineGrid, flagGrid, gameOver, winState, tag, difficulty;
var stopwatchInterval, stopwatchStart, revealAbilityAvailable, revealAbilityActive;

function initializeBoard(board){ //go thorugh every row and col, populating the board with 9s
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = 9;
        }
    }
    return board;
}
function initializeMineGrid(mineGrid) { //go thorugh every row and col, populating the board with false
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            mineGrid[row][col] = false;
        }
    }
    return mineGrid;
}

function initializeFlagGrid(flagGrid) { //go thorugh every row and col, populating the board with false
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            flagGrid[row][col] = false;
        }
    }
    return flagGrid;
}

function placeMines(mineGrid, mineCount) {
    let placedMines = 0;

    while (placedMines < mineCount) { 
        let row = Math.floor(Math.random() * ROWS); //get random row number
        let col = Math.floor(Math.random() * COLS); //ger random column number

        if (!mineGrid[row][col]) { //if theres not a mine there
            mineGrid[row][col] = true; //set cell to true
            placedMines++;
        }
    }
    return mineGrid;
}

function revealTile(board,mineGrid,row,col) {
    let adjacentMines = 0;
    if (mineGrid[row][col]) { // Check for mine
        if (firstTurn) { // Cannot hit mine on first turn.
            placeMines(mineGrid, 1);
            mineGrid[row][col] = false;
        }
        else {
            return 2; // Hit a mine.
        }
    }
    firstTurn = false;
    if (board[row][col] == 9) {
        for (let tiles = 0; tiles < 9; tiles++) { 
            //starting from top left, go through every adjacent tile
            let rowPos = row - 1 + Math.floor(tiles / 3); 
            let colPos = col - 1 + (tiles % 3);
            
            if ((rowPos >= 0 && rowPos < ROWS) && (colPos >= 0 && colPos < COLS) && mineGrid[rowPos][colPos]) //if tile in bounds and contains a mine
                adjacentMines++;
        }
        board[row][col] = adjacentMines;

        if (adjacentMines == 0) {//If user selects a tile with no near mines reveal surroundin tiles
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

function checkWin(board,mineGrid) { //Goes through the board to see if every non-mine cell has been revealed, signifying a win
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (!mineGrid[row][col] && board[row][col] == 9) {
                return false; //If a non-mine cell is not revealed, continue playing
            }
        }
    }
    return true; //If every non-mine cell has been revealed, the game has been won
}

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

    let mineCount = Number(document.getElementById('mineSlider').value);

    // prevent placing more flags than there are mines
    if (!flagGrid[row][col] && placedFlags >= mineCount) {
        return flagGrid;
    }

    flagGrid[row][col] = !flagGrid[row][col];
    return flagGrid;
}

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

    let mineCount = Number(document.getElementById('mineSlider').value);
    document.getElementById('flagCount').textContent = mineCount - placedFlags;
}

/*Functions for tracking game duration written by the Project 2 team 10/5/26*/
function updateStopwatch() {
    let elapsedSeconds = Math.floor((Date.now() - stopwatchStart) / 1000);
    let minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    let seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = minutes + ':' + seconds;
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
    updateStopwatch();
}

function activateRevealAbility() {
    if (gameOver || !revealAbilityAvailable) return;
    revealAbilityActive = !revealAbilityActive;
    document.getElementById('revealButton').textContent = revealAbilityActive ? 'Select 3x3 Area' : 'Use 3x3 Reveal';
}

function revealAbilityTile(row, col) {
    let adjacentMines = 0;
    for (let rowPos = row - 1; rowPos <= row + 1; rowPos++) {
        for (let colPos = col - 1; colPos <= col + 1; colPos++) {
            if (rowPos >= 0 && rowPos < ROWS && colPos >= 0 && colPos < COLS && mineGrid[rowPos][colPos]) {
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
            if (rowPos >= 0 && rowPos < ROWS && colPos >= 0 && colPos < COLS && !flagGrid[rowPos][colPos]) {
                if (mineGrid[rowPos][colPos]) {
                    flagGrid[rowPos][colPos] = true;
                } else if (board[rowPos][colPos] == 9) {
                    revealAbilityTile(rowPos, colPos);
                }
            }
        }
    }

    firstTurn = false;
    revealAbilityAvailable = false;
    revealAbilityActive = false;
    document.getElementById('revealButton').textContent = '3x3 Reveal Used';
    render();
    updateFlagCount();

    if (checkWin(board, mineGrid)) {
        gameOver = true;
        winState = true;
        stopStopwatch();
        render();
        document.getElementById('status').textContent = 'Game Over: You Win!';
    }
}

// Code chunk below replaces prompt-based input
// ========================================================================================================================================

function buildGrid() {
    const gameBoard = document.getElementById('board');
    gameBoard.innerHTML = ''; // clear previous game

    const headerRow = document.createElement('tr');
    const corner = document.createElement('th');
    headerRow.appendChild(corner);

    // add column labels A-J
    for (let col = 0; col < COLS; col++) {
        const th = document.createElement('th');
        th.textContent = String.fromCharCode(65 + col);
        headerRow.appendChild(th);
    }

    gameBoard.appendChild(headerRow);

    // create table rows and cells
    for (let row = 0; row < ROWS; row++) {
        const tr = document.createElement('tr');

        // add row labels 1-10
        const rowLabel = document.createElement('th');
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
			    return; //Replace with hard function
			}
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
            const td = document.getElementById('cell-' + row + '-' + col);
            const val = board[row][col];
            td.className = '';
            td.textContent = '';

            // flag
            if (val === 9) {
                if (flagGrid[row][col]) {
                    td.textContent = '🚩'; // changed F to be flag emoji
                } else if (winState && mineGrid[row][col]) {
                    td.textContent = '💣'; // If bombs unflagged after win, they're marked with bomb icon
                }
            // mine
            } else if (val === -1) {
                td.className = 'revlealed';
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

function revealAllMines() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (mineGrid[row][col]) {
                board[row][col] = -1; // -1 represents a mine
            }
        }
    }
}

function handleReveal(row, col) {
    if (gameOver) return;
    if (flagGrid[row][col]) return; // flagged cells cannot be revealed

    let revealResult = revealTile(board, mineGrid, row, col);
    render();

    // revealResult === 2 reprensents hitting a mine
    if (revealResult === 2) {
        gameOver = true;
        revealAllMines();
        render();
        stopStopwatch();
    } else if (checkWin(board, mineGrid)) {
        gameOver = true;
        winState = true;
        stopStopwatch();
        render(); //Re-renders board so show unflagged bombs
    }
    if (gameOver) {
        document.getElementById('status').textContent = `Game Over: You ${checkWin(board, mineGrid) ? "Win!" : "Hit a Mine..."}`;
    } else {
        document.getElementById('status').textContent = '';
    }
}

function handleDoubleReveal(row, col) { //Reveal surrounding tiles when a numbered tile is double-clicked
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
        document.getElementById('status').textContent = 'Game Over: You Hit a Mine...';
        return;
    }

    render();
    if (checkWin(board, mineGrid)) { //If all non-mine cells are revealed after the surrounding tiles are opened, the player wins
        gameOver = true;
        winState = true;
        stopStopwatch();
        render();
    }

    if (gameOver) {
        document.getElementById('status').textContent = `Game Over: You ${checkWin(board, mineGrid) ? "Win!" : "Hit a Mine..."}`;
    } else {
        document.getElementById('status').textContent = '';
    }
}

function handleFlag(row, col) {
    if (gameOver) return;
    flagGrid = flagCell(flagGrid, board, row, col); // Update the flagGrid
    render();
    updateFlagCount();
}

function newGame() {
    // Create 2D arrays for board, mineGrid, and flagGrid
    tag = false; //Automatically sets Tag-Team mode variable to false, will be set to true in tagTeam() function if Tag-Team mode is being played
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

    let mineCount = Number(document.getElementById('mineSlider').value); // gets selected mine count
    mineGrid = placeMines(mineGrid, mineCount); // place selected number of mines (1-20)

    firstTurn = true;
    gameOver = false;
    winState = false;
    revealAbilityAvailable = true;
    revealAbilityActive = false;
    document.getElementById('revealButton').textContent = 'Use 3x3 Reveal';
    stopwatchStart = Date.now();
    clearInterval(stopwatchInterval);
    stopwatchInterval = setInterval(updateStopwatch, 1000);
    updateStopwatch();
    buildGrid();
    render();
    updateFlagCount();
    document.getElementById('status').textContent = '';
}

/*
Algorithm for taking one turn under the Medium Difficulty AI

goes over all tiles one by one, if they are revealed we check if 
    1) the # of adjacent unrevealed tiles + flagged tiles = the # of adjacent bomb, if so, flag all adjacent tiles
    2) the # of adjacent flagged tiles = the # adjacent bombs, if so reveal all adjacent unflagged tiles
if we find no tiles that meet these rules, we just call the easy algorithm to reveal a random tile

- function and comment written by Ian Ruebelmann on 9/30/2026 @ 11:25pm
*/
function medium()
{
    for(let i = 0; i < ROWS; i++)
    {
        for(let j = 0; j < COLS; j++)
        {
            // if the tile is unrevealed we dont care about it
            if(board[i][j] != 9 && board[i][j] != 0)
            {
                let adjacentFlags = 0;
                let adjacentUnrevealedTiles = 0;
                for (let tiles = 0; tiles < 9; tiles++) { 
                    //starting from top left, go through every adjacent tile
                    let rowPos = i - 1 + Math.floor(tiles / 3); 
                    let colPos = j - 1 + (tiles % 3);
        
                    if ((rowPos >= 0 && rowPos < ROWS) && (colPos >= 0 && colPos < COLS))
                    {
                        if(flagGrid[rowPos][colPos])
                        {
                            adjacentFlags++; // Count flags
                        }  
                        else if(board[rowPos][colPos] == 9)
                        {
                            adjacentUnrevealedTiles++; // Count unrevealed tiles with no flags
                        }
                    }
                }
                if (adjacentUnrevealedTiles != 0)
                {
                    if(adjacentFlags == board[i][j])
                    {
                        // Reveal all adjacent unflagged tiles
                        for (let tiles = 0; tiles < 9; tiles++) { 
                            //starting from top left, go through every adjacent tile
                            let rowPos = i - 1 + Math.floor(tiles / 3); 
                            let colPos = j - 1 + (tiles % 3);

                            if ((rowPos >= 0 && rowPos < ROWS) && (colPos >= 0 && colPos < COLS))
                            {
                                if(board[rowPos][colPos] == 9 && !flagGrid[rowPos][colPos])
                                {
                                    handleReveal(rowPos, colPos);
                                }
                            }
                        }
                        return; // End Turn
                    }
                    else if (adjacentFlags + adjacentUnrevealedTiles == board[i][j])
                    {
                        // Flag all adjacent unflagged tiles
                        for (let tiles = 0; tiles < 9; tiles++) { 
                            //starting from top left, go through every adjacent tile
                            let rowPos = i - 1 + Math.floor(tiles / 3); 
                            let colPos = j - 1 + (tiles % 3);

                            if ((rowPos >= 0 && rowPos < ROWS) && (colPos >= 0 && colPos < COLS))
                            {
                                if(board[rowPos][colPos] == 9 && !flagGrid[rowPos][colPos])
                                {
                                    handleFlag(rowPos, colPos)
                                }
                            }
                        }
                        return; //End Turn
                    }
                }
            }
        }
    }
    // If we find no valid tiles we just pick a random tile (easy)
    easy();
}

function easy(){
/*Algorithm for taking one turn under the Easy Difficulty AI written by Wyatt Payne 9/29/26*/
    //Keep randomly choosing squares until a valid one reached
    while(true){
    	//Get random row number
    	let row = Math.floor(Math.random() * ROWS);
    	//Get random collumn number
    	let col = Math.floor(Math.random() * COLS);
    	//If chosen square not flagged or revealed
    	if (!flagGrid[row][col] && board[row][col] == 9){
            //Reveal randomly chosen grid square
	    handleReveal(row,col);
	    //End turn
	    break;
    	}
    }
}

function aiPlayer(){
/*Game mode for AI gameplay written by Wyatt Payne 9/29/26*/
    //Resets the board and restarts the game
    newGame();
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
        return; //Replace with a hard difficulty algorithm function
    }
}

function tagTeam(){
/*Game mode for player and AI turn alternating written by Wyatt Payne 9/29/26*/
    //Resets the board and restarts the game
    newGame();
    //Sets tag mode to true
    tag = true;
    //Sets difficulty of AI to difficulty value of difficultySlider in index.html
    difficulty = Number(document.getElementById('difficultySlider').value);
}

function updateDifficulty(){
/*Function for updating text on difficulty slider in index.html
  written by Wyatt Payne 9/29/26*/
    //Sets difficulty to slider value (0,1,2)
    difficulty = Number(document.getElementById('difficultySlider').value);
    //0 is Easy, 1 is Medium, 2 is Hard
    let difficultyArray = ['Easy', 'Medium', 'Hard'];
    //Returns the string displayed in difficulty textContent in index.html
    return difficultyArray[difficulty];
}

function userPlayer() {
/*Game mode for single user player written by Wyatt Payne 9/29/26*/
    //Resets the board and restarts the game
    newGame();
}

newGame();

// ========================================================================================================================================

