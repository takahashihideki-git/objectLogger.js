// ----------------------------------------------------------------------------
// ObjectLogger Class
// ----------------------------------------------------------------------------

( function ( className ) {

    window[ className ] = function ( userLoggingMethod ) {
      this.logs = new Array();
      if ( userLoggingMethod ) {
        this.userLoggingMethod = userLoggingMethod;
      }
    }

    window[ className ].prototype = {

        classes: null,
        prefix: "_do_",
        depth: 0,
        logs: null,
        canvas: null,
        userLoggingMethod: null,

        watch: function ( classes ) {

            var logger = this;
            logger.classes = classes;

            for ( var i = 0; i < logger.classes.length; i++ ) {

                ( function () {

                    var classIndex = i;
                    var targetClass = logger.classes[ classIndex ].constructor;
                    var targetProtos = [ targetClass.prototype ];

                    var chain = function ( proto ) {
                        if ( proto.__proto__ && Object.keys( proto.__proto__ ).length > 0 ) {
                            targetProtos.push( proto.__proto__ );
                            chain( proto.__proto__ );
                        }
                    }
                    chain( targetClass.prototype );

                    for ( var j = 0; j < targetProtos.length; j++ ) {

                        ( function () {

                            var protoIndex = j;
                            var keys = Object.keys( targetProtos[ protoIndex ] );

                            for ( var k = 0; k < keys.length; k++ ) {

                                ( function () {

                                    var keyIndex = k;

                                    if ( targetProtos[ protoIndex ][ keys[ keyIndex ] ] instanceof Function ) {

                                        // skip overrided __proto__
                                        if ( protoIndex > 0 && keys[ keyIndex ] in Object.keys( targetProtos[ 0 ] ) ) {
                                            return;
                                        }

                                        // rename real method and set to prototype 
                                        targetClass.prototype[ logger.prefix + keys[ keyIndex ] ] = targetProtos[ protoIndex ][ keys[ keyIndex ] ];

                                        // set logging method to prototype instead of real method
                                        targetClass.prototype[ keys[ keyIndex ] ] = function () {

                                            logger.depth++;

                                            // logging
                                            logger.log( {
                                                body: "[Log] " + logger.indent() + " " + logger.classes[ classIndex ].className + ": " + keys[ keyIndex ] + "( " + arguments.length + " arguments )",
                                                type: "call",
                                                indent: logger.depth,
                                                class: logger.classes[ classIndex ].className,
                                                method: keys[ keyIndex ],
                                                argumentsLenght: arguments.length,
                                                instance: this
                                            } );

                                            // logging
                                            logger.log( {
                                                body: arguments,
                                                type: "arguments",
                                                indent: logger.depth,
                                                class: logger.classes[ classIndex ].className,
                                                method: keys[ keyIndex ],
                                                argumentsLenght: arguments.length,
                                                arguments: arguments,
                                                instance: this
                                            } );

                                            // do real method
                                            var value = this[ logger.prefix + keys[ keyIndex ] ].apply( this, arguments );

                                            // logging
                                            logger.log( {
                                                body: "[Log] " + logger.indent() + " " + logger.classes[ classIndex ].className + ": " + keys[ keyIndex ] + ": return",
                                                type: "return",
                                                indent: logger.depth,
                                                class: logger.classes[ classIndex ].className,
                                                method: keys[ keyIndex ],
                                                argumentsLenght: arguments.length,
                                                instance: this
                                            } );

                                            // logging
                                            logger.log( {
                                                body: value,
                                                type: "value",
                                                indent: logger.depth,
                                                class: logger.classes[ classIndex ].className,
                                                method: keys[ keyIndex ],
                                                argumentsLenght: arguments.length,
                                                value: value,
                                                instance: this
                                            } );
                                            logger.depth--;

                                            return value; 

                                        }

                                    }

                                } )();

                            }

                        } )();

                    }

                } )();

            }

        },

        indent: function () {
            var indent = "+";
            for ( var i = 0; i < this.depth; i++ ) {
                indent += "-";
            }
            indent += ">";
            return indent;
        },

        log: function ( log ) {
            if ( this.userLoggingMethod ) {
              this.userLoggingMethod( log );
            }
            else {
              console.log( log.body );
            }
            this.logs.push( log );
        },

        chart: function () {
          if ( ! this.canvas ) {
            this.canvas = document.createElement( "canvas" );
            this.canvas.setAttribute( "style", "position:absolute; top:10px; left:10px; border:1px solid #ccc; border-radius:10px; background-color:rgba( 255, 255, 255, 0.9 ); cursor:pointer;" );
            document.querySelector( "body" ).appendChild( this.canvas );
            this.drawChart();
          }
          else {
            document.querySelector( "body" ).removeChild( this.canvas );
            this.canvas = null;
          }
        },

        drawChart: function () {

          // Create Data
          var logs = this.logs;
          var lanes = new Array();
          for ( var i = 0; i < logs.length; i++ ) { 
            ( function () {
              // add index
              logs[ i ].index = i;
              // add to lane
              var hit = false;
              for ( var j = 0; j < lanes.length; j++ ) { 
                ( function () {
                  if ( lanes[ j ].instance == logs[ i ].instance ) {
                    hit = true;
                    lanes[ j ].logs.push( logs[ i ] );
                    // add lane numer to log
                    logs[ i ].lane = j;
                  }
                } )();
                if ( hit ) {
                  break;
                }
              }
              if ( ! hit ) {
                var lane = {
                  instance: logs[ i ].instance,
                  logs: [ logs[ i ] ]
                }
                lanes.push( lane );
                // add lane numer to log
                logs[ i ].lane = lanes.length - 1;
              }
            } )();
          }

          // const
          const margin = 50;
          const unitWidth = 200;
          const unitHeight = 10;
          const textColor = "#000";
          const activeColor = "#1E96D2";
          const inactiveColor = "#eee";
          const textBackgroundColor = "#fff";
          const textBackgroundWidth = 20;
          const classNameMarginTop = -20;
          const classNameMarginLeft = -10;
          const stepRadius = 5;
          const stepTextMarginLeft = 10;
          const classNameFontSize = 14;
          const stepFontSize = 12;
          const alpha = 0.7

          // var
          var canvasWidth;
          var canvasHeight;
          var maxLaneSteps;
          var startX;
          var startY;
          var laneLength;
          var sequenceX;
          var sequenceY;
          var stepIndex;
          var stepType;
          var stepY;  

          // set Canvas
          var canvas = this.canvas;
          var context = canvas.getContext( "2d" );

          // spread canvas
          canvasWidth = lanes.length * unitWidth + margin;
          maxLaneSteps = 0;
          for ( var i = 0; i < lanes.length; i++ ) {
              maxLaneSteps += lanes[ i ].logs.length
          }
          canvasHeight = unitHeight * maxLaneSteps +  margin * 2
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          // draw Lanes and set event
          context.strokeStyle = inactiveColor;
          startX = margin;
          startY = margin;
          laneLength = margin + unitHeight * maxLaneSteps;
          for( var i = 0; i < lanes.length; i++ ) {
            context.beginPath();
            context.moveTo( startX, startY );
            context.lineTo( startX, laneLength);
            context.closePath();
            context.stroke();
            context.font =  classNameFontSize + "px sans-serif";
            context.fillText( lanes[ i ].logs[ 0 ].class, startX + classNameMarginLeft, startY + classNameMarginTop );

            ( function () {

                  var x = startX + classNameMarginLeft;
                  var y = startY + classNameMarginTop - classNameFontSize;

                  var instance =  lanes[ i ].instance;                 

                  canvas.addEventListener( "click", function ( e ) {

                    if ( e.offsetX > x && e.offsetX < x + unitWidth ) {
                      if ( e.offsetY > y && e.offsetY < y - classNameMarginTop ) {
                        console.log( instance );
                      }
                    }

                  }, false );


            } )();

            startX = startX + unitWidth;

          }

          // draw Sequence
          context.strokeStyle = activeColor;
          startX = margin;
          startY = margin;
          sequenceX;
          sequenceY;
          context.beginPath();
          context.moveTo( startX, startY );
          for ( var i = 1; i < logs.length; i++ ) {

            if ( logs[ i ].type == "call" || logs[ i ].type == "return" ) {

              sequenceX = margin + unitWidth * logs[ i ].lane;
              sequenceY = margin + unitHeight * logs[ i ].index;
              context.lineTo( sequenceX, sequenceY);

            }

          }
          context.stroke();

          // draw Steps and set event
          startX = margin;
          startY = margin;
          for( var i = 0; i < lanes.length; i++ ) {
            for ( var j = 0; j < lanes[ i ].logs.length; j++ ) {

              stepType = lanes[ i ].logs[ j ].type; 

              if ( stepType == "call" || stepType == "return" ) {

                stepIndex = lanes[ i ].logs[ j ].index;
                stepY = startY + ( unitHeight * stepIndex ) ;
              
                context.beginPath();
                context.arc( startX, stepY, stepRadius, 0, Math.PI * 2, false );

                if ( stepType == "call" ) {
                  // fill arc
                  context.globalAlpha = 1;
                  context.fillStyle = activeColor;
                  context.fill();
                  // text background
                  context.beginPath();
                  context.rect( startX + stepTextMarginLeft, stepY - stepRadius, textBackgroundWidth, unitHeight );
                  context.fillStyle = textBackgroundColor;
                  context.globalAlpha = alpha;
                  context.fill();
                  // text
                  context.globalAlpha = 1;
                  context.fillStyle = textColor;
                  context.beginPath();
                  context.font = stepFontSize + "px sans-serif";
                  context.fillText( lanes[ i ].logs[ j ].method + "()", startX + stepTextMarginLeft, stepY + stepRadius / 2 );
                }
                else { // stepType == "return"
                  // stroke arc
                  context.fillStyle = activeColor;
                  context.stroke();
                  // text background
                  context.beginPath();
                  context.rect( startX + stepTextMarginLeft, stepY - stepRadius, 20, unitHeight );
                  context.fillStyle = textBackgroundColor;
                  context.globalAlpha = alpha;
                  context.fill();
                  // text
                  context.globalAlpha = 1;
                  context.fillStyle = textColor;
                  context.beginPath();
                  context.font = stepFontSize + "sans-serif";
                  context.fillText( lanes[ i ].logs[ j ].method + ": " + stepType, startX + stepTextMarginLeft, stepY + stepRadius / 2 );
                }

                ( function () {

                  var x = startX;
                  var y = stepY;
                  
                  if ( stepType == "call" ) {
                    var log = {
                      class: lanes[ i ].logs[ j + 1 ].class,
                      instance: lanes[ i ].logs[ j + 1 ].instance,
                      method: lanes[ i ].logs[ j + 1 ].method,
                      arguments: lanes[ i ].logs[ j + 1 ].arguments,
                    };
                  }
                  else { // stepType == "return"
                    var log = {
                      class: lanes[ i ].logs[ j + 1 ].class,
                      instance: lanes[ i ].logs[ j + 1 ].instance,
                      method: lanes[ i ].logs[ j + 1 ].method,
                      value: lanes[ i ].logs[ j + 1 ].value,
                    };
                  }

                  canvas.addEventListener( "click", function ( e ) {

                    if ( e.offsetX > x - stepRadius && e.offsetX < x + unitWidth ) {
                      if ( e.offsetY > y - stepRadius && e.offsetY < y + unitHeight ) {
                        console.log( log );
                      }
                    }

                  }, false );

                } )();

              }

            }
            startX = startX + unitWidth; 
          }

        }

    }

} )( "ObjectLogger" );
