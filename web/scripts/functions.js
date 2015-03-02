// data driven -------------

function dataToHts(){ // translates data vals 
	var allValues = []
	currentDataSet.forEach(function(ele,i,arr){
		var total = 0
		var keyList = Object.keys(ele[currentResource])
		for(var i = 0; i < keyList.length; i++){
			total += (ele[currentResource][keyList[i]])
		}
		allValues.push(total)
	})
	console.log(allValues)
	var highestValue = allValues.indexOf(Math.max.apply( Math, allValues ))
	allValues.forEach(function(ele,i,arr){
		tgtHts[i].y = (ele / arr[highestValue]) * 12
	})
}
function updatePillars(){
	[seseme.children[3],seseme.children[4],seseme.children[5],seseme.children[6]].forEach(function(ele,i){
		spd = Math.abs((ele.position.y - tgtHts[i].y) * 100) + 400
		plrTween = new TWEEN.Tween(plrHts[i])
		plrTween.to(tgtHts[i],spd)
		plrTween.easing(TWEEN.Easing.Cubic.InOut)
		plrTween.onUpdate(function(){
			ele.position.y = plrHts[i].y
		})
		plrTween.start()

	})

}
function dataToUI(){ //data to textual / UI elems
	console.log(data[currentResource])
}
function uiShift(which){ //click or touch rotate: call 
	//get header
	var name = document.querySelector('#header .pillar .name')
	var index = ['plr1','plr2','plr3','plr4'].indexOf(selectedObj)
	name.textContent = currentDataSet[index].name
}
//interaction prompts ---------------


function clickedSeseme(){
	raycast.setFromCamera(mousePos, camera)
	var intersects = raycast.intersectObjects([].slice.call(seseme.children))
	var clicked = intersects[0].object.name
	if(clicked != 'ground' && clicked != 'orb'){ //pillar or pedestal
		index = ['pedestal','plr1','plr2','plr3','plr4'].indexOf(clicked)
		userActions.push('clicked ' + clicked)

		if(clicked == selectedObj){ //already selected
			//zoom/mode/navfunc
			console.log('clicked same one, zoom')
		}else{ //new selection
			if(index > 0){ //pillar
				distance = pillars.indexOf(clicked)
				if(distance==1){
					autoRotate(-90)
					rotDir = -1
				}else if(distance==2){
					autoRotate(rotDir * 180)
				}else if(distance==3){
					autoRotate(90)
					rotDir = 1
				}
				selectedObj = clicked
			}else{
				highlight(0)
				selectedObj = clicked
			}
		}
	}else{ //clicked the ground or the orb
		selectedObj = ''
		// clearHighlight()
	}
}
function clickedNav(index){
	userActions.push('clicked ' + navs[index].id)	
	if(mode==0 || index+1 != mode){ 
		console.log('open nav')
		navFuncs[index](true)
		mode=index+1
	}else{
		navFuncs[index](false)
		mode=0
	}
}
// ----------3d operations-----------------
function shift(tgtPosZoom){
	var currentPosZoom = {x: camera.position.x, y: camera.position.y, zoom: camera.zoom}
	var shiftSpeed = (Math.abs(camera.zoom - tgtPosZoom.zoom)) * 600 + 300
	var shiftTween = new TWEEN.Tween(currentPosZoom)
	shiftTween.to(tgtPosZoom, shiftSpeed)
	shiftTween.onUpdate(function(){
		camera.position.x = currentPosZoom.x
		camera.position.y = currentPosZoom.y
		camera.zoom = currentPosZoom.zoom
		camera.updateProjectionMatrix()
	})
	shiftTween.easing(TWEEN.Easing.Cubic.Out)
	shiftTween.start()
}
function autoRotate(deg){
	current = {rotationY: seseme.rotation.y}
	tgt = {rotationY: (nearest90*(Math.PI/180)) + (deg * (Math.PI/180))}
	spd = Math.abs(tgt.rotationY - current.rotationY)*200 + 350
	rotate = new TWEEN.Tween(current)
	rotate.to(tgt,spd)
	rotate.easing(TWEEN.Easing.Quadratic.Out)
	rotate.onUpdate(function(){
		seseme.rotation.y = current.rotationY
		realRotation()
		findNearest90()
		highlightCheck()
		uiShift()
	})
	rotate.start()
	rotate.onComplete(function(){
		realRotation()
		findNearest90()
		highlightCheck()
		
	})
}

// ------- math processes to make things make sense / work -------------

function findNearest90(){
	for(var i = 0; i < 5 ;i++){
		if(Math.abs(sRotY-(i*90)) <= 45){
			nearest90 = i*90
			if(i==4){nearest90 = 0}
			pillarOrder(all90s.indexOf(nearest90))
		}
	}
}
function realRotation(){ 
	sRotY = seseme.rotation.y * (180/Math.PI)
		if(sRotY < 0){
			seseme.rotation.y = (360+sRotY) / (180/Math.PI)
			revolutionCount +=1
			userActions.push('# revs: ' + revolutionCount)
		}
		if(Math.abs(sRotY/360) >= 1){
			numRevs = Math.abs(Math.floor(sRotY/360))
			actRot = sRotY - (numRevs*360)
			if(sRotY < 0){actRot = sRotY+(numRevs*360)}
			seseme.rotation.y = actRot / (180/Math.PI)
			revolutionCount +=1
			userActions.push('# revs: ' + revolutionCount)
		}
	sRotY = seseme.rotation.y * (180/Math.PI)
}
function pillarOrder(distance){
	//reorders the pillar array by taking everything b4 new selection and putting it at the end
	//'distance' being how deep in the array you clicked
	for(var i = 0; i < distance; i++){
		pillars.push(pillars.shift())
		all90s.push(all90s.shift())
	}
}


function highlight(outlineNumber){
	outlines.forEach(function(ele){
		ele.opacity = 0
	})
	outlines[outlineNumber].opacity = 1
}

function highlightCheck(){
	if(selectedObj == "pedestal"){

	}else{
		highlightRanges =[{min: 0, max: 45,p:1},{min:315,max: 360,p:1},{min:228,max:314,p:2},{min:137,max:227,p:3},{min:46,max:136,p:4}]
		highlightRanges.forEach(function(ele,i){
			if(ele.max >= sRotY && ele.min <= sRotY){
				highlight(ele.p)
				selectedObj = "plr" + ele.p
			}
		})
	}
}

// ----------navigation mode---------------
viewFunc = function(open){
	if(open){
		shift({x: -19.75, y: 17, zoom: 1.5})
	}else{
		shift(defaultPosZoom)
	}
}
dataFunc = function(open){
	if(open){
		shift({x: -19.75, y: 17, zoom: 1.5})
	}else{
		shift(defaultPosZoom)
	}	
}
talkFunc = function(open){
	if(open){
		shift({x: -19.75, y: 17, zoom: 1.5})
	}else{
		shift(defaultPosZoom)
	}
}
helpFunc = function(open){
	if(open){
		shift({x: -19.75, y: 17, zoom: 1.5})
	}else{
		shift(defaultPosZoom)
	}
}


