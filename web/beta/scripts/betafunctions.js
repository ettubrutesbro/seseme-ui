function updatePillars(plr){
	console.log(plr)
	var index = plr.replace('plr','')
	spd = Math.abs((seseme.getObjectByName(plr).position.y - tgtHts[index].y)*100) + 400
	plrTween = new TWEEN.Tween(plrHts[index])
	plrTween.to(tgtHts[index],spd)
	plrTween.easing(TWEEN.Easing.Cubic.InOut)
	plrTween.onUpdate(function(){
		seseme.getObjectByName(plr).position.y = plrHts[index].y
	})
	plrTween.start()
}