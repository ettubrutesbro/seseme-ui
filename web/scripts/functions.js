
function clickedSeseme(){
	raycast.setFromCamera(mousePos, camera)
	var intersects = raycast.intersectObjects([].slice.call(seseme.children))
	var clicked = intersects[0].object.name
	if(clicked != 'ground' && clicked != 'orb' && mode ==0){ //pillar or pedestal
		console.log(selectedObj + " > " + clicked)
		index = ['pedestal','plr1','plr2','plr3','plr4'].indexOf(clicked)

		if(clicked == selectedObj){ //already selected

		}else{ //new selection
			highlight(index) 
			if(index > 0){ //pillar
				distance = pillars.indexOf(clicked)
				console.log(distance)
				switch(distance){
					case 1:
						autoRotate(-90)
						rotDir = -1	
					break
					case 2:
						autoRotate(rotDir * 180)
					break
					case 3:
						//get your difference from the nearest 90
						// and subtract it from 90
						autoRotate(90)
						rotDir = 1
					break
				}

				for(var i = 0; i < distance; i++){
					pillars.push(pillars.shift())
				}

			}
			userActions.push(clicked)
			selectedObj = clicked
		}
		

		
	}
}
function clickedNav(tgt, index){
	if(mode==0 || index != mode){ 
		navFuncs[index](true)
		mode=index
	}else{
		navFuncs[index](false)
		mode=0
	}
	userActions.push(tgt)	
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
	current = {rotation: seseme.rotation.y}
	//for tgt: s.r.y should be nearest
	tgt = {rotation: seseme.rotation.y + (deg * (Math.PI/180))}
	spd = Math.abs(tgt.rotation - current.rotation)*200
	rotate = new TWEEN.Tween(current)
	rotate.to(tgt,spd)
	rotate.onUpdate(function(){
		seseme.rotation.y = current.rotation
	})
	rotate.start()
	rotate.onComplete(function(){
		realRotation()
	})
}

function realRotation(){ 
	finalRot = seseme.rotation.y * (180/Math.PI)
		if(finalRot < 0){
			seseme.rotation.y = (360+finalRot) / (180/Math.PI)
			revolutionCount +=1
		}
		if(Math.abs(finalRot/360) >= 1){
			numRevs = Math.abs(Math.floor(finalRot/360))
			actRot = finalRot - (numRevs*360)
			if(finalRot < 0){actRot = finalRot+(numRevs*360)}
			seseme.rotation.y = actRot / (180/Math.PI)
			revolutionCount +=1
		}
	console.log(seseme.rotation.y * (180/Math.PI))
}
function highlight(outlineNumber){
	outlines[outlineNumber].opacity = 1
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


