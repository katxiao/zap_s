var DemoRestaurant = [
"##############################",
"#..............#......#......#",
"#..............#......#......#",
"#.........#....#......#......#",
"#.........#....#......#......#",
"#.........#....#......#......#",
"###########....#..#########..#",
"#............................#",
"#............................#",
"#............................#",
"#............................#",
"#############..###############",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#..############",
"#............................#",
"#............................#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"#..............#.............#",
"##############################"
];


var bfs = function(start, goal, map){
	var visitedNodes = [];
	var queue = [];
	queue.push([start]);
	// console.log(queue);
	if (equals(goal,start)){
		return [start];
	}
	else{
		// while(queue[0][queue[0].length - 1] != goal){
		for(var i = 0; i < 20; i++){
			currentNode = queue[0][queue[0].length-1];
			if (!(isIn(currentNode, visitedNodes))){
				console.log(currentNode, isIn(currentNode, visitedNodes));
				visitedNodes.push(currentNode);
				var neighbors = getNeighbors(currentNode, map);
				// console.log("neighbors: ", neighbors);
				var firstItem = queue[0].splice(0);
				for (index in neighbors){
					var path = firstItem.concat(neighbors[index])
					queue.push(path);	
				}
			}
			queue.splice(0, 1);
			console.log(visitedNodes);
		}
		console.log(queue[0]);
		return queue[0];
	}
}

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
var count = 0;
var navigate = function(path, initialRotation,camera){
	count+=1;
	// console.log(count);
	var distance;
	var direction;
	var degree;
	var start = path[0][0];
	var destination = path[0][1];
	var driveSpeed = path[0][2];
	var rotationSpeed = path[0][3];
	initialRotation = (initialRotation + 2*Math.PI) %  (2* Math.PI);
	if (start.x === destination.x){
		distance = Math.abs(destination.y - start.y);
		if (destination.y > start.y){
			direction = {x:0, y:1};
		}
		else{
			direction = {x:0, y:-1};
		}
	}

	else if (start.y === destination.y){
		distance = Math.abs(destination.x - start.x);
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


    degree = Math.atan2((destination.y-start.y), (destination.x - start.x));
    degree = (degree + 2*Math.PI) % 2*Math.PI;
    console.log(degree);
    // console.log("initialRotation: ", initialRotation - degree);
	if (initialRotation - degree === Math.PI/2){
		rotationDirection = 1;
	}
	else{
		rotationDirection = -1;
	}
	degree = Math.PI/2;

	var navigateVars = [path, initialRotation, degree, camera];

	if (driveSpeed === 0 && rotationSpeed != 0){
		rotateToGoal(degree, rotationSpeed, rotationDirection, navigateVars, camera)
	}

	if (rotationSpeed === 0 && driveSpeed != 0){
		moveToGoal(destination, distance, driveSpeed, direction, navigateVars, camera)
	}
	path.splice(0, 1);
}
currentRotation = 0;
currentDistance = 0;
var moveInterval;
var navigateCallBack = function(navigateVars){
	var path = navigateVars[0];
	var initialRotation = navigateVars[1];
	var degree = navigateVars[2];
	var camera = navigateVars[3];
	if (path.length != 0){
		navigate(path, (initialRotation), camera);
	}

}
var moveToGoal = function(destination, distance, speed, direction, navigateVars, camera){
	moveInterval = setInterval(function(){move(destination, distance, camera, direction, navigateVars);}, 1000/speed);
}
var move = function(destination, distance, camera, direction, navigateVars){
	camera.position.x += 0.1*direction.x;
	camera.position.z += 0.1*direction.y;
	currentDistance += (direction.x + direction.y)*0.1;
	if (Math.abs(currentDistance) >= distance){
		clearInterval(moveInterval);
		currentDistance = 0;
		navigateCallBack(navigateVars);
	}
}

var rotateToGoal = function(degree, speed, rotationDirection, navigateVars, camera){
	navigateVars[1] = -navigateVars[1] + degree;
	moveInterval = setInterval(function(){rotate(degree, rotationDirection, navigateVars, camera);}, 100/speed);
}

var rotate = function(degree, rotationDirection, navigateVars, camera){
	camera.rotation.y += 0.01*rotationDirection;
	currentRotation += 0.01*rotationDirection;
	if (Math.abs(currentRotation) >= Math.abs(degree)){
		clearInterval(moveInterval);
		currentRotation = 0;
		navigateCallBack(navigateVars);
		
	}
}

var manageNavigation = function(pointsList, speed, camera){
	var navigateInputList = []
	for (var i = 0; i < pointsList - 2; i++){
		navigateInputList.push([pointsList[i], pointsList[i+1], speed, 0]);
	}
	navigate(navigateInputList, Math.atan2((pointsList[1].y - pointsList[0].y), pointsList[1].x - pointsList[0].x), camera);
}
var testStart = {x:1, y:1};
var testEnd = {x:20, y:16};

