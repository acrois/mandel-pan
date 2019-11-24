var index;
(index = function() {
    var Color = require('color');

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
	var dragScale = 0.0075;
	var dragOrigin = null;
	var particles = [];
	var events = [];
	var magnificationFactor = 600;
	var pan = [ 1.5, 0.5 ];
	var offset = [ 0, 0 ];
	var color = Color("hsl(100, 100%, " + 0 + "%)");
	var colors = [];
	var colorFactor = 3;
	
	function checkIfBelongsToMandelbrotSet(x,y) {
		var realComponentOfResult = x;
		var imaginaryComponentOfResult = y;
		var maxIterations = 100;

		for(var i = 0; i < maxIterations; i++) {
			var tempRealComponent = realComponentOfResult * realComponentOfResult - imaginaryComponentOfResult * imaginaryComponentOfResult + x;
			var tempImaginaryComponent = 2 * realComponentOfResult * imaginaryComponentOfResult + y;
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
			var modY = y + offset[1];
			var mY = ((y / magnificationFactor)).toFixed(colorFactor) - pan[1];

			if (!colors[mY]) {
				colors[mY] = [];
			}

			for (var x = 0; x < canvas.width; ++x) {
				var modX = x + offset[0];
				var mX = ((x / magnificationFactor)).toFixed(colorFactor) - pan[0];
				
				//console.log(mX, mY);
				
				var value = colors[mY][mX];

				if (!value) {
					//colors[mZ] = 
					var mandel = checkIfBelongsToMandelbrotSet(mX, mY);
					//console.log(mandel);
					value = colors[mY][mX] = color.lightness(mandel).rgbNumber();
				}

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

		//console.log(colors);
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
		window.addEventListener('mousemove', dragCameraPan, false);
		window.addEventListener('mousedown', registerCameraPan, false);
		window.addEventListener('mouseup', deregisterCameraPan, false);
	}

	function registerCameraPan(e) {
		dragOrigin = offset.slice(0);
	}

	function deregisterCameraPan(e) {
		dragOrigin = null;
	}
	
	function dragCameraPan(e) {
		if (dragOrigin) {
			console.log(e);
			cameraPan(dragOrigin[0] + (e.movementX * dragScale), dragOrigin[1] + (e.movementY * dragScale));
		}
	}
	
	function cameraPan(x, y) {
		if (pan[0] == x && pan[1] == y) {
			return;
		}

		offset = [ x, y ];
		redraw();
	}

	// Display custom canvas. In this case it's a blue, 5 pixel 
	// border that resizes along with the browser window.
	function redraw() {
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
window.index = index;