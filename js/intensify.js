if (document.readyState !== 'loading') {
	ready()
} else {
	// the document hasn't finished loading/parsing yet so let's add an event handler
	document.addEventListener('DOMContentLoaded', ready)
}

function ready() {
	if (localStorage.image) {
		show_only("msg_box_ready");
	}
	document.getElementById("msg_box_error").addEventListener('click', (e) => e.target.style.display = "none");
}

function select_file(input) {
	var files = input.files;
	show_only("msg_box_loading");
	
	if (FileReader && files && files.length) {
		var file_reader = new FileReader();
		file_reader.onload = () => {
			localStorage.image = file_reader.result;
			show_only("msg_box_ready");
		};
		file_reader.readAsDataURL(files[0]);
	} else {
		show_only("msg_box_error");
	}
}

function save_to_local_storage() {
	var url = document.getElementById("url-input").value;
	if (url == null || url == "") {
		return;
	}
	var xhr = new XMLHttpRequest();
	show_only("msg_box_loading");
	xhr.open("GET", url, true);
	xhr.responseType = "blob";
	
	xhr.addEventListener("load", function () {
		if (xhr.readyState == 4 && xhr.status === 200) {
			var fileReader = new FileReader();
			fileReader.onload = function (evt) {
				localStorage.image = evt.target.result;
				show_only("msg_box_ready");
			};
			fileReader.readAsDataURL(xhr.response);
		} else {
			console.error("Unable to load file");
			show_only("msg_box_error");
		}
	});
	xhr.addEventListener("error", function () {
		console.error("Unable to load file");
		show_only("msg_box_error");
	});
	xhr.send();
}

function intensify() {
	show_only("msg_box_intensifying");
	document.getElementById("url-input").value = "";
	document.getElementById("file-input").value = null;
	var canvas = document.getElementById("bitmap");
	if (canvas === null) {
		canvas = document.createElement("canvas");
		canvas.id = "bitmap";
		document.getElementById("center").appendChild(canvas);
	}
	var intense_gif = document.getElementById("intensity_image");
	if (intense_gif == undefined) {
		intense_gif = new Image();
		intense_gif.id = "intensity_image";
		document.getElementById("center").appendChild(intense_gif);
	}
	var imgCanvas = document.createElement("canvas");
	var imgCtx = imgCanvas.getContext("2d");
	var target = new Image();
	target.onload = function() {
		var img_width  = target.width;
		var img_height = target.height;
		if (document.getElementById("checkbox").checked) {
			let max_width  = document.getElementById("max_x").value || 800;
			let max_height = document.getElementById("max_y").value || 800;
			if (img_width > max_width) {
				ratio = max_width/img_width;
				img_width *= ratio;
				img_height *= ratio;
			}
			if (img_height > max_height) {
				ratio = max_height/img_height;
				img_width *= ratio;
				img_height *= ratio;
			}
		}
		imgCanvas.width = img_width;
		imgCanvas.height = img_height;
		imgCtx.drawImage(target, 0, 0, img_width, img_height);
		var options = {
			img: imgCanvas,
			ctx: canvas.getContext("2d"),
			magnitude: document.getElementById("magnitude_range").value,
			font_size: document.getElementById("font_range").value,
			text: document.getElementById("text").value,
			text_effect: document.getElementById("text-menu").value,
			img_output: intense_gif
		}
		create_gif(options);
	};
	target.src = localStorage.image;
}

function create_gif(options) {
	var magnitude = options.magnitude || 5;
	options.ctx.canvas.width = options.img.width - (magnitude * 2);
	options.ctx.canvas.height = options.img.height - (magnitude * 2);
	
	var encoder = new GIFEncoder();
	encoder.setRepeat(0);
	encoder.setDelay(20);
	encoder.start();
	
	var font_size = options.font_size || 30;
	options.ctx.font = font_size + "px Impact";
	options.ctx.fillStyle = "White";
	options.ctx.lineWidth = 1;
	options.ctx.strokeStyle = "Black";
	options.ctx.textAlign = "center";
	var gif_data = {
		source_file: options.img,
		magnitude: magnitude,
		text: options.text || "[intensity intensifies]",
		intensify_text: options.text_effect || "none",
		image_x: [0, 2, 1, 0, 2],
		image_y: [2, 2, 0, 1, 1],
		text_x:  [1, 0, 2, 0, 1],
		text_y:  [1, 2, 0, 2, 2]
	}
	
	for (var i = 0; i < 5; i++) {
		draw_gif_frame(options.ctx, gif_data, i);
		encoder.addFrame(options.ctx);
		options.ctx.clearRect(0, 0, options.ctx.canvas.width, options.ctx.canvas.height);
	}
	
	encoder.finish();
	var data_url = "data:image/gif;base64," + encode64(encoder.stream().getData());
	
	options.img_output.src = data_url;
	
	hide_all();
	options.img_output.width = options.ctx.canvas.width;
	options.img_output.height = options.ctx.canvas.height;
	options.ctx.canvas.width = 0;
	options.ctx.canvas.height = 0;
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
	[...document.getElementsByClassName("msg_box")].forEach((div) => {
		if (div.id == name) {
			div.style.display = "block";
		} else {
			div.style.display = "none";
		}
	});
}

hide_all = () => [...document.getElementsByClassName("msg_box")].forEach((e) => e.style.display = "none");
