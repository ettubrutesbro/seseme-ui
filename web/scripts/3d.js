    
    //3d.js: all three.js code for SESEME UI. 1) DISPLAY   2) ANIMATE   3) INTERACT

    //basic display 
    var container //dom element
    var scene = new THREE.Scene()
    // in the near future this will need to be dependent on 
    // parent container's dimensions not the window
    var aspect = window.innerWidth / window.innerHeight
    var dips = window.devicePixelRatio

    var uiScale = 1//Math.abs(((aspect*aspect) - aspect).toFixed(2))
    if(dips>2){
      uiScale=2.2
    }else if(dips<2){
      uiScale=0.5
    } //uiScale is there to make touch interactions that measure pixels
    //equal across multiple devices

    var d = 20
    var camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 10, 100 )
    var loader = new THREE.JSONLoader()
    var renderer
   
    //dividing loaded model into manipulable groups 
    var seseme = new THREE.Group()
    var pedestal
    var pillargroup = new THREE.Group()

    //variables for INTERACT functions
    var raycaster
    var mouseLocation = new THREE.Vector2()
    var mouseTarget
    
    var rotationTargetArray = [0, -90, -180, 90]

    //variables for ANIMATION
    var currentPosition = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0}
    var targetPosition = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0}

    var pillarHeights = [{y:0},{y:0},{y:0},{y:0}]
    var pillarTargets = [{y:2},{y:13},{y:1},{y:3}]

    //debug
    var debugState = 0
    var debugInfo = document.querySelector('#debug')
    var debugInput = document.querySelector('#debugInput')
    var debugButton = document.querySelector('#debugButton')
    //-----------------------------------------------
    // END GLOBAL VARIABLE DECLARATION
    //-----------------------------------------------
    //core functions setup scene and draw it every frame
    setup()
    animate() //render() is nested in here
    initTouchEvents()
    lightDebug()
    //cameraMove(false,0,true,{x: -10, y: 8})

    function setup(){

      camera.position.set( -19, 13, 20 )
      //camera.position.set( -19, 0, 20 )
      //camera.position.set( 0, 13, 0 )
      camera.rotation.order = 'YXZ'
      camera.rotation.y = - Math.PI / 4
      camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
      //camera.rotation.x = 20*(Math.PI/180)
      camera.zoom = .83
      camera.updateProjectionMatrix()

      //place the renderer(canvas) within DOM element (div)
      container = document.createElement("div")
      document.body.appendChild(container)
      container.id = "containerSESEME"
      renderer = new THREE.WebGLRenderer({antialias: true})
      renderer.shadowMapEnabled = true
      renderer.shadowMapType = THREE.PCFSoftShadowMap
      renderer.setSize( window.innerWidth, window.innerHeight )
      container.appendChild( renderer.domElement )

      //materials for seseme & orb (eventually need multiples for seseme?)
      var sesememtl = new THREE.MeshPhongMaterial({color: 0x1b1d1e, shininess: 16, specular: 0x413632})
      sesememtl.shading = THREE.FlatShading
   
      var groundmtl = new THREE.MeshBasicMaterial({color: 0x878787})
      
      
      var orbmtl = new THREE.MeshPhongMaterial({color: 0x000000, shininess: 10, specular: 0x878787})
      var outlinemtl = new THREE.MeshBasicMaterial( { color: 0xff0000, linewidth: 4} )

      var hilightmtl = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.BackSide })


      //LIGHTING
      lighthelpergeo = new THREE.BoxGeometry(3,3,3)
      targethelpergeo = new THREE.BoxGeometry(1,1,1)
      helper = new THREE.Mesh(lighthelpergeo, new THREE.MeshNormalMaterial())
      helper.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z)

      light = new THREE.SpotLight(0xffffff, 1.8)
      light.add(helper)
      light.position.set(24,80,20)
      light.castShadow = true
      light.shadowDarkness = 0.3
      // light.shadowCameraVisible = true

      light.target.position.set(2,1,0)

      light.shadowMapWidth = 768; // default is 512
      light.shadowMapHeight = 768; // default is 512

      seseme.add(light)
     

      light2 = new THREE.SpotLight(0xffffff, .6)
      // light2.target.position.set(2,1,0)
      // light2.castShadow = true
      // light2.shadowDarkness = 0.5

      //light2.add(helper2)
      // //light2 = new THREE.AmbientLight(0x1a1a1a, 0)
      
      light2.position.set(camera.position.x,camera.position.y-8,camera.position.z)
      
      scene.add(light2)

      // INTERACT setup -- event listener, initializing interact vars
      window.addEventListener( 'mousemove', onMouseMove, false)
      window.addEventListener( 'mouseup', onMouseUp, false)
      window.addEventListener( 'mousedown', onMouseDown, false)
     window.addEventListener( 'deviceorientation', onDeviceOrient, false)
     //debugButton.addEventListener('click', lightDebug, false)

      mouseLocation = { x:0, y:0, z:1 }
      raycaster = new THREE.Raycaster()

      // EXTERNAL LOADING - getting .js 3d models into the canvas
      loader.load("assets/pedestal.js", function(geometry,evt){

        pedestal = new THREE.Mesh(geometry, sesememtl)
        pedestal.applyMatrix( new THREE.Matrix4().makeTranslation(1.5, 0, 1))
        pedestal.scale.set(0.5,0.5,0.5)
        pedestal.castShadow = true
        // pedestal.receiveShadow = true
        pedestal.name = "pedestal"
        pedestal.overdraw = true
        seseme.add(pedestal)

      }) 

      loader.load("assets/pillarA.js", function(geometry,evt){

        //  var outTgt = geometry.vertices
        //  var outlineGeometry = new THREE.Geometry()
        //  outlineGeometry.vertices.push(outTgt[2], outTgt[3], outTgt[0], outTgt[8])
        // var outlineGeometry2 = new THREE.Geometry()
        // outlineGeometry2.vertices.push(outTgt[2], outTgt[1], outTgt[0])
        // var outlineGeometry3 = new THREE.Geometry()
        // outlineGeometry3.vertices.push(outTgt[3], outTgt[5], outTgt[4])
        // var outlineGeometry4 = new THREE.Geometry()
        // outlineGeometry4.vertices.push(outTgt[1], outTgt[6], outTgt[7])
        // var outlineGeometry5 = new THREE.Geometry()
        // outlineGeometry5.vertices.push(outTgt[2], outTgt[9], outTgt[5]) 
        // var outlineGeometry6 = new THREE.Geometry()
        // outlineGeometry6.vertices.push(outTgt[9], outTgt[6])

        // var lineobject = new THREE.Mesh(outlineGeometry, outlinemtl)
        // lineobject.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
        // lineobject.scale.set(0.5,0.5,0.5)
        // lineobject.overdraw = true

      
        

       var pillar1 = new THREE.Mesh(geometry, sesememtl)
        pillar1.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
        pillar1.scale.set(0.5,0.5,0.5)
        pillar1.overdraw = true
        pillar1.name = "pillar1"
        // pillar1.receiveShadow = true
        pillar1.castShadow = true
        pillargroup.add(pillar1)

        // var pillar1b = new THREE.Mesh(geometry, hilightmtl)
        // pillar1b.scale.set(3,3,3)
        // pillar1b.overdraw = true
        // pillar1b.applyMatrix( new THREE.Matrix4().makeTranslation( -0.5, 0.5, -1 ) )
        // pillar1.add(pillar1b)

     

      var pillar4 = new THREE.Mesh(geometry, sesememtl)
        pillar4.applyMatrix( new THREE.Matrix4().makeTranslation( 5, 0, -5 ) )
        pillar4.scale.set(0.5,0.5,0.5)
        pillar4.rotation.y = -90 * Math.PI / 180
        pillar4.overdraw = true
        pillar4.name = "pillar4"
        // pillar4.receiveShadow = true
        pillar4.castShadow = true
        setTimeout(function(){
          pillargroup.add(pillar4)
        },10) //this is awful and should not be
        
      })


      loader.load("assets/pillarB.js", function(geometry,evt){
      var pillar2 = new THREE.Mesh(geometry, sesememtl)
        pillar2.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
        pillar2.scale.set(0.5,0.5,0.5)
        pillar2.overdraw = true
        pillar2.name = "pillar2"
        // pillar2.receiveShadow = true
        pillar2.castShadow = true
        pillargroup.add(pillar2)

      var pillar3 = new THREE.Mesh(geometry, sesememtl)
        pillar3.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, 5 ) )
        pillar3.scale.set(0.5,0.5,0.5)
        pillar3.rotation.y = 90 * Math.PI / 180
        pillar3.overdraw = true
        // pillar3.receiveShadow = true
        pillar3.castShadow = true
        pillar3.name = "pillar3"
        pillargroup.add(pillar3)

      })

      //the orb is generated here (adjust segments for smooth)
      var orb = new THREE.Mesh( new THREE.SphereGeometry( 2.5, 7, 5 ), orbmtl )
      orb.name = "orb"
      orb.position.set(0,-5,0) //it's down but visible
      seseme.add(orb)  

      //groundplane
      var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry( 175, 175, 175 ), 
        groundmtl)
      ground.position.set(0,-17.7,0)
      ground.rotation.x = -90*(Math.PI/180)
      ground.receiveShadow = true
      scene.add(ground)

      console.log(pillargroup)  
      seseme.add(pillargroup)


      scene.add (seseme)


        setTimeout(function(){updateValues()},500) //no idea why, but this only
        // works with a setTimeout that waits (even 10ms is enough) to fire it

    } //end setup

    function animate(){ //put 3d animations here
        requestAnimationFrame( animate )
        //camera.rotation.x+=0.001
      
        render()
        TWEEN.update()


      } // end animate

    function render() { //put frame-by-frame checks and operations here
      //such as RENDERING or checking
        //DISPLAY
        renderer.render( scene, camera )
    } // end render

    function onMouseMove(evt){ //mouse movements update X / Y pos
      evt.preventDefault()
      mouseLocation.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
      mouseLocation.y = - ( evt.clientY / window.innerHeight ) * 2 + 1;

     } // end onMouseMove
     function onMouseDown(evt){
      raycaster.setFromCamera(mouseLocation, camera)
      var intersects = raycaster.intersectObjects(pillargroup.children)
      if(intersects != ''){
        console.log(intersects)
        mouseTarget = intersects[0].object.name
      }
     }
     function onMouseUp(evt){

      //get real rotation
      raycaster.setFromCamera(mouseLocation, camera)
      var intersects = raycaster.intersectObjects(pillargroup.children)
      
      if(intersects!=''){
        console.log(intersects[0].object.name)
        if(intersects[0].object.name == mouseTarget){ //did you let go on the same pillar you started on?
          var index = (intersects[0].object.name).replace('pillar','') 
          var oldRotation, newRotation, realRotation 
          //old / new to determine direction, then realRot to make relevant to (>360? rotations)
        currentPosition.ry = seseme.rotation.y

        targetPosition.ry = rotationTargetArray[index-1]*(Math.PI / 180)

        console.log('began at ' + seseme.rotation.y*(180/Math.PI))
        oldRotation = seseme.rotation.y*(180/Math.PI)

        var rotationTween = new TWEEN.Tween(currentPosition)

        var update = function(){
          seseme.rotation.y = currentPosition.ry
        }

        rotationTween.to(targetPosition,750) 
        rotationTween.easing(TWEEN.Easing.Quadratic.Out)
        rotationTween.onUpdate(update)
        rotationTween.onComplete(function(){
          console.log('finished at ' + seseme.rotation.y*(180/Math.PI))
          newRotation = seseme.rotation.y*(180/Math.PI)
           if(oldRotation>newRotation){ //1>2, 2>4, etc
              console.log('you rotated backwards') 
            } else {
              console.log('you rotated forwards')//reconf. array to go pos
            }
        })
        rotationTween.start()

        } else { //didn't mousedown on a pillar to begin with
          console.log('no')
        }
      } // end if !undefined

     }


    function updateValues(){ //valarray[index] is updated,
      // causing pillar[index] to move by change over duration
        console.log('updating values...')
        pillargroup.children.forEach(function(e,i){
        var index = (e.name).replace('pillar','')
        console.log(index)
        //need to convert the above into a number
        var pillarUpd = function(){
          e.position.y = pillarHeights[index-1].y
        }

        var pillarTween = new TWEEN.Tween(pillarHeights[index-1])
        pillarTween.to(pillarTargets[index-1],1200)
        pillarTween.onUpdate(pillarUpd)
        pillarTween.easing(TWEEN.Easing.Quadratic.InOut)

        pillarTween.start()
      })

    }

    function onDeviceOrient(evt){
      //debugInfo.textContent = evt.beta
      // if(evt.beta > 50){
      //   camera.rotation.x +=0.0007*(Math.abs(evt.beta-45))
      //   camera.position.x -=0.01*(Math.abs(45-evt.beta))
      //   camera.position.z +=0.01*(Math.abs(45-evt.beta))
      //   camera.position.y -=0.01*(Math.abs(45-evt.beta))
      // }
      // if(evt.beta < 40){
      //   camera.rotation.x -=0.0007*(Math.abs(45-evt.beta))
      //   camera.position.x +=0.01*(Math.abs(45-evt.beta))
      //   camera.position.z -=0.01*(Math.abs(45-evt.beta))
      //   camera.position.y +=0.01*(Math.abs(45-evt.beta))
      // }
      

    }

    function initTouchEvents(){
      var myElement = document.getElementById('containerSESEME')
      touchEvts = new Hammer(myElement)
      touchEvts.on('pan',function(evt){
        seseme.rotation.y-=(evt.velocity*uiScale)*(Math.PI/90)
      })
      touchEvts.on('panend',function(evt){
       
        var currentSpeed = {speed: evt.velocity*uiScale}
        var update = function(){
          seseme.rotation.y-=(currentSpeed.speed * (Math.PI/90)) 
        }
        rotationDeceleration = new TWEEN.Tween(currentSpeed)
        rotationDeceleration.to({speed: 0},1400)
        rotationDeceleration.onUpdate(update)
        rotationDeceleration.easing(TWEEN.Easing.Cubic.Out)
        rotationDeceleration.onComplete(function(){
           
           
           //something here to SET rotation to a 0-380 val
        })
        rotationDeceleration.start()
      })
    }
    
    function cameraMove(zoom,zoomAmt,pan,panTgt){
      if(zoom){
        var currentZoom= {zoom: camera.zoom}
        var zoomSpd = (Math.abs(currentZoom.zoom - zoomAmt)) * 1000 + 200

        var updatezoom = function(){
          camera.zoom = currentZoom.zoom
          camera.updateProjectionMatrix()
        }
        var zoomTween = new TWEEN.Tween(currentZoom)
        zoomTween.to({zoom: zoomAmt},zoomSpd)
        zoomTween.easing(TWEEN.Easing.Cubic.Out)
        zoomTween.onUpdate(updatezoom)
        zoomTween.start()
      }

      if(pan){
        //var panTarget = {x: camera.position.x + panTgt.x, y: camera.position.y + panTgt.y}
        var pan = {x: camera.position.x, y: camera.position.y}
        var panTween = new TWEEN.Tween(pan)
        var updatepan = function(){
          camera.position.x = pan.x
          camera.position.y = pan.y
        }
        panTween.to(panTgt,1000)
        panTween.onUpdate(updatepan)
        panTween.easing(TWEEN.Easing.Cubic.Out)
        panTween.start()

      }
    }

    function lightDebug(){
      if(debugState == 1){
        var newInfo = debugInput.textContent
        newInfo = newInfo.split(" ")
        console.log(newInfo)

        light.position.x = newInfo[0]
        light.position.y = newInfo[1]
        light.position.z = newInfo[2]

        light.target.position.set(newInfo[3],newInfo[4],newInfo[5])
        //light.shadowCameraVisible = true


        debugInfo.textContent = "x:" + light.position.x +
        " y:" + light.position.y + " z:" + light.position.z + 
        " px: " + light.target.position.x + " py:" + light.target.position.y +
        " pz:" + light.target.position.z

      }
 
    }