// 1. get data  2. load external 3d   3. add event listeners (native, then custom)
// semantic, consistent naming structure (there will be no pillar #0)

var displayedDataSet //currently displayed dataset 
var scene = new THREE.Scene(), camera, renderer, //basic 3d display
seseme = new THREE.Group(), //model organization
raycast, mousePos = new THREE.Vector2(),//interaction w/ 3d
//rotations
pillars = ['plr1','plr2','plr3','plr4'], rotDir =1,
//pillar up and down movement
plrHts = [{y: 0}, {y: 0}, {y: 0}, {y: 0}], tgtHts = [{y: 0}, {y: 0}, {y: 0}, {y: 0}],
defaultPosZoom, selectedObj,  mode = 0, outlines = [],
//what pillar is selected?  mode=nav section(0-explore,1-view,2-data,3-talk,4-help)

navs = [].slice.call(document.getElementById('uiNav').children), //persistent nav buttons go to diff. sections
explore, viewFunc, talkFunc, dataFunc, helpFunc, 
navFuncs = [explore, viewFunc, talkFunc, dataFunc, helpFunc],
//array of functions called when buttons are pressed

//experimental usage metrics
userActions = [], futiles, useTime = 0 , revolutionCount = 0 

function setup(){
	cameraSetup()
	domSetup()
	lightMtlSetup()
	sesemeSetup()
	eventListeners()
	syncToData()

	function cameraSetup(){
	  var aspect = window.innerWidth / window.innerHeight
	 
	  var d = 20
	  camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 5, 100 )
	  camera.position.set( -19, 10, 20 )
	  camera.rotation.order = 'YXZ'
	  camera.rotation.y = - Math.PI / 4
	  camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
	  camera.zoom = .91
	  camera.updateProjectionMatrix()
	  defaultPosZoom = {x: camera.position.x, y: camera.position.y, zoom: camera.zoom}
	}
	function domSetup(){
	  var containerSESEME = document.getElementById("containerSESEME")
	  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
	  renderer.shadowMapEnabled = true
	  renderer.shadowMapType = THREE.PCFSoftShadowMap
	  renderer.setSize( window.innerWidth, window.innerHeight)
	  containerSESEME.appendChild( renderer.domElement )
	}
	function lightMtlSetup(){
	  //LIGHTING
	  backlight = new THREE.SpotLight(0xeaddb9, 1.2)
	  backlight.position.set(-15,75,-10)
	  backlight.castShadow = true
	  backlight.shadowDarkness = 0.2
	  backlight.shadowMapWidth = 768 
	  backlight.shadowMapHeight = 768 

	  amblight = new THREE.AmbientLight( 0x232330 )
	  camlight = new THREE.SpotLight(0xffffff, .35)
	  camlight.position.set(camera.position.x-25,camera.position.y-29,camera.position.z-30)    

	  scene.add(backlight)
	  scene.add(amblight) 
	  scene.add(camlight)
	}
	function sesemeSetup(){ //ground plane is also added here
		//materials for seseme & orb 
		  sesememtl = new THREE.MeshPhongMaterial({color: 0x80848e, shininess: 21, specular: 0x9e6f49, emissive: 0x101011})
		  groundmtl = new THREE.MeshBasicMaterial({color: 0xededed})
		  orbmtl = new THREE.MeshPhongMaterial({color: 0x80848e, shininess: 8, specular: 0x272727})

		  var plr1, plr2, plr3, plr4
		  var loader = new THREE.JSONLoader()

		  loader.load("assets/pedestal.js", function(geometry,evt){
		    pedestal = new THREE.Mesh(geometry, sesememtl)
		    pedestal.applyMatrix( new THREE.Matrix4().makeTranslation(1.5, 0, 1))
		    pedestal.castShadow = true
		    pedestal.name = "pedestal"
		    seseme.add(pedestal)
		    loader.load("assets/pedestal_outline.js", function(g){
		    	outlines[0] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide})
		   		var pedestalo = new THREE.Mesh(g, outlines[0])
		   		pedestalo.applyMatrix( new THREE.Matrix4().makeTranslation(-0, -0.5, 0))
		   		pedestal.add(pedestalo)
		    })
		  }) 

		  loader.load("assets/pillarA.js", function(geometry,evt){
		    plr1 = new THREE.Mesh(geometry, sesememtl)
		    plr1.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
		    plr1.name = "plr1"
		    plr1.castShadow = true
		    seseme.add(plr1)
		    plr4 = new THREE.Mesh(geometry, sesememtl)
		    plr4.applyMatrix( new THREE.Matrix4().makeTranslation( 5, 0, -5 ) )
		    plr4.rotation.y = -90 * Math.PI / 180
		    plr4.name = "plr4"
		    plr4.castShadow = true
		    setTimeout(function(){
		      seseme.add(plr4)
		    },10) //this is awful and should not be
		    loader.load("assets/pillarA_outline.js", function(g){
		      outlines[1] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      outlines[4] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      var plr1o = new THREE.Mesh(g, outlines[1])
		      var plr4o = new THREE.Mesh(g, outlines[4])
		      plr1.add(plr1o)
		      setTimeout(function(){
		        plr4.add(plr4o)
		      },50)
		    })
		  })
		  loader.load("assets/pillarB.js", function(geometry,evt){
		    plr2 = new THREE.Mesh(geometry, sesememtl)
		    plr2.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
		    plr2.name = "plr2"
		    plr2.castShadow = true
		    seseme.add(plr2)

		    plr3 = new THREE.Mesh(geometry, sesememtl)
		    plr3.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, 5 ) )
		    plr3.rotation.y = 90 * Math.PI / 180
		    plr3.castShadow = true
		    plr3.name = "plr3"
		    seseme.add(plr3)
		    loader.load("assets/pillarB_outline.js", function(g){
		      outlines[2] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      outlines[3] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      var plr2o = new THREE.Mesh(g, outlines[2])
		      var plr3o = new THREE.Mesh(g, outlines[3])
		      plr2.add(plr2o)
		      plr3.add(plr3o)
		    })
		  })

		  //the orb is generated here (adjust segments for smooth)
		  var orb = new THREE.Mesh( new THREE.SphereGeometry( 2.5, 7, 5 ), orbmtl )
		  orb.name = "orb"
		  orb.position.set(0,-3.75,0) //it's down but visible
		  seseme.add(orb)  
		  //groundplane
		  var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry( 70, 70, 70 ), 
		    groundmtl)
		  ground.position.set(0,-17.7,0)
		  ground.rotation.x = -90*(Math.PI/180)
		  ground.receiveShadow = true
		  ground.name = 'ground'

		  seseme.add(ground)
		  scene.add(seseme)
	}
	function eventListeners(){ //raycast and interaction
		mousePos = { x:0, y:0, z:1 }
  		raycast = new THREE.Raycaster()

		document.body.addEventListener('touchmove', function(e){ e.preventDefault() })

		hammerSESEME = new Hammer(containerSESEME)
		hammerSESEME.on('tap',function(e){
			mousePos.x= (e.pointers[0].clientX / window.innerWidth)*2-1
			mousePos.y= - (e.pointers[0].clientY / window.innerHeight)*2+1
			clickedSeseme()
		})
  		hammerSESEME.on('pan',function(evt){
  			if(Math.abs(evt.velocityX)>Math.abs(evt.velocityY)){
  				seseme.rotation.y-=(evt.velocityX)*(Math.PI/90)
  			}
  		})
  		hammerSESEME.on('panend',function(evt){ //rotation deceleration
  			if(Math.abs(evt.velocityX)>Math.abs(evt.velocityY)){ //horizontal pan
  				start = {speed: evt.velocityX}
	  			diff = (Math.abs(0-evt.velocityX)) * 90
	  			rotDecel = new TWEEN.Tween(start)
	  			rotDecel.to({speed:0},diff+300)
	  			rotDecel.onUpdate(function(){
	  				seseme.rotation.y-=(start.speed * (Math.PI/90))
	  			})
	  			rotDecel.easing(TWEEN.Easing.Quadratic.Out)
	  			rotDecel.start()
	  			rotDecel.onComplete(function(){
	  				realRotation()
	  				highlightCheck()
	  			}) //onComplete
	  		}//horizontal pan finish
  		})//pan finish

		navs.forEach(function(ele, i){
			hammerNav = new Hammer(ele)
			hammerNav.on('tap',function(){
				clickedNav(ele.id, i+1)	
			})
		})		
	}//end function eventListeners
	function syncToData(){ //get all data, populate 3d and DOM/UI
	  // setTimeout(function(){updateValues()
	  // },800) //no idea why, but this only
	  // // works with a setTimeout that waits (even 10ms is enough) to fire it
	}
} //end setup

function animate(){ 
    requestAnimationFrame( animate )
    render()
    TWEEN.update()
  } 
function render() { 
    renderer.render( scene, camera )
} 