
var socket = io('10.0.1.111:5000')
var dataset = 'ucd_bldg_nrg', dataList = Object.keys(data)

var allValues = [], grades = [{},{},{},{}]

var scene = new THREE.Scene(), camera, renderer, 
seseme = new THREE.Group(), plr0, plr1, plr2, plr3, pedestal,ring,

uiScale = 2,
raycast, mousePos = new THREE.Vector2(),

staticZoom = 1.15,

//3d rotation utilities
rotationIndex = ['plr0','plr1','plr2','plr3'], distCtr, centerish,
rotDir =1,last90=0,nearest90=0,sRotY =0,anglesIndex = [0,270,180,90],
//pillar up and down movement
tgtHts = [{y: 3}, {y: 6}, {y: 10}, {y: 2}],
//assorted
defaultPosZoom,
mode = 'explore', selectedPillar, selectedProjection=0, lookingAt = 'plr0',
outlines = [], 
huelight, orbmtl,
//state booleans that allow stuff
highlightsOK = true, autoRotating = false, touchRotating = false, rotAmt = 0, forcing = false
//experimental usage metrics
userActions = [], useTime = 0 , degreesRotated = 0 

function setup(){
	cameraSetup()
	domSetup()
	lightingSetup()
	sesemeSetup()
	otherMdls()
	eventListeners()
	syncToData()

	function cameraSetup(){
	  var aspect = window.innerWidth / window.innerHeight
	 
	  var d = 20
	  camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 5, 100 )
	  camera.position.set( -20, 14.75, 20 )
	  camera.rotation.order = 'YXZ'
	  camera.rotation.y = - Math.PI / 4
	  camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
	  camera.zoom = 1.125
	  camera.updateProjectionMatrix()
	  defaultPosZoom = {x: camera.position.x, y: camera.position.y, zoom: camera.zoom,
	  	rx: camera.rotation.x, ry: camera.rotation.y}
	}
	function domSetup(){
	  var containerSESEME = document.getElementById("containerSESEME")
	  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
	  renderer.shadowMapType = THREE.PCFSoftShadowMap
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
		  sesememtl = new THREE.MeshPhongMaterial({color: 0x80848e, shininess: 21, 
		  	specular: 0x9e6f49, emissive: 0x101011}) 
		// sesememtl = new THREE.MeshLambertMaterial({color: 0x80848e, shininess: 21, 
		// 		  	specular: 0x9e6f49, emissive: 0x101011})
		  groundmtl = new THREE.MeshBasicMaterial({color: 0xededed})
		  shadowmtl = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('assets/blobshadow.svg')})
		  orbmtl = new THREE.MeshPhongMaterial({color: 0xff6666, emissive: 0x771100,shininess: 1, specular: 0x272727})
		  
		  var loader = new THREE.JSONLoader()

		  loader.load("assets/pedestal.js", function(geometry,evt){
		    pedestal = new THREE.Mesh(geometry, sesememtl)
		    pedestal.applyMatrix( new THREE.Matrix4().makeTranslation(1.5, 0, 1))
		    pedestal.name = "pedestal"
		    seseme.add(pedestal)
		    
		    createPreviews()
		  }) 	

		  loader.load("assets/pillarA.js", function(geometry,evt){
		    plr0 = new THREE.Mesh(geometry, sesememtl)
		    plr0.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
		    plr0.name = "plr0"
		    seseme.add(plr0)
		    
		    plr3 = new THREE.Mesh(geometry, sesememtl)
		    plr3.applyMatrix( new THREE.Matrix4().makeTranslation( 5, 0, -5 ) )
		    plr3.rotation.y = -90 * Math.PI / 180
		    plr3.name = "plr3"
		    seseme.add(plr3)
		    
		    loader.load("assets/pillarA_outline.js", function(g){
		      outlines[1] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      outlines[4] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      var plr0o = new THREE.Mesh(g, outlines[1])
		      var plr3o = new THREE.Mesh(g, outlines[4])
		      plr0o.name = "outline0"
		      plr3o.name = "outline3"
		      plr0.add(plr0o)
		      plr3.add(plr3o)
		    })
		  
		  initProjections(plr0,plrAprojections)
		  initProjections(plr3,plrAprojections)
		  updatePillars(plr0)
		  updatePillars(plr3)
		
		  })
		  loader.load("assets/pillarB.js", function(geometry,evt){
		    plr1 = new THREE.Mesh(geometry, sesememtl)
		    plr1.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
		    plr1.name = "plr1"
		    seseme.add(plr1)

		    
		    plr2 = new THREE.Mesh(geometry, sesememtl)
		    plr2.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, 5 ) )
		    plr2.rotation.y = 90 * Math.PI / 180
		    plr2.name = "plr2"
		    seseme.add(plr2)

		   
		    loader.load("assets/pillarB_outline.js", function(g){
		      outlines[2] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      outlines[3] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
		      var plr1o = new THREE.Mesh(g, outlines[2])
		      var plr2o = new THREE.Mesh(g, outlines[3])
		      plr1o.name = "outline1"
		      plr2o.name = "outline2"
		      plr1.add(plr1o)
		      plr2.add(plr2o)
		    })
			
			initProjections(plr1,plrBprojections)
			initProjections(plr2,plrBprojections)
			updatePillars(plr1)
			 updatePillars(plr2)
		  })

		  //the orb is generated here (adjust segments for smooth)
		  var orb = new THREE.Mesh( new THREE.SphereGeometry( 2.5, 7, 5 ), orbmtl )
		  orb.name = "orb"
		  orb.position.set(0,-3.75,0) //it's down but visible
		  seseme.add(orb)  
		  //groundplane
		  var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry( 150, 150 ), 
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
	function otherMdls(){
		// var ringgeo = new THREE.Geometry()
	 //    for(var i = 0; i < 33; i++){
	 //    	theta = (i/32) * Math.PI * 2
	 //    	ringgeo.vertices.push(new THREE.Vector3(Math.cos(theta)*16,Math.sin(theta)*16,0))
		//     }
	 //    ring = new THREE.Line(ringgeo, new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1})); ring.rotation.set(rads(90),0,rads(45))
	 //    // ring.position.set(0,-17.5,0x000000); scene.add(ring); ring.name = "ring"

	 //    dg_xlats = [{x:16,z:0},{x:-16,z:0},{x:0,z:-16},{x:0,z:16}]
	 //    for(var i = 0; i<4; i++){ //loop generates 4 symbolgeos for ring
	 //    	var dataGeo = new THREE.Mesh(new THREE.BoxGeometry(3,3,3),new THREE.MeshNormalMaterial())
	 //    	// dataGeo.position.set(dg_xlats[i].x,dg_xlats[i].z,0); ring.add(dataGeo) 
	    // }
	}
	function eventListeners(){ //raycast and interaction

		THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {

				console.log( item, loaded, total );

			}
		//web data
		socket.on('dataHere',function(dat){
			console.log('datahere: ' + dataset[dat])
				backOut(); clearText(); dataset = dataList[dat]; getValues(); assess();
				createPreviews()
				for(var i = 0; i<4; i++){
					var set = i==0 ? plrAprojections: i==3? plrAprojections: plrBprojections
					updatePillars(seseme.getObjectByName('plr'+i))
					initProjections(seseme.getObjectByName('plr'+i),set)
				}
				footProject(data[dataset].name)
		})

		socket.on('changeData',function(dat){
			console.log(dat + 'big red button: send dataset '+ dataList[dat])
				//change data?
			backOut(); clearText(); dataset = dataList[dat]; getValues(); assess();
			createPreviews()
			for(var i = 0; i<4; i++){
				var set = i==0 ? plrAprojections: i==3? plrAprojections: plrBprojections
				updatePillars(seseme.getObjectByName('plr'+i))
				initProjections(seseme.getObjectByName('plr'+i),set)
			}	
			for(var i = 1; i<5; i++){
				console.log({name: 'm'+i, position:(tgtHts[i-1].y/12)*100})
				socket.emit('moveMotorJack',{name: 'm'+i, position:(tgtHts[i-1].y/12)*100})
			}
			footProject(data[dataset].name)
	
		})

		socket.on('secretButton',function(){
			console.log('sekrat button pressed')
		})
		//

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
			hammerSESEME.get('pinch').set({ enable: true })
		hammerSESEME.on('pinch',function(evt){
			evt.preventDefault()
			camera.zoom = staticZoom * evt.scale
			camera.updateProjectionMatrix()
		})
  		hammerSESEME.on('pinchend',function(evt){
  			evt.preventDefault()
  			if(camera.zoom>1.75){
  				var from = {zoom: camera.zoom}
  				var spd = Math.abs(1.75 - camera.zoom) + 300
  				var back = new TWEEN.Tween(from).to({zoom:2},500).onUpdate(function(){
  					camera.zoom=from.zoom
		  			camera.updateProjectionMatrix()
  				}).easing(TWEEN.Easing.Cubic.Out).start()
  			}	
  			staticZoom = camera.zoom
  		})
		hammerSESEME.on('tap',function(e){
			if(dataset!=='arc_saver'&&!forcing){
				mousePos.x= (e.pointers[0].clientX / window.innerWidth)*2-1
				mousePos.y= - (e.pointers[0].clientY / window.innerHeight)*2+1
				clickedSeseme()
			}
		})
  		hammerSESEME.on('pan',function(evt){
	  	if(!autoRotating){	
  			if(Math.abs(evt.velocityX)>Math.abs(evt.velocityY)){
  				touchRotating = true
				rotDir = evt.velocityX < 0 ? 1: evt.velocityX > 0 ? -1: 1
  				seseme.rotation.y-=((evt.velocityX)*(Math.PI/180))*uiScale
  				realRotation()
  				rotationOrder(getNearest90())
  				if(last90!=anglesIndex[0]){
  					browse(rotationIndex[0])
  				}
  				flipPrev()
  		  	}
	  	}
  		})
  		hammerSESEME.on('panend',function(evt){ //rotation deceleration
  			if(!autoRotating){ 
  				if(Math.abs(evt.velocityX)>Math.abs(evt.velocityY)){ //horizontal pan
	  				start = {speed: evt.velocityX}
		  			diff = (Math.abs(0-evt.velocityX)) * 85
		  			rotDecel = new TWEEN.Tween(start)
		  			rotDecel.to({speed:0},diff+400)
		  			rotDecel.onUpdate(function(){
		  				seseme.rotation.y-=(start.speed * (Math.PI/90))
		  				realRotation()
		  				rotationOrder(getNearest90())
		  				if(last90!=anglesIndex[0]){
		  					browse(rotationIndex[0])
		  				}
		  				flipPrev()
		  			})
		  			rotDecel.easing(TWEEN.Easing.Quadratic.Out)
		  			rotDecel.start()

		  		}
		  		touchRotating = false
			}
  		})//pan finish
	}//end function eventListeners
	function syncToData(){ //get all data, populate 3d and DOM/UI
		getValues()
		assess()
		socket.emit('whatData')
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