
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
	intensify(document.getElementById("url-input").value);
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
		document.body.appendChild(canvas);
	}
	var ctx = canvas.getContext("2d");
	canvas.width = source_file.width - 10;
	canvas.height = source_file.height - 10;

	var encoder = new GIFEncoder();
	encoder.setRepeat(0);
	encoder.setDelay(25);
	encoder.start();

	ctx.font = "20pt Impact";
	ctx.fillStyle = "White";
	ctx.lineWidth = 1;
	ctx.strokeStyle = "Black";
	ctx.textAlign = "center";
	var text = document.getElementById("text").value;

	for (var i=0; i < 5; i++){
		draw_gif_frame(ctx, source_file, text, i);
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
		document.body.appendChild(intense_gif);
	}
	else {
		intense_gif.src = data_url;
	}

	intense_gif.width = canvas.width;
	intense_gif.height = canvas.height;
	canvas.width = 0;
	canvas.height = 0;
}

function draw_gif_frame(ctx, img, text, frame) {
	var image_x = -5;
	var image_y = -5;
	switch (frame){
		case 0:
			image_x = 0;
			image_y = -10;
			break;
		case 1:
			image_x = -10;
			image_y = -10;
			break;
		case 2:
			image_x = 0;
			image_y = 0;
			break;
		case 3:
			image_x = 0;
			image_y = -10;
			break;
		default:
			image_x = -5;
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