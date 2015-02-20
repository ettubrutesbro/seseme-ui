    
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
    var camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 5, 100 )
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
    
    var rotationTargetArray = [360, 270, 180, 90]

    //variables for ANIMATION
    var currentPosition = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0}
    var targetPosition = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0}

    var pillarHeights = [{y:0},{y:0},{y:0},{y:0}]
    var pillarTargets = [{y:4},{y:10},{y:4},{y:8}]

    var selectedPillar

    //debug
    // var debugState = 0
    // var debugInfo = document.querySelector('#debug')
    // var debugInput = document.querySelector('#debugInput')
    // var debugButton = document.querySelector('#debugButton')

    //experimental variables
    var revolutionCount = 0


    //-----------------------------------------------
    // END GLOBAL VARIABLE DECLARATION
    //-----------------------------------------------
    //core functions setup scene and draw it every frame
    setup()
    animate() //render() is nested in here
    initTouchEvents()
    //lightDebug()

    function setup(){

      camera.position.set( -19, 11, 20 )
      camera.rotation.order = 'YXZ'
      camera.rotation.y = - Math.PI / 4
      camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
      camera.zoom = .925
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
      var sesememtl = new THREE.MeshPhongMaterial({color: 0x80848e, 
        shininess: 21, specular: 0x9e6f4c, emissive: 0x101011})
      var groundmtl = new THREE.MeshBasicMaterial({color: 0xefefef})
      var orbmtl = new THREE.MeshPhongMaterial({color: 0x80848e, 
        shininess: 8, specular: 0x272727})

      //LIGHTING
      backlight = new THREE.SpotLight(0xeaddb9, 1.4)
      backlight.position.set(-15,75,-10)
      backlight.castShadow = true
      backlight.shadowDarkness = 0.2
      backlight.shadowMapWidth = 768 // default is 512
      backlight.shadowMapHeight = 768 // default is 512
      // helper = new THREE.Mesh(box, normalmtl)
      // helper.rotation.set(same as cam.x,y,z)
      // light.add(helper)
      //backlight.shadowCameraVisible = true
      scene.add(backlight)

      var amblight = new THREE.AmbientLight( 0x171721 )
      scene.add(amblight)
     
      camlight = new THREE.SpotLight(0xffffff, .35)
      camlight.position.set(camera.position.x-25,camera.position.y-29,camera.position.z-30)     
      scene.add(camlight)

      // INTERACT setup -- event listener, initializing interact vars
      window.addEventListener( 'mousemove', onMouseMove, false)
      window.addEventListener( 'mouseup', onMouseUp, false)
      window.addEventListener( 'mousedown', onMouseDown, false)
      window.addEventListener( 'deviceorientation', onDeviceOrient, false)

      mouseLocation = { x:0, y:0, z:1 }
      raycaster = new THREE.Raycaster()

      // EXTERNAL LOADING - getting .js 3d models into the canvas
      var pillar1, pillar2, pillar3, pillar4
      loader.load("assets/pedestal.js", function(geometry,evt){
        pedestal = new THREE.Mesh(geometry, sesememtl)
        pedestal.applyMatrix( new THREE.Matrix4().makeTranslation(1.5, 0, 1))
        pedestal.castShadow = true
        pedestal.name = "pedestal"
        seseme.add(pedestal)
      }) 
      loader.load("assets/pillarA.js", function(geometry,evt){
        pillar1 = new THREE.Mesh(geometry, sesememtl)
        pillar1.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
        pillar1.name = "pillar1"
        pillar1.castShadow = true
        pillargroup.add(pillar1)

        pillar4 = new THREE.Mesh(geometry, sesememtl)
        pillar4.applyMatrix( new THREE.Matrix4().makeTranslation( 5, 0, -5 ) )
        pillar4.rotation.y = -90 * Math.PI / 180
        pillar4.name = "pillar4"
        pillar4.castShadow = true
        setTimeout(function(){
          pillargroup.add(pillar4)
        },10) //this is awful and should not be
      })
      loader.load("assets/pillarA_outline.js", function(geometry){
        var mtl = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
        var mtl2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })

        var pillar1o = new THREE.Mesh(geometry, mtl)
        var pillar4o = new THREE.Mesh(geometry, mtl2)
        pillar1.add(pillar1o)
        pillar4.add(pillar4o)
      })

      loader.load("assets/pillarB.js", function(geometry,evt){
        pillar2 = new THREE.Mesh(geometry, sesememtl)
        pillar2.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
        pillar2.name = "pillar2"
        pillar2.castShadow = true
        pillargroup.add(pillar2)

        pillar3 = new THREE.Mesh(geometry, sesememtl)
        pillar3.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, 5 ) )
        pillar3.rotation.y = 90 * Math.PI / 180
        pillar3.castShadow = true
        pillar3.name = "pillar3"
        pillargroup.add(pillar3)
      })
      loader.load("assets/pillarB_outline.js", function(geometry,evt){
        var mtl = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
        var mtl2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })

        var pillar2o = new THREE.Mesh(geometry, mtl)
        var pillar3o = new THREE.Mesh(geometry, mtl2)
        pillar2.add(pillar2o)
        pillar3.add(pillar3o)
      })


      seseme.add(pillargroup)



      //the orb is generated here (adjust segments for smooth)
      var orb = new THREE.Mesh( new THREE.SphereGeometry( 2.5, 7, 5 ), orbmtl )
      orb.name = "orb"
      orb.position.set(0,-3.75,0) //it's down but visible
      seseme.add(orb)  

      //groundplane
      var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry( 250, 250, 250 ), 
        groundmtl)
      ground.position.set(0,-17.7,0)
      ground.rotation.x = -90*(Math.PI/180)
      ground.receiveShadow = true
      scene.add(ground)
      

      scene.add(seseme)

      setTimeout(function(){updateValues()
      },800) //no idea why, but this only
      // works with a setTimeout that waits (even 10ms is enough) to fire it
    } //end setup

    function animate(){ //put 3d animations here
        requestAnimationFrame( animate )
        render()
        TWEEN.update()
      } // end animate

    function render() { 
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

     
      raycaster.setFromCamera(mouseLocation, camera)
      var intersects = raycaster.intersectObjects(pillargroup.children)
      
      if(intersects!=''){
        console.log(intersects[0].object.name)
        if(intersects[0].object.name == mouseTarget){ //did you let go on the same pillar you started on?
          var index = (intersects[0].object.name).replace('pillar','') 
          console.log('begin at ' + seseme.rotation.y*(180/Math.PI))
          currentPosition.ry = seseme.rotation.y
          targetPosition.ry = rotationTargetArray[index-1]*(Math.PI / 180)

        
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
        hilightOn(index-1, false)
        

        } else { //didn't mousedown on a pillar to begin with
          console.log('no')
        }
      } // end if !undefined

     }


    function updateValues(){ //valarray[index] is updated,
      // causing pillar[index] to move by change over duration
        pillargroup.children.forEach(function(e,i){
        var index = (e.name).replace('pillar','')
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
        rotationDeceleration.to({speed: 0},700)
        rotationDeceleration.onUpdate(update)
        rotationDeceleration.easing(TWEEN.Easing.Quadratic.Out)
        rotationDeceleration.onComplete(function(){
           var finalRotate = seseme.rotation.y * (180/Math.PI)

           if(finalRotate < 0){
            var actRotation = 360 + finalRotate
            seseme.rotation.y = actRotation / (180/Math.PI)
            revolutionCount +=1
           }
           
           if(Math.abs(finalRotate/360) >= 1){
            console.log('abs value > 1')
            var numRevs = Math.abs(Math.floor(finalRotate/360))
            var actRotation = finalRotate-(numRevs*360)
            if(finalRotate < 0){
              actRotation = finalRotate+(numRevs*360)
            }
            seseme.rotation.y = actRotation / (180/Math.PI)
            revolutionCount +=1
           }

           console.log(seseme.rotation.y * (180/Math.PI))
           evaluateHighlight()
           if(revolutionCount>0){
            console.log(revolutionCount)
            //update value server-side with revolutionCount for this user
           }
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
      light.shadowCameraVisible = true
      if(debugState == 1){
        var newInfo = debugInput.textContent
        newInfo = newInfo.split(" ")
        console.log(newInfo)
        light.position.x = newInfo[0]
        light.position.y = newInfo[1]
        light.position.z = newInfo[2]
        light.target.position.set(newInfo[3],newInfo[4],newInfo[5])
        debugInfo.textContent = "x:" + light.position.x +
        " y:" + light.position.y + " z:" + light.position.z + 
        " px: " + light.target.position.x + " py:" + light.target.position.y +
        " pz:" + light.target.position.z
      }
    }

    function evaluateHighlight(target){
      console.log('evaluating')
     var rotationArray = [{min: 335, max: 25, dual: true},{min:245,max:295},{min:155,max:205},{min: 65, max:115}]
     var r = seseme.rotation.y * (180/Math.PI) 
     rotationArray.forEach(function(ele,i,arr){
    
      if(ele.dual==undefined){
        if(r>ele.min && r<ele.max){
          hilightOn(i, false)
        }
      }else{ //for the dual-sided 340-360, 0-20 case
        if(r>ele.min || r<ele.max){
          hilightOn(i, false)
        }
      }
     })
    }

    function hilightOn(target, clear){ //upgrade this with tweens
      if(clear){
        if(selectedPillar != undefined){
          console.log("clearing")
          pillargroup.children[selectedPillar].children[0].material.opacity = 0
          selectedPillar = undefined
        }
      } else{
        console.log('turning on')
        if(selectedPillar != target || selectedPillar == undefined){
          if(selectedPillar != undefined){
            pillargroup.children[selectedPillar].children[0].material.opacity = 0
          }
          var op = {opacity: 0}
          var opUpdate = function(){
            pillargroup.children[target].children[0].material.opacity = op.opacity
          }
          var opTween = new TWEEN.Tween(op)
          opTween.to({opacity: 1},500)
          opTween.easing(TWEEN.Easing.Quadratic.Out)
          opTween.onUpdate(opUpdate)
          opTween.start()
          selectedPillar = target
        }else{
          console.log('same one')
        }
        
        //turn off selection, open new one

      }
      // if(target != selectedPillar && selectedPillar!=undefined){
      //   console.log('should turn off ' + selectedPillar)
      //   pillargroup.children[selectedPillar].children[0].material.opacity = 0
      // }
      // var op = {opacity: pillargroup.children[target].children[0].material.opacity}
      // var opUpdate = function(){
      //   pillargroup.children[target].children[0].material.opacity = op.opacity
      // }
      // var opTween = new TWEEN.Tween(op)
      // opTween.to({opacity: 1}, 350)
      // opTween.onUpdate(opUpdate)
      // opTween.easing(TWEEN.Easing.Quadratic.Out)
      // opTween.start()
      // selectedPillar = target
      
    }