var DemoRestaurant = [
"###############################",
"#..............#......#.......#",
"#..............#......#.......#",
"#.........#....#......#.......#",
"#.........#....#......#.......#",
"#.........#....#......#.......#",
"###########....##..########..##",
"#.............................#",
"#.............................#",
"#.............................#",
"#.............................#",
"############..#################",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..#############",
"#.............................#",
"#.............................#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"###############################"
];


var bfs = function(start, goal, map){
	var visitedNodes = [];
	var queue = [];
	queue.push([start]);
	console.log(queue);
	if (equals(goal,start)){
		return [start];
	}
	else{
		// while(queue[0][queue[0].length - 1] != goal){
		for(var i = 0; i < 20; i++){
			currentNode = queue[0][queue[0].length-1];
			console.log("currentNode: " , currentNode);
			console.log("vistedNodes: ", visitedNodes);
			if (!(isIn(currentNode, visitedNodes))){
				visitedNodes.push(currentNode);
				var neighbors = getNeighbors(currentNode, map);
				console.log("neighbors: ", neighbors);
				var firstItem = queue[0].splice(0);
				for (index in neighbors){
					var path = firstItem.concat(neighbors[index])
					queue.push(path);	
				}
			}
			console.log("queue: ", queue);
			queue.pop(0);
		}
		return queue[0];
	}
}

//make 'visited' a property of a node
// var dfs = function(goal, path, map){
// 	if (equals(goal, path[path.length - 1])){
// 		return path;
// 	}

// 	else{
// 		for(index in getNeighbors(path[path.length - 1])){
// 			if (nei)
// 		}
// 	}
// }

var getNeighbors = function(node, map){
	var neighbors = [];
	xMax = map[0].length;
	yMax = map.length;
	for(var i = -1; i <=1; i++){
		for (var j = -1; j <=1; j++){
			var neighbor = {x:node.x + i, y:node.y + j};
			if(!(neighbor.x === node.x && neighbor.y === node.y) && (neighbor.x > 0 && neighbor.x < xMax)
			 && (neighbor.y > 0 && neighbor.y < yMax) && isPassable(neighbor, map)){
				neighbors.push(neighbor);
			}
		}
	}
	return neighbors;
}



var isPassable = function(node, map){
	return map[node.y][node.x] != "#";
}

var isIn = function(item, container){
	for(var k = 0; k < container.length; k++){
		return (container[k].x === item.x && container[k].y === item.y);
	}
	return false;
}

var equals = function(item1, item2){
	return (item1.x === item2.x && item1.y === item2.y);
}

var navigate = function(path, initialRotation,camera){
	console.log("initial camera: ", camera);
	var distance;
	var direction;
	var degree;
	var start = path[0][0];
	var destination = path[0][1];
	var driveSpeed = path[0][2];
	var rotationSpeed = path[0][3];
	if (start.x === destination.x){
		distance = Math.abs(destination.y - start.y);
		console.log("distance: ", distance, destination.y, start.y);
		if (destination.y > start.y){
			direction = {x:0, y:1};
		}
		else{
			direction = {x:0, y:-1};
		}
	}

	else if (start.y === destination.y){
		distance = Math.abs(destination.x - start.x);
		console.log("distance: ", distance, destination.y, start.y);
		if (destination.x > start.x){
			direction = {x:1, y:0};
		}
		else{
			direction = {x:-1, y:0};
		}
	}
	else{
		console.log("Points for navigation are not orthogonal");
	}
	// console.log("distance: ", distance);


    degree = Math.atan2((destination.y-start.y), (destination.x - start.x)) - initialRotation;
	// console.log(degree);
	console.log("camera after degree: ", camera);
	if (degree >= 0){
	  rotationDirection = 1;
	}
	else{
	  rotationDirection = -1;
	}
	path.splice(0, 1);
	var navigateVars = [path, driveSpeed, rotationSpeed, initialRotation, degree, camera];

	if (driveSpeed === 0 && rotationSpeed != 0){
		console.log("line before camera: ", camera);
		rotateToGoal(degree, rotationSpeed, rotationDirection, navigateVars, camera)
	}

	if (rotationSpeed === 0 && driveSpeed != 0){
		moveToGoal(distance, driveSpeed, direction, navigateVars, camera)
	}
}
currentRotation = 0;
currentDistance = 0;
var moveInterval;
var navigateCallBack = function(navigateVars){
	var path = navigateVars[0];
	var driveSpeed = navigateVars[1];
	var rotationSpeed = navigateVars[2];
	var initialRotation = navigateVars[3];
	var degree = navigateVars[4];
	var camera = navigateVars[5];
	if (path.length != 0){
		console.log("navigateCallBack camera: ", camera);
		navigate(path, (initialRotation + degree), camera);
	}

}
var moveToGoal = function(distance, speed, direction, navigateVars, camera){
	// console.log("Running moveToGoal");
	moveInterval = setInterval(function(){move(distance, camera, direction, navigateVars);}, 1000/speed);
	console.log("moveInterval1: ", moveInterval);
}
var move = function(distance, camera, direction, navigateVars){
	// console.log("running move");
	// console.log("distance: ", distance);
	// console.log("currentDistance: ", currentDistance);

	camera.position.x += 0.1*direction.x;
	camera.position.z += 0.1*direction.y;
	currentDistance += (direction.x + direction.y)*0.1;
	if (Math.abs(currentDistance) >= distance){
		console.log("moveInterval2: ", moveInterval);
		clearInterval(moveInterval);
		navigateCallBack(navigateVars);
		currentDistance = 0;
		// moveInterval = -1;
	}
}
// var rotateInterval;
var rotateToGoal = function(degree, speed, rotationDirection, navigateVars, camera){
	// console.log("camera in rotateToGoal: ", camera);
	moveInterval = setInterval(function(){rotate(degree, rotationDirection, navigateVars, camera);}, 1000/speed);
}

var rotate = function(degree, rotationDirection, navigateVars, camera){
	// console.log("camera: ", camera);
	camera.rotation.y += 0.1*rotationDirection;
	currentRotation += 0.1*rotationDirection;
	if (Math.abs(currentRotation) >= degree){
		clearInterval(moveInterval);
		navigateCallBack(navigateVars);
		currentRotation = 0;
		// rotateInterval =-1;
		currentRotation += 0.1*degree;
	}
}



var testStart = {x:1, y:1};
var testEnd = {x:20, y:16};

