// Intro to Programming I - Final Game Project by Ricco Visser
// I have implemented extensions for sounds, platforms and enemies. I have also added fireworks when the spacebar is pressed.
// Throughout the course I've found letious sections difficult. Concepts such as functions, objects and constructors
// were all tricky to grasp at first. Topics such as vectors and a particle system was also difficult to implement.
// Almost everything implemented has been something new I've learnt. I've learnt and practiced drawing
// objects to the screen, creating functions with parameters, implementing sound and user interaction, using math functions
// such as round(), arc(), random(), map() and many more. I've also learnt and practiced how to implement and manipulate arrays, objects, classes, conditional statements and letiables.
// With this project, I have also learnt and practiced many indirect skills, such as debugging (and the letious forms that can entail),
// writing clean, concise code (including the use of indentation, comments and meaningful letiable names), and learning to ask for help when needed.


let gameChar_x;
let gameChar_y;
let floorPos_y;
let scrollPos;
let gameChar_world_x;

let isLeft;
let isRight;
let isFalling;
let isPlummeting;

let trees_x;
let clouds;
let mountains_x;
let canyons;
let collectables;

let game_score;
let scoreLetters;
let scoreColours;

let flagpole;

let lives;

let platforms;

let enemies;

let jumpSound;
let collectableSound;
let winSound;
let deathSound;
let gameoverSound;
let backgroundSound;

let dotsPosX;
let dotsPosY;

let sunPos;
let moonPos;
let brightness;
let darkness;

let gravity;
let fireworkArr = [];

function preload()
{
    soundFormats('mp3','wav');
    
    //Loading the sounds
    jumpSound = loadSound('assets/JumpSound.wav');
    collectableSound = loadSound('assets/CollectableSound.wav');
    winSound = loadSound('assets/WinSound.wav');
    deathSound = loadSound('assets/DeathSound2.wav');
    gameoverSound = loadSound('assets/GameoverSound.wav');
    backgroundSound = loadSound('assets/BackgroundSound.wav');
    jumpSound.setVolume(0.4);
    collectableSound.setVolume(0.3);
    winSound.setVolume(0.3);
    deathSound.setVolume(0.3);
    gameoverSound.setVolume(0.1);
    backgroundSound.setVolume(0.1);
}


function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;

    lives = 3;

    startGame();
    backgroundSound.loop();

	dotsPosX = [];
	dotsPosY = [];

	for(i = 0; i < 100; i++){
		dotsPosX.push(random(-3000,3000));
		dotsPosY.push(random(floorPos_y+20,height-20));
	}

	gravity = createVector(0,0.2);
}


function draw()
{
	background(100, 155, 255); // fill the sky blue

	//Draw Sun
	drawSun();

	//Draw Moon
	drawMoon();

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground


	push(); // Save the current position
	translate(scrollPos,0); //Translate the x position

	//Draw Flowers
	drawFlowers();

	// Draw clouds.
	drawClouds();

	// Draw mountains.
	drawMountains();

	// Draw trees.
	drawTrees();

	// Draw canyons.
	for(let i = 0; i < canyons.length; i++){
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
		if (isPlummeting){
			gameChar_y += 3;
		};
	}
	
	// Draw collectable items.
	for(let i = 0; i < collectables.length; i++){
		if (collectables[i].isFound == false){
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}		
	}

	//Draw platforms.
	for(let i = 0; i < platforms[0].length; i++){
		platforms[0][i].draw();
		platforms[1][i].draw();
		platforms[0][i].move(100);		//right steps
		platforms[1][i].move(100);		//left steps
	}

    renderFlagpole();        // Draw flagpole

	// Draw Enemies
	for(let i = 0; i < enemies.length; i++){
		enemies[i].draw();
		if(enemies[i].checkContact(gameChar_world_x,gameChar_y)){
			PlayerDie();
		}
	}

	pop(); //Revert back to the saved position 

    //Display Score 
    for(let i = 0; i < scoreLetters.length;i++){
        noStroke();
        textSize(20);
        fill(scoreColours[i]);
        text(scoreLetters[i], 10+i*15,30);
    }
    text(game_score,100,30)

    // Draw hearts
    for(let i = 0; i < lives; i++){
        fill(200,0,0);
        ellipse(i*50+10,50,10,15);
        ellipse(i*50+20,50,10,15);
        triangle(i*50+5,52,i*50+25,52,i*50+15,70);
    }

    //Game over if all lives have been lost.
    if(lives<1){
        noStroke();
        fill(200,50,50);
        textSize(30);
        text('Game over. Press space to continue.', 300,height/3);
        return;
    }

    //Level complete if flagpole has been reached.
    if(flagpole.isReached){
        noStroke();
        fill(200,50,50);
        textSize(30);
        text('Level complete. Press space to continue.', 300,height/3);
        return;
    }

    // Draw game character.
	drawGameChar();

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
	if (gameChar_y < floorPos_y){
		let isContact = false;
		for(let i = 0; i < platforms[0].length; i++){
			if(platforms[0][i].checkContact(gameChar_world_x,gameChar_y) == true || platforms[1][i].checkContact(gameChar_world_x,gameChar_y) == true){
				isContact = true;
				isFalling = false;
				break;
			}
		}
		if(isContact == false){
			if(platforms[0][0].collapseCount > 0){
				platforms[0][0].collapseCount = 60;
			}
			if(platforms[1][0].collapseCount > 0){
				platforms[1][0].collapseCount = 60;
			}
			gameChar_y += 2;
			isFalling = true;
		}
	}
	else{
		isFalling = false;
	};

    if(flagpole.isReached == false){
        checkFlagpole();
    }

	if(gameChar_y > height){
		PlayerDie();
	}
    
	//Fireworks

	for(let i = fireworkArr.length-1 ; i >= 0; i--){
		fireworkArr[i].update();
		fireworkArr[i].show();
		if(fireworkArr[i].done()){
			fireworkArr.splice(i,1);
		}
	}	

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Increase brightness of screen as sun rises and increase darkness as moon rises
	brightness = map(sunPos,floorPos_y+100, 100, 0, 30,true);
	darkness = map(moonPos,floorPos_y+100, 100, 0, 30, true);

	//Increase darkness as moon comes up
	noStroke();
	fill(255,brightness);
	rect(0,0,width,height);

	//Increase brightness as sun comes up
	fill(0,darkness);
	rect(0,0,width,height);
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed(){

	if (keyCode == 37 || key == "a"){		//left arrow or 'a'
		isLeft = true;
	}
	
	if (keyCode == 39 || key == "d"){		//right arrow or 'd'
		isRight = true;
	}

	if (keyCode == 38 || key == "w"){		// up arrow or 'w'
		if(!isFalling && !isPlummeting && lives > 0){
			gameChar_y -= 100;
        	jumpSound.play();
		}
	}

	if (keyCode == 32){						//spacebar
		fireworkArr.push(new Fireworks());
	}
}

function keyReleased()
{
	if (keyCode == 37 || key == "a"){
		isLeft = false;
	}
	else if (keyCode == 39 || key == "d"){
		isRight = false;
	}
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	if(isLeft && isFalling)
	{
		//Jumping Left Code
		//legs
		fill(16, 9, 224); //blue
		rect(gameChar_x - 13, gameChar_y - 28, 10, 20); //left
		rect(gameChar_x + 3, gameChar_y - 28, 10, 20); //right

		//shoes
		fill(66, 38, 23); //brown
		rect(gameChar_x -20, gameChar_y - 8, 17, 6); //left
		rect(gameChar_x-1, gameChar_y - 8, 14, 6); //right

		//body
		fill(176, 14, 14); //red
		triangle(gameChar_x - 13, gameChar_y - 28, gameChar_x, gameChar_y - 60, gameChar_x + 13, gameChar_y - 28);

		// arms
		fill(224, 172, 105); //skin
		quad(gameChar_x-6, gameChar_y-45, gameChar_x-20,gameChar_y-52,gameChar_x-21,gameChar_y-43,gameChar_x-9,gameChar_y-38);
		quad(gameChar_x+6, gameChar_y-45, gameChar_x+20,gameChar_y-52,gameChar_x+21,gameChar_y-43,gameChar_x+9,gameChar_y-38);

		// face
		ellipse(gameChar_x,gameChar_y-60,20,20); //head
		fill(0);
		ellipse(gameChar_x-4,gameChar_y-62,3); //left eye
		stroke(0);
		line(gameChar_x-8,gameChar_y-55,gameChar_x-3,gameChar_y-55); // mouth
		line(gameChar_x,gameChar_y-56,gameChar_x-3, gameChar_y-55);
	}
	else if(isRight && isFalling)
	{
		//Jumping Right Code
		//legs
		fill(16, 9, 224); //blue
		rect(gameChar_x - 13, gameChar_y - 28, 10, 20); //left
		rect(gameChar_x + 3, gameChar_y - 28, 10, 20); //right

		//shoes
		fill(66, 38, 23); //brown
		rect(gameChar_x -13, gameChar_y - 8, 14, 6); //left
		rect(gameChar_x + 3, gameChar_y - 8, 17, 6); //right

		//body
		fill(176, 14, 14); //red
		triangle(gameChar_x - 13, gameChar_y - 28, gameChar_x, gameChar_y - 60, gameChar_x + 13, gameChar_y - 28);

		// arms
		fill(224, 172, 105); //skin
		quad(gameChar_x-6, gameChar_y-45, gameChar_x-20,gameChar_y-52,gameChar_x-21,gameChar_y-43,gameChar_x-9,gameChar_y-38);
		quad(gameChar_x+6, gameChar_y-45, gameChar_x+20,gameChar_y-52,gameChar_x+21,gameChar_y-43,gameChar_x+9,gameChar_y-38);

		// face
		ellipse(gameChar_x,gameChar_y-60,20,20); //head
		fill(0);
		ellipse(gameChar_x+3,gameChar_y-62,3); //right eye
		stroke(0);
		line(gameChar_x,gameChar_y-55,gameChar_x+7,gameChar_y-55); // mouth
		line(gameChar_x-2,gameChar_y-56,gameChar_x,gameChar_y-55);
	}
	else if(isLeft)
	{
		//Walking Left Code
		//legs
		fill(16, 9, 224); //blue
		rect(gameChar_x - 13, gameChar_y - 23, 10, 20); //left
		rect(gameChar_x + 3, gameChar_y - 23, 10, 20); //right

		//shoes
		fill(66, 38, 23); //brown
		rect(gameChar_x -20, gameChar_y - 3, 17, 6); //left
		rect(gameChar_x -1, gameChar_y -3, 14, 6); //right

		//body
		fill(176, 14, 14); //red
		triangle(gameChar_x - 13, gameChar_y - 23, gameChar_x, gameChar_y - 55, gameChar_x + 13, gameChar_y - 23);

		// arms
		fill(224, 172, 105); //skin
		quad(gameChar_x - 13, gameChar_y - 43, gameChar_x - 6, gameChar_y - 40, gameChar_x - 13, gameChar_y - 20, gameChar_x - 21, gameChar_y - 20); //left
		quad(gameChar_x + 13, gameChar_y - 43, gameChar_x + 6, gameChar_y - 40, gameChar_x + 13, gameChar_y - 20, gameChar_x + 21, gameChar_y - 20); //right

		// face
		ellipse(gameChar_x,gameChar_y-55,20,20); //head
		fill(0);
		ellipse(gameChar_x-4,gameChar_y-57,3); //left eye
		stroke(0);
		line(gameChar_x-8,gameChar_y-50,gameChar_x,gameChar_y-50); // mouth
	}
	else if(isRight)
	{
		//Walking Right Code
		//legs
		fill(16, 9, 224); //blue
		rect(gameChar_x - 13, gameChar_y - 23, 10, 20); //left
		rect(gameChar_x + 3, gameChar_y - 23, 10, 20); //right

		//shoes
		fill(66, 38, 23) //brown
		rect(gameChar_x -13, gameChar_y - 3, 14, 6); //left
		rect(gameChar_x + 3, gameChar_y -3, 17, 6); //right

		//body
		fill(176, 14, 14); //red
		triangle(gameChar_x - 13, gameChar_y - 23, gameChar_x, gameChar_y - 55, gameChar_x + 13, gameChar_y - 23);

		// arms
		fill(224, 172, 105); //skin
		quad(gameChar_x - 13, gameChar_y - 43, gameChar_x - 6, gameChar_y - 40, gameChar_x - 13, gameChar_y - 20, gameChar_x - 21, gameChar_y - 20); //left
		quad(gameChar_x + 13, gameChar_y - 43, gameChar_x + 6, gameChar_y - 40, gameChar_x + 13, gameChar_y - 20, gameChar_x + 21, gameChar_y - 20); //right

		// face
		ellipse(gameChar_x,gameChar_y-55,20,20); //head
		fill(0);
		ellipse(gameChar_x+3,gameChar_y-57,3); //right eye
		stroke(0);
		line(gameChar_x-1,gameChar_y-50,gameChar_x+7,gameChar_y-50); // mouth
	}
	else if(isFalling || isPlummeting)
	{
		//Jumping Facing Forwards Code
		//legs
		fill(16, 9, 224); //blue
		rect(gameChar_x - 13, gameChar_y - 28, 10, 20); //left
		rect(gameChar_x + 3, gameChar_y - 28, 10, 20); //right

		//shoes
		fill(66, 38, 23); //brown
		rect(gameChar_x -20, gameChar_y - 8, 17, 6); //left
		rect(gameChar_x + 3, gameChar_y - 8, 17, 6); //right

		//body
		fill(176, 14, 14); //red
		triangle(gameChar_x - 13, gameChar_y - 28, gameChar_x, gameChar_y - 60, gameChar_x + 13, gameChar_y - 28);

		// arms
		fill(224, 172, 105); //skin
		quad(gameChar_x-6, gameChar_y-45, gameChar_x-20,gameChar_y-52,gameChar_x-21,gameChar_y-43,gameChar_x-9,gameChar_y-38);
		quad(gameChar_x+6, gameChar_y-45, gameChar_x+20,gameChar_y-52,gameChar_x+21,gameChar_y-43,gameChar_x+9,gameChar_y-38);

		// face
		ellipse(gameChar_x,gameChar_y-60,20,20); //head
		fill(0);
		ellipse(gameChar_x-4,gameChar_y-62,3); //left eye
		ellipse(gameChar_x+3,gameChar_y-62,3); //right eye
		stroke(0);
		line(gameChar_x-4,gameChar_y-55,gameChar_x+3,gameChar_y-55); // mouth
		line(gameChar_x-6,gameChar_y-56,gameChar_x-4,gameChar_y-55);
		line(gameChar_x+5,gameChar_y-56,gameChar_x+3, gameChar_y-55);
	}
	else
	{
		//Standing Facing Forwards Code
		//legs
	    fill(16, 9, 224); //blue
	    rect(gameChar_x - 13, gameChar_y - 23, 10, 20); //left
	    rect(gameChar_x + 3, gameChar_y - 23, 10, 20); //right

        //shoes
        fill(66, 38, 23) //brown
        rect(gameChar_x -20, gameChar_y - 3, 17, 6); //left
        rect(gameChar_x + 3, gameChar_y -3, 17, 6); //right

        //body
        fill(176, 14, 14); //red
        triangle(gameChar_x - 13, gameChar_y - 23, gameChar_x, gameChar_y - 55, gameChar_x + 13, gameChar_y - 23);

        // arms
        fill(224, 172, 105); //skin
        quad(gameChar_x - 13, gameChar_y - 43, gameChar_x - 6, gameChar_y - 40, gameChar_x - 13, gameChar_y - 20, gameChar_x - 21, gameChar_y - 20); //left
        quad(gameChar_x + 13, gameChar_y - 43, gameChar_x + 6, gameChar_y - 40, gameChar_x + 13, gameChar_y - 20, gameChar_x + 21, gameChar_y - 20); //right

        // face
        ellipse(gameChar_x,gameChar_y-55,20,20); //head
        fill(0);
        ellipse(gameChar_x-4,gameChar_y-57,3); //left eye
        ellipse(gameChar_x+3,gameChar_y-57,3); //right eye
        stroke(0);
        line(gameChar_x-5,gameChar_y-50,gameChar_x+4,gameChar_y-50); // mouth (smiles when jumping)
        };
}

// ---------------------------
// Background render functions
// ---------------------------

//Function to draw Sun
function drawSun(){
	noStroke();
	sunPos = map(gameChar_world_x,550,1900,floorPos_y+100, 100, true);		// As the character moves right, the sun moves up
	fill(252, 229, 112);
	ellipse(width-100,sunPos, 70, 70);
}

//Function to draw Moon
function drawMoon(){
	noStroke();
	moonPos = map(gameChar_world_x, 550, -1000, floorPos_y+100, 100, true);	// As the character moves left, the moon moves up
	fill(200);
	ellipse(100,moonPos, 70, 70);
}

//Function to draw Flowers
function drawFlowers(){
	noStroke();
	for(let i = 0; i < dotsPosX.length; i++){
		fill(200,200,0);
		ellipse(dotsPosX[i],dotsPosY[i],5,5);
		fill(255);
		ellipse(dotsPosX[i],dotsPosY[i]-4,3,5);
		ellipse(dotsPosX[i]+4,dotsPosY[i],5,3);
		ellipse(dotsPosX[i]-4,dotsPosY[i],5,3);
		ellipse(dotsPosX[i],dotsPosY[i]+4,3,5);
	}
}

// Function to draw cloud objects.
function drawClouds(){
	for (let i = 0; i < clouds.length; i++){ 	
		fill(244, 230, 255); 
		ellipse(clouds[i].x_pos,clouds[i].y_pos,clouds[i].size*3,clouds[i].size);
		ellipse(clouds[i].x_pos,clouds[i].y_pos-20,clouds[i].size*1.2,clouds[i].size*1.2);
		ellipse(clouds[i].x_pos+40,clouds[i].y_pos-10,clouds[i].size,clouds[i].size);
		ellipse(clouds[i].x_pos-40,clouds[i].y_pos-10,clouds[i].size,clouds[i].size);
	}
}

// Function to draw mountains objects.
function drawMountains(){
	for (let i = 0; i < mountains_x.length; i++){
		fill(102, 89, 92); // grey mountain
		triangle(mountains_x[i],floorPos_y,mountains_x[i]+150,floorPos_y-332,mountains_x[i]+300,floorPos_y);
		fill(255); // white snow
		triangle(mountains_x[i]+100,floorPos_y-222,mountains_x[i]+150,floorPos_y-332,mountains_x[i]+200,floorPos_y-222);
	}
}

// Function to draw trees objects.
function drawTrees(){
	for(let i = 0; i < trees_x.length ; i++){
		fill(64, 6, 19);
		rect(trees_x[i],floorPos_y,70,-100); // trunk 
		fill(10, 122, 6);
		triangle(trees_x[i]-50,floorPos_y-70,trees_x[i]+35,floorPos_y-182,trees_x[i]+120,floorPos_y-70); //leaves
		triangle(trees_x[i]-50,floorPos_y-100,trees_x[i]+35,floorPos_y-212,trees_x[i]+120,floorPos_y-100);
		triangle(trees_x[i]-50,floorPos_y-130,trees_x[i]+35,floorPos_y-242,trees_x[i]+120,floorPos_y-130);
		fill(212, 4, 4);
		ellipse(trees_x[i]+60,floorPos_y-132,20,20); //apple
	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
	fill(64, 57, 57); 		
	rect(t_canyon.x_pos, floorPos_y, t_canyon.width,152); //pit  
	fill(224, 172, 105);
	rect(t_canyon.x_pos+33,floorPos_y+118,15,-20); //arm
	ellipse(t_canyon.x_pos+25,floorPos_y+118,20); //head
	fill(0);
	ellipse(t_canyon.x_pos+30,floorPos_y+113,5); //eyes
	ellipse(t_canyon.x_pos+20,floorPos_y+113,5);
	fill(255, 119, 0);
	rect(t_canyon.x_pos,floorPos_y+118,t_canyon.width,26); //lava
	fill(230, 27, 16);
	strokeWeight(2);
	stroke(230, 27, 16);
	line(t_canyon.x_pos+10,floorPos_y+138,t_canyon.x_pos+20,560);						//red lines in lava
	line(t_canyon.x_pos + t_canyon.width/2,floorPos_y+138,t_canyon.x_pos + t_canyon.width/2+10,560);
	line(t_canyon.x_pos + t_canyon.width-20,floorPos_y+138,t_canyon.x_pos + t_canyon.width-10,560);
	noStroke();
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
	if (gameChar_world_x > t_canyon.x_pos && gameChar_world_x < (t_canyon.x_pos + t_canyon.width) && gameChar_y >= floorPos_y){
		isPlummeting = true;
	}
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
	fill(255, 230, 0);
	rect(t_collectable.x_pos,t_collectable.y_pos,30,20);
	fill(173, 157, 7);
	triangle(t_collectable.x_pos,t_collectable.y_pos,t_collectable.x_pos+15,t_collectable.y_pos-20,t_collectable.x_pos+30,t_collectable.y_pos);
	triangle(t_collectable.x_pos,t_collectable.y_pos+20,t_collectable.x_pos+15,t_collectable.y_pos+40,t_collectable.x_pos+30,t_collectable.y_pos+20);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
	if (dist(gameChar_world_x,gameChar_y,t_collectable.x_pos,t_collectable.y_pos) < 70){
		t_collectable.isFound = true;
        game_score += 1;
        collectableSound.play();
	};

	if (t_collectable.isFound == false){
		drawCollectable(t_collectable);
	};
}


// Function that draws Flagpole

function renderFlagpole(){
    push();

    strokeWeight(8);
    stroke(171, 247, 94);
    line(flagpole.x_pos,floorPos_y,flagpole.x_pos,floorPos_y-200);
    strokeWeight(2);
    stroke(0);
    fill(8, 92, 6);
    ellipse(flagpole.x_pos,floorPos_y-200,20)

    if(flagpole.isReached == false){
		noStroke();
		fill(255);
		triangle(flagpole.x_pos-40,floorPos_y-185,flagpole.x_pos-3,floorPos_y-185,flagpole.x_pos-3,floorPos_y-140);
		noFill();
		stroke(8, 92, 6);
		ellipse(flagpole.x_pos-15,floorPos_y-175,10);
    }
    else{
        noStroke();
        fill(255);
        triangle(flagpole.x_pos-40,floorPos_y-55,flagpole.x_pos-3,floorPos_y-55,flagpole.x_pos-3,floorPos_y-10);
        noFill();
        stroke(8, 92, 6);
        ellipse(flagpole.x_pos-15,floorPos_y-45,10);
    }
    pop();
}

//Function to check if flagpole has been reached

function checkFlagpole(){
    let d = abs(gameChar_world_x - flagpole.x_pos);
    if(d < 25){
        flagpole.isReached = true;
        backgroundSound.stop();
        winSound.play();
    } 
}

//Function if player has died

function PlayerDie(){
    lives -= 1;
    if(lives>0){
        startGame();
        deathSound.play();
    } else if(lives == 0){
        backgroundSound.stop();
        gameoverSound.play();
    }
}

// Constructor Function to make Particles

function Particle(x,y,hue,fireworkSeed){
	this.pos = createVector(x,y);
	this.fireworkSeed = fireworkSeed;
	this.lifespan = 255;
	this.hue = hue;

	if(this.fireworkSeed){
		this.vel = createVector(0,map(gameChar_y,432,192,-11,-8));
	}
	else{
		this.vel = p5.Vector.random2D();
		this.vel.mult(random(2,10));
	}
		this.acc = createVector(0,0);

	this.applyForce = function(force){
		this.acc.add(force);
	}

	this.update = function(){
		if(!this.fireworkSeed){
			this.vel.mult(0.9);
			this.lifespan -= random(1,10);
		}
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}

	this.done = function(){
		if(this.lifespan < 0){
			return true;
		}
		else{
			return false;
		}
	}

	this.show = function(){
		colorMode(HSB);
		if(!this.fireworkSeed){
			strokeWeight(5);
			stroke(this.hue,255,255,this.lifespan);
		}
		else{
			strokeWeight(6);
			stroke(this.hue,255,255);
		}
		
		point(this.pos.x, this.pos.y);
		strokeWeight(1);
		colorMode(RGB);
	}
}

// Constructor Function to make fireworks

function Fireworks(){
	this.hue = random(255);
	this.firework = new Particle(gameChar_x,gameChar_y, this.hue, true);
	this.exploded = false;
	this.partclesArr = [];

	this.done = function(){
		if(this.exploded && this.partclesArr.length == 0){
			return true;
		}
		else{
			return false;
		}
	}

	this.update = function(){
		if(!this.exploded){
			this.firework.applyForce(gravity);
			this.firework.update();

			if(this.firework.vel.y >= 0){
				this.exploded = true;
				this.explode();
			}
		}
		for(let i = this.partclesArr.length-1; i >= 0; i--){
			this.partclesArr[i].applyForce(gravity);
			this.partclesArr[i].update();
			if(this.partclesArr[i].done()){
				this.partclesArr.splice(i,1);
			}
		}
	}

	this.explode = function(){
		for(let i = 0; i<100; i++){
			let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hue, false);
			this.partclesArr.push(p);
		}
	}


	this.show = function(){
		if(!this.exploded){
			this.firework.show();
		}
		for(let i = 0; i < this.partclesArr.length; i++){
			this.partclesArr[i].show();
		}
	}

}

// Function to make platforms
function createPlatforms(x,y,direction,colour, collapseCount){

	let p = {x: x, y: y, direction: direction, colour: colour, collapseCount: collapseCount,
	draw: function(){
		strokeWeight(1);
		stroke(0);
		fill(this.colour);
		if(this.checkContact == false && this.collapseCount > 0){
			this.collapseCount = 60;
		}
		if(this.collapseCount < 60 && this.collapseCount > 0){
			rect(this.x + random(-5,5), this.y, 100, 20);
		} else{
			rect(this.x, this.y, 100, 20);
		} 
		if(this.collapseCount < 0){
			this.y += 6;
		 }
		noStroke();
	},
	checkContact: function(gc_x, gc_y){
		if(gc_x > this.x && gc_x < this.x + 100){
			let d = this.y - gc_y;
			if(d >= 0 && d < 1){
				this.collapseCount -=1;
				return true;
			}
		}
		return false;
	},
	move: function(distance){
		let anchor = x;
		if(this.x > anchor + distance){
			this.direction = -(random(.5,1.5));
		} else if(this.x < anchor){
			this.direction = random(.5,1.5);
		}
		this.x += this.direction;
	}
	}
	
	return p;
}



// Constructor Function for enemies
function Enemy(x,y,range,colour,speed){
	this.x = x;
	this.y = y;
	this.range = range;
	this.currentX = x;
	this.colour = colour;
	this.speed = speed;

	this.update = function(){
		this.currentX += this.speed;
		if(this.currentX > this.x + this.range || this.currentX < this.x){
			this.speed *= -1;
		}
	}

	this.draw = function(){
		this.update();
		push();		//Save the pre-existing state
		translate(this.currentX ,this.y);		//origin (0,0) is now at (this.CurrentX,this.y)
		rotate(this.currentX/20);			//rotate the enemy
		fill(this.colour);
		ellipse(0, 0, 40);			//body
		fill(255);
		ellipse(0-5, 0-3, 7, 9);	//eyes
		ellipse(0+5, 0-3, 7, 9);
		fill(0)
		ellipse(0-5, 0-3, 4);
		ellipse(0+5, 0-3, 4);

		stroke(0);
		strokeWeight(2);
		noFill();
		arc(0, 0+13, 20, 5, PI, 0);			//mouth
		strokeWeight(3);
		arc(0 -15, 0-7, 25, 15, 5.5, 0);		//eyebrows
		arc(0 +15, 0-7, 25, 15, PI, 3.66);
		noStroke();

		fill(255,165,0);					// spikes
		triangle(0-3,0-20,0,0-25,0+3,0-20);
		triangle(0-20,0-3,0-25,0,0-20,0+3);
		triangle(0-3,0+20,0,0+25,0+3,0+20);
		triangle(0+20,0-3,0+25,0,0+20,0+3);
		pop();			// Go back to pre-saved state
		
	}

	this.checkContact = function(gc_x, gc_y){
		let d = dist(gc_x, gc_y, this.currentX, this.y)
		if(d < 40){
			return true
		}
		return false;
	}
}

function startGame(){
    gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// letiable to control the background scrolling.
	scrollPos = 0;

	// letiable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean letiables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	trees_x = [-750, -300, -100, 140, 600, 800, 1700];

	clouds = [{		//Clouds array - 7 elements
		x_pos: -1000,
		y_pos: 80,
		size: 55
	},
	{
		x_pos: -50,
		y_pos: 95,
		size: 60
	},
	{
		x_pos: 300,
		y_pos: 80,
		size: 50
	},
	{
		x_pos: 500,
		y_pos: 65,
		size: 55
	},
	{
		x_pos: 800,
		y_pos: 70,
		size: 40
	},
	
	{
		x_pos: 1100,
		y_pos: 95,
		size: 40
	},
	{
		x_pos: 1600,
		y_pos: 80,
		size: 40
	}];

	mountains_x = [-600, 0, 500, 1200]; // Mountains array - 4 elements

	canyons = [{  	// Canyons array - 6 elements
		x_pos: -550,
		width: 110
	},
	{
		x_pos: -200,
		width: 150
	},
	{		
		x_pos: 200,
		width: 100
	},
	{
		x_pos: 720,
		width: 200
	},
	{
		x_pos: 1150,
		width: 160
	},
	{
		x_pos: 1800,
		width: 140
	}];

	collectables =  [{  //Collectables array - 5 elements
		x_pos: -900,
		y_pos: 350,
		isFound: false
	},
	{		
		x_pos: -200,
		y_pos: 30,
		isFound: false
	},
	{
		x_pos: 930,
		y_pos: 370,
		isFound: false
	},
	{
		x_pos: 1300,
		y_pos: 130,
		isFound: false
	},
	{
		x_pos: 1900,
		y_pos: 320,
		isFound: false
	}];

	platforms = [[],[]];


	platforms[0].push(createPlatforms(700, floorPos_y-80, 0, color(219, 20, 7), 60));	// right down step
	platforms[1].push(createPlatforms(0, floorPos_y-80, 0, color(219, 20, 7), 60));		// left down step

		
	for(let i = 1; i < 3; i++){
			platforms[0].push(createPlatforms(platforms[0][i-1].x+120, platforms[0][i-1].y - 80,1, color(220,85,57))) //right up steps
			platforms[1].push(createPlatforms(platforms[1][i-1].x-120, platforms[0][i-1].y - 80, 1, color(220,85,57)))	//left up steps
		}
	
    game_score = 0;
    scoreLetters = ['S','c','o','r','e',':'];
    scoreColours = ['red','orange','yellow','green','darkblue','purple'];

    flagpole = {isReached: false, x_pos: 2000};

	enemies = [];
	enemies.push(new Enemy(-440, floorPos_y - 10, 240, color(random(0,255),random(0,255),random(0,255)), 1));
	enemies.push(new Enemy(-50,floorPos_y - 10, 250, color(random(0,255),random(0,255),random(0,255)), 2));
	enemies.push(new Enemy(920, floorPos_y - 10, 230, color(random(0,255),random(0,255),random(0,255)), 1));
	enemies.push(new Enemy(1310, floorPos_y - 10, 490, color(random(0,255),random(0,255),random(0,255)), 2));
	enemies.push(new Enemy(1310, floorPos_y - 10, 490, color(255,0,0), 3));
}
