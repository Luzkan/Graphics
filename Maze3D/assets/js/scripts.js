// $ for getting elements by ID and "dc" to create a new one
var $ = function(id) { return document.getElementById(id); };
var dc = function(tag) { return document.createElement(tag); };

// Defining a map
// If I would need to access block data on a map, I just need to go for map[x][y]
var map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,5,3,0,0,1,1,1,2,1,1,1,1,1,2,1,1,1,2,1,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
	[1,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,2,0,2,2,2,2,2,2,2,2,0,2,4,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,3,3,4,2,2,2,2,2,2,2,2,2,2,2,2,2,4,3,3,4,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

console.log(map[1].length + " " + map.length)

// Player Model.
var player = {
	x : 16,							// X, Y is the position on the map
	y : 10,
	dir : 0,						// Dir is turning direction (-1 left, 1 right)
	rot : 0,						// Rot is the angle the player is facing
	speed : 0,						// Indicator of movement (-1 backwards, 1 forwards)
	moveSpeed : 0.18,				// Movement speed per frame
	rotSpeed : 6 * Math.PI / 180	// Rotation speed per frame
}

// Map width and height defined for the boundaries 
var mapWidth = map[0].length;
var mapHeight = map.length;

// Canvas height/width defined to be fullscreen
var screenWidth = innerWidth;
var screenHeight = innerHeight;

// How big the minimap should be (minimap is a canvas too)
var miniMapScale = 6;

// Horizontal Scan Width checks with defined interspace for objects
// Later on I'm going to use rays. If = 1, then whole canvas will be scanned.
var horizScanWidth = 1;
var numRays = Math.ceil(screenWidth / horizScanWidth);

// Field of View, necessery for 3D related stuff
var fov = 90 * Math.PI / 180;
var fovHalf = fov / 2;			

var viewDist = (screenWidth/2) / Math.tan((fov / 2));
var twoPI = (Math.PI*2);

// ------------------------------------------------------------------

// Initialization - setup of the game
// It will draw the minimap and initial screen + bind the keyboard controls
// Then proceeds to start gameCycle() and begin the game.
function init() {
	bindKeys();
	initScreen();
	drawMiniMap();
	gameCycle();
}

// Keybinding - has to be dependant on values like speed
// Otherwise if it would be just "onPress" then we would have
// lag after press of a button before actual continous input would be registered.
function bindKeys() {
	document.onkeydown = function(e) {
		e = e || window.event;
		switch (e.keyCode) { 
			case 87: 				// (W) Forward
				player.speed = 1;
				break;
			case 83: 				// (S) Backwards
				player.speed = -1;
				break;
			case 65: 				// (A) Rotate Left
				player.dir = -1;
				break;
			case 68: 				// (D) Rotate Right
				player.dir = 1;
				break;
		}
	}
	document.onkeyup = function(e) {
		e = e || window.event;
		switch (e.keyCode) {
			case 87:				// (W)
			case 83:				// (S)
				player.speed = 0;	// Stop movement
				break;
			case 65:				// (A)
			case 68:				// (D)
				player.dir = 0;		// Stop rotating
				break;
		}
	}
}

// First screen initialization
function initScreen() {
	var thegame = $("thegame"); 			// Get "thegame" canvas
	thegame.width=innerWidth;				// Fullscreen the width
	thegame.height=innerHeight;				// 			  and height
	gameScreen=thegame.getContext("2d");	// Get 2D context of "thegame"
}

// Minimap initialization (the non-moving stuff on it)
function drawMiniMap() {
	var miniMap = $("minimap");						// Minimap
	var miniMapCtr = $("minimapcontainer");			// Container that has minimap and it's objects
	var miniMapObjects = $("minimapobjects");		// Canvas in which we draw player and his vision

	miniMap.width = mapWidth * miniMapScale;		// Resize with scale
	miniMap.height = mapHeight * miniMapScale;	
	miniMapObjects.width = miniMap.width;
	miniMapObjects.height = miniMap.height;

	var ctx = miniMap.getContext("2d");			
	ctx.fillStyle = "rgb(255, 255, 255, 1)";	  // Minimap background
	ctx.fillRect(0,0,miniMap.width,miniMap.height);

	for (var y=0;y<mapHeight;y++) {					// Loop through the defined map
		for (var x=0;x<mapWidth;x++) {
			var wall = map[y][x];

			if(wall == 5){							// Finish block
				ctx.fillStyle = "rgb(0,0,255)";
				ctx.fillRect(x * miniMapScale, y * miniMapScale, miniMapScale,miniMapScale);
			}
			else if (wall > 0) { 					// If block/wall/object found - draw it
				ctx.fillStyle = "rgb(200,200,200)";
				ctx.fillRect(x * miniMapScale, y * miniMapScale, miniMapScale,miniMapScale);
			}
		}
	}
	updateMiniMap();
}

function gameCycle() {
	move();
	updateMiniMap();
	resetCanvas();
	castRays();
	setTimeout(gameCycle,1000/30); // aim for 30 FPS
}

// ------------------------------------------------------------------

// Movement functionality
function move() {
	var moveStep = player.speed * player.moveSpeed;	// Player steps
	player.rot += player.dir * player.rotSpeed; 	// Rotation (default = 0, so whole equation = 0 if not rotating)

	// New player position calculated similiarly to turtle steps in turtle graphic
	var newX = player.x + Math.cos(player.rot) * moveStep;
	var newY = player.y + Math.sin(player.rot) * moveStep;

	// Check if the position is allowed or a win
	if (winningBlock(newX, newY)){
		// alert("You completed the maze!");
		generateMap()
	} else if (isBlocking(newX, newY)) {
		return;
	}
	
	// Set new position
	player.x = newX;
	player.y = newY;
}

// Collision functionality
function isBlocking(x,y) {
	// Check if out of bounds & Check if not "air"
	if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth) return true;
	if (map[Math.floor(y)][Math.floor(x)] != 0) 		   return true; 
}

// Collision functionality
function winningBlock(x,y) {
	// Check if out of bounds & Check if not "air"
	if (map[Math.floor(y)][Math.floor(x)] == 5) 		   return true; 
}

// ------------------------------------------------------------------

// Minimap
function updateMiniMap() {
	var miniMap = $("minimap");
	var miniMapObjects = $("minimapobjects");

	var minimapStuff = miniMapObjects.getContext("2d");
	miniMapObjects.width = miniMapObjects.width;

	// Player represented as a rectangle
	minimapStuff.fillStyle = "purple";
	minimapStuff.fillRect(player.x * miniMapScale - 2, player.y * miniMapScale - 2, 4, 4);

	// Vision represented as line
	minimapStuff.strokeStyle = "purple";
	minimapStuff.beginPath();
	minimapStuff.moveTo(player.x * miniMapScale, player.y * miniMapScale);
	minimapStuff.lineTo((player.x + Math.cos(player.rot) * 2.5) * miniMapScale, (player.y + Math.sin(player.rot) * 2.5) * miniMapScale);
	minimapStuff.closePath();
	minimapStuff.stroke();
}

// ------------------------------------------------------------------

// Update canvas with background colors to "erase"
function resetCanvas(){
	// Ceiling ("skybox")
	gameScreen.beginPath();
	gameScreen.rect(0, 0, thegame.width, (thegame.height)/2);
	gameScreen.fillStyle = "rgb(0, 0, 0)";
	gameScreen.fill();
	gameScreen.closePath();
	// Floor
	gameScreen.beginPath();
	gameScreen.rect(0, (thegame.height)/2, thegame.width, (thegame.height)/2);
	gameScreen.fillStyle = "rgb(138, 138, 138)";
	gameScreen.fill();
	gameScreen.closePath();
}

// ------------------------------------------------------------------

function castRays() {
	// Game is segmented to vertical lines, give each line an ID
	var horizScanIdx = 0;

	// Loop performing the horizontal scans for objects
	for (var i=0;i<numRays;i++) {

		//				  /|
		//				 / |		a = rayScreenPos
		//			  c /  | a		c = rayViewDistance
		//			   /   |		α = rayAngle
		//			  /	   |
		//			 /α _ _|
		//
		// This is a triangle we will operate on to create 3D effect.

		// Position where the ray passes on the screen.
		var rayScreenPos = (-numRays/2 + i) * horizScanWidth;

		// Distance from the player to the point on the screen
		// Calculated with Pythagoras Triangle (c^2 = a^2 + b^2)
		var rayViewDist = Math.sqrt(rayScreenPos*rayScreenPos + viewDist*viewDist);

		// the angle of the ray, relative to the viewing direction.
		// right triangle: a = sin(A) * c

		// Angle of the ray (relative to the viewing direction)
		// Horizontal Angle (at Straight Line in a Triangle): sin(alfa) = (a/c) 
		var rayAngle = Math.asin(rayScreenPos / rayViewDist);

		// Ray is shot from the calculated angle + player current view
		// 							to get the angle in gameworld space
		castSingleRay(rayAngle + player.rot, horizScanIdx++);
	}
}

function castSingleRay(rayAngle, horizScanIdx) {

	// Ray Angle must be in range (0, 360) degree
	rayAngle %= twoPI;
	if (rayAngle < 0) rayAngle += twoPI;

	// Determined by which quadrant the angle is in.
	// Moving right if angle is (90, 270) left if (0, 90) & (270, 360)
	// Moving up if angle is (180, 360), down if (0, 180)
	var right = (rayAngle > twoPI * 0.75 || rayAngle < twoPI * 0.25);
	var up = (rayAngle < 0 || rayAngle > Math.PI);

	// Prepare sin and cos of the angle to not overdue the command.
	var angleSin = Math.sin(rayAngle);
	var angleCos = Math.cos(rayAngle);

	// Distance to X and Y coordinate where ray hitted the block
	var dist = 0;
	var xHit = 0;
	var yHit = 0;

	// Type of the wall hitted (0 is air / nothing)
	var wallType = 0;
	var wallIsHorizontal = false;

	// Check against the vertical map/wall lines.
	// Move to the right or left edge of the block player is standing in
	// Then move 1 map unit step horizontally.
	// The amount to move vertically is determined by the tilt of the ray (sin(a)/cos(a))

	var tilt = angleSin / angleCos; 			// Tilt of the straight line made by the ray
	var dXVer = right ? 1 : -1; 				// Move 1 map unit to the left or right
	var dYVer = dXVer * tilt; 					// Move up or down (~tilt)

	// Starting horizontal and vertical position 
	var x = right ? Math.ceil(player.x) : Math.floor(player.x);	// [H] at one of the edges of the current map block
	var y = player.y + (x - player.x) * tilt;					// [V] we add the small horizontal step we just made, multiplied by the tilt.

	// While in map borders
	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		var wallX = Math.floor(x + (right ? 0 : -1));
		var wallY = Math.floor(y);

		// Check if found point is not "air"
		if (map[wallY][wallX] > 0) {

			var distX = x - player.x;			// Calculate the distance of found object to the player
			var distY = y - player.y;
			dist = distX*distX + distY*distY;	// That distance, squared.

			wallType = map[wallY][wallX]; 		// Save type of the object for later
			edgeX = y % 1;						// Left edge X coordinate of the wall
			if (!right) edgeX = 1 - edgeX; 		// If looking at left side of the map, the edge should be reversed

			xHit = x;							// Saving coordinates of the place ray hitted
			yHit = y;							// 					    	(used for minimap)
			wallIsHorizontal = true;
			break;
		}
		x += dXVer;
		y += dYVer;
	}

	// Check against the horizontal map/wall lines. It's the same but reversed.
	var tilt = angleCos / angleSin; 				// Tilt of the straight line made by the ray
	var dYHor = up ? -1 : 1;						// Move 1 map unit up or down
	var dXHor = dYHor * tilt;						// Move right or left (~tilt)

	// Starting horizontal and vertical position 
	var y = up ? Math.floor(player.y) : Math.ceil(player.y);	// [V] at one of the edges of the current map block
	var x = player.x + (y - player.y) * tilt;					// [H] we add the small horizontal step we just made, multiplied by the tilt.

	// While in map borders
	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		var wallY = Math.floor(y + (up ? -1 : 0)); 	
		var wallX = Math.floor(x);		

		// Check if found point is not "air"
		if (map[wallY][wallX] > 0) {

			// Calculate the distance of found object to the player
			var distX = x - player.x;
			var distY = y - player.y;
			var blockDist = distX*distX + distY*distY;	// That distance, squared.

			// If there was also found one earlier - vertical run (so if dist != 0).
			// Register this hit if the distance is smaller
			if (!dist || blockDist < dist) {
				dist = blockDist;
				xHit = x;
				yHit = y;

				wallType = map[wallY][wallX];		// Save type of the object for later
				edgeX = x % 1;						// Left edge X coordinate of the wall
				if (up) edgeX = 1 - edgeX;			// If looking at left side of the map, the edge should be reversed
			}
			break;
		}
		x += dXHor;	
		y += dYHor;
	}

	if (dist) {
		// Draw ray vision on the minimap
		// drawRay(xHit, yHit);

		// Distance previously (x^2 + y^2) (Pithagoras Triangle equation)
		dist = Math.sqrt(dist);

		// Fish Eye Fix - perpendicular distance
		// Distorted Distance = (Correct Distance / cos(RelativeAngleOfRay))
		dist = dist * Math.cos(player.rot - rayAngle);

		// now calc the position, height and width of the wall strip
		// "real" wall height in the game world is 1 unit, the distance from the player to the screen is viewDist,
		// thus the height on the screen is equal to wall_height_real * viewDist / dist

		// Real wall height is equal to 1 unit and the distance from player to screen is viewDist
		// Height = RealWallHeight * viewDist / dist
		var height = Math.round(viewDist / dist);

		// Because wall is a cube width is the same, but
		// I have to stretch the texture because of horizScanWidth
		var width = height * horizScanWidth;
		var edgX = Math.round(edgeX*width);

		// Top placement is easy since everything is centered on the x-axis, so we simply move
		// it half way down the screen and then half the wall height back up.
		var top = Math.round((screenHeight - height) / 2);
		var drawTo = Math.abs((top-(thegame.height/2)));

		// Draw a Line on Canvas
		gameScreen.beginPath();

		// Depending on type of the object, do various things
		if(wallType == 5){
			gameScreen.strokeStyle = "rgb(0,0,255)";
		}else{
			gameScreen.strokeStyle = "rgb(255,255,255)";
		}

		// Draw the edge of the wall
		// if(edgX == 0){
		// 	gameScreen.strokeStyle = "rgb(255,0,0)";
		// }

		// Drawing from desired top value to the middle of screen
		// Mirroring it on the floor side
		gameScreen.moveTo(horizScanIdx*horizScanWidth, (top));
		gameScreen.lineTo(horizScanIdx*horizScanWidth, (thegame.height/2)+drawTo);

		// Redraws to fix opacity (a trick)
		for(var i=0; i<horizScanWidth; i++){		
			gameScreen.stroke();
			gameScreen.stroke();
			gameScreen.stroke();
		}
		gameScreen.closePath();

		// Draw a Rect on Canvas
		// gameScreen.beginPath();
		// gameScreen.rect(horizScanIdx*horizScanWidth, top, width*horizScanWidth, height);
		// gameScreen.fillStyle = "rgb(0, 255, 0)";
		// gameScreen.fill();
		// gameScreen.closePath();
	}
}

// ------------------------------------------------------------------

setTimeout(init, 1);

// ------------------------------------------------------------------

// Used to draw ray vision on the minimap
function drawRay(rayX, rayY) {
	var miniMapObjects = $("minimapobjects");
	var vision = miniMapObjects.getContext("2d");

	vision.strokeStyle = "rgba(0,100,0,0.3)";
	vision.lineWidth = 0.5;
	vision.beginPath();
	vision.moveTo(player.x * miniMapScale, player.y * miniMapScale);
	vision.lineTo(rayX * miniMapScale, rayY * miniMapScale);
	vision.closePath();
	vision.stroke();
}

// ------------------------------------------------------------------

function generateMap(){
	// Reset current map
	var n = map.length;
	for(var i = 1; i < (n-1); ++i){
		setAll(map[i], 9);
	}

	// Random walls
	for (var i = 1; i < (n-1); ++i){
		for (var j = 1; j < (map[i].length-1); ++j){
			if(Math.floor(Math.random()*100) < 85){
				map[i][j] = 0;
			}else{
				map[i][j] = 1;
			}
		}
	}

	// Random finish
	setFinish();

	// Redraw Minimap
	drawMiniMap();
}

function setFinish(){
	// Random finish
	var finX = 3+(Math.floor(Math.random()*25));
	var finY = 3+(Math.floor(Math.random()*15));
	
	try {
		map[finX][finY] = 5;
		console.log("FinX: ", finX, " FinY: ", finY);
	}
	catch(error) {
		console.error(error);
		console.log("Woops");
		setFinish();
	}
}

function setAll(a, v) {
	var i, n = a.length;
	for (i = 1; i < (n-1); ++i) {
		a[i] = v;
	}
}
