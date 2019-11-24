(function() {
    require('color');

	var canvas = document.getElementById('sand'); // Obtain a reference to the canvas element using its id.
	var context = canvas.getContext('2d'); // Obtain a graphics context on the canvas element for drawing.

	// initialized within resize canvas
	var isLittleEndian = true;
	var imageData = null;
	var buf = null;
	var buf8 = null;
	var data = null;
	
	// Start listening to resize events and draw canvas.
	initialize();
	
	/**
		BEGIN LOGIC
	*/
	var particles = [];
	var events = [];
	var magnificationFactor = 600;
	var panX = 2;
	var panY = 0.22;
	
	function checkIfBelongsToMandelbrotSet(x,y) {
		var realComponentOfResult = x;
		var imaginaryComponentOfResult = y;
		var maxIterations = 100;
		for(var i = 0; i < maxIterations; i++) {
			var tempRealComponent = realComponentOfResult * realComponentOfResult
			- imaginaryComponentOfResult * imaginaryComponentOfResult
			+ x;
			var tempImaginaryComponent = 2 * realComponentOfResult * imaginaryComponentOfResult
			+ y;
			realComponentOfResult = tempRealComponent;
			imaginaryComponentOfResult = tempImaginaryComponent;

			// Return a number as a percentage
			if(realComponentOfResult * imaginaryComponentOfResult > 5) 
				return (i/maxIterations * 100);
		}
		return 0;   // Return zero if in set        
	}
	
	function generateSet() {
		for (var y = 0; y < canvas.height; ++y) {
			for (var x = 0; x < canvas.width; ++x) {
				var mandel = checkIfBelongsToMandelbrotSet(x/magnificationFactor - panX, y/magnificationFactor - panY);
				var value = mandel ? 0xFFFFFF : 0x000000;

				if (isLittleEndian) {
					data[y * canvas.width + x] =
						(255   << 24) |    // alpha
						(value << 16) |    // blue
						(value <<  8) |    // green
						value;            // red
				}
				else {
					data[y * canvas.width + x] =
						(value << 24) |    // red
						(value << 16) |    // green
						(value <<  8) |    // blue
						255;              // alpha
				}
			}
		}

		imageData.data.set(buf8);
		context.putImageData(imageData, 0, 0);
	}
	/**
		END LOGIC
	*/
	
	// Draw canvas for the first time
	resizeCanvas();
	
	function isBigEndian() {
		// Determine whether Uint32 is little- or big-endian.
		data[1] = 0x0a0b0c0d;

		if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c &&
				buf[7] === 0x0d) {
			return true;
		}
		
		return false;
	}

	function initialize() {
		// Register an event listener to call the resizeCanvas() function 
		// each time the window is resized.
		window.addEventListener('resize', resizeCanvas, false);
		window.addEventListener('drag', dragCameraPan, false);
	}
	
	function dragCameraPan(e) {
		console.log(e);
	}
	
	function cameraPan(x, y) {
		panX = x;
		panY = y;
	}

	// Display custom canvas. In this case it's a blue, 5 pixel 
	// border that resizes along with the browser window.
	function redraw() {
		context.strokeStyle = 'blue';
		context.lineWidth = '5';
		context.strokeRect(0, 0, window.innerWidth, window.innerHeight);
		generateSet();
	}

	// Runs each time the DOM window resize event fires.
	// Resets the canvas dimensions to match window,
	// then draws the new borders accordingly.
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		buf = new ArrayBuffer(imageData.data.length);
		buf8 = new Uint8ClampedArray(buf);
		data = new Uint32Array(buf);
		isLittleEndian = !isBigEndian();
		
		redraw();
	}
})();