var DemoRestaurant = [
"###############################",
"#..............#......#.......#",
"#..............#......#.......#",
"#.........##...#......#.......#",
"#.........##...#......#.......#",
"#.........##...#......#.......#",
"############...##..########..##",
"#.............................#",
"#.............................#",
"#.............................#",
"#.............................#",
"###########..##################",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..............#",
"#..............#..#############",
"#..............#..............#",
"#.............................#",
"#..........#####..............#",
"#..........#...#..............#",
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
"############..#################",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"...............................",
"..............................."
];



var bfs = function(start, goal, map){
	// console.log("start: ", start, "end: ", goal);
	var visitedNodes = [];
	var queue = [];
	queue = queue.concat([[start]]);
	// console.log(queue);
	if (equals(goal,start)){

		return [start];
	}

	else{
		// console.log(queue);
		while(!equals(queue[0][queue[0].length - 1], goal)){
			// console.log("queue: ", queue);
			var currentNode = queue[0][queue[0].length-1];
			// console.log(currentNode);
			// console.log("gets here!");
			if (!(isIn(currentNode, visitedNodes))){
				visitedNodes = visitedNodes.concat(currentNode);
				var neighbors = getNeighbors(currentNode, map);
				var firstItem = queue[0].splice(0);
				for (index in neighbors){
					var path = firstItem.concat(neighbors[index])
					queue.push(path);	
				}
			}
			queue.splice(0, 1);
		}
		return queue[0];
	}
}

var getNeighbors = function(node, map){
	var neighbors = [];
	xMax = map[0].length;
	yMax = map.length;
	var tempNeighbors = [];
	tempNeighbors = tempNeighbors.concat([{x:node.x - 1, y:node.y}, {x:node.x, y:node.y+1}, {x:node.x + 1, y:node.y}, {x:node.x, y:node.y-1}]);
	for (l in tempNeighbors){
		var neighbor = tempNeighbors[l];
		if(!(neighbor.x === node.x && neighbor.y === node.y) && (neighbor.x > 0 && neighbor.x < xMax)
		 && (neighbor.y > 0 && neighbor.y < yMax) && isPassable(neighbor, map)){
			neighbors.push(neighbor);
		}
	}
	return neighbors;
}



var isPassable = function(node, map){
	return map[node.y][node.x] != "#";
}

var isIn = function(item, container){
	if (container.length === 0){
		return false;
	}
	for(k in container){
		if(equals(container[k], item)){
			return true;
		}
	}
	return false;
}

var equals = function(item1, item2){
	return (item1.x === item2.x && item1.y === item2.y);
}
var count = 0;
var navigate = function(path, initialRotation,camera){
	count+=1;
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
    degree = (degree + 2*Math.PI) % (2*Math.PI);

	rotationDataList = handleRotation(initialRotation, degree);
	rotationDirection = rotationDataList[0];
	degree = rotationDataList[1];
	var navigateVars = [path, initialRotation, degree, camera];

	if (driveSpeed === 0 && rotationSpeed != 0){
		rotateToGoal(degree, rotationSpeed, rotationDirection, navigateVars, camera)
	}

	if (rotationSpeed === 0 && driveSpeed != 0){
		moveToGoal(destination, distance, driveSpeed, direction, navigateVars, camera)
	}
	path.splice(0, 1);
}


var handleRotation = function(start, destination){
	var direction;
	var degree;
	if ((destination - start) > Math.PI){
		// console.log(1);
		direction = 1;
		degree = (2*Math.PI) - (destination	- start);
	}
	else if((destination - start) >= 0 && (destination - start) <= Math.PI){
		// console.log(2);
		direction = -1;
		degree = destination - start;
	}
	else if((destination - start) <= -Math.PI){
		// console.log(3);
		direction = -1;
		degree = (2*Math.PI) + (destination - start);
	}
	else if((destination - start) < 0 && (destination - start) > -Math.PI){
		// console.log(4);
		direction = 1;
		degree = Math.abs(destination - start);
	}
	else{
		console.log("something very strange is happening in handleRotation");
	}
	return [direction, degree];
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
	else{
		if (tourBool){
		tourCallBack(camera);
		}
		navigating = false;
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
	navigateVars[1] =  navigateVars[1] + degree * -rotationDirection;
	var totalDegree = camera.rotation.y + degree;
	moveInterval = setInterval(function(){rotate(degree, rotationDirection, navigateVars, totalDegree, camera);}, 100/speed);
}

var rotate = function(degree, rotationDirection, navigateVars, totalDegree, camera){
	camera.rotation.y += 0.01*rotationDirection;
	currentRotation += 0.01*rotationDirection;
	if (Math.abs(currentRotation) >= Math.abs(degree)){
		clearInterval(moveInterval);
		currentRotation = 0;
		navigateCallBack(navigateVars);
		
	}
}
var tourBool = false;
var manageNavigation = function(pointsList, speed, rotationSpeed, roomCenter, camera, tourEndPoint){
	var navigateInputList = [];
	camera.position.x = 2*(pointsList[0].x - 15);
	camera.position.z = -2*(pointsList[0].y - 21);
	camera.position.y = 7;
	camera.rotation.x = 0;
	camera.rotation.y = Math.PI/2;
	camera.rotation.z = 0;
	for (var i = 0; i < pointsList.length - 2; i++){
		var point1 = {x:2*(pointsList[i].x - 15), y:-2*(pointsList[i].y - 21)};
		var point2 = {x:2*(pointsList[i + 1].x - 15), y:-2*(pointsList[i+1].y - 21)};
		//make speed proportional to distance from goal
		var c = Math.sqrt((point2.y-pointsList[pointsList.length - 2].y)*(point2.y-pointsList[pointsList.length - 2].y)
		 + (point2.x - pointsList[pointsList.length - 2].x)*(point2.x - pointsList[pointsList.length - 2].x));
		navigateInputList.push([point1, point2, 0, rotationSpeed]);
		navigateInputList.push([point1, point2, speed*c, 0]);
	}

	navigateInputList.push([point2, roomCenter, 0, rotationSpeed]);
	if(tourBool){
		navigateInputList.push([roomCenter, tourEndPoint, 0, rotationSpeed]);
	}
	navigate(navigateInputList,0, camera);
}	


var testStart = {x:1, y:1};
var testEnd = {x:20, y:16};

var babylonPoint2MapPoint = function(point){
	return {x:Math.round((point.x)/2 + 15), y:Math.round((point.y)/(-2) + 21)};
}

var MapPoint2BabylonPoint = function(point){
	return {x:2*(point.x - 15), y:-2*(point.y - 21)};
}


var tourCallBack = function(camera){
	tourListTemp.splice(0, 1);
	if (tourListTemp.length > 0){
		tour(tourListTemp[0], camera);
	}
	else{
		tourBool = false;
		navigating = false;
	}
}

var tourList = [
  [babylonPoint2MapPoint({x:2, y:-4}), {x:4, y:-8}, {x:5, y:-8}],
  [babylonPoint2MapPoint({x:5, y:1}), {x:15, y:11}, {x:16, y:11}],
  [babylonPoint2MapPoint({x:-6, y:21}), {x:-29, y:2}, {x:-29, y:2}],
  [babylonPoint2MapPoint({x:27, y:28}), {x:25, y:36}, {x:26, y:36}],
  [babylonPoint2MapPoint({x:4, y:28}), {x:7, y:36}, {x:8, y:36}],
  [babylonPoint2MapPoint({x:-8, y:39}), {x:-19, y:40}, {x:-18, y:40}],
  [babylonPoint2MapPoint({x:-6, y:-99}), {x:0, y:50}, {x:15, y:61}]
              ]



var tourListTemp = []

var populateTourListTemp = function(){
	tourListTemp = $.extend(true, [], tourList)
}

var rs = 160;
var ds = 3.5;
var tour = function(tourData, camera){
  var start = babylonPoint2MapPoint({x:camera.position.x, y:camera.position.z});
  var end = tourData[0];
  var roomCenter = tourData[1];
  tourEndPoint = tourData[2];
  manageNavigation(bfs(start, end, DemoRestaurant), ds, rs, roomCenter, camera, tourEndPoint);
}