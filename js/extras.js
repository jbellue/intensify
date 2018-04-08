if (document.readyState !== 'loading') {
	ready()
} else {
	// the document hasn't finished loading/parsing yet so let's add an event handler
	document.addEventListener('DOMContentLoaded', ready)
}

function ready() {
	link_range_to_value(document.getElementById("font_range"),      document.getElementById("font_slider_value"));
	link_range_to_value(document.getElementById("magnitude_range"), document.getElementById("magnitude_slider_value"));
}

function link_range_to_value(range, display) {
	display.innerHTML = range.value;
	range.addEventListener('input', () => display.innerHTML = range.value);
}
