
function degs(rads){
	return rads*(180/Math.PI)
}
function rads(degs){
	return degs*(Math.PI/180)
}
function move(obj,pos,spd,multiplier,twntype,twninout,callback,delay){
	var start = {x: obj.position.x, y: obj.position.y, z: obj.position.z}
	var dist = multiplier*((Math.abs(obj.position.x-pos.x))+(Math.abs(obj.position.y-pos.y))+(Math.abs(obj.position.z-pos.z)))
	var translate = new TWEEN.Tween(start).to(pos,spd+dist)
	.onComplete(function(){if(callback!==undefined){callback()}})
	.onUpdate(function(){
		obj.position.x = start.x; obj.position.y = start.y; obj.position.z = start.z
	})
	.easing(TWEEN.Easing[twntype][twninout])
	if(delay!==undefined){translate.delay(delay)}
	translate.start()
}

function fade(mtl,tgtopacity,spd,delay,callback){
	var start = {opacity: mtl.opacity}
	var transition = new TWEEN.Tween(start).to({opacity: tgtopacity}, spd)
	.onComplete(function(){if(callback!==undefined){callback()}})
	.onUpdate(function(){mtl.opacity = start.opacity}).delay(delay)
	.start()
}

function orientIso(obj, direction, spd){ //true > iso, false > 0
	var start = direction===true? 0: defaultiso, 
	tgt = direction===true? defaultiso: 0
	var orient=new TWEEN.Tween(start).to(tgt,spd).onUpdate(function(){
		obj.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(start))
	}).start()
}

function view(height){
	console.log('height: ' + height)
	if(height === 'isometric' && perspective.zoom === 'normal'){
		
		point_prev(facing)
		point_sprites(false)
		
	}else if(height === 'plan'){
		point_prev(undefined,facing)

	}else if(height === 'elevation'){
		point_prev(undefined,facing)
		point_sprites(true)
	}
	perspective.height = height
}
function zooming(zoom){
	console.log('zoom:' + zoom)
	if(zoom==='normal'){
		point_prev(facing)
	}else{
		point_prev(undefined,facing)
	}
	perspective.zoom = zoom
}

function point_prev(plrin, plrout){
	if(plrout!==undefined){
		var outi = 0; seseme[plrout].plane.traverse(function(child){
			move(child,child.origin,400,1,'Quadratic','Out',function(){},outi*100)
			fade(child.material,0,350,outi*50); outi++
		})	
	}
	if(plrin!==undefined){
		var ini = 0; seseme[plrin].plane.traverse(function(child){
			move(child,child.expand,400,1,'Quadratic','Out',function(){},ini*100)
			fade(child.material,1,400,ini*120); ini++
		})
	}
}

function point_sprites(inout){
	if(inout){
		seseme.pillars.children.forEach(function(ele,i){
			move(ele.sprite,ele.sprite.expand,400,1,'Quadratic','Out',function(){},i*80)
			fade(ele.sprite.material,1,300,i*80)
		})
	}else{
		seseme.pillars.children.forEach(function(ele,i){
			move(ele.sprite,ele.sprite.origin,400,1,'Quadratic','Out',function(){},i*80)
			fade(ele.sprite.material,0,300,i*80)
		})
	}
}