export let particlesConfig = {
	"particles": {
	  "number": {
		"value": 20, // number of balls
		"density": {
		  "enable": false
		}
	  },
	  "color": {
		"value": "#386ade"
	  },
	  "shape": {
		"type": "circle",
		"stroke": {
		  "width": 0,
		  "color": "#000000"
		}
	  },
	  "opacity": {
		"value": 0.5,
		"random": false
	  },
	  "size": {
		"value": 10, // balls max size
		"random": true,
		"anim": {
		  "enable": false
		}
	  },
	  "line_linked": {
		"enable": false
	  },
	  "move": {
		"enable": true,
		"speed": 0.6, // speed of balls
		"direction": "right",
		"random": true,
		"straight": false,
		"out_mode": "bounce",
		"bounce": true,
		"attract": {
		  "enable": false
		}
	  }
	},
	"interactivity": {
	  "detect_on": "window",
	  "events": {
		"onhover": {
		  "enable": false
		},
		"resize": true
	  },
	  "modes": {
		"grab": {
		  "distance": 200,
		  "line_linked": {
			"opacity": 1
		  }
		},
		"bubble": {
		  "distance": 200,
		  "size": 10,
		  "duration": 2,
		  "opacity": 8,
		  "speed": 3
		},
		"repulse": {
		  "distance": 100,
		  "duration": 0.2
		},
		"push": {
		  "particles_nb": 4
		},
		"remove": {
		  "particles_nb": 2
		}
	  }
	},
	"fps_limit": 15, // Limit FPS
	"detect_retina": true,
	"pause_on_blur": true,
	"pause_on_visibility_hidden": true
  };
