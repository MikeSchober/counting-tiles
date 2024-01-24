
## Counting Tiles

This is a logic game written entirely in HTML, CSS and JavaScript (no external libraries or frameworks). It uses the HTML drag and drop API with some added JavaScript logic for the core gameplay functionality, and it uses simple indexing operations in combination with matrices that are built within arrays to handle all of the data processing and calculations.

I began this project partly because I had an interest in all of the different gameplay elements and their relationship with each other (especially the gameplay number distribution as it relates to the size of the gameboard and the difficulty of the game), so I structured the codebase to allow for easy adjustments.

After experimenting with several different variations between gameplay logic and the overall tile distribution, the game begins with seven randomly-placed tiles on the board and a random tile is placed in a random open position every 25 seconds. The gameboard includes seven rows of six cells per row, and the initial gameplay number distrubtion is as follows:

1: 100, 2: 120, 3: 100, 4: 120, 5: 100, 6: 120, 7: 70, 8: 120, 9: 90, 10: 90, 11: 70, 12: 120, 13: 70, 14: 70

As the game progresses, the interval between the placement of random tiles decreases incrementally down to a minimum of seven seconds, and the tile value distribution expands to a maximum tile value of 40. The larger prime number tile values are excluded completely but, as tile values are added, the distribution expands by fifty tiles for each of the larger values.

I love writing JavaScript logic, and this project has been so much fun. It's simple, yet fascinating, and I hope people enjoy the result.

## Screenshot
![output screenshot](https://github.com/Runningman47/counting-tiles/blob/randomTile/images/s2.png)

## Updates
This is version one of the game, as I think I have finally achieved a good balance between the tile value distribution, the random tile placement logic, and the overall gameplay structure. I am currently working on several projects, but suggestions and improvements here are welcome! Fork the repo and open a PR, requesting to pull into `main`!

## Licensing
With the exception of the copyright text, along with the score and the completed rows numbers, the font used in the gameplay UI is a font called "Acme". Copyright (c) 2011, Juan Pablo del Peral. It is licensed under the SIL Open Font License, which can be found in the accompanying "license.txt" file in this repo. 

Copyright (c) 2023 Mike Schober

