// Particles configuration for the background
export let particlesConfig =
{
	"particles": {
	  "number": {
		"value": 10,
		"density": {
		  "enable": false,
		  "value_area": 4000
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
		},
	  },
	  "opacity": {
		"value": 0.5,
		"random": false,
		"anim": {
		  "enable": false,
		  "speed": 1,
		  "opacity_min": 0.1,
		  "sync": false
		}
	  },
	  "size": {
		"value": 20,
		"random": false,
		"anim": {
		  "enable": true,
		  "speed": 1,
		  "size_min": 0.1,
		  "sync": false
		}
	  },
	  "line_linked": {
		"enable": true,
		"distance": 400,
		"color": "#c04141",
		"opacity": 0.4,
		"width": 1
	  },
	  "move": {
		"enable": true,
		"speed": 2,
		"direction": "right",
		"random": true,
		"straight": false,
		"out_mode": "bounce",
		"bounce": true,
		"attract": {
		  "enable": true,
		  "rotateX": 600,
		  "rotateY": 1200
		}
	  }
	},
	"interactivity": {
	  "detect_on": "window",
	  "events": {
		"onhover": {
		  "enable": true,
		  "mode": "repulse"
		},
		"resize": true
	  },
	  "modes": {
		"grab": {
		  "distance": 380,
		  "line_linked": {
			"opacity": 1
		  }
		},
		"bubble": {
		  "distance": 400,
		  "size": 20,
		  "duration": 2,
		  "opacity": 8,
		  "speed": 3
		},
		"repulse": {
		  "distance": 200,
		  "duration": 0.4
		},
		"push": {
		  "particles_nb": 4
		},
		"remove": {
		  "particles_nb": 2
		}
	  }
	},
  };