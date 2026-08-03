
var masterTL;

function boxIn() {
	let tl = gsap.timeline()
		.set('.scene', { autoAlpha: 1 })
		.fromTo(".box", { rotationY: -540, y: "100vh" }, { duration: 2, rotationY: 0, y: "16vh", ease: "power2" })
		.to(".box__lid", { rotateX:-225, duration: 0.5, ease: "sine.inOut" }, "-=1.4")
		.to(".box__lid-flap", { rotateX: 60, duration: 0.5, ease: "sine.inOut" }, "-=1.2")
		.to(".box__flap--left", { rotateX: "-=135", duration: 0.5, ease: "sine.inOut", transformOrigin: "50% 100%" }, "-=1")
		.to(".box__flap--right", { rotateX: "-=135", duration: 0.5, ease: "sine.inOut", transformOrigin: "50% 100%" }, "-=1"); 
	return tl;
}

function rotationAnim() {
	let tl = gsap.timeline({ repeat: -1 })
		.to(".box", { rotateY: 180, ease: "power2.inOut", duration: 0.8 })
		.fromTo(".box__back", { webkitFilter: "brightness(1)", filter: "brightness(1)" }, { duration: 0.8, webkitFilter: "brightness(0.2)", filter: "brightness(0.2)", ease: "power4.inOut" }, 0)
		.fromTo(".box__left", { webkitFilter: "brightness(1)", filter: "brightness(1)" }, { duration: 0.8, webkitFilter: "brightness(0.8)", filter: "brightness(0.8)", ease: "power4.inOut" }, 0)
		.fromTo(".box__lid-top-logo", { webkitFilter: "brightness(1)", filter: "brightness(1)" },{ duration: 0.8, webkitFilter: "brightness(0.85)", filter: "brightness(0.85)", ease: "power2.inOut" }, 0.2)
		.to(".card--1", { keyframes:[{ duration: 0.4, y: "-155%", transformOrigin: "center bottom", ease: "sine" }, { duration: 0.6, rotation: 50, x: "40%", ease: "power2", delay: -0.25}]}, 0.2) // keyframes array
		.to(".card--2", { keyframes:[{ duration: 0.4, y: "-160%", transformOrigin: "center bottom", ease: "sine" }, { duration: 0.6, rotation: 25, x: "20%", ease: "power2", delay: -0.25}]}, 0.2)
		.to(".card--3", { keyframes:[{ duration: 0.4, y: "-160%", transformOrigin: "center bottom", ease: "sine" }, { duration: 0.6, rotation: 0, x: "0%", ease: "power2", delay: -0.25}]}, 0.2)
		.to(".card--4", { keyframes:[{ duration: 0.4, y: "-160%", transformOrigin: "center bottom", ease: "sine" }, { duration: 0.6, rotation: -25, x: "-20%", ease: "power2", delay: -0.25}]}, 0.2)
		.to(".card--5", { keyframes:[{ duration: 0.4, y: "-155%", transformOrigin: "center bottom", ease: "sine" }, { duration: 0.6, rotation: -50, x: "-40%", ease: "power2", delay: -0.25}]}, 0.2)
		.to(".card--1", { keyframes:[{ duration: 0.6, rotation: 0, x: "0%", ease: "power2.in" }, { duration: 0.4, y: "0%", transformOrigin: "center bottom", ease: "sine.in", delay: -0.25 }]}, 1.4)
		.to(".card--2", { keyframes:[{ duration: 0.6, rotation: 0, x: "0%", ease: "power2.in" }, { duration: 0.4, y: "0%", transformOrigin: "center bottom", ease: "sine.in", delay: -0.25 }]}, 1.4)
		.to(".card--3", { keyframes:[{ duration: 0.6, rotation: 0, x: "0%", ease: "power2.in" }, { duration: 0.4, y: "0%", transformOrigin: "center bottom", ease: "sine.in", delay: -0.25 }]}, 1.4)
		.to(".card--4", { keyframes:[{ duration: 0.6, rotation: 0, x: "0%", ease: "power2.in" }, { duration: 0.4, y: "0%", transformOrigin: "center bottom", ease: "sine.in", delay: -0.25 }]}, 1.4)
		.to(".card--5", { keyframes:[{ duration: 0.6, rotation: 0, x: "0%", ease: "power2.in" }, { duration: 0.4, y: "0%", transformOrigin: "center bottom", ease: "sine.in", delay: -0.25 }]}, 1.4)
		.to(".box", { rotateY: 360, ease: "power2.inOut", duration: 0.8 }, 1.6)
		.fromTo(".box__front-face", { webkitFilter: "brightness(1)", filter: "brightness(1)" }, { duration: 0.8, webkitFilter: "brightness(0.2)", filter: "brightness(0.2)", ease: "power4.inOut" }, 1.6)
		.fromTo(".box__right", { webkitFilter: "brightness(1)", filter: "brightness(1)" }, { duration: 0.8, webkitFilter: "brightness(0.8)", filter: "brightness(0.8)", ease: "power4.inOut" }, 1.6)
		.fromTo(".box__lid-flap-shape-outer", { webkitFilter: "brightness(1)", filter: "brightness(1)" }, { duration: 0.4, webkitFilter: "brightness(0.6)", filter: "brightness(0.6)", ease: "power2.in" }, 1.6)
		.to(".box__lid-top-logo", { duration: 0.4, webkitFilter: "brightness(0.6)", filter: "brightness(0.6)", ease: "power2.inOut" }, 1.6)
		.to(".box__lid-flap-shape-outer", { duration: 0.4, webkitFilter: "brightness(1)", filter: "brightness(1)", ease: "power2.inOut" }, 2)
		.set(".box__back", { webkitFilter: "brightness(1)", filter: "brightness(1)", immediateRender:false }, "-=0.8");
	
	return tl;
}

function init() {
	masterTL = gsap.timeline();
	masterTL.add(boxIn())
  			.add(rotationAnim());
}

window.onload = (event) => {
	init();
};

