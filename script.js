'use strict';

///////
//GLOBAL VARS//

//holds playing status (bool)
let game = true;

//holds current score (number)
let score = 0;

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
let sequences = new Map();

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

///////


///////
//EVENT LISTENERS


//event listener for general click
//toSelect() callback function uses event.target to get the id from the clicked element and, if it is a <TH> element, displays a modal to show that column's taf data
document.addEventListener('click', toSelect);


///////


///////
//DOM ELEMENTS

let curr = document.getElementById("currTile");

let scr = document.getElementById("score");


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

    if (element.tagName != 'IMG' && element.className === 'cell') {

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
        score++;
        //<h3 class="score">Current score: </h3>

        //updating the score disolay in the ui
        let viewScore = `<h3>Current score: ${score}</h3>`;
        scr.removeChild(scr.children[0]);
        scr.insertAdjacentHTML("afterbegin", viewScore);

        //check for full row that adds up to 21, to style it with special style for 3 seconds, then clear the row so that the user can begin filling it again
        checkSum(rowSums, gameTiles, gameboard, 6);

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

    }
};


//function to generate all tiles and return them in an array
//take as arg... distribution, in order, by number (dist is array containing the number of tiles desired, in order, one-nine)
function genTiles(dist) {

    //counter that holds latest tile id (starts at zero)
    let ident = 0;

    //holds current value being assigned
    let val = 0;

    //holds array of all generated tiles... this is what is returned
    let tileBag = [];

    //iteration to generate the specified number of tiles by number
    //iterates through the dist array, producing the specified number of tile objects for each number (1-9)
    for (let x of dist) {

        val++;
        console.log(`CURRENT VALUE BE ASSIGNED: ${val}`);

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

        //removes the img from the cell
        currC.removeChild(currC.firstChild);

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
    let fullRow = true;

    //checking for value of 21 in the sums array
    for (let y = 0; y < sArr.length; y++) {

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
                score = score + 21;

                //updating the score disolay in the ui
                let viewScore = `<h3>Current score: ${score}</h3>`;
                scr.removeChild(scr.children[0]);
                scr.insertAdjacentHTML("afterbegin", viewScore);



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


///
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
    //this is always triggering right now...
    if (e.target.tagName === 'IMG') {


        //if the div contains an img already, the target.id now becomes the img id. bc we need the div id, we need to call e.target.parentElement.id in these situations. thus, must run the checkAdjacent function seperately for the combining and the moving scenarios...
        if (checkAdjacent(origLoc, e.target.parentElement.id)) {


            //if the tile obj in the original loc has not yet been combined (dragging into another tile)...
            if (gameTiles[origLoc[1]][origLoc[3]].combined === false) {


                //combine tile logic here
                //function to take the ids from both the starting div and the drop target div and to use those id (location) values to take the tile values from the tile values matrix and determine the combined value (9/3 or 4/2)... this then returns the value for use in calling the new img name for the tile display in the original location
                //basically... user can combined a 9 into a 3 to change the 9 into a 3, or can combined a 4 into a 2 to change the 4 into a 2... psbly will change this later to allow combining any tile that is divisible by another tile value except for one

                //if the checkCombine function results in an allowable result (not zero), then the combine logic excutes here...

                //holds the resulting number from the combo (only allowable if the result is not zero... see checkCombine for the specific logic)
                let cmbValue = checkCombine(origLoc, e.target.parentElement.id, gameboard);

                if (cmbValue === 3 || cmbValue === 2) {

                    //logic for combining tiles

                    //delete the img in the origLoc div and replace it with the new/combine value's img

                    //deletes the orig img
                    document.getElementById(origLoc).removeChild(document.getElementById(origLoc).firstChild);

                    //adds the new img
                    let cmbTile = `<img src="images/${cmbValue}cmb.png" alt="combined tile" draggable="true" ondragstart="dragTile(event)" class="pTile" id="tile${gameTiles[origLoc[1]][origLoc[3]].id}">`;
                    document.getElementById(origLoc).insertAdjacentHTML("afterbegin", cmbTile);


                    //in the tile objs matrix, for the obj at the origLoc, set the combined property = true and the newValue = new combined value (either 2 or 3)
                    //also changes the moved property to true to prevent subsequent moving (may change this later)
                    //also changes the img path to the correct img
                    gameTiles[origLoc[1]][origLoc[3]].combined = true;
                    gameTiles[origLoc[1]][origLoc[3]].moved = true;
                    gameTiles[origLoc[1]][origLoc[3]].newValue = cmbValue;
                    gameTiles[origLoc[1]][origLoc[3]].image = `images/${gameTiles[origLoc[1]][origLoc[3]].newValue}cmb.png`;


                    //in the tile values matrix, for the obj at origLoc, set the value to the new combined value (either 2 or 3)
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


//function to take the ids from both the starting div and the drop target div and to use those id (location) values to take the tile values from the tile values matrix and determine the combined value (9/3 or 4/2)... this then returns the value for use in calling the new img name for the tile display in the original location
//takes as agrs the string representations of the locations, taken from the ids of the div elements in the html doc (ex: "[5,0]") and the gameboard (tile values array)
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


    //returns the new value for the tile that was dragged into the divisor tile (zero is combine not authorized)
    return cmb;

};




///////




///////
//GAME INITIATION

//tile bag created
allTiles = genTiles([14, 14, 4, 4, 4, 5, 5, 14, 14]);

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


///////



//progress notes as of 12/2/23...

//need to write logic to style completed row of 21 with special style before clearing it... adding className.add('twentyOne') with special css style for the row...


//write logic in toSelect to check for game end (full board... indicated by gameboard objects matrix being full (no undefined values in it))

//need to write logic for placement of random tile in random space (using the currenttile logic previously used, with random placement choice... new function with a new random value generator)

//need to write logic for game-end point summation and summary
//need to write logic for hiding/displaying the extra info section

//small bug in the code combining tiles logic... allows user to combine a tile after it has been moved bc combine logic doesnt check for the .moved property of the tile obj (maybe just get rid of the combined prop and use moved to determine it's move/combine status?)


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








//after consideration, plan is to build the game to that there is seemingly endless scoring opportunity. will be more interesting than just a clear, finite scoring potential.


//may need to adjust the tile disribution!!! seems very hard with my initial choice...