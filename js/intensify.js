if (document.readyState !== 'loading') {
	ready()
} else {
	// the document hasn't finished loading/parsing yet so let's add an event handler
	document.addEventListener('DOMContentLoaded', ready)
}

var div_list = [
	"error",
	"loading",
	"ready",
	"intensifying"
]

function ready() {
	if (localStorage.image) {
		show_only("ready");
	}
	link_range_to_value(document.getElementById("font_range"),      document.getElementById("font_slider_value"));
	link_range_to_value(document.getElementById("magnitude_range"), document.getElementById("magnitude_slider_value"));
	document.getElementById("error").addEventListener('click', () => hide_div("error"));
}

function link_range_to_value(range, display) {
	display.innerHTML = range.value;
	range.addEventListener('input', () => display.innerHTML = range.value);
}

function select_file(input) {
	var files = input.files;
	show_only("loading");

	if (FileReader && files && files.length) {
		var file_reader = new FileReader();
		file_reader.onload = () => {
			localStorage.image = file_reader.result;
			show_only("ready");
		};
		file_reader.readAsDataURL(files[0]);
	} else {
		show_only("error");
	}
}

function save_to_local_storage() {
	var url = document.getElementById("url-input").value;
	if (url == null || url == "") {
		return;
	}
	var xhr = new XMLHttpRequest();
	show_only("loading");
	xhr.open("GET", url, true);
	xhr.responseType = "blob";

	xhr.addEventListener("load", function () {
		if (xhr.readyState == 4 && xhr.status === 200) {
			var fileReader = new FileReader();
			fileReader.onload = function (evt) {
				localStorage.image = evt.target.result;
				show_only("ready");
			};
			fileReader.readAsDataURL(xhr.response);
		} else {
			console.error("Unable to load file");
			show_only("error");
		}
	});
	xhr.addEventListener("error", function () {
		console.error("Unable to load file");
		show_only("error");
	});
	xhr.send();
}

function intensify() {
	show_only("intensifying");
	document.getElementById("url-input").value = "";
	document.getElementById("file-input").value = null;
	load_local_storage(localStorage.image);
}

function load_local_storage(img) {
	loadImage(
		img,
		function (img) {
			if (img.type === "error") {
				console.error("Unable to load file");
				show_only("error");
			} else {
				create_gif(img);
			}
		}, {
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
	ctx.font = font + "px Impact";
	ctx.fillStyle = "White";
	ctx.lineWidth = 1;
	ctx.strokeStyle = "Black";
	ctx.textAlign = "center";
	var gif_data = {
		source_file: source_file,
		magnitude: magnitude,
		text: document.getElementById("text").value,
		intensify_text: document.getElementById("text-menu").value,
		image_x: [0, 2, 1, 0, 2],
		image_y: [2, 2, 0, 1, 1],
		text_x:  [1, 0, 2, 0, 1],
		text_y:  [1, 2, 0, 2, 2]
	}

	for (var i = 0; i < 5; i++) {
		draw_gif_frame(ctx, gif_data, i);
		encoder.addFrame(ctx);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	encoder.finish();
	var data_url = "data:image/gif;base64," + encode64(encoder.stream().getData());

	var intense_gif = document.getElementById("intensity_image");
	if (intense_gif == undefined) {
		intense_gif = new Image();
		intense_gif.id = "intensity_image";
		intense_gif.src = data_url;
		document.getElementById("center").appendChild(intense_gif);
	} else {
		intense_gif.src = data_url;
	}

	hide_all();
	intense_gif.width = canvas.width;
	intense_gif.height = canvas.height;
	canvas.width = 0;
	canvas.height = 0;
}

function draw_gif_frame(ctx, gif_data, frame) {
	var magnitude = -gif_data.magnitude;
	var image_x = magnitude * gif_data.image_x[frame];
	var image_y = magnitude * gif_data.image_y[frame];
	ctx.drawImage(gif_data.source_file, image_x, image_y);

	var text_x = ctx.canvas.clientWidth / 2;
	var text_y = ctx.canvas.clientHeight * 0.98;
	switch (gif_data.intensify_text) {
		case "along":
			text_x += image_x;
			text_y += image_y;
			break;
		case "shake":
			text_x += magnitude * gif_data.text_x[frame];
			text_y += magnitude * gif_data.text_y[frame];
			break;
		case "pulse_move":
			text_x += image_x;
			text_y += image_y;
			// intentional fallthrough
		case "pulse":
			ctx.font = ctx.font.replace(/\d+px/, parseInt(ctx.font.match(/\d+/)) + 4 + "px");
			break;
		default:
	}
	ctx.fillText(gif_data.text, text_x, text_y);
	ctx.strokeText(gif_data.text, text_x, text_y);
	ctx.fill();
	ctx.stroke();
}

function show_only(name) {
	div_list.forEach((div) => {
		if (div == name) {
			document.getElementById(name).style.display = "block";
		} else {
			hide_div(div);
		}
	});
}

hide_div = (name) => document.getElementById(name).style.display = "none";
hide_all = () => div_list.forEach((name) => hide_div(name));
