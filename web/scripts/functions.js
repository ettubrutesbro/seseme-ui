
function clickedSeseme(e){
	raycast.setFromCamera(mousePos, camera)
	var intersects = raycast.intersectObjects([].slice.call(seseme.children))
	console.log(intersects[0].object.name)

}
function clickedNav(e){

}