'use strict';

///////
//GLOBAL VARS//

//holds playing status (bool)
let game = true;

//holds current score (number)
let score = 0;

//holds gameboard matrix (array and arrays)
let gameboard;

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
        space = element.id;

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

    let ins = `<img src="${currTile.image}" alt="CURRENT TILE">`;
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

///////




///////
//GAME INITIATION

//tile bag created
allTiles = genTiles([14, 14, 4, 4, 4, 5, 5, 14, 14]);

//current tile drawn
currTile = allTiles[drawIndex(allTiles.length)];

//displaying the current tile
dispTile();


///////
