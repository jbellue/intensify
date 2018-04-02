
function select_file(input) {
	var files = input.files;

	if (FileReader && files && files.length) {
		document.getElementById("error").style.display = "none";
		var file_reader = new FileReader();
		file_reader.onload = function () {
			localStorage.image = file_reader.result;
		};
		file_reader.readAsDataURL(files[0]);

		intensify(localStorage.image);
	}
	else {
		document.getElementById("error").style.display = "block";
	}
}

function select_url() {
	intensify(document.getElementById("url-input").value || localStorage.image);
}

function intensify(img) {
	loadImage(
		img,
		function (img) {
			if(img.type === "error") {
				console.log("Unable to load file");
				document.getElementById("error").style.display = "block";
			} else {
				document.getElementById("error").style.display = "none";
				create_gif(img);
			}
		},
		{
			crossOrigin: true,
			canvas: true,
			maxWidth: 500
		}
	);
}
function create_gif(source_file) {
	// Set up the canvas.
	var canvas = document.getElementById("bitmap");
	if (canvas === null) {
		canvas = document.createElement("canvas");
		canvas.id = "bitmap";
		document.getElementById("center").appendChild(canvas);
	}
	var ctx = canvas.getContext("2d");
	var magnitude = document.getElementById("magnitude_range").value;
	canvas.width = source_file.width - (magnitude * 2);
	canvas.height = source_file.height - (magnitude * 2);

	var encoder = new GIFEncoder();
	encoder.setRepeat(0);
	encoder.setDelay(20);
	encoder.start();

	var font = document.getElementById("font_range").value;
	ctx.font = font + "pt Impact";
	ctx.fillStyle = "White";
	ctx.lineWidth = 1;
	ctx.strokeStyle = "Black";
	ctx.textAlign = "center";
	var text = document.getElementById("text").value;

	for (var i=0; i < 5; i++){
		draw_gif_frame(ctx, source_file, text, magnitude, i);
		//console.log(encoder.addFrame(ctx), i);
		encoder.addFrame(ctx);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	encoder.finish();
	var data_url = "data:image/gif;base64,"+encode64(encoder.stream().getData());


	var intense_gif = document.getElementById("intensity_image");
	if (intense_gif == undefined) {
		intense_gif = new Image();
		intense_gif.id = "intensity_image";
		intense_gif.src = data_url;
		document.getElementById("center").appendChild(intense_gif);
	}
	else {
		intense_gif.src = data_url;
	}

	intense_gif.width = canvas.width;
	intense_gif.height = canvas.height;
	canvas.width = 0;
	canvas.height = 0;
}

function update_magnitude_range(value) {
	document.getElementById("magnitude_slider_value").innerHTML = value;
}

function update_font_range(value) {
	document.getElementById("font_slider_value").innerHTML = value;
}

function ready() {
	magnitude_slider = document.getElementById("magnitude_range");
	document.getElementById("magnitude_slider_value").innerHTML = magnitude_slider.value;
	magnitude_slider.addEventListener('input', function() {
		update_magnitude_range(magnitude_slider.value);
	});
	font_slider = document.getElementById("font_range");
	document.getElementById("font_slider_value").innerHTML = font_slider.value;
	font_slider.addEventListener('input', function() {
		update_font_range(font_slider.value);
	});
	document.getElementById("error").addEventListener('click', function() {
		document.getElementById("error").style.display = "none";
	});
}

function draw_gif_frame(ctx, img, text, magnitude, frame) {
	var image_x = -magnitude;
	var image_y = -magnitude;
	switch (frame){
		case 0:
			image_x = 0;
			image_y = -2 * magnitude;
			break;
		case 1:
			image_x = -2 * magnitude;
			image_y = -2 * magnitude;
			break;
		case 2:
			//image_x = 0;
			//image_y = 0;
			break;
		case 3:
			image_x = 0;
			image_y = -magnitude;
			break;
		default:
			image_x = -2 * magnitude;
			image_y = 0;
			break;
	}
	
	ctx.drawImage(img, image_x, image_y);
	var text_x = (img.width - 15) / 2;
	var text_y = (img.height - 15) * 0.9;
	ctx.fillText(text, text_x, text_y);
	ctx.strokeText(text, text_x, text_y);
	ctx.fill();
	ctx.stroke();
}

if (document.readyState !== 'loading') {
	ready()
} else {
	// the document hasn't finished loading/parsing yet so let's add an event handler
	document.addEventListener('DOMContentLoaded', ready)
}