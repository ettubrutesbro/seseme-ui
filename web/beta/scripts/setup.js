

var allValues = [], grades = [0,0,0,0], distFromCtr = []

var scene = new THREE.Scene(), camera, renderer, 
seseme = new THREE.Group(), plr0, plr1, plr2, plr3,

raycast, mousePos = new THREE.Vector2(),

//3d rotation utilities
rotationIndex = ['plr0','plr1','plr2','plr3'], 
rotDir =1, nearest90 = 0, sRotY, anglesIndex = [0,270,180,90], 
//pillar up and down movement
plrHts = [{y: 0}, {y: 0}, {y: 0}, {y: 0}], 
tgtHts = [{y: 3}, {y: 6}, {y: 10}, {y: 2}],
//assorted
defaultPosZoom, //default camera positioning 
mode = 0, 
outlines = [], 
huelight, orbmtl,
//state booleans that allow stuff
highlightsOK = true, isRotating = false,
//experimental usage metrics
userActions = [], useTime = 0 , revolutionCount = 0 

function setup(){
	cameraSetup()
	domSetup()
	lightingSetup()
	sesemeSetup()
	eventListeners()
	// syncToData()

	function cameraSetup(){
	  var aspect = window.innerWidth / window.innerHeight
	 
	  var d = 20
	  camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 5, 100 )
	  camera.position.set( -20, 20, 20 )
	  // camera.position.set( -19, 10, 20 )
	  camera.rotation.order = 'YXZ'
	  camera.rotation.y = - Math.PI / 4
	  camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
	  // camera.zoom = .91
	  camera.zoom = 2
	  camera.updateProjectionMatrix()
	  defaultPosZoom = {x: camera.position.x, y: camera.position.y, zoom: camera.zoom,
	  	rx: camera.rotation.x, ry: camera.rotation.y}
	}
	function domSetup(){
	  var containerSESEME = document.getElementById("containerSESEME")
	  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
	  renderer.setSize( window.innerWidth, window.innerHeight)
	  containerSESEME.appendChild( renderer.domElement )
	}
	function lightingSetup(){
	  //LIGHTING
	  backlight = new THREE.SpotLight(0xeaddb9, 1.2)
	  backlight.position.set(-15,75,-10)

	  amblight = new THREE.AmbientLight( 0x232330 )
	  camlight = new THREE.SpotLight(0xffffff, .35)
	  camlight.position.set(camera.position.x-25,camera.position.y-29,camera.position.z-30)    

	  huelight = new THREE.PointLight(0xff0000,0,20)
	  huelight.position.set(0,-3,0)
	  
	  seseme.add(huelight)
	  scene.add(backlight)
	  scene.add(amblight) 
	  scene.add(camlight)
	}
	function sesemeSetup(){ //ground plane is also added here
		//materials for seseme & orb 
		  sesememtl = new THREE.MeshPhongMaterial({color: 0x80848e, shininess: 21, specular: 0x9e6f49, emissive: 0x101011})
		  groundmtl = new THREE.MeshBasicMaterial({color: 0xededed})
		  shadowmtl = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('../assets/blobshadow.svg')})
		  orbmtl = new THREE.MeshPhongMaterial({color: 0x80848e, shininess: 8, specular: 0x272727})
		  projectionmtl = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('assets/burnleaf3.svg'), 
		  transparent: true, opacity: 1})
		  
		  var loader = new THREE.JSONLoader()

		  loader.load("assets/pedestal.js", function(geometry,evt){
		    pedestal = new THREE.Mesh(geometry, sesememtl)
		    pedestal.applyMatrix( new THREE.Matrix4().makeTranslation(1.5, 0, 1))
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
		    plr0 = new THREE.Mesh(geometry, sesememtl)
		    plr0.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
		    plr0.name = "plr0"
		    seseme.add(plr0)
		    updatePillars('plr0')
		    plr3 = new THREE.Mesh(geometry, sesememtl)
		    plr3.applyMatrix( new THREE.Matrix4().makeTranslation( 5, 0, -5 ) )
		    plr3.rotation.y = -90 * Math.PI / 180
		    plr3.name = "plr3"
		    seseme.add(plr3)
		    updatePillars('plr3')
		    loader.load("assets/pillarA_outline.js", function(g){
		      outlines[1] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      outlines[4] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      var plr0o = new THREE.Mesh(g, outlines[1])
		      var plr3o = new THREE.Mesh(g, outlines[4])
		      plr0o.name = "outline1"
		      plr3o.name = "outline4"
		      plr0.add(plr0o)
		      plr3.add(plr3o)
		    })
		    plr0sp = new THREE.Mesh(new THREE.PlaneGeometry(5.5,6), projectionmtl)
			plr0sp.rotation.y-=45*(Math.PI/180)
			plr0sp.position.set(3,5,7)
			plr0.add(plr0sp)

		    plr3sp = new THREE.Mesh(new THREE.PlaneGeometry(5.5,6), projectionmtl)
			plr3sp.rotation.y-=45*(Math.PI/180)
			plr3sp.position.set(3,5,7)
			plr3.add(plr3sp)
		  })
		  loader.load("assets/pillarB.js", function(geometry,evt){
		    plr1 = new THREE.Mesh(geometry, sesememtl)
		    plr1.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
		    plr1.name = "plr1"
		    seseme.add(plr1)
		    updatePillars('plr1')
		    plr2 = new THREE.Mesh(geometry, sesememtl)
		    plr2.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, 5 ) )
		    plr2.rotation.y = 90 * Math.PI / 180
		    // plr2.castShadow = true
		    plr2.name = "plr2"
		    seseme.add(plr2)
		    updatePillars('plr2')
		    loader.load("assets/pillarB_outline.js", function(g){
		      outlines[2] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      outlines[3] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      var plr1o = new THREE.Mesh(g, outlines[2])
		      var plr2o = new THREE.Mesh(g, outlines[3])
		      plr1o.name = "outline2"
		      plr2o.name = "outline3"
		      plr1.add(plr1o)
		      plr2.add(plr2o)
		    })
		    plr1sp = new THREE.Mesh(new THREE.PlaneGeometry(5.5,6), projectionmtl)
			plr1sp.rotation.y+=45*(Math.PI/180)
			plr1sp.position.set(7,5,7)
			plr1.add(plr1sp)
		    plr2sp = new THREE.Mesh(new THREE.PlaneGeometry(5.5,6), projectionmtl)
			plr2sp.rotation.y+=45*(Math.PI/180)
			plr2sp.position.set(7,5,7)
			plr2.add(plr2sp)
		  })



		  //the orb is generated here (adjust segments for smooth)
		  var orb = new THREE.Mesh( new THREE.SphereGeometry( 2.5, 7, 5 ), orbmtl )
		  orb.name = "orb"
		  orb.position.set(0,-3.75,0) //it's down but visible
		  seseme.add(orb)  
		  //groundplane
		  var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry( 70, 70 ), 
		    groundmtl)
		  ground.position.set(0,-17.7,0)
		  ground.rotation.x = -90*(Math.PI/180)
		  ground.name = 'ground'
		  //fake shadow
		  var shadow = new THREE.Mesh(new THREE.PlaneBufferGeometry(16,16), shadowmtl)
		  shadow.position.set(-0.1,-17.65,0.1)
		  shadow.rotation.x -= 90 * (Math.PI/180)
		  seseme.add(shadow)
		  seseme.add(ground)
		  scene.add(seseme)
	}
	function eventListeners(){ //raycast and interaction
		mousePos = { x:0, y:0, z:0 }
  		raycast = new THREE.Raycaster()

		document.body.addEventListener('touchmove', function(e){ e.preventDefault() })

		window.addEventListener('resize', function(){
			var aspect = window.innerWidth / window.innerHeight
			var d = 20
			camera.left = - d * aspect
			camera.right = d * aspect
			camera.top = d
			camera.bottom = - d
	  		renderer.setSize( window.innerWidth, window.innerHeight)
			camera.updateProjectionMatrix()
		}, false)

		hammerSESEME = new Hammer(containerSESEME)
		hammerSESEME.on('tap',function(e){
			mousePos.x= (e.pointers[0].clientX / window.innerWidth)*2-1
			mousePos.y= - (e.pointers[0].clientY / window.innerHeight)*2+1
		})
  		hammerSESEME.on('pan',function(evt){
	  	if(!isRotating){	
  			if(Math.abs(evt.velocityX)>Math.abs(evt.velocityY)){
				rotDir = evt.velocityX < 0 ? 1: evt.velocityX > 0 ? -1: 1
  				seseme.rotation.y-=(evt.velocityX)*(Math.PI/90)
  		  	}
	  	}
  		})
  		hammerSESEME.on('panend',function(evt){ //rotation deceleration
  			if(!isRotating){ 
  				if(Math.abs(evt.velocityX)>Math.abs(evt.velocityY)){ //horizontal pan
	  				start = {speed: evt.velocityX}
		  			diff = (Math.abs(0-evt.velocityX)) * 85
		  			rotDecel = new TWEEN.Tween(start)
		  			rotDecel.to({speed:0},diff+400)
		  			rotDecel.onUpdate(function(){
		  				seseme.rotation.y-=(start.speed * (Math.PI/90))
		  			})
		  			rotDecel.easing(TWEEN.Easing.Quadratic.Out)
		  			rotDecel.start()
		  		}
			}
  		})//pan finish
	
	}//end function eventListeners
	function syncToData(){ //get all data, populate 3d and DOM/UI

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