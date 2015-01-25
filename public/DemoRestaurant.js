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
var dfs = function(goal, path, map){
	if (equals(goal, path[path.length - 1])){
		return path;
	}

	else{
		for(index in getNeighbors(path[path.length - 1])){
			if (nei)
		}
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

var navigate = function(start, destination, driveSpeed, rotationSpeed, camera){
	var distance;
	var direction;
	var degree;
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

	degree = Math.atan((destination.y-start.y)/(destination.x - start.x));
	if (driveSpeed === 0){
		rotateToGoal(degree, rotationSpeed, camera)
	}

	if (rotationSpeed === 0){
		moveToGoal(distance, driveSpeed, direction, camera)
	}
}
currentRotation = 0;
currentDistance = 0;
moveInterval = -1;
var moveToGoal = function(distance, speed, direction, camera){
	moveInterval = setInterval(function(){move(distance, camera, direction);}, 1000);
}
var move = function(distance, camera, direction){
	camera.position.x += 0.1*direction.x;
	camera.position.z += 0.1*direction.y;
	currentDistance += (direction.x + direction.y)*0.1;
	if (currentDistance > distance){
		clearInterval(moveInterval);
		currentDistance = 0;
		moveInterval = -1;
	}

}

var rotateToGoal = function(degree, speed, camera){
	rotateInterval = setInterval(function(){rotate(degree, camera);}, 1000);
}

var rotate = function(degree, camera){
	camera.rotation.y += 0.1*degree;
	if (currentRotation > rotation){
		clearInterval(rotateInterval);
		rotateInterval =-1;
		currentRotation += 0.1*degree;
}



var testStart = {x:1, y:1};
var testEnd = {x:20, y:16};

