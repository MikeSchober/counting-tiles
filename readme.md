
## Counting Tiles

This is a logic game written entirely in HTML, CSS and JavaScript (no external libraries or frameworks). It uses the HTML drag and drop API with some added JavaScript logic for the core gameplay functionality, and it uses simple indexing operations in combination with matrices that are built within arrays to handle all of the data processing and calculations.

I began this project partly because I had an interest in all of the different gameplay elements and their relationship with each other (especially the gameplay number distribution as it relates to the size of the gameboard and the difficulty of the game), so I structured the codebase to allow for easy adjustments.

At the moment, the game begins with seven randomly-placed tiles on the board and a random tile is placed in a random open position each time the user places a tile manually. The gameboard includes seven rows of six cells per row, and the gameplay number distrubtion is as follows:

1: 10, 2: 12, 3: 10, 4: 12, 5: 10, 6: 12, 7: 7, 8: 12, 9: 9, 10: 9, 11: 7, 12: 12, 13: 7, 14: 7

I love writing JavaScript logic, and this project has been especially enjoyable. It's simple, yet fascinating, and I'm excited to see where it goes from here!

## Screenshot
![output screenshot](https://github.com/Runningman47/counting-tiles/blob/randomTile/images/s2.png)

## Updates
This is version zero of the game and I am still experimenting with different tile value distributions and variations of the random tile placement functionality, but suggestions and improvements are welcome! Fork the repo and open a PR, requesting to pull into `main`!

## Licensing
With the exception of the copyright text, along with the score and the completed rows numbers, the font used in the gameplay UI is a font called "Acme". Copyright (c) 2011, Juan Pablo del Peral. It is licensed under the SIL Open Font License, which can be found in the accompanying "license.txt" file in this repo. 

Copyright (c) 2023 Mike Schober

