
// SESEME UI custom JS - no jQuery

var stickerDrawerOpen = false

var nav = document.getElementById("nav")
var container = document.querySelector(".container")
var navs = [].slice.call(nav.children) 

var currentSection
var stickerCategory
var htArray = ["4em","17em","13em","2em"]


navs.forEach(function(ele,i,arr){
	ele.addEventListener('click',function(){
		// when clicking a nav button
		var name = (ele.id).replace("nav", "")
		var section = document.getElementById(name)
		if(currentSection==section){
			console.log('clicked same one')
			// if you clicked the same nav icon for what's already displayed
			//this will need a special behavior if you are clicking VIEW
			Velocity(currentSection,{height:0},{duration:300})
			cameraMove(true,0.8,true,{x:-20,y:13})
			currentSection = ''
		}else{
			//if you clicked on a nav that isnt already expanded
			var index = navs.indexOf(ele)
			var sectionContainer = document.getElementById('sectionContainer')
			
			sectionContainer.appendChild(section)
			//default camera positions: zoom 0.8, x-20, y13, z20
			var ncArr = [{zm:1.75,x:-20,y:21},{zm:.6,x:-20,y:-2},{zm:0,x:0,y:0},{zm:0,x:0,y:0}]

			if(currentSection==undefined){
				section.style["display"] = "block"
				Velocity(section,{height: htArray[index]})
				// var camAmt = htArray[index].replace('em','')
				cameraMove(true,ncArr[index].zm,true,{x:ncArr[index].x
					,y:ncArr[index].y})
				//cameraMove(true,1.25,false,{x:0,y:0})
			} else if (currentSection!=undefined){
				Velocity(currentSection,{height: 0},{duration: 300})
				section.style["display"] = "block"
				Velocity(section,{height: htArray[index]},{delay:0})
				cameraMove(true,ncArr[index].zm,true,{x:ncArr[index].x
					,y:ncArr[index].y})
			}
			currentSection = section
		}
	})

	function stickerDrawer(){
		var categories = [].slice.call(document.querySelectorAll('#stickerLabel td'))
		var expand = document.getElementById('stickerDrawer')
		var target = document.querySelectorAll('#stickers tr')
		var stickerCats = ['PLACES', 'RESOURCES', 'UCD, TODAY', 'THINGS', 'FEELINGS']
		var label = document.querySelector('#stickerLabel th.label')
		
		//var section = document.getElementById('talk')

		categories.forEach(function(ele,i,arr){
			ele.addEventListener('click',function(){
				if(i!=stickerCategory){
					if(!stickerDrawerOpen){
						Velocity(label, {opacity:0},{duration:500, complete: function(){
							label.textContent = stickerCats[i]
						}})
						Velocity(label, {opacity:1},{duration:500})
						
						Velocity(expand, {height: 185},{duration:500})
						Velocity(target, 'transition.slideDownIn', {stagger: 200})
						stickerDrawerOpen = true
					}else if(stickerDrawerOpen){
						Velocity(label, {opacity:0},{duration:500, complete: function(){
							label.textContent = stickerCats[i]
						}})
						Velocity(label, {opacity:1},{duration:500})
						Velocity(target, {opacity: 0},{complete: function(){
							//switch sesemojis
						}})
						Velocity(target, {opacity: 1})

					}
					stickerCategory = i
				}else if(i== stickerCategory){
					Velocity(target, 'transition.slideUpOut', {duration: 500})
					Velocity(expand, {height: 0}, {duration: 500})
					stickerDrawerOpen = false
					stickerCategory = null
					Velocity(label, {opacity:0},{duration:500, complete: function(){
							label.textContent = 'STICKERS'
						}})
					Velocity(label, {opacity:1},{duration:500})
				}
			})
		})
	} //end stickerdrawer

	function voteConv(){
		//section conversate display none
		var section = document.getElementById("talk")
		var voteButton = document.getElementById('switchVote')
		var convButton = document.getElementById('switchConv')
		var stickerLabel = document.getElementById('stickerLabel')
		var conv = document.getElementById("conversate").querySelectorAll(".columns")
		conv = [].slice.call(conv)
		var vote = document.getElementById("voteDiv").querySelectorAll("div")
		vote = [].slice.call(vote)

		voteButton.addEventListener('click',function(){
			Velocity(stickerLabel, "transition.slideRightOut", {duration: 500})
			Velocity(section, {height: "9.5em"}, {delay:200}, {duration: 500})

			Velocity(voteButton, "transition.slideRightOut", {duration: 200})
			Velocity(convButton, "transition.slideLeftIn", {delay: 1000})
			Velocity(conv, "transition.slideRightOut", {duration: 350})
			setTimeout(function(){
				Velocity(vote, "transition.slideLeftIn", {stagger: 150},{duration: 500})
			},350)
			htArray[1]="9.5em"
		})
		
		convButton.addEventListener('click', function(){
			Velocity(section, {height: "17em"}, {duration: 700})
			
			Velocity(voteButton, "transition.slideRightIn", {delay: 1000})
			Velocity(convButton, "transition.slideLeftOut", {duration: 300})
			Velocity(vote, "reverse", {duration: 200})
			setTimeout(function(){
				vote.forEach(function(ele){
					ele.style["display"] = 'none'
				})
				Velocity(conv, "transition.slideRightIn", {stagger: 10})
				Velocity(stickerLabel, "transition.slideRightIn", {duration: 600})
			},350)
			htArray[1]="17em"
			
		
		})	
	} 

	window.onload = function(){
		stickerDrawer()
		voteConv()
		
	}

})
