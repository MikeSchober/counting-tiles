'use strict';

///////
//GLOBAL VARS//

//holds playing status (bool)
//can likely remove... not using
// let game = true;

//holds current score (number)
//starts negative to offset the automatic updating of the random placing function at game initiation
let score = -70;

//holds high score, if user plays several times
let highScore = 0;

//holds gameboard tile value matrix (array and arrays)
let gameboard;

//holds the sum of each row in the gameboard tile value matrix
let rowSums;

//holds the gameboard tile object matrix
let gameTiles;

//holds the chosen index of the current tile object (the drawn tile)
let currTileInd;

//holds current tile object
let currTile;

//holds number of each acheived sequence (map... seq name:# of that seq)
//can likely delete... not using
// let sequences = new Map();

//holds all available tiles (array)
let allTiles;

//holds the total number of tiles created a game initiation
let tileNums;

//holds number of discarded tiles (number)
let discarded;

//holds number of placed tiles (number)
let placed = 0;

//holds the number of tiles remaining to be drawn
let remaining;

//holds id of user-clicked gameboard space
let space;

//holds number of completed rows of 21
let completedRows = 0;

//array to hold the status of the available bonuses
//defaults to zero for each
//changes to value of one if bonus should be active
//each time the user gets a completed row, need function that iterates through this array and changes the first occurring zero to a one
//need function to check this array and activate bonuses, as needed after each turn
let bonuses = [0, 0, 0, 0];

//holds the number of random tiles placed
let randTiles = 0;

//holds boolean value that determines whether or not randomly-drawn tiles are currently being placed at set interval
//default is true but set to false after initial gameboard set
let drawing = true;

//vars to hold status for toSelect functionality for bonus application

//for remove tile...
let rem = false;

//for change tile...
let chg = false;

//for wild tile...
let wld = false;

///

//holds the number of each bonus used

//tile discarded
let numDiscard = 0;

//tile removed
let numRemoved = 0;

//tile changed to 1
let numChanged = 0;

//wild tile
let numWild = 0;

///////



///////
//DOM ELEMENTS

//gamestart modal
let startModal = document.getElementById("introModal");

//start button in the gamestart modal
let startButton = document.getElementById("startPlay");

//game end modal
let endModal = document.getElementById("endModal");

//game end modal content
let endMsg = document.getElementById("finalScore");

//play again button in end modal
let againButton = document.getElementById("playAgain");

//holds the current tile display div in the html doc
let curr = document.getElementById("currTile");

//holds score display in the ui
let scr = document.getElementById("score");

let rs = document.getElementById("rowsDone");


//special power buttons!
//discard
let discard = document.getElementById("discard");

//remove
let remove = document.getElementById("remove");

//change to 1
let change = document.getElementById("change");

//wild card tile
let wild = document.getElementById("wild");

//array that holds all selected buttons abv
//created so that we can iterate through them to activate/deactivate
let powers = [discard, remove, change, wild];

///////




///////
//EVENT LISTENERS

//modal listeners
startButton.addEventListener('click', startRandom);

againButton.addEventListener('click', gameReset);

//event listener for general click
//toSelect() callback function uses event.target to get the id from the clicked element and, if it is a <TH> element, displays a modal to show that column's taf data
document.addEventListener('click', toSelect);

//event listeners for clicked special powers buttons!
discard.addEventListener('click', pOne);
remove.addEventListener('click', pTwo);
change.addEventListener('click', pThree);
wild.addEventListener('click', pFour);

///////


///////
//CLASS DEFINITIONS

//tile class
class Tile {
    constructor(id, value, moved, combined, combo, newValue, image) {
        this.id = id;
        this.value = value;
        this.moved = moved;
        this.combined = combined;
        this.combo = combo;
        this.newValue = newValue;
        this.image = image;
    }
};


///////


///////
//FUNCTION DEFINITIONS


//callback function to take the id from the table DIV that is clicked and for use in updating the gameboard matrix
//when user clicks empty div, the current tile is assigned there
//the gameboard matrix updates and the gameboard displays that tile at that location
//if user clicks div with img already in it, nothing happens

//this basically allows us to add functionalty to a dom element that isnt created at the start of the doc...
//can also use this function to display/hide the extra info section
function toSelect(event) {
    let element = event.target

    if (element.tagName != 'IMG' && element.className === 'cell' && wld === false) {

        console.log(`tile assigned!`);

        //assigned cell id to the space var for use in updating the gameboard tile values and tile objects matrices
        space = element.id;

        //placing the currTile on the clicked space on the gameboard
        let placeTile = `<img src="${currTile.image}" alt="CURRENT TILE" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${currTile.id}">`;
        element.insertAdjacentHTML("afterbegin", placeTile);

        //updating the gameboard tile values matrix
        gameboard[space[1]][space[3]] = currTile.value;

        //updating the gameboard tile objects matrix
        gameTiles[space[1]][space[3]] = currTile;

        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        showSums(rowSums);

        //updating the placed tile counter
        placed++;
        console.log(`number of placed tiles: ${placed}`);

        //updating the discarded tile count
        discarded = tileNums - (allTiles.length + placed);
        console.log(`discarded: ${discarded}`);

        //updating the user's current score
        score = score + 10;
        //<h3 class="score">Current score: </h3>

        //updating the score disolay in the ui
        let viewScore = `<h1>${score}</h1>`;
        scr.removeChild(scr.children[0]);
        scr.insertAdjacentHTML("afterbegin", viewScore);

        //check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
        checkSum(rowSums, gameTiles, gameboard, 6);

        //checking for game end
        checkEnd();

        //removing the currTile from the current tile display so that the next tile can be shown
        curr.removeChild(curr.firstChild);

        //next random tile index chosen
        currTileInd = drawIndex(allTiles.length);

        //next tile drawn
        currTile = allTiles[currTileInd];

        //removing the drawn tile from the tile bag
        allTiles = rmvTile(allTiles, currTileInd);

        //displaying the next tile
        dispTile();

        //total number of remaining tiles to be drawn is updated
        remaining = allTiles.length;
        console.log(`tiles remaining to be drawn: ${remaining}`);

        //places random tile on board
        setTimeout(placeRandom, 3000);

    } else if (element.tagName === 'IMG' && element.className === 'pTile' && rem === true) {

        //functionality for remove clicked tile
        console.log(`remove!`);

        console.log(`target parent element id: ${element.parentElement.id}`);

        //updates the tile values matrix to zero for the removed tile
        gameboard[Number(element.parentElement.id[1])][Number(element.parentElement.id[3])] = 0;

        //updates the tile objects matrix to undefined for the removed tile
        gameTiles[Number(element.parentElement.id[1])][Number(element.parentElement.id[3])] = undefined;

        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        showSums(rowSums);

        //removes the tile image from the gameboard
        element.remove();


        //resets the var value
        rem = false;

        //disables the button again
        remove.disabled = true;

    } else if (element.tagName === 'IMG' && element.className === 'pTile' && chg === true) {

        //functionality for change clicked tile to 1
        console.log(`change!`);


        //updates the tile values matrix to one for the chosen tile
        gameboard[Number(element.parentElement.id[1])][Number(element.parentElement.id[3])] = 1;

        //updates the tile objects matrix object for the chosen tile
        //value and image props change
        //value prop...
        gameTiles[Number(element.parentElement.id[1])][Number(element.parentElement.id[3])].value = 1;

        //image prop...
        gameTiles[Number(element.parentElement.id[1])][Number(element.parentElement.id[3])].image = `images/1.png`;


        //adds the new img
        let one = `<img src="images/1.png" alt="special tile" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${gameTiles[Number(element.parentElement.id[1])][Number(element.parentElement.id[3])].id}">`;

        //inserts the new tile img into the dragged tile's orig position on the gamebaord
        element.parentElement.insertAdjacentHTML("afterbegin", one);

        //removes the tile image from the gameboard
        element.remove();


        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        showSums(rowSums);

        //check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
        checkSum(rowSums, gameTiles, gameboard, 6);

        //resets the var
        chg = false;

        //disables the button again
        change.disabled = true;

    } else if (element.tagName != 'IMG' && element.className === 'cell' && wld === true) {

        //functionality for wild tile (completes the row its in which it's placed)
        console.log(`wild card!`);

        console.log(`element id for wild!!!: ${element.id}`);

        //placing the currTile on the clicked space on the gameboard
        let placeWild = `<img src="images/wild.png" alt="WILD TILE" draggable="true" ondragstart="dragTile(event)" class="pTile">`;
        element.insertAdjacentHTML("afterbegin", placeWild);

        //changes the value of the row in the rowSums matrix to 21
        rowSums[Number(element.id[1])] = 21;

        console.log(`row sums! : ${rowSums}`);

        //displaying the row sums in the UI
        showSums(rowSums);

        //clears the completed row of the tile values matrix
        clrValRow(gameboard, Number(element.id[1]), 6);

        //clears the completed row of the tile objs matrix
        clrObjRow(gameTiles, Number(element.id[1]), 6);

        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        showSums(rowSums);

        //updating the user's current score... adds 21 pts!
        score = score + 350;

        //updating the number of completed rows in the var
        completedRows++;

        //updating the completed rows count in the ui
        let viewRows = `<p>${completedRows}<p>`;
        rs.removeChild(rs.children[0]);
        rs.insertAdjacentHTML("afterbegin", viewRows);


        //updating the score disolay in the ui
        let viewScore = `<h1>${score}</h1>`;
        scr.removeChild(scr.children[0]);
        scr.insertAdjacentHTML("afterbegin", viewScore);

        ///setTimeout function calls function to clear the row in the ui after 3 seconds...
        setTimeout(clrUserRow, 3000, Number(element.id[1]), 6);


        //resets the var
        wld = false;

        //disables the button again
        wild.disabled = true;


    }
};


//function to generate all tiles and return them in an array
//take as arg... distribution, in order, by number (dist is array containing the number of tiles desired, in order, one-the last tile number desired (currently 14). so currently index zero through index 13 in the passed-in array)
function genTiles(dist) {

    //counter that holds latest tile id (starts at zero)
    let ident = 0;

    //holds current value being assigned
    let val = 0;

    //holds array of all generated tiles... this is what is returned
    let tileBag = [];

    //UPDATED THIS FOR NEW DISTRIBUTION (1-14)
    //iteration to generate the specified number of tiles by number
    //iterates through the dist array, producing the specified number of tile objects for each number (1-14)
    for (let x of dist) {

        val++;
        console.log(`CURRENT VALUE BEING ASSIGNED: ${val}`);

        //for each number, creates the specified number of tile objects and adds them to the t array that will be returned
        for (let i = 0; i < x; i++) {

            //increments counter
            ident++;
            console.log(`current id: ${ident}`);

            //creating new tile
            let t = new Tile(ident, val, false, false, 0, 0, `images/${val}.png`);

            //pushing new tile into the tile bag
            tileBag.push(t);

        }

    }

    console.log(`GEN TILE STATS!!!`);
    console.log(`TOTAL NUMBER OF TILES GENERATED: ${tileBag.length}`);
    console.log(`DISTRIBUTION ENTERED: ${dist}`);

    return tileBag;

}


//draws current tile
//generates random number between 0 and the length of the allTiles array and returns that number for use in assigning that tile object as the current tile
//takes the length of the allTiles array as arg (l is number)
function drawIndex(l) {

    //generates random number (integer) between 0 and the length of the allTiles array (not inclusive of l)
    //for example, a value of l produces a random number between 0-77
    //this is by intention as it goes with the INDEXES of the allTiles array (first index to last index)
    let rand = Math.floor(Math.random() * l)
    return rand;

};


//displays image of current tile
function dispTile() {

    let ins = `<img src="${currTile.image}" alt="CURRENT TILE" class="cTile">`;
    curr.insertAdjacentHTML("afterbegin", ins);

};


//removes drawn tile from the tile bag
//takes the allTiles array and the index of the drawn tile as arg (number)
function rmvTile(tls, tileInd) {

    //using the splile method to remove the chosen index from the tile bag
    tls.splice(tileInd, 1);

    //returns an updated array with th drawn tile removed
    return tls;
};



//testing my random number logic...
/*
let inc = 0;

//testing my random number code
for (let i = 0; i < 100; i++) {

    inc = inc + .012;
    console.log(`inc = ${inc}`);

    console.log(`iteration number: ${i}`);
    console.log(`random num: ${Math.floor(inc * i)}`);

}
*/


//creates the gameboard tile values matrix
//takes numbers of rows and columns as args (numbers)
function makeMatrix(rows, cols) {

    //holds gameboard values matrix to be returned
    let matx = [];

    for (let i = 0; i < rows; i++) {

        //pushes an array to the matx array for each row
        matx.push([]);

        for (let y = 0; y < cols; y++) {

            //pushes a 0 to the i index of the matx array for each column
            matx[i].push(0);
        }
    }

    //returns the matrix (defaults to a value of zero for each cell)
    //[[0, 0, 0],[0, 0, 0], etc.]
    return matx;
};


//creates the gameboard tile objects matrix
//takes numbers of rows and columns as args (numbers)
function makeObjMatrix(rows, cols) {

    //holds gameboard values matrix to be returned
    let matx = [];

    for (let i = 0; i < rows; i++) {

        //pushes an array to the matx array for each row
        matx.push([]);

        for (let y = 0; y < cols; y++) {

            //pushes a 0 to the i index of the matx array for each column
            matx[i].push(undefined);
        }
    }

    //returns the matrix (defaults to a value of undefined (falsy value) for each cell)
    //[[undefined, undefined, undefined],[undefined, undefined, undefined], etc.]
    return matx;
};


//adds up all the values in each row of the gameboard matrix
//takes the gameboard matrix as arg (array)
//returns an array of the sum of each row in order from top to bottom (row 0 to last row... whatever that is)
function rowValues(theBoardValues) {

    //holds array to the returned (each value in the array in the sum of the corresponding row... top row (index 0 in the gameboard tile values matrix) first, through the bottom row (last index))
    let sums = [];

    //for each row of the gameboard tile values matrix...
    for (let i of theBoardValues) {

        //holds current row total
        let ttl = 0;

        //for each column in the row...
        for (let y of i) {

            ttl += y;

        }

        sums.push(ttl);

    }

    //returns array that holds the sum of each row in the gameboard tile values matrix
    return sums;
};


//displays updated row sums in the UI
//takes the row sums array as arg (array)
function showSums(theSums) {


    //iterates through the row sums array and adds the value to the corresponding row total id in the html doc
    for (let i = 0; i < theSums.length; i++) {

        let s = document.getElementById(`t${i}`);

        //if the is a firstchild value in s...
        if (s.firstChild) {

            //removing the value from the div so that the sum can be updated
            s.removeChild(s.firstChild);

        };

        //inserting the corresponding sum into s(the row ttl cell)
        let rowTtl = `<h3>${theSums[i]}</h3>`;
        s.insertAdjacentHTML("afterbegin", rowTtl);

    }

};


//messed with the clrUserRow() function when added wild tile functionality... if error when clearing user row for actual full row, check here first!!!

//function to clear a completed row in the ui
//takes as args the index of the row to clear (number) and the number of columns in the table (number)
function clrUserRow(rowInd, colmns) {

    //clear row by selecting each child element of the row div
    //document.getElementById("currTile");
    //bc we have the row index of the row to clear, we can use string literals to grab each div id in the row to clear it
    for (let c = 0; c < colmns; c++) {

        //clearing the completed row in the ui

        //selects the current cell of the row we are clearing
        let currC = document.getElementById(`[${rowInd},${c}]`)

        //checking for children (had to add this logic when added this function to the special powers for wild tile)
        if (currC.hasChildNodes()) {

            //removes the img from the cell
            currC.removeChild(currC.firstChild);

        }

    }

};


//function to clear a completed row in tile obj matrix
//takes as args the tile obj matrix (array), the index of the row to clear (number), and the number of columns in the table (number)
function clrObjRow(tObjs, rowInd, colmns) {

    //holds the updated matrix to return
    // let updatedObjMatx = tObjs;

    for (let c = 0; c < colmns; c++) {

        //clearing the completed row in the tile objects matrix
        tObjs[rowInd][c] = undefined;

    }

    // return updatedObjMatx;

};


//function to clear a completed row in the tile values matrix
//takes as args the tile values matrix (array), the index of the row to clear (number), and the number of columns in the table (number)
function clrValRow(tVals, rowInd, colmns) {

    //holds the updated matrix to return
    // let updatedValMatx = tVals;


    for (let c = 0; c < colmns; c++) {

        //clearing the completed row in the tile values matrix

        //setting the value back to the default of zero
        tVals[rowInd][c] = 0;

    }

    // return updatedValMatx;

};



//function to check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again. (this logic will need to run after a tile is placed, moved, or combined (when i write the logic for tiles to be combined))
//takes the rowSums array as arg and both matrices as args (arrays), as well as the number of columns currently in the gameboard (number)
function checkSum(sArr, tObjs, tVals, cols) {

    //holds bool to indicate whether or not the row in the tile objs array is full (no undefined)
    let fullRow;

    //checking for value of 21 in the sums array
    for (let y = 0; y < sArr.length; y++) {

        fullRow = true;

        //if the row sum is 21...
        if (sArr[y] === 21) {

            //for loop to check for full row
            for (let x of gameTiles[y]) {

                if (x === undefined) {

                    fullRow = false;
                    console.log('broke from for of loop');
                    break;
                }
            };

            //and if the row is completely full...
            if (fullRow === true) {

                //clears the completed row of the tile values matrix
                // gameboard = clrValRow(tVals, y, cols);
                clrValRow(tVals, y, cols);

                //clears the completed row of the tile objs matrix
                // gameTiles = clrObjRow(tObjs, y, cols);
                clrObjRow(tObjs, y, cols);

                //updating the array that holds the sum of each row's tile values
                rowSums = rowValues(gameboard);

                //displaying the row sums in the UI
                showSums(rowSums);

                //updating the user's current score... adds 21 pts!
                score = score + 350;

                //updating the number of completed rows in the var
                completedRows++;

                //updating the completed rows count in the ui
                let viewRows = `<p>${completedRows}<p>`;
                rs.removeChild(rs.children[0]);
                rs.insertAdjacentHTML("afterbegin", viewRows);

                //updating the score disolay in the ui
                let viewScore = `<h1>${score}</h1>`;
                scr.removeChild(scr.children[0]);
                scr.insertAdjacentHTML("afterbegin", viewScore);

                //updates the bonuses array
                updateBonus(bonuses);

                //actives the bonuses as needed
                actBonus(bonuses, powers);


                //style it with special style for 3 seconds...
                //come back to this...
                //add background color to the total column of the completed row
                //in the setTimeout function, add functionality for the total column in the row to reset to its default background color

                ///setTimeout function calls function to clear the row in the ui after 3 seconds...
                setTimeout(clrUserRow, 3000, y, cols);

                console.log('broke from the for loop after clring');
                //break out of the for loop
                break;


            }

        }

    }

};


//function that iterates through the bonuses array each time the user gets a completed row and changes the first occurring zero to a one
//updates the first value in the array that is a zero to a one (top-bottom of the button stack)
//arg is the bonuses array
//updates it in-place
function updateBonus(b) {

    for (let x = 0; x < b.length; x++) {

        if (b[x] === 0) {

            b[x] = 1;
            break
        }
    }

    return b;

};


//function to check the bonus array and activate bonuses, as needed after each turn
//takes as args the bonuses array (holds bonus status) and the powers array (hold buttons)
function actBonus(b, p) {

    for (let x = 0; x < b.length; x++) {

        //if bonus is active, activate button for use
        if (b[x] === 1) {

            p[x].disabled = false;

        }

    }

};

//function to check for game end
//checks for zeroes in the gameboard matrix. if hits a zero, returns from function. otherwise, game over.
//need to be done after each tile is placed (randomly or manually)
//displays game end modal when it finds full board
function checkEnd() {

    //checking for game end... checks for full gamebaord
    for (let x of gameboard) {

        for (let y of x) {

            if (y === 0) {

                console.log(`not complete`);
                return;

            }

        }

    }

    //executes if there are no zeros in the gameboard matrix... displays game end modal

    //stops the random placements
    drawing = false;

    //records score as high score if it's higher than current
    if (score > highScore) {
        highScore = score;
    };

    //updating the modal to show the final score
    let endScore = `<div><h3>Game over!</h3>
        <br>
        <h4>Final score: ${score}</h4>
        <br>
        <h3>Nice job!</h3>
        <br></div>`;
    endMsg.removeChild(endMsg.children[0]);
    endMsg.insertAdjacentHTML("afterbegin", endScore);


    //displaying the modal
    endModal.classList.remove('hidden');

    console.log(`game end!`);

};


//function to reset the game
function gameReset() {

    //score reset
    score = -100;

    //holds the number of random tiles placed
    randTiles = 0;

    //tile bag created
    //UPDATED TO CREATE NEW DISTRIBUTION (1-14)
    allTiles = genTiles([10, 12, 10, 12, 10, 12, 7, 12, 9, 9, 7, 12, 7, 7]);

    //old dist... too hard
    //2, 2, 3, 4, 5, 7, 7, 7, 6, 6, 5, 4, 3, 3

    //total number of generated tiles is stored (number)
    tileNums = allTiles.length;

    //creating the gameboard tile values matrix (default is 7 rows, 6 cols)
    gameboard = makeMatrix(7, 6);

    //creating the gameboard tile objects matrix (default is 7 rows, 6 cols) 
    gameTiles = makeObjMatrix(7, 6);

    //clearing the gameboard ui
    for (let a = 0; a < gameboard.length; a++) {

        clrUserRow(a, 6);

    };


    //creating the array that holds the sum of each row's tile values
    rowSums = rowValues(gameboard);

    //displaying the row sums in the UI
    showSums(rowSums);


    //drawing true so that it can place the random starting tiles
    drawing = true;

    //places set number of random tiles to start the game
    for (let i = 0; i < 7; i++) {

        placeRandom()
        console.log(`placing beginning tile ${i}`);

    };

    //sets drawing back to false once gameboard set
    drawing = false;


    //resetting the score disolay in the ui
    let viewScore = `<h1>${score}</h1>`;
    scr.removeChild(scr.children[0]);
    scr.insertAdjacentHTML("afterbegin", viewScore);

    //holds number of placed tiles (number)
    placed = 0;

    //holds number of completed rows of 21
    completedRows = 0;

    //array to hold the status of the available bonuses
    //defaults to zero for each
    //changes to value of one if bonus should be active
    //each time the user gets a completed row, need function that iterates through this array and changes the first occurring zero to a one
    //need function to check this array and activate bonuses, as needed after each turn
    bonuses = [0, 0, 0, 0];

    //disabling all bonus buttons again
    discard.disabled = true;
    remove.disabled = true;
    change.disabled = true;
    wild.disabled = true;

    //bonus tracking reset
    //tile discarded
    numDiscard = 0;

    //tile removed
    numRemoved = 0;

    //tile changed to 1
    numChanged = 0;

    //wild tile
    numWild = 0;


    //presenting the discarded tile count at zero
    discarded = tileNums - (allTiles.length + placed);

    //removing the currTile from the current tile display so that the next tile can be shown
    curr.removeChild(curr.firstChild);

    //random tile index chosen
    currTileInd = drawIndex(allTiles.length);

    //current tile drawn
    currTile = allTiles[currTileInd];

    //removing the drawn tile (current tile) from the tile bag
    allTiles = rmvTile(allTiles, currTileInd);

    //displaying the current tile
    dispTile();

    //total number of remaining tiles to be drawn is initiated
    remaining = allTiles.length;
    console.log(`tiles remaining to be drawn: ${remaining}`);

    //displays modal to start game again
    endModal.classList.add('hidden')
    startModal.classList.remove('hidden');

};


//callback functions for the bonus buttons!!!

//discard current tile and deactivate the button
//takes no args... just executes the discard/draw functionality
function pOne() {

    //removing the currTile from the current tile display so that the next tile can be shown
    curr.removeChild(curr.firstChild);

    //next random tile index chosen
    currTileInd = drawIndex(allTiles.length);

    //next tile drawn
    currTile = allTiles[currTileInd];

    //removing the drawn tile from the tile bag
    allTiles = rmvTile(allTiles, currTileInd);

    //displaying the next tile
    dispTile();

    //total number of remaining tiles to be drawn is updated
    remaining = allTiles.length;
    console.log(`tiles remaining to be drawn: ${remaining}`);

    //updating the discarded tile count (plus one bc the current tile is not included in the allTiles array)
    discarded = tileNums - (allTiles.length + placed + 1);
    console.log(`discarded: ${discarded}`);

    //increments the bonus count
    numDiscard++;

    //updates the bonuses array
    bonuses[0] = 0;

    //disables the button
    discard.disabled = true;

};



//remove any tile and deactivate the button
function pTwo() {

    //enables the functionality within the toSelect function
    rem = true;

    //ensures that the other two special power functionality are disbaled
    chg = false;
    wld = false;

    //updates the bonuses array
    bonuses[1] = 0;

    //increments the bonus count
    numRemoved++;

};


//change any tile value to 1 and deactivate the button
function pThree() {

    //enables the functionality within the toSelect function
    chg = true;

    //ensures that the other two special power functionality are disbaled
    rem = false;
    wld = false;

    //updates the bonuses array
    bonuses[2] = 0;

    //increments the bonus count
    numChanged++;

};


//wild cald tile---complete any row and deactivate the button
function pFour() {

    //enables the functionality within the toSelect function
    wld = true;

    //ensures that the other two special power functionality are disbaled
    rem = false;
    chg = false;

    //updates the bonuses array
    bonuses[3] = 0;

    //increments the bonus count
    numWild++;

};

///

///
//iterates through the tile values array to create an array of coordinates for all the open spaces. coords are held in an array of strings to work with the IDs in the html doc (ex: '[1,2]')
//takes tile values array as arg (v === tile values array)
//returns an array of coordinates in string form of all open spaces on the gameboard
function findOpen(v) {

    //array to return
    let open = [];

    //iterates through the tile values array, looking for all zeroes to grab coords of all open spaces
    for (let a = 0; a < v.length; a++) {

        for (let x = 0; x < v[a].length; x++) {

            if (v[a][x] === 0) {

                open.push(`[${a},${x}]`)

            }

        }

    }

    return open;

};



///



///callback function for placing random tile
//will get called by setTimeout() at 20 second intervals to place random tile on the gameboard
//could add if statement within this function to allow pause functionality... left out for now
function placeRandom() {

    //could always add if statement --- if (drawing === true) {then all the code in this function executes... this would allow us to pause the auto-placement functionality before/during gameplay}
    if (drawing === true) {

        //draws random tile

        //random tile index chosen
        let randChoice = drawIndex(allTiles.length);

        //next tile drawn
        let r = allTiles[randChoice];

        //removing the drawn tile from the tile bag
        allTiles = rmvTile(allTiles, randChoice);

        //total number of remaining tiles to be drawn is updated
        remaining = allTiles.length;
        console.log(`tiles remaining to be drawn: ${remaining}`);


        //iterates through the tile values array to create an array of coordinates for all the open spaces. coords are held in an array of strings to work with the IDs in the html doc (ex: '[1,2]')
        let allOpen = findOpen(gameboard);

        //generates random number between zero and the length of the coords array
        // drawIndex(allOpen.length);


        //grabs the coordinates at the random number's index in the coords array
        let c = allOpen[drawIndex(allOpen.length)];

        console.log(`chosen coords: ${c}`);

        //grabs div at the chosen coords
        let tgt = document.getElementById(c);

        //as long as the cell does not already contain a tile, places the chosen tile at the chosen location on the ui
        if (tgt.hasChildNodes() === false) {

            //placing the currTile on the clicked space on the gameboard
            let placingRandom = `<img src="images/r${r.value}.png" alt="random tile" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${r.id}">`;
            tgt.insertAdjacentHTML("afterbegin", placingRandom);

            //updates random tile counter
            randTiles++;
            console.log(`number of random tiles placed: ${randTiles}`);

            //updating the gameboard tile values matrix
            gameboard[c[1]][c[3]] = r.value;

            //updating the gameboard tile objects matrix
            gameTiles[c[1]][c[3]] = r;

            //updating the array that holds the sum of each row's tile values
            rowSums = rowValues(gameboard);

            //displaying the row sums in the UI
            showSums(rowSums);

            //updating the user's current score
            score = score + 10;
            //<h3 class="score">Current score: </h3>

            //updating the score disolay in the ui
            let viewScore = `<h1>${score}</h1>`;
            scr.removeChild(scr.children[0]);
            scr.insertAdjacentHTML("afterbegin", viewScore);


            //check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
            checkSum(rowSums, gameTiles, gameboard, 6);

            //checking for game end
            checkEnd();


        } else {

            placeRandom();
        }

    } else {

        return;

    }

};


//the abv function will be called by setTimesout() to place random tiles at set intervals during gameplay and it will also be called nine times at game initiation to place nine tiles randomly before game start

//function to start the placing of random tiles (startgame)
function startRandom() {

    drawing = true;
    startModal.classList.add('hidden');

};



///////





//functions for moving and combining tiles

//holds the original location of the tile being moved (string)
//string bc it comes from the dragTile(e) function, taking the location from id of the parent div of the img being moved
let origLoc;

//function to be executed when a tile img is grabbed and begins moving
function dragTile(e) {

    origLoc = e.target.parentElement.id;

    console.log(`parent element id (orig loc): ${e.target.parentElement.id}`);
    e.dataTransfer.setData("text", e.target.id)

};

//function to enable the drop
function allowDropTile(e) {
    e.preventDefault()

};

//function to execute the drop
function dropTile(e) {

    console.log(`target id (should be location from html): ${e.target.id}`);
    console.log(`target parent element id: ${e.target.parentElement.id}`);


    //if the e.target.id (the div) already contains an img, then execute the combine test logic
    if (e.target.tagName === 'IMG') {


        //if the div contains an img already, the target.id now becomes the img id. bc we need the div id, we need to call e.target.parentElement.id in these situations. thus, must run the checkAdjacent function seperately for the combining and the moving scenarios...
        if (checkAdjacent(origLoc, e.target.parentElement.id)) {


            //if the tile obj in the original loc has not yet been combined (dragging into another tile) or moved...
            //on adding the random tile placement functionality, took out the restriction that stopped user from moving and then combining tiles
            //user can now move and then combine tiles, but cannot combine and then move. once a tile is combined, it cannot be moved or further changed
            if (gameTiles[origLoc[1]][origLoc[3]].combined === false) {


                //combine tile logic here
                //function to take the ids from both the starting div and the drop target div and to use those id (location) values to take the tile values from the tile values matrix and determine the combined value (9/3 or 4/2)... this then returns the value for use in calling the new img name for the tile display in the original location
                //basically... user can combined a 9 into a 3 to change the 9 into a 3, or can combined a 4 into a 2 to change the 4 into a 2... psbly will change this later to allow combining any tile that is divisible by another tile value except for one

                //if the checkCombine function results in an allowable result (not zero), then the combine logic excutes here...

                //holds the resulting number from the combo (only allowable if the result is not zero... see checkCombine for the specific logic)
                let cmbValue = checkCombine(origLoc, e.target.parentElement.id, gameboard);

                //if cmbValue is anything but zero, the combine operation is allowed...
                if (cmbValue != 0) {

                    //logic for combining tiles

                    //delete the img in the origLoc div and replace it with the new/combine value's img

                    //deletes the orig img
                    document.getElementById(origLoc).removeChild(document.getElementById(origLoc).firstChild);

                    //adds the new img
                    let cmbTile = `<img src="images/${cmbValue}cmb.png" alt="combined tile" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${gameTiles[origLoc[1]][origLoc[3]].id}">`;

                    //inserts the new tile img into the dragged tile's orig position on the gamebaord
                    document.getElementById(origLoc).insertAdjacentHTML("afterbegin", cmbTile);


                    //in the tile objs matrix, for the obj at the origLoc, set the combined property = true and the newValue = new combined value
                    //also changes the moved property to true to prevent subsequent moving (may change this later)
                    //also changes the img path to the correct img
                    gameTiles[origLoc[1]][origLoc[3]].combined = true;
                    gameTiles[origLoc[1]][origLoc[3]].moved = true;
                    gameTiles[origLoc[1]][origLoc[3]].newValue = cmbValue;
                    gameTiles[origLoc[1]][origLoc[3]].image = `images/${gameTiles[origLoc[1]][origLoc[3]].newValue}cmb.png`;


                    //in the tile values matrix, for the obj at origLoc, set the value to the new combined value
                    gameboard[origLoc[1]][origLoc[3]] = cmbValue;

                    //updating the array that holds the sum of each row's tile values
                    rowSums = rowValues(gameboard);

                    //displaying the row sums in the UI
                    showSums(rowSums);

                    //check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
                    checkSum(rowSums, gameTiles, gameboard, 6);

                    //currently, combining tiles allows the discard of the currently-drawn tile... may change this... to change just remove the following code lines to the end of this block...

                    //removing the currTile from the current tile display so that the next tile can be shown
                    curr.removeChild(curr.firstChild);

                    //next random tile index chosen
                    currTileInd = drawIndex(allTiles.length);

                    //next tile drawn
                    currTile = allTiles[currTileInd];

                    //removing the drawn tile from the tile bag
                    allTiles = rmvTile(allTiles, currTileInd);

                    //displaying the next tile
                    dispTile();

                    //total number of remaining tiles to be drawn is updated
                    remaining = allTiles.length;
                    console.log(`tiles remaining to be drawn: ${remaining}`);

                    //updating the discarded tile count
                    //plus one here bc the currently-drawn tile is not included in the allTiles bag or the number of placed tiles
                    discarded = tileNums - (allTiles.length + placed + 1);
                    console.log(`discarded: ${discarded}`);

                    //places random tile on board
                    // setTimeout(placeRandom, 3000);

                }


            }


        }


    } else {

        //if the game tile has not been moved yet...
        if (gameTiles[origLoc[1]][origLoc[3]].moved === false) {

            //and...
            //logic to check for adjacent position. if adjacent...
            if (checkAdjacent(origLoc, e.target.id)) {

                //else... execute the tile moving logic...

                //if adjacent, the drop executes...
                e.preventDefault();
                let d = e.dataTransfer.getData("text");
                e.target.appendChild(document.getElementById(d));

                //logic to update the picture styling
                e.target.firstChild.src = `images/${gameTiles[origLoc[1]][origLoc[3]].value}mvd.png`;

                //logic to update the matrices

                //tile values matrix updated
                gameboard = updateMatx(gameboard, origLoc, e.target.id, 0);

                //logic to update the .moved property in the tile object in the gameTiles matrix
                gameTiles[origLoc[1]][origLoc[3]].moved = true;

                //logic to update the image property in the tile object in the gameTiles matrix
                gameTiles[origLoc[1]][origLoc[3]].image = `images/${gameTiles[origLoc[1]][origLoc[3]].value}mvd.png`;

                //tile objects matrix updated
                gameTiles = updateMatx(gameTiles, origLoc, e.target.id, undefined);

                //updating the array that holds the sum of each row's tile values
                rowSums = rowValues(gameboard);

                //displaying the row sums in the UI
                showSums(rowSums);

                //check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
                checkSum(rowSums, gameTiles, gameboard, 6);

                //bc moving or combining a tile results in the currently-drawn tile to be discarded, the currently-drawn tile is removed and the next tile is drawn...

                //removing the currTile from the current tile display so that the next tile can be shown
                curr.removeChild(curr.firstChild);

                //next random tile index chosen
                currTileInd = drawIndex(allTiles.length);

                //next tile drawn
                currTile = allTiles[currTileInd];

                //removing the drawn tile from the tile bag
                allTiles = rmvTile(allTiles, currTileInd);

                //displaying the next tile
                dispTile();

                //total number of remaining tiles to be drawn is updated
                remaining = allTiles.length;
                console.log(`tiles remaining to be drawn: ${remaining}`);

                //updating the discarded tile count
                //plus one here bc the currently-drawn tile is not included in the allTiles bag or the number of placed tiles
                discarded = tileNums - (allTiles.length + placed + 1);
                console.log(`discarded: ${discarded}`);

                //disabled for now... too many tiles with this
                //places random tile on board
                // setTimeout(placeRandom, 3000);

            }


        }

    }



};


//function to check as to whether or not two locations are adjacent to each other
//takes as args the string representations of the locations, taken from the ids of the div elements in the html doc (ex: "[5,0]")
//returns true or false
function checkAdjacent(start, stop) {

    //holds bool value to return
    let adj;

    console.log(`stop passed-in: ${stop}`);

    //holds indices of the starting position
    //cast into number data type
    let startY = Number(start[1]);
    let startX = Number(start[3]);

    //holds indices of the proposed ending position
    //cast into number data type
    let stopY = Number(stop[1]);
    let stopX = Number(stop[3]);

    console.log(`starting pos:`);
    console.log(`row: ${startY}`);
    console.log(`col: ${startX}`);

    console.log(`ending pos:`);
    console.log(`row: ${stopY}`);
    console.log(`col: ${stopX}`);

    //bc one of the values between the start position and the stop posiiton have to be the same between the two, we look for that first
    if (startY === stopY) {

        //if that is satisfied with the proposed move, the other value in the new position must be plus or minus one from its original value
        if (stopX === startX + 1 || stopX === startX - 1) {

            adj = true;

        }

    } else if (startX === stopX) {

        //if that is satisfied with the proposed move, the other value in the new position must be plus or minus one from its original value
        if (stopY === startY + 1 || stopY === startY - 1) {

            adj = true;

        }

    } else {

        adj = false;

    }

    return adj;

};


//function to update the matrices
//takes as args... matrix to be updated (array), two locations that are changing (indices in str representation of array from the html doc), new value for location one (0 for the tile values array, undefined for the tile objects array) 
//it just moves the value from location one to location two by default
//returns the updated array
//will have to run this for both the tile values array and the tile objects array
function updateMatx(matArr, strt, stp, dfVal) {

    //holds updated matrix to return
    let updatedArr = matArr;

    //holds indices of the starting position [row, col] = [y,x]
    //cast into number data type
    let startY = Number(strt[1]);
    let startX = Number(strt[3]);

    //holds indices of the proposed ending position [row, col] = [y,x]
    //cast into number data type
    let stopY = Number(stp[1]);
    let stopX = Number(stp[3]);

    //moving the value from the original loc to the new loc in the matrix
    updatedArr[stopY][stopX] = updatedArr[startY][startX];

    //replacing the value at the original loc with the default value
    updatedArr[startY][startX] = dfVal;

    return updatedArr;

};


//UPDATED FOR NEW DISTRIBUTION---NOW RETURNS RESULT OF COMBINE OPERATION, IF ALLOWED. OTHERWISE RETURNS ZERO
//function to take the ids from both the starting div and the drop target div and to use those id (location) values to take the tile values from the tile values matrix and determine the combined value (9/3 or 4/2)... this then returns the value for use in calling the new img name for the tile display in the original location
//takes as args the string representations of the locations, taken from the ids of the div elements in the html doc (ex: "[5,0]") and the gameboard (tile values array)
//returns 2 or 3 if combo allowed, else returns zero (number)
function checkCombine(start, stop, tVals) {

    //holds number value to return
    let cmb;

    //holds indices of the starting position
    //cast into number data type
    let startY = Number(start[1]);
    let startX = Number(start[3]);

    //holds indices of the proposed ending position
    //cast into number data type
    let stopY = Number(stop[1]);
    let stopX = Number(stop[3]);

    /* COMMENTED-OUT DUE TO CHANGE IN LOGIC FOR NEW DISTRIBUTION
    //logic to check the values of the tiles being combined. uses the values from passed-in tile values matrix to check for specific values for the tiles that the user is attempting to combine.
    //as of now, only allowing combining of 9/3 and 4/2, resulting in the square root and only works when dragging the larger number into the smaller number, changing the tile value of the larger number

    //checking for the 9/3 combo...
    if (tVals[startY][startX] === 9 && tVals[stopY][stopX] === 3) {

        cmb = 3;
        console.log(`cmb = 3`);

    }
    //checking for the 4/2 combo
    else if (tVals[startY][startX] === 4 && tVals[stopY][stopX] === 2) {

        cmb = 2;
        console.log(`cmb = 2`);

    }
    //zero if not an authorized combo for combining
    else {

        cmb = 0

    }
    */


    //logic to check the values of the tiles being combined. uses the values from passed-in tile values matrix to check for specific values for the tiles that the user is attempting to combine.
    //with the new distribution (1-14), allowing the combining of any even tile with any other tile by which it is evenly divisible. combining this way results in the larger tile taking on the value of the quotient

    //checking for a valid combo...
    //if the modulus between the tile being dragged and the tile with which it is being combined equals zero, the combine operation is allowed, division of the larger tile by the smaller tile is executed, and the larger tile takes on the quotient
    //does not allow division that results in one!
    if (((tVals[startY][startX]) % (tVals[stopY][stopX]) === 0) && ((tVals[startY][startX]) / (tVals[stopY][stopX]) != 1)) {

        cmb = (tVals[startY][startX]) / (tVals[stopY][stopX]);
        console.log(`legal cmb! cmb = ${cmb}`);

    }
    //zero if not an authorized combo for combining
    else {

        cmb = 0

    }

    //returns the new value for the tile that was dragged into the divisor tile (zero if combine not authorized)
    return cmb;

};




///////




///////
//GAME INITIATION

//tile bag created
//UPDATED TO CREATE NEW DISTRIBUTION (1-14)
allTiles = genTiles([10, 12, 10, 12, 10, 12, 7, 12, 9, 9, 7, 12, 7, 7]);

//old dist... too hard
//2, 2, 3, 4, 5, 7, 7, 7, 6, 6, 5, 4, 3, 3


//total number of generated tiles is stored (number)
tileNums = allTiles.length;

//creating the gameboard tile values matrix (default is 7 rows, 6 cols)
gameboard = makeMatrix(7, 6);

//creating the gameboard tile objects matrix (default is 7 rows, 6 cols) 
gameTiles = makeObjMatrix(7, 6);

//creating the array that holds the sum of each row's tile values
rowSums = rowValues(gameboard);

//displaying the row sums in the UI
showSums(rowSums);


//places set number of random tiles to start the game
for (let i = 0; i < 7; i++) {

    placeRandom()
    console.log(`placing beginning tile ${i}`);

};

//sets drawing back to false once gameboard set
drawing = false;

///////


///////
//GAMEPLAY

//presenting the discarded tile count at zero
discarded = tileNums - (allTiles.length + placed);

//random tile index chosen
currTileInd = drawIndex(allTiles.length);

//current tile drawn
currTile = allTiles[currTileInd];

//removing the drawn tile (current tile) from the tile bag
allTiles = rmvTile(allTiles, currTileInd);

//displaying the current tile
dispTile();

//total number of remaining tiles to be drawn is initiated
remaining = allTiles.length;

//logic to place random tiles at set interval... currently 25 seconds
//instead of placing random tile at set interval, trying gameplay with random tile being placed every time the user places, moves, or combines a tile or tiles
// setInterval(placeRandom, 25000);


///////



//progress notes as of 12/18/23...
//need to write logic to style completed row of 21 with special style before clearing it... adding className.add('twentyOne') with special css style for the row...

//need to refactor whole code base... start with game initiation. can put much of it into a function which can be called at initial game init and also at game reset

//latest update... 12/21/23
//updated logic to include randomly-placed tiles each time the user manually places a tile. The user can currently move and combine tiles without a random tile being placed.
//had random tiles being placed every 25 seconds but it was too many tiles, too quickly. if doing random tiles at intervals, need to install button to allow the user to precipitate the placement at lulls in the game. also need to play with board size and number distribution for this to work. work in progress...


///later... for now just total score
//----need to write logic for game-end point summation and summary
//---game end stats... # completed row, # placed tiles, # discarded tiles, # tiles combined, # tiles moved, total reduction in points by combining tiles, avg drawn tile value vs distribution avg, # of bonuses used, total points!


//-------------------------------------------------------------
//finished tasks...
//tiles created and UI working as designed---done!
//need to write logic for tile counts in the extra info section---done!!!
//need to write logic to remove the drawn tiles from the tile bag as they are drawn---done!!!

//need to create drag/drop functionality and logic for moving and combining tiles
///drag/drop functionality written!!!
//---need to write logic to execute when things are moved---done!!!

//write logic to update the row totals after placing and moving---done!

//write logic to update the total score after each move---done!!!

//need to write logic to check for full rows that add up to 21, then clear the row so that the user can begin fulling it again. (this logic will need to run after a tile is placed, moved, or combined (when i write the logic for tiles to be combined))---done!!!

//need to create logic for combining tiles---done!
//need to write logic for when things are combined!---done!

//need to write the logic to update the row totals when things are combined---done!

//---need to write logic to use the gameboard objects matrix to check as to whether the tile has been combined already---done!

//need to write logic to check for sequences and to adjust current score accordingly (using the gameboard tile values table)---might not do this... (tabled for now)---tabled!!!

//disable rows when they cant be added to anymore without exceeding 21???---not needed. logic already prevents user from dropping a new tile on top of once already placed and it's always psbl that the user could move or combine tiles to change the situation.---not needed!

//small bug in the code combining tiles logic... allows user to combine a tile after it has been moved bc combine logic doesnt check for the .moved property of the tile obj (maybe just get rid of the combined prop and use moved to determine it's move/combine status?)---fixed!
//moved tile cannot be combined and a combined tile can not be moved
//the only way a moved or combined tile can be involved in a combining operation is if it is the tile with which the larger tile is being combined. in this case it's allowed. for example, a tile with the value of two gets moved. then the user puts a four next to it and drags the four over the two to combine them. this is allowed.

//cl218... need to write logic for remove, change, and wild tile in the toSelect function---done!!!

//need to write logic for bonuses that get unlocked as user completes rows of 21---done!!!
//need to create buttons for each bonus---done!
//---default is disabled... enabled from top to bottom as user completes rows of 21---done!
//user clicks button and then clicks in row (if applicable... for all but discard current tile, which just does it) to use bonus
//----bonuses accrue as user lets them add up. if user already has a bonus, the second one becomes active, etc.

//need to write logic for placement of random tile in random space (using the currenttile logic previously used, with random placement choice... new function with a new random value generator)---no longer planning this!

///function to reset game
///---called by reset button in game-end modal---done!!!

///test game end logic and modal appearance---done!!!


///---bug... if user places a tile at the same cell that a random tile is being placed, logic allows it and it hold both... add if statement to placeRandom() to prevent this???---fixed!!!

//game rules written. need to make graphic to display rules before game start---done!!!
//need to create game-end modal---done!!!

//write logic in toSelect to check for game end (full board... indicated by gameboard objects matrix being full (no undefined values in it))---done!
//----need to write code for the game end modal---goes in checkEnd() function---done!!!

//checkEnd is too complicated... simpliy it to avoid bugs---done!!!

//bugs 12/21/23...
//cant remove randomly-placed tile---fixed!!!



//after consideration, plan is to build the game to that there is seemingly endless scoring opportunity. will be more interesting than just a clear, finite scoring potential.


//may need to adjust the tile disribution!!! seems very hard with my initial choice...