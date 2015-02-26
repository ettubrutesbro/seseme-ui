
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
			if(index > 0){ // pillar clicked
				//autorotate
				whichPillar = pillars.indexOf(clicked)
				for(var i = 0; i < whichPillar; i++){

					pillars.push(pillars.shift())

				}
				console.log(pillars)

			}
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


