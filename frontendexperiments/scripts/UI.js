
// SESEME UI custom JS - no jQuery

var stickerDrawerOpen = false

var nav = document.getElementById("nav")
var container = document.querySelector(".container")
var navs = [].slice.call(nav.children) 

var currentSection
var htArray = ["2em","15em","13em","2em"]

//default camera positions: zoom 0.8, x-20, y13, z20
var ncArr = [{zm:1.25,x:0,y:0},{zm:.6,x:10,y:-5},{zm:0,x:0,y:0},{zm:0,x:0,y:0}]



navs.forEach(function(ele,i,arr){
	ele.addEventListener('click',function(){
		// when clicking a nav button
		var name = (ele.id).replace("nav", "")
		var section = document.getElementById(name)
		if(currentSection==section){
			console.log('clicked same one')
			// if you clicked the same nav icon for what's already displayed
			//this will need a special behavior if you are clicking VIEW
		}else{
			//if you clicked on a nav that isnt already expanded
			var index = navs.indexOf(ele)
			var sectionContainer = document.getElementById('sectionContainer')
			
			sectionContainer.appendChild(section)

			if(currentSection==undefined){
				section.style["display"] = "block"
				Velocity(section,{height: htArray[index]})
				// var camAmt = htArray[index].replace('em','')
				cameraMove(true,ncArr[index].zm,false,{x:0,y:0})
				//cameraMove(true,1.25,false,{x:0,y:0})
			} else if (currentSection!=undefined){
				Velocity(currentSection,{height: 0},{duration: 300})
				section.style["display"] = "block"
				Velocity(section,{height: htArray[index]},{delay:0})
			}
			currentSection = section
		}
	})

	function stickerDrawer(){
		var categories = [].slice.call(document.querySelectorAll('.stickerCat'))
		var target = document.querySelectorAll('#stickerDrawer .row')
		//var section = document.getElementById('talk')

		categories.forEach(function(ele,i,arr){
			ele.addEventListener('click',function(){
				if(!stickerDrawerOpen){
					//this will eventually be key to pulling the correct sticker drawer out
					//load in the correct stickers per category, then run the below anim
					Velocity(target, {height: '2em'},{duration: 500})
					//Velocity(section, {height: +2},{duration: 500})
					//this would be even better with a stagger....
					stickerDrawerOpen = true
				}else if(stickerDrawerOpen){
					Velocity(target, {height: 0}, {duration: 500})
					stickerDrawerOpen = false
				}
			})
		})
	} //end stickerdrawer

	function voteConv(){
		//section conversate display none
		var section = document.getElementById("talk")
		var voteButton = document.getElementById('switchVote')
		var convButton = document.getElementById('switchConv')
		var conv = document.getElementById("conversate").querySelectorAll(".columns")
		conv = [].slice.call(conv)
		var vote = document.getElementById("voteDiv").querySelectorAll("div")
		vote = [].slice.call(vote)

		voteButton.addEventListener('click',function(){
			if(stickerDrawerOpen){
				var target = document.querySelectorAll('#stickerDrawer .row')
				Velocity(target, {height: 0}, {duration: 500})
				stickerDrawerOpen = false
			}
			Velocity(section, {height: "8em"}, {delay:200}, {duration: 500})

			Velocity(voteButton, "transition.slideRightOut", {duration: 200})
			Velocity(convButton, "transition.slideLeftIn", {delay: 1000})
			Velocity(conv, "transition.slideRightOut", {duration: 350})
			setTimeout(function(){
				Velocity(vote, "transition.slideLeftIn", {stagger: 150},{duration: 500})
			},350)
			htArray[1]="8em"
		})
		
		convButton.addEventListener('click', function(){
			Velocity(section, {height: "15em"}, {duration: 700})
			Velocity(voteButton, "transition.slideRightIn", {delay: 1000})
			Velocity(convButton, "transition.slideLeftOut", {duration: 300})
			Velocity(vote, "reverse", {duration: 200})
			setTimeout(function(){
				vote.forEach(function(ele){
					ele.style["display"] = 'none'
				})
				Velocity(conv, "transition.slideRightIn", {stagger: 10})
			},350)
			htArray[1]="15em"
			
		
		})	
	} 

	window.onload = function(){
		stickerDrawer()
		voteConv()
		
	}

})
