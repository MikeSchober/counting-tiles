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

//holds current tile object
let currTile;

//holds number of each acheived sequence (map... seq name:# of that seq)
let sequences = new Map();

//holds all available tiles (array)
let allTiles;

//holds number of discarded tiles (number)
let discarded;

//holds number of placed tiles (number)
let placed;

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
        let placeTile = `<img src="${currTile.image}" alt="CURRENT TILE" class="pTile">`;
        element.insertAdjacentHTML("afterbegin", placeTile);

        //updating the gameboard tile values matrix
        gameboard[space[1]][space[3]] = currTile.value;

        //updating the gameboard tile objects matrix
        gameTiles[space[1]][space[3]] = currTile;

        //updating the array that holds the sum of each row's tile values
        rowSums = rowValues(gameboard);

        //displaying the row sums in the UI
        showSums(rowSums);

        //removing the currTile from the current tile display so that the next tile can be shown
        curr.removeChild(curr.firstChild);

        //next tile drawn
        currTile = allTiles[drawIndex(allTiles.length)];

        //displaying the next tile
        dispTile();


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
            let t = new Tile(ident, val, false, false, 0, 0, `${val}.png`);

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

//testing my randon number logic...
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


///////




///////
//GAME INITIATION

//tile bag created
allTiles = genTiles([14, 14, 4, 4, 4, 5, 5, 14, 14]);

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

//current tile drawn
currTile = allTiles[drawIndex(allTiles.length)];

//displaying the current tile
dispTile();


///////



//progress notes as of 12/2/23...
//tiles created and UI working as designed
//need to create drag/drop functionality and logic for moving and combining tiles
//---need to write logic to use the gameboard objects matrix to check as to whether the tile has been moved already and whether or not it has been combined already (these things prevent themselves and each other)
//need to write logic to check for sequences and to adjust current score accordingly (using the gameboard tile values table)
//disable rows when they cant be added to anymore without exceeding 21??? (logic already prevents user from dropping a new tile on top of once already placed)
//write logic in toSelect to check for game end (full board... indicated by gameboard objects matrix being full (no undefined values in it))
//need to write logic for placement of random tile in random space (using the currenttile logic previously used, with random placement choice... new function with a new random value generator)
//need to write logic for game-end point summation and summary
//need to write logic for tile counts in the extra info section
//need to write logic for hiding/displaying the extra info section

//may need to adjust the tile disribution!!! seems very hard with my initial choice...