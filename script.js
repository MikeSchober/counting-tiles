'use strict';

//version 0.4.0
//includes total saved count as getter within the tile objs and allows infinite combining
//also adds decreasing time interval between random placements, increasing tile value distribution (both happen as rows are completed), and challenge mode logic (still need user selection for it)

///////
//GLOBAL VARS//

//holds playing status (bool)
//can likely remove... not using
// let game = true;

//holds current score (number)
//starts negative to offset the automatic updating of the random placing function at game initiation
let score = 0;

//holds high score, if user plays several times
let highScore = 0;

//counter that holds latest tile id (starts at zero)
//moved from within the genTiles function to the global scope so that we can access this from the addLarger function when adding the larger tiles to the dist after each row completed
let ident = 0;

//holds number of games played
let attempts = 0;

//holds boolean for whether or not user chose to play challenge mode
//when challenge mode selected and this is true, the time intervals between random tile placements decrease incrementally
//need to create the selection for this in the game start modal
let challenge = true;

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

//holds current interval for random placing
let timeframe;

//holds array of row value goals for each row (index in the gomeboard array)
let goalVals = [];

//holds the aggregate value saved by combining tiles (number)
let ttlSaved = 0;

//holds the number of moved tiles
let moves = 0;

//holds the number of combined tiles
let ttlCombined = 0;

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

//mode toggle button in gamestart modal
let mode = document.getElementById("mode");

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

mode.addEventListener('click', modeToggle);

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

    //getter to determine how much tile value was saved, if any, by combining this tile with another tile
    //to make this work, had to define newValue's default value to the original value of the tile when the tile was created
    get saved() {

        return (this.value - this.newValue)

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

        //changing the cell background color to style the placed tile
        element.classList.add("std");

        //updating the gameboard tile values matrix
        gameboard[space[1]][space[3]] = currTile.value;

        //updating the gameboard tile objects matrix
        gameTiles[space[1]][space[3]] = currTile;

        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        // showSums(rowSums);

        //displaying the new row total needed
        showRemain(rowSums, goalVals);

        //updating the placed tile counter
        placed++;
        console.log(`number of placed tiles: ${placed}`);

        //updating the discarded tile count
        discarded = (tileNums - placed - randTiles - 1) - remaining;
        console.log(`discarded: ${discarded}`);

        //chgd scoring logic to ttl value saved...
        //updating the user's current score
        // score = score + 10;
        //<h3 class="score">Current score: </h3>

        //updating the score disolay in the ui
        // let viewScore = `<h1>${score}</h1>`;
        // scr.removeChild(scr.children[0]);
        // scr.insertAdjacentHTML("afterbegin", viewScore);

        //check for full row that adds up to row goal value, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
        checkSum(rowSums, gameTiles, gameboard, 6);

        //checking for game end
        checkEnd();

        //adjRandom slowed-down the placement of random tiles as the board filled up. removed this for now
        //check for random interval adjustment
        // adjRandom();

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

        //regenerates tile bag if tiles remaining is less than 7
        if ((remaining < 7) && (completedRows < 18)) {

            allTiles = genTiles([100, 120, 100, 120, 100, 120, 70, 120, 90, 90, 70, 120, 70, 70]);

            //adds the larger tiles that were in the dist
            for (let x = 0; x < completedRows; x++) {

                addLarger([15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 34, 35, 36, 40], x, 50);
            }

        } else if (remaining < 7) {

            //adds all psbl tiles to the dist
            allTiles = genTiles([100, 120, 100, 120, 100, 120, 70, 120, 90, 90, 70, 120, 70, 70, 50, 50, 0, 50, 0, 50, 50, 50, 0, 50, 50, 50, 50, 50, 0, 50, 0, 50, 0, 50, 50, 50, 0, 0, 0, 50]);

        };

        //places random tile on board
        //took this out when added random interval adjustment functionality
        // setTimeout(placeRandom, 3000);

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
        // showSums(rowSums);

        //displaying the new row total needed
        showRemain(rowSums, goalVals);

        //changing the cell background color to the default color
        element.parentElement.classList = "cell";

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
        let one = `<img src="images/1n.png" alt="special tile" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${gameTiles[Number(element.parentElement.id[1])][Number(element.parentElement.id[3])].id}">`;

        //inserts the new tile img into the dragged tile's orig position on the gamebaord
        element.parentElement.insertAdjacentHTML("afterbegin", one);

        //changing the cell background color to style the placed tile
        element.parentElement.classList.add("std");

        //removes the tile image from the gameboard
        element.remove();


        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        // showSums(rowSums);

        //displaying the new row total needed
        showRemain(rowSums, goalVals);

        //check for full row that adds up to row goal value, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
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
        rowSums[Number(element.id[1])] = goalVals[Number(element.id[1])];

        console.log(`row goals: ${goalVals}`);
        console.log(`row sums! : ${rowSums}`);

        //displaying the row sums in the UI
        // showSums(rowSums);

        //displaying the new row total needed
        //probably dont need this... 
        //maybe display a W in the remaining column???
        showRemain(rowSums, goalVals);

        //clears the completed row of the tile values matrix
        clrValRow(gameboard, Number(element.id[1]), 6);

        //clears the completed row of the tile objs matrix
        clrObjRow(gameTiles, Number(element.id[1]), 6);

        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        // showSums(rowSums);

        //generating new goal value for the row
        let newG = genGoals();
        console.log(`new goal: ${newG}`);

        //updating the row goal in the row goals array
        goalVals[Number(element.id[1])] = newG;

        //displaying the new row total needed
        // showRemain(rowSums, goalVals);

        //chgd scoring to ttlsaved + 350 per completed row
        //updating the user's current score... adds 350 pts!
        // score = score + 350;

        //updating the number of completed rows in the var
        completedRows++;

        //updating the completed rows count in the ui
        let viewRows = `<p>${completedRows}<p>`;
        rs.removeChild(rs.children[0]);
        rs.insertAdjacentHTML("afterbegin", viewRows);

        //recalculating and updating the score
        //recalc...
        score = (ttlSaved + (completedRows * 350));
        console.log(`SCORE UPDATE: ${score}`);

        //updating the score disolay in the ui
        let viewScore = `<h1>${score}</h1>`;
        scr.removeChild(scr.children[0]);
        scr.insertAdjacentHTML("afterbegin", viewScore);

        //adding difficulty... decreasing time int between randomTile placement and increasing tile values in the dist
        //currently results in interval from 25 sec to 7 sec after 34 rows
        if ((completedRows % 2 === 0) && (completedRows < 35) && (challenge)) {

            //increasing the speed at which random tiles are placed based on the ttl number of completed rows
            fasterRandom();
            console.log(`faster!`);

        };


        //tile values go up to a value of 40
        if (completedRows < 18) {

            //add next larger tile value to the distribution
            //completedRows -1 is second arg bc it has already been incremented here and we need to start at index zero
            addLarger([15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 34, 35, 36, 40], (completedRows - 1), 50);


        };

        //style it with special style for 3 seconds...
        //come back to this...
        //add background color to the total column of the completed row
        //in the setTimeout function, add functionality for the total column in the row to reset to its default background color
        /*let cpltIns = `<div id="cplt" class="cplt">
            <h3>Bam! Row complete!</h3></div>`;*/

        let cpltIns = congrats(completedRows);


        document.getElementById(["row0", "row1", "row2", "row3", "row4", "row5", "row6"][Number(element.id[1])]).insertAdjacentHTML("afterbegin", cpltIns);


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
            let t = new Tile(ident, val, false, false, 0, val, `images/${val}n.png`);

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


//adds up all the saved values from each tile obj in the gameTile matrix
//takes the gameTiles matrix as arg (array)
//returns a number (total tile value saved by combining tiles)
function savedValues(tObjsMtx) {

    let num = 0;

    //for each row of the gameTiles tile objects matrix...
    for (let i of tObjsMtx) {

        //for each cell in the row...
        for (let y of i) {

            //if there is a tile obj in the cell...
            if (y != undefined) {

                console.log(`num before: ${num}`);
                num += y.saved;
                console.log(`num now: ${num}`);

            }

        }

    }

    //returns total tile value saved by combining tiles (number)
    return num;
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


//displays updated row goals in the UI
//takes the goal values array as arg (array)
function showGoals(goalV) {


    //iterates through the goal values array and adds the value to the corresponding row goal id in the html doc
    for (let i = 0; i < goalV.length; i++) {

        let g = document.getElementById(`g${i}`);

        //if the is a firstchild value in s...
        if (g.firstChild) {

            //removing the value from the div so that the sum can be updated
            g.removeChild(g.firstChild);

        };

        //inserting the corresponding goal value into g(the row goal cell)
        let rowG = `<h3>/ ${goalV[i]}</h3>`;
        g.insertAdjacentHTML("afterbegin", rowG);

    }

};


//displays updated row values needed to meet the row goal
//takes the rowSums array and the goal values array as args
function showRemain(theSums, goalV) {


    //iterates through the arrays and subtracts the row sum from the goal value to get the remaining tile values needed to reach the row goal
    //adds the value to the corresponding row goal id in the html doc
    for (let i = 0; i < goalV.length; i++) {

        let r = document.getElementById(`r${i}`);

        //if the is a firstchild value in s...
        if (r.firstChild) {

            //removing the value from the div so that the sum can be updated
            r.removeChild(r.firstChild);

        };

        //inserting the corresponding goal value into g(the row goal cell)
        let rowToGo = `<h3>${(goalV[i] - theSums[i])}</h3>`;
        r.insertAdjacentHTML("afterbegin", rowToGo);

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

            //changing the cell background color back to default by removing any added styling classes
            currC.classList = "cell";

        }

    }

    //only tries to remove special styling if it exists in the row being cleared
    if (document.getElementById(`row${rowInd}`).firstChild === document.getElementById("cplt")) {

        //removes special styling for completed row
        document.getElementById("cplt").remove();

    };

    //displaying the new row total needed
    showRemain(rowSums, goalVals);

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


//function to generate the row completion messages
//takes the number of completed rows as arg
function congrats(cmpltRows) {

    let sayings = [`Bam! Row complete!`, `You rock!`, `Allstar tile-mover!`, `Always gettin the job done!`, `Another one? Already?`, `Movin tiles like a boss!`, `Tile-moving rockstar!`, `Look at all these points!`, `You make it look easy!`, `Is it too easy?!?`, `Another 350!`, `That's ${cmpltRows}!`, `Bam! Bam! Bam!`, `Another one on the board!`, `What's your high score again?`, `I'm out of words...`, `Done!`, `Finished!`, `Complete!`, `Another one!`, `And another one!`, `And another one!`, `Do you ever get tired?!?`, `And... wow`, `Personal record yet?`, `Keep em' rollin!`, `I think I might have lost count...`, `${cmpltRows} complete?!? Wow.`];

    return `<div id="cplt" class="cplt"><h3>${sayings[((cmpltRows - 1) % sayings.length)]}</h3></div>`;

};


//function to check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again. (this logic will need to run after a tile is placed, moved, or combined (when i write the logic for tiles to be combined))
//takes the rowSums array as arg and both matrices as args (arrays), as well as the number of columns currently in the gameboard (number)
function checkSum(sArr, tObjs, tVals, cols) {

    //holds bool to indicate whether or not the row in the tile objs array is full (no undefined)
    let fullRow;

    //checking for goal value in the sums array
    for (let y = 0; y < sArr.length; y++) {

        fullRow = true;

        //if the row sum is the goal value in the goalVals array...
        if (sArr[y] === goalVals[y]) {

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

                //generating new goal value for the row
                let newG = genGoals();
                console.log(`new goal: ${newG}`);

                //updating the row goal in the row goals array
                goalVals[y] = newG;

                // //displaying the new row goal
                // showGoals(goalVals);

                //updating the array that holds the sum of each row's tile values
                rowSums = rowValues(gameboard);

                // //displaying the row sums in the UI
                // showSums(rowSums);

                //chgd socring to ttlsaved + 350 per completed row
                //updating the user's current score... adds 21 pts!
                // score = score + 350;

                //updating the number of completed rows in the var
                completedRows++;

                //updating the completed rows count in the ui
                let viewRows = `<p>${completedRows}<p>`;
                rs.removeChild(rs.children[0]);
                rs.insertAdjacentHTML("afterbegin", viewRows);

                //recalculating and updating the score
                //recalc...
                score = (ttlSaved + (completedRows * 350));
                console.log(`SCORE UPDATE: ${score}`);

                //updating the score disolay in the ui
                let viewScore = `<h1>${score}</h1>`;
                scr.removeChild(scr.children[0]);
                scr.insertAdjacentHTML("afterbegin", viewScore);


                //updates the bonuses array
                updateBonus(bonuses);

                //actives the bonuses as needed
                actBonus(bonuses, powers);


                //adding difficulty... decreasing time int between randomTile placement and increasing tile values in the dist
                //currently results in interval from 25 sec to 7 sec after 34 rows
                if ((completedRows % 2 === 0) && (completedRows < 35) && (challenge)) {

                    //increasing the speed at which random tiles are placed based on the ttl number of completed rows
                    fasterRandom();
                    console.log(`faster!`);

                };

                //tile values go up to a value of 40
                if (completedRows < 18) {

                    //add next larger tile value to the distribution
                    //completedRows -1 is second arg bc it has already been incremented here and we need to start at index zero
                    addLarger([15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 34, 35, 36, 40], (completedRows - 1), 50);


                };


                //style it with special style for 3 seconds...
                //come back to this...
                //add background color to the total column of the completed row
                //in the setTimeout function, add functionality for the total column in the row to reset to its default background color
                /*let cpltIns = `<div id="cplt" class="cplt">
                <h3>Bam! Row complete!</h3></div>`;*/

                let cpltIns = congrats(completedRows);

                document.getElementById(["row0", "row1", "row2", "row3", "row4", "row5", "row6"][y]).insertAdjacentHTML("afterbegin", cpltIns);


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
    let endScore = `<div><h1>Game over!</h1>
        <br>
        <h2>Final score: ${score}</h2>
        <br>
        <h4>---------------------------------------------</h4>
        <h3>Your stats!</h3>
        <ul>
            <li>Completed rows: ${completedRows}</li>
            <li>Placed tiles: ${placed}</li>
            <li>Tiles moved: ${moves}</li>
            <li>Tiles combined: ${ttlCombined}</li>
            <li>Total value saved by combining: ${ttlSaved}</li>
        </ul>
        <h4>---------------------------------------------</h4>
        </div>`;
    endMsg.removeChild(endMsg.children[0]);
    endMsg.insertAdjacentHTML("afterbegin", endScore);


    //displaying the modal
    endModal.classList.remove('hidden');

    console.log(`game end!`);

};


//function to reset the game
function gameReset() {

    //score reset
    score = 0;

    //holds the number of random tiles placed
    randTiles = 0;

    //tile bag created
    //UPDATED TO CREATE NEW DISTRIBUTION (1-14)
    allTiles = genTiles([100, 120, 100, 120, 100, 120, 70, 120, 90, 90, 70, 120, 70, 70]);

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

    //clearing the goalVals array
    goalVals = [];

    //creating goal values array
    for (let i = 0; i < 7; i++) {
        let g = genGoals();
        goalVals.push(g);
    };

    // //updating the row goals values in the ui
    // showGoals(goalVals);

    //creating the array that holds the sum of each row's tile values
    rowSums = rowValues(gameboard);

    //displaying the new row total needed
    showRemain(rowSums, goalVals);

    // //displaying the row sums in the UI
    // showSums(rowSums);

    //re-initiating the bonuses array to allow the wild bonus again
    bonuses = [0, 0, 0, 0];

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

    //updating the completed rows count in the ui
    let viewRows = `<p>${completedRows}<p>`;
    rs.removeChild(rs.children[0]);
    rs.insertAdjacentHTML("afterbegin", viewRows);


    //holds the number of moved tiles
    moves = 0;

    //holds the number of combined tiles
    ttlCombined = 0;

    //holds ttl value saved
    ttlSaved = 0;

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

    //resetting the tile placement interval
    clearInterval(randInterval);
    randInterval = setInterval(placeRandom, 25000);


    //presenting the discarded tile count at zero
    discarded = (tileNums - placed - randTiles) - remaining;

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

    //inserts/updates high score display
    if (attempts > 0) {

        //removes the current high score
        document.getElementById("highSc").remove();

        //displays high score below the bonus buttons
        document.getElementById("play").insertAdjacentHTML('beforeend', `<div id="highSc"><img src="images/highScr.png" alt="high score" class="highScore"><p id="hs">${highScore}</p></div>`);

    } else {

        //displays high score below the bonus buttons
        document.getElementById("play").insertAdjacentHTML('beforeend', `<h2 id="dash">-----------------------</h2><div id="highSc"><img src="images/highScr.png" alt="high score" class="highScore"><p id="hs">${highScore}</p></div>`);

    }

    //increments number of games played
    attempts++;

    //displays modal to start game again
    endModal.classList.add('hidden')
    startModal.classList.remove('hidden');

};


//generates random row value goal numbers between 21 and 40 (inclusive) and returns that number for use as a specific row value goal
function genGoals() {

    //generates random number (integer) between 21 and 40 (inclusive)
    let rand = Math.floor(Math.random() * (41 - 21)) + 21;
    console.log(`random row value: ${rand}`);

    return rand;

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
    discarded = (tileNums - placed - randTiles - 1) - remaining;
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

    //pops the wild bonus from the bonuses array to disable it once it has been used once in the game
    //will need to reinitiate the bonuses array at game reset
    bonuses.pop();

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
            //need to chg img path here for css background color styling
            let placingRandom = `<img src="images/${r.value}n.png" alt="random tile" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${r.id}">`;
            tgt.insertAdjacentHTML("afterbegin", placingRandom);

            //adds class for random tile background styling
            tgt.classList.add("rdm");

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
            // showSums(rowSums);

            //displaying the new row total needed
            showRemain(rowSums, goalVals);

            //chgd scoring logic to ttl value saved...
            //updating the user's current score
            // score = score + 10;
            //<h3 class="score">Current score: </h3>

            //updating the score disolay in the ui
            // let viewScore = `<h1>${score}</h1>`;
            // scr.removeChild(scr.children[0]);
            // scr.insertAdjacentHTML("afterbegin", viewScore);


            //check for full row that adds up to row goal value, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
            checkSum(rowSums, gameTiles, gameboard, 6);

            //checking for game end
            checkEnd();


            //regenerates tile bag if tiles remaining is less than 7
            if ((remaining < 7) && (completedRows < 18)) {

                allTiles = genTiles([100, 120, 100, 120, 100, 120, 70, 120, 90, 90, 70, 120, 70, 70]);

                //adds the larger tiles that were in the dist
                for (let x = 0; x < completedRows; x++) {

                    addLarger([15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 34, 35, 36, 40], x, 50);
                }

            } else if (remaining < 7) {

                //adds all psbl tiles to the dist
                allTiles = genTiles([100, 120, 100, 120, 100, 120, 70, 120, 90, 90, 70, 120, 70, 70, 50, 50, 0, 50, 0, 50, 50, 50, 0, 50, 50, 50, 50, 50, 0, 50, 0, 50, 0, 50, 50, 50, 0, 0, 0, 50]);

            };

            //adjRandom slowed-down the placement of random tiles as the board filled up. removed this for now
            //check for random interval adjustment
            // adjRandom();


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

//function to toggle game modes (defaults to on)
//challenge var holds current mode status. defaults to true for challenge mode
//this function is called when the mode button clicked
//changes the styling of the mode button to OFF/ON, inverted colors
//toggles the boolean in the chalenge variable
function modeToggle() {

    if (challenge === true) {

        challenge = false;
        mode.innerHTML = "Challenge mode: OFF"
        mode.style.setProperty('background-color', 'beige');
        mode.style.setProperty('color', 'black');

    } else {

        challenge = true;
        mode.innerHTML = "Challenge mode: ON"
        mode.style.setProperty('background-color', 'black');
        mode.style.setProperty('color', 'beige');

    }


};


//as user completes rows, the interval at which tiles are randomly placed decreases
//function to decrease the interval at which tiles are placed
function fasterRandom() {

    let t = 25000 - ((completedRows / 2) * 1000);
    console.log(`new t will be: ${t}`);

    clearInterval(randInterval);
    randInterval = setInterval(placeRandom, t);

};


//function to determine the number of tiles on the board and to adjust the interval at which the random tiles are placed
function adjRandom() {

    let full = ((placed + randTiles) - (completedRows * 6));
    console.log(`full: ${full}`);

    if ((timeframe === 25) && (full >= 30)) {

        clearInterval(randInterval);
        randInterval = setInterval(placeRandom, 40000)
        timeframe = 40;

        console.log(`placing at 40 seconds now!`);

    } else if ((timeframe === 40) && (full <= 30)) {

        clearInterval(randInterval);
        randInterval = setInterval(placeRandom, 25000)
        timeframe = 25;

        console.log(`placing at 25 seconds again!`);

    }

};


//function for adding larger-value tiles to the distribution
//only adds one larger tile value at a time
//takes as arg array of tile values that we want to add and the index of the array that we are currently adding
//also takes as arg the number of tiles that we want to create at the larger value
function addLarger(newVals, ind, numLarge) {

    //tile value that we are currently assigning
    let val = newVals[ind];
    console.log(`CURRENT LARGER TILE VALUE BEING ASSIGNED: ${val}`);

    //for each number, creates the specified number of tile objects and adds them to the tileValues array
    for (let i = 0; i < numLarge; i++) {

        //increments counter
        ident++;
        console.log(`current id: ${ident}`);

        //creating new tile
        let t = new Tile(ident, val, false, false, 0, val, `images/${val}n.png`);

        //pushing new tile into the tile bag
        allTiles.push(t);

    }

    //updating the counter for the number of tiles generated
    console.log(`old tileNums: ${tileNums}`);
    tileNums = tileNums + numLarge;
    console.log(`new tileNums: ${tileNums}`);

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


            //added infinite combining...
            //on adding the random tile placement functionality, took out the restriction that stopped user from moving and then combining tiles
            //user can now move and then combine tiles, but cannot combine and then move. once a tile is combined, it cannot be moved but it can be combined again
            // if (gameTiles[origLoc[1]][origLoc[3]].combined === false) {


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
                document.getElementById(origLoc).classList = "cell";
                document.getElementById(origLoc).removeChild(document.getElementById(origLoc).firstChild);

                //need to change picture name back to "valueCMB.png" once we have the styling for the cmb tile... background transparent, but box around it or something???

                //adds the new img
                let cmbTile = `<img src="images/${cmbValue}n.png" alt="combined tile" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${gameTiles[origLoc[1]][origLoc[3]].id}">`;

                //inserts the new tile img into the dragged tile's orig position on the gamebaord
                document.getElementById(origLoc).insertAdjacentHTML("afterbegin", cmbTile);

                //logic for combined tile styling... progressivelt gets darker as user combines several times
                //uses the combo property of the tile object to determine the class that is assigned to the div at document.getElementBtId(origLoc)...
                //styling for combining up to five times
                document.getElementById(origLoc).classList = "cell " + ["one", "two", "three", "four", "five"][gameTiles[origLoc[1]][origLoc[3]].combo];


                //in the tile objs matrix, for the obj at the origLoc, set the combined property = true and the newValue = new combined value
                //also changes the moved property to true to prevent subsequent moving (may change this later)
                //also changes the img path to the correct img
                gameTiles[origLoc[1]][origLoc[3]].combined = true;
                gameTiles[origLoc[1]][origLoc[3]].moved = true;
                gameTiles[origLoc[1]][origLoc[3]].newValue = cmbValue;
                gameTiles[origLoc[1]][origLoc[3]].combo++;
                gameTiles[origLoc[1]][origLoc[3]].image = `images/${gameTiles[origLoc[1]][origLoc[3]].newValue}cmb.png`;


                //in the tile values matrix, for the obj at origLoc, set the value to the new combined value
                gameboard[origLoc[1]][origLoc[3]] = cmbValue;

                //updating the array that holds the sum of each row's tile values
                rowSums = rowValues(gameboard);

                //displaying the row sums in the UI
                // showSums(rowSums);

                //displaying the new row total needed
                showRemain(rowSums, goalVals);

                //check for full row that adds up to row goal value, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
                checkSum(rowSums, gameTiles, gameboard, 6);

                //update the total value saved by combining tiles
                ttlSaved = savedValues(gameTiles);
                console.log(`total saved: ${ttlSaved}`);

                //incrementing the ttlCombined number
                ttlCombined++;

                //recalculating and updating the score
                //recalc...
                score = (ttlSaved + (completedRows * 350));
                console.log(`SCORE UPDATE: ${score}`);

                //updating the score disolay in the ui
                let viewScore = `<h1>${score}</h1>`;
                scr.removeChild(scr.children[0]);
                scr.insertAdjacentHTML("afterbegin", viewScore);


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
                discarded = (tileNums - placed - randTiles - 1) - remaining;
                console.log(`discarded: ${discarded}`);

                //places random tile on board
                // setTimeout(placeRandom, 3000);

                // }


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

                //need to change picture name back to "valueMVD.png" once we have the styling for the mvd tile... background transparent, but box around it or something???

                //logic to update the picture styling
                e.target.firstChild.src = `images/${gameTiles[origLoc[1]][origLoc[3]].value}n.png`;
                e.target.classList.add("mvd");

                //removing the background styling from the original space that the file occupied
                document.getElementById(origLoc).classList = "cell";

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
                // showSums(rowSums);

                //displaying the new row total needed
                showRemain(rowSums, goalVals);

                //incrementing the ttl moved variable
                moves++;

                //check for full row that adds up to row goal value, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
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
                discarded = (tileNums - placed - randTiles - 1) - remaining;
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
    /*
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

    };

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
    */

    //bc one of the values between the start position and the stop posiiton have to be the same between the two, as long as this condition is satisfied the move is allowed
    if ((startY === stopY) || (startX === stopX)) {


        adj = true;

        console.log(`move allowed!`);

    } else {

        adj = false;

        console.log(`move not allowed!`);

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


    //added this if statement to make sure that the combining operaton is only allowed for tiles that are directly adjacent to each other. tiles not right next to each other cannot be combined
    if ((startY === stopY && (stopX === startX + 1 || stopX === startX - 1)) || (startX === stopX) && (stopY === startY + 1 || stopY === startY - 1)) {


        //logic to check the values of the tiles being combined. uses the values from passed-in tile values matrix to check for specific values for the tiles that the user is attempting to combine.
        //with the new distribution (1-14), allowing the combining of any even tile with any other tile by which it is evenly divisible. combining this way results in the larger tile taking on the value of the quotient

        //checking for a valid combo...
        //if the modulus between the tile being dragged and the tile with which it is being combined equals zero, the combine operation is allowed, division of the larger tile by the smaller tile is executed, and the larger tile takes on the quotient
        //does not allow division that results in one!
        if (((tVals[startY][startX]) % (tVals[stopY][stopX]) === 0) && ((tVals[startY][startX]) / (tVals[stopY][stopX]) != 1) && ((tVals[stopY][stopX] != 1))) {

            cmb = (tVals[startY][startX]) / (tVals[stopY][stopX]);
            console.log(`legal cmb! cmb = ${cmb}`);

        }
        //zero if not an authorized combo for combining
        else {

            cmb = 0

        }



    } else {

        cmb = 0;

    };

    //returns the new value for the tile that was dragged into the divisor tile (zero if combine not authorized)
    return cmb;

};




///////




///////
//GAME INITIATION

//tile bag created
//UPDATED TO CREATE NEW DISTRIBUTION (1-14)
allTiles = genTiles([100, 120, 100, 120, 100, 120, 70, 120, 90, 90, 70, 120, 70, 70]);

//old dist... too hard
//2, 2, 3, 4, 5, 7, 7, 7, 6, 6, 5, 4, 3, 3


//total number of generated tiles is stored (number)
tileNums = allTiles.length;

//creating the gameboard tile values matrix (default is 7 rows, 6 cols)
gameboard = makeMatrix(7, 6);

//creating the gameboard tile objects matrix (default is 7 rows, 6 cols) 
gameTiles = makeObjMatrix(7, 6);

//creating goal values array
for (let i = 0; i < 7; i++) {
    let g = genGoals();
    goalVals.push(g);
};

// //updating the row goals values in the ui
// showGoals(goalVals);

//creating the array that holds the sum of each row's tile values
rowSums = rowValues(gameboard);

//displaying the new row total needed
showRemain(rowSums, goalVals);

// //displaying the row sums in the UI
// showSums(rowSums);


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
discarded = (tileNums - placed - randTiles) - remaining;

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
let randInterval = setInterval(placeRandom, 25000);
timeframe = 25;

///////



//progress notes as of 1/14/24...

//CL 1760 and 1652... need to change back to the mvd and cmb image names once we have the styling nailed down for them... currently all using the valueN.png images

//finished styling to completed row!!!
//---need to add array of various sayings to be displayed when user completes row (maybe 40-50 says that eventually repeat???)
//---template literal used so that we can insert different index of the array each time

//need to create the selection for challenge mode or casual mode in the game start modal

//created all tiles with transparent background.---done!!!
//need to decide on styling to moved and combined tiles

//need to update rules and the readme


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

//make the wild bonus only available once per game---done!!!

//need to write logic to style completed row of 21 with special style before clearing it---done!!!

//bugs 12/21/23...
//cant remove randomly-placed tile---fixed!!!



//after consideration, plan is to build the game to that there is seemingly endless scoring opportunity. will be more interesting than just a clear, finite scoring potential.


//may need to adjust the tile disribution!!! seems very hard with my initial choice...