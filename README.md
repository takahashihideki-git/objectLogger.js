# objectLogger.js
logging coordinated operation between user-defined objects.

## Usage

    var logger = new ObjectLogger();

    logger.watch( [ 
      { constructor: Man, className: "Man" },
      { constructor: Dog, className: "Dog" }
    ] );

ObjectLogger outputs log into the browser console.

You can set custom logging function to constructor.

    var textarea = document.querySelector( "textarea" );

    var logger = new ObjectLogger( function ( log ) {
      // custom log
      var body = log.body instanceof Object ? JSON.stringify( log.body ) : log.body;
      textarea.value = textarea.value + body + "\n";
    } );

and chart() method draws chart as below.

<p>
<img src="https://raw.githubusercontent.com/takahashihideki-git/objectLogger.js/master/sample/screenshot-chart.png">
</p>

For more information, please check the sample.
