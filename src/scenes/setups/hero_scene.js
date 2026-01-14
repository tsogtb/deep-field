import { DefaultCameraConfig } from "../../camera/camera_config.js";
import { COLORS } from "../../data/colors.js";

const STAR_COUNT = 10000;

const PALETTE = [
  COLORS.BLUE_CORE, COLORS.CYAN_CORE, COLORS.UV_CORE, 
  COLORS.SILVER_CORE,
];

const starColors = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {

  const base = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const brightness = 0.4 + Math.random() * 0.6;
  
  starColors[i * 3 + 0] = base[0] * brightness;
  starColors[i * 3 + 1] = base[1] * brightness;
  starColors[i * 3 + 2] = base[2] * brightness;
}

const camPos = DefaultCameraConfig.position

export const starsConfig = {
  name: "starField",
  brush: "circle", 
  config: {
    
    samplers: [
      () => {
        const theta = Math.random() * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * Math.random() - 1.0);
        
        
        const r = (Math.random() > 0.5) 
          ? (0.1 + Math.random() * 5.0) 
          : (5.0 + Math.random() * 5.0);
        
        return {
          x: camPos[0] + r * Math.sin(phi) * Math.cos(theta),
          y: camPos[1] + r * Math.sin(phi) * Math.sin(theta),
          z: camPos[2] + r * Math.cos(phi)
        };
      }
    ],
    counts: [STAR_COUNT],

    sceneColors: [
      COLORS.AMBER_CORE,
    ]},

    animate: (pointData, time, mat4) => {
  
      if (pointData[0]) {
        pointData[0].colorBuffer = starColors;
        const m = pointData[0].modelMatrix;
        const rotationSpeed = 0.02;

        mat4.identity(m);

        mat4.translate(m, m, [camPos[0], camPos[1], camPos[2]]);

        mat4.rotateY(m, m, time * rotationSpeed);

        mat4.translate(m, m, [-camPos[0], -camPos[1], -camPos[2]]);
      }
    },
  };
