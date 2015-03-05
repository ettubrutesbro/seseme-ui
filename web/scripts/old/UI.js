//this needs better organization
// SESEME UI custom JS - no jQuery

var stickerDrawerOpen = false

var buttonBar = document.getElementById("buttonBar")
var container = document.querySelector(".container")
var navs = [].slice.call(buttonBar.children) 

var currentSection
var stickerCategory
var htArray = ["4rem","13rem","13rem","2rem"]

var viewFunc, talkFunc, dataFunc, helpFunc
var navFuncArr = [viewFunc, talkFunc, dataFunc, helpFunc]

var closeThis

//default camera positions: zoom 0.8, x-19, y13, z20

var ncArr = [{zm:1.5,x:-19.75,y:17},{zm:.6,x:-19,y:7},{zm:0,x:0,y:0},{zm:0,x:0,y:0}]




navs.forEach(function(ele,i,arr){ //asign click listener for every NAV BUTTON
	ele.addEventListener('click',function(){
		// when clicking a nav button
		var name = (ele.id).replace("nav", "")
		var section = document.getElementById(name)
		if(currentSection==section){
			// if you clicked the same nav icon that's already open
			Velocity(currentSection,{height:0, opacity: 0},{duration:500})
			cameraMove(true,0.8,true,{x:-19,y:13})
			currentSection = ''
			navFuncArr[closeThis](false)
		}else{
			if(currentSection!=undefined){ //close currently open section
				navFuncArr[closeThis](false)
				Velocity(currentSection,{height: 0, opacity: 0},{duration: 400})
			}
			// if you clicked on a nav that isnt already expanded
			var index = navs.indexOf(ele)
			var sectionContainer = document.getElementById('sectionContainer')
			
			sectionContainer.appendChild(section)
			cameraMove(true,ncArr[index].zm,true,{x: ncArr[index].x, y: ncArr[index].y})
			section.style["display"] = "block"
			Velocity(section,{height: htArray[index], opacity: 1})

			navFuncArr[i](true)
			
			closeThis = index
			console.log(closeThis)

			currentSection = section
			}
	})
})

function setupData(){

}


function stickerDrawer(){
	var categories = [].slice.call(document.querySelectorAll('#stickerLabel td'))
	var expand = document.getElementById('stickerDrawer')
	var target = document.querySelectorAll('#stickers tr')

	
	//var section = document.getElementById('talk')

	categories.forEach(function(ele,i,arr){
		ele.addEventListener('click',function(){
			if(i!=stickerCategory){
				if(!stickerDrawerOpen){
					
					
					Velocity(expand, {height: 195},{duration:500})
					Velocity(target, 'transition.slideDownIn', {stagger: 200})
					stickerDrawerOpen = true
				}else if(stickerDrawerOpen){
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
	var conv = document.getElementById("conversate").querySelectorAll("div")
	conv = [].slice.call(conv)
	var vote = document.getElementById("voteDiv").querySelectorAll("div")
	vote = [].slice.call(vote)

	voteButton.addEventListener('click',function(){
		Velocity(stickerLabel, "transition.slideRightOut", {duration: 500})
		Velocity(section, {height: "13.5rem"}, {delay:200}, {duration: 500})

		Velocity(voteButton, "transition.slideRightOut", {duration: 200})
		Velocity(convButton, "transition.slideLeftIn", {delay: 1000})
		Velocity(conv, "transition.slideRightOut", {duration: 350})
		setTimeout(function(){
			Velocity(vote, "transition.slideLeftIn", {stagger: 150},{duration: 500})
		},350)
		htArray[1]="13.5rem"
	})
	
	convButton.addEventListener('click', function(){
		Velocity(section, {height: "13rem"}, {duration: 700})
		
		Velocity(voteButton, "transition.slideRightIn", {delay: 1000})
		Velocity(convButton, "transition.slideLeftOut", {duration: 300})
		Velocity(vote, "reverse", {duration: 200},{complete: function(){

		}})
		setTimeout(function(){
			vote.forEach(function(ele){
				ele.style["display"] = 'none'
			})
			Velocity(conv, "transition.slideRightIn", {stagger: 100})
		},300)
		htArray[1]="13rem"
		
	
	})	
} //end voteConv

function viewFunc(open){ //function runs when opening view
	var hide = document.querySelectorAll('#header .hideMe div')
	var big = document.querySelector('#header .name')
	Velocity(hide, "finish")
	Velocity(big, "finish")
	if(open){
		Velocity(hide, {opacity: 0}, {duration: 300})
		//Velocity(big, {rotateX: '+=90deg', opacity: 0}, {duration: 500, easing: "easeOutQuad"})
		Velocity(big, {scale: 1.6}, {duration: 500, delay: 300, easing: "easeOutQuad"})
	}else{
		Velocity(hide, "transition.slideLeftIn", {delay: 150})
		Velocity(big, {scale: 1}, {duration: 500})
	}

}

function talkFunc(open){
	var stickerelement = document.querySelectorAll('#stickerLabel td')
	var talkentries = document.querySelectorAll('#convEntries tr')
	var timeentries = document.querySelectorAll('#convEntries td:nth-child(2)')
	Velocity(timeentries, "finish")
	Velocity(talkentries, "finish")
	Velocity(stickerelement, "finish")
	if(open){
		Velocity(stickerelement, 'transition.slideDownIn',{delay:300, stagger: 50})
		Velocity(talkentries, 'transition.slideLeftIn',{delay: 700, stagger: 100, drag: true,
			complete: function(){
				Velocity(timeentries, 'transition.fadeIn', {stagger: 70, drag: true})
			}
		})
	}else{
		Velocity(timeentries, {opacity: 0}, {duration: 150})
		Velocity(talkentries, {opacity: 0}, {duration: 150})
		Velocity(stickerelement, {opacity: 0}, {duration: 150})
	}
	
}

function dataFunc(){

}

function helpFunc(){

}



window.onload = function(){
		stickerDrawer()
		voteConv()
	}
