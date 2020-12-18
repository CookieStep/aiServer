function load() {
	wsSetup();
	resize();
	document.body.appendChild(canvas);
	update();
}
function resize() {
	canvas.height = innerHeight;
	canvas.width = canvas.height;
	canvas.style.width = `${canvas.width}px`;
	canvas.style.height = `${canvas.height}px`;
}
function update() {
	main();
	sendUpdate();
	requestAnimationFrame(update);
}
addEventListener("load", load);
addEventListener("click", click);
addEventListener("resize", resize);