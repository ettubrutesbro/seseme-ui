
function degs(rads){
	return rads*(180/Math.PI)
}
function rads(degs){
	return degs*(Math.PI/180)
}
function move(obj,pos,spd,multiplier,twntype,twninout,callback,delay){
	// console.log('move operation')
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
function fade(obj,tgtopacity,spd,delay,callback){
	var start = {opacity: obj.material.opacity}
	var transition = new TWEEN.Tween(start).to({opacity: tgtopacity}, spd)
	.onComplete(function(){if(callback!==undefined){callback()}})
	.onUpdate(function(){obj.material.opacity = start.opacity}).delay(delay)
	.start()

}
function size(obj,tgtscale,spd,callback){
	var start = {x: obj.scale.x, y: obj.scale.y, z: obj.scale.z}
	var anim = new TWEEN.Tween(start).to(tgtscale,spd).onComplete(function(){
	if(callback!==undefined){callback()}}).onUpdate(function(){obj.scale.x = start.x
	obj.scale.y= start.y; obj.scale.z = start.z}).start()

}

function view(height){
	console.log('height: ' + height)
	if(height === 'isometric'){
		point_prev(facing)
		point_sprites(false)

	}else if(height === 'plan'){
		point_prev(undefined,facing)

	}else if(height === 'elevation'){
		point_prev(undefined,facing)
		// point_sprites(true)
	}
	perspective.height = height
}

function zooming(zoom){
	console.log('zoom:' + zoom)
	if(zoom==='normal'){

	}else{

	}
	perspective.zoom = zoom
}

function point_prev(plrin, plrout){
	if(plrout!==undefined){
		var outi = 0; seseme[plrout].plane.traverse(function(child){
			move(child,child.origin,400,1,'Quadratic','Out',function(){},outi*100)
			fade(child,0,350,outi*50); outi++
		})
		if(perspective.zoom==='normal'){
			fade(seseme[plrout].statbox,0,300,0)
			fade(seseme[plrout].statbox.text,0,300,0)
			move(seseme[plrout].statbox,seseme[plrout].statbox.origin,300,1,'Cubic',
				'Out',function(){},0)
			size(seseme[plrout].statbox,{x:0.75,y:0.75,z:0.75},300)
		}
	}
	if(plrin!==undefined){
		var ini = 0; seseme[plrin].plane.traverse(function(child){
			move(child,child.expand,400,1,'Quadratic','Out',function(){},ini*100)
			fade(child,1,400,ini*120); ini++
		})
		if(perspective.zoom==='normal'){
			fade(seseme[plrin].statbox,1,400,0)
			fade(seseme[plrin].statbox.text,1,400,0)
			move(seseme[plrin].statbox,seseme[plrin].statbox.expand,400,1,'Cubic',
				'Out',function(){},0)
			size(seseme[plrin].statbox,{x:1,y:1,z:1},300)
		}
	}
}

function point_sprites(inout){
	if(inout){
		seseme.pillars.children.forEach(function(ele,i){
			move(ele.sprite,ele.sprite.expand,400,1,'Quadratic','Out',function(){},i*80)
			fade(ele.sprite,1,300,i*80)
		})
	}else{
		seseme.pillars.children.forEach(function(ele,i){
			move(ele.sprite,ele.sprite.origin,400,1,'Quadratic','Out',function(){},i*80)
			fade(ele.sprite,0,300,i*80)
		})
	}
}
