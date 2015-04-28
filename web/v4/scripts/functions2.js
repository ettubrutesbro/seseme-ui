
function degs(rads){
	return rads*(180/Math.PI)
}
function rads(degs){
	return degs*(Math.PI/180)
}
function move(obj,pos,spd,multiplier,twntype,twninout,callback,delay){
	// console.log('move operation')
	if(obj.moveTween){obj.moveTween.stop()}
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
	obj.moveTween = translate
}
function fade(obj,tgtopacity,spd,delay,callback){
	if(obj.fadeTween){obj.fadeTween.stop()}
	var start = {opacity: obj.material.opacity}
	var transition = new TWEEN.Tween(start).to({opacity: tgtopacity}, spd)
	.onComplete(function(){if(callback!==undefined){callback()}})
	.onUpdate(function(){obj.material.opacity = start.opacity}).delay(delay)
	.easing(TWEEN.Easing.Quadratic.Out).start(); obj.fadeTween = transition
}
function size(obj,tgtscale,spd,callback){
	if(obj.sizeTween){obj.sizeTween.stop()}
	var start = {x: obj.scale.x, y: obj.scale.y, z: obj.scale.z}
	var anim = new TWEEN.Tween(start).to(tgtscale,spd).onComplete(function(){
	if(callback!==undefined){callback()}}).onUpdate(function(){obj.scale.x = start.x
	obj.scale.y= start.y; obj.scale.z = start.z}).easing(TWEEN.Easing.Quadratic.Out).start()
	obj.sizeTween = anim
}

// function dom_anim(obj,properties,values,dur,twntype,twninout){
// 		properties.forEach(function(ele,i){
// 			if(obj[ele+'anim']){ obj[ele+'anim'].stop() }
// 			var origin = {}; origin[ele] = parseFloat(obj.style[ele])
// 			var tgt = {}; tgt[ele] = values[i]
// 			obj[ele+'anim'] = new TWEEN.Tween(origin).to(tgt,dur).onUpdate(function(){
// 				obj.style[ele] = origin[ele]
// 				console.log(origin[ele])
// 			}).easing(TWEEN.Easing[twntype][twninout]).start()
// 		})
// }
//
// function dom_xform(obj){
// 		var style = window.getComputedStyle(obj,null)
// 		var xform = style.getPropertyValue("-webkit-transform") || style.getPropertyValue("-moz-transform") ||
//          style.getPropertyValue("-ms-transform") || style.getPropertyValue("-o-transform") ||
//          style.getPropertyValue("transform") ||
// 		console.log(xform)
// }


function Text(words,width,widthmargin,height,color,font,fontSize,fontWeight,align){ //'400 36pt Source Serif Pro'
	this.cvs = document.createElement('canvas'), this.ctx = this.cvs.getContext('2d')
	this.tex = new THREE.Texture(this.cvs); this.tex.needsUpdate = true
	this.cvs.width = this.ctx.measureText(words).width * width + widthmargin; this.cvs.height = height
	// this.ctx.strokeStyle = '#FF0000', this.ctx.lineWidth=5, this.ctx.strokeRect(0,0,this.cvs.width,this.cvs.height)
	this.ctx.scale(3,3); this.ctx.fillStyle = color; this.ctx.font = 'normal '+fontWeight+' '+fontSize+'pt '+font
	this.ctx.textAlign = align;
	if(align==='center'){this.ctx.fillText(words,this.cvs.width/6,this.cvs.height/6+fontSize/2.2)
	}else if(align==='start'){this.ctx.fillText(words,1,this.cvs.height/6+fontSize/2.2)}
	else{this.ctx.fillText(words,this.cvs.width/3-10,this.cvs.height/6+fontSize/2.2)}
	}

function traverseDom (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]); // passes back stuff we need
  }
}
