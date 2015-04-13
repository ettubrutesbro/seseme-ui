
function degs(rads){
	return rads*(180/Math.PI)
}
function rads(degs){
	return degs*(Math.PI/180)
}
function move(obj,pos,spd,multiplier,twntype,twninout,callback){
	var start = {x: obj.position.x, y: obj.position.y, z: obj.position.z}
	var dist = multiplier*((Math.abs(obj.position.x-pos.x))+(Math.abs(obj.position.y-pos.y))+(Math.abs(obj.position.z-pos.z)))
	var translate = new TWEEN.Tween(start).to(pos,spd+dist)
	.onComplete(function(){if(callback!==undefined){callback()}})
	.onUpdate(function(){
		obj.position.x = start.x; obj.position.y = start.y; obj.position.z = start.z
	})
	.easing(TWEEN.Easing[twntype][twninout])
	.start()
}
function fade(mtl,tgtopacity,spd,callback){
	mtl.tween
	var start = {opacity: mtl.opacity}
	var transition = new TWEEN.Tween(start).to({opacity: tgtopacity}, spd)
	.onComplete(function(){if(callback!==undefined){callback()}})
	.onUpdate(function(){mtl.opacity = start.opacity})
	.start()
}

function view(height){
	console.log('height: ' + height)
	if(height === 'isometric' && perspective.zoom === 'normal'){
		
		isoprev(facing)

		resources.mtls.plrs.sprs.forEach(function(ele){
			fade(ele,0,300)
		})
		
	}else if(height === 'plan'){
		resources.mtls.plrs.plns.forEach(function(ele){
			fade(ele,0,300) //potentially add move
			fade(ele.caption,0,300) //potentially add move
		})
	}else if(height === 'elevation'){
		resources.mtls.plrs.plns.forEach(function(ele){
			fade(ele,0,300) //potentially add move
			fade(ele.caption,0,300) //potentially add move
		})
		resources.mtls.plrs.sprs.forEach(function(ele){
			fade(ele,1,300)
		})
	}
	perspective.height = height
}
function zooming(zoom){
	console.log('zoom:' + zoom)
	if(zoom==='normal'){
		isoprev(facing)
	}else{
		resources.mtls.plrs.plns.forEach(function(ele){
			fade(ele,0,300) //potentially add move
			fade(ele.caption,0,300) //potentially add move
		})
	}
	perspective.zoom = zoom
}

function isoprev(plrin, plrout){
	if(plrout!==undefined){
		fade(seseme[plrout].getObjectByName('plane').material,0,300)
		fade(seseme[plrout].getObjectByName('plane').children[0].material,0,300)
	}
	fade(seseme[plrin].getObjectByName('plane').material,1,300)
	fade(seseme[plrin].getObjectByName('plane').children[0].material,1,300)
}