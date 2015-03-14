# objectLogger.js
logging coordinated operation between user-defined objects.

## Usage

    var logger = new ObjectLogger();

    logger.watch( [ 
      { constructor: Man, className: "Man" },
      { constructor: Dog, className: "Dog" }
    ] );

ObjectLogger outputs logs into the browser console.

You can set custom logging function to constructor.

ObjectLogger outputs chart as below.

<p>
<img src="https://raw.githubusercontent.com/takahashihideki-git/objectLogger.js/master/sample/screenshot-chart.png">
</p>

For more information, please check the sample.
