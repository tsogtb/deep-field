export const COLORS = {
  // --- Professional Blue (Sapphire Gradient) ---
  BLUE_CORE:    [0.20, 0.50, 1.00], // Bright, energetic center
  BLUE_MIST:    [0.10, 0.30, 0.70], // Mid-tone body of the wisp
  BLUE_SHADOW:  [0.02, 0.05, 0.20], // Deep fade that blends into black

  // --- Professional Red (Crimson Gradient) ---
  RED_CORE:     [1.00, 0.15, 0.25], // Sharp, vibrant focal point
  RED_MIST:     [0.60, 0.05, 0.10], // Sophisticated deep wine red
  RED_SHADOW:   [0.20, 0.00, 0.02], // Subliminal red-black fade

  // --- Neutral Highlights (The "Glow" Accents) ---
  NEUTRAL_HOT:  [0.90, 0.95, 1.00], // Pure white-blue for the hottest points
  NEUTRAL_HAZE: [0.40, 0.50, 0.55], // Steel-tinted mist for volume
  NEUTRAL_VOID: [0.08, 0.08, 0.10], // Dark charcoal to soften edges

  // --- Toxic Emerald (Professional Green) ---
  EMERALD_CORE:   [0.10, 1.00, 0.40], // Sharp radioactive center
  EMERALD_MIST:   [0.02, 0.60, 0.25], // Deep forest-tinted glow
  
  // --- Electric Violet (Royal Purple) ---
  VIOLET_CORE:    [0.80, 0.30, 1.00], // High-energy neon violet
  VIOLET_MIST:    [0.35, 0.10, 0.60], // Dark velvet purple
  
  // --- Burnt Amber (Industrial Orange) ---
  AMBER_CORE:     [1.00, 0.60, 0.10], // Molten metal hot spot
  AMBER_MIST:     [0.50, 0.20, 0.02], // Dried blood / Rust atmosphere
  
  // --- Cyan Pulse (Cold Tech) ---
  CYAN_CORE:      [0.00, 1.00, 1.00], // Pure digital light
  CYAN_MIST:      [0.00, 0.40, 0.50], // Deep sea / Arctic shadow

  // --- Magenta Glitch (Synth Aesthetic) ---
  MAGENTA_CORE:   [1.00, 0.20, 0.80], // Hot pink focal point
  MAGENTA_MIST:   [0.40, 0.05, 0.30], // Muted wine / plum depth

  // --- Solar Gold (Bright Luxury) ---
  GOLD_CORE:      [1.00, 0.90, 0.40], // White-yellow heat
  GOLD_MIST:      [0.60, 0.40, 0.10], // Brassy, warm haze

  // --- Rose Quartz (Luxury Tech) ---
  ROSE_CORE:      [1.00, 0.70, 0.75], // Soft, expensive pink glow
  ROSE_MIST:      [0.45, 0.20, 0.25], // Deep satin mahogany

  // --- Deep Sea Teal (Anodized Titanium) ---
  TEAL_CORE:      [0.20, 1.00, 0.80], // Bright seafoam energy
  TEAL_MIST:      [0.05, 0.35, 0.30], // Dark oceanic depths

  // --- Pearlescent Silver (Liquid Chrome) ---
  SILVER_CORE:    [0.95, 0.98, 1.00], // Brilliant white-silver
  SILVER_MIST:    [0.30, 0.35, 0.45], // Cool slate metallic shadow

  // --- Ultraviolet Luxe (High-End Nightlife) ---
  UV_CORE:        [0.50, 0.40, 1.00], // Sharp blacklight blue
  UV_MIST:        [0.15, 0.05, 0.35], // Midnight indigo depth

  // --- Champagne Bronze (Refined Metal) ---
  BRONZE_CORE:    [1.00, 0.80, 0.50], // Warm glowing brass
  BRONZE_MIST:    [0.30, 0.15, 0.05], // Dark espresso / Burnt copper

  // --- Electric Mint (Fresh Tech) ---
  MINT_CORE:      [0.60, 1.00, 0.70], // Crisp, clean futuristic green
  MINT_MIST:      [0.10, 0.40, 0.25], // Muted forest glass

  // --- Laser Grid Pink (Synthwave Classic) ---
  LASER_PINK_CORE:   [1.00, 0.35, 0.65], // Hot CRT pink beam
  LASER_PINK_MIST:   [0.45, 0.10, 0.30], // Vaporwave magenta haze
  LASER_PINK_SHADOW: [0.12, 0.02, 0.08], // Near-black pink residue

  // --- Neon Horizon Blue (Tron Skyline) ---
  HORIZON_BLUE_CORE:   [0.30, 0.80, 1.00], // Cyan-blue skyline glow
  HORIZON_BLUE_MIST:   [0.08, 0.35, 0.55], // Smoggy future dusk
  HORIZON_BLUE_SHADOW: [0.02, 0.06, 0.12], // Cold night falloff

  // --- VHS Purple (Analog Artifact) ---
  VHS_PURPLE_CORE:   [0.85, 0.40, 1.00], // Chromatic aberration violet
  VHS_PURPLE_MIST:   [0.30, 0.12, 0.45], // Tape-noise purple fog
  VHS_PURPLE_SHADOW: [0.06, 0.02, 0.10], // Analog shadow bleed

  // --- Neon Sunset Orange (Outrun Sky) ---
  SUNSET_ORANGE_CORE:   [1.00, 0.45, 0.15], // Horizon sun flare
  SUNSET_ORANGE_MIST:   [0.55, 0.18, 0.05], // Dusty neon clouds
  SUNSET_ORANGE_SHADOW: [0.12, 0.05, 0.02], // Heat-soaked dark

  // --- Vector Green (Retro Terminal) ---
  VECTOR_GREEN_CORE:   [0.30, 1.00, 0.30], // CRT phosphor green
  VECTOR_GREEN_MIST:   [0.08, 0.45, 0.15], // Scanline glow
  VECTOR_GREEN_SHADOW: [0.02, 0.08, 0.04], // Old monitor black

  // --- Plasma Yellow (Arcade Energy) ---
  PLASMA_YELLOW_CORE:   [1.00, 1.00, 0.35], // Overdriven arcade light
  PLASMA_YELLOW_MIST:   [0.55, 0.45, 0.10], // Warm ionized haze
  PLASMA_YELLOW_SHADOW: [0.15, 0.12, 0.02], // Burned CRT glass

  // --- Infrared Red (Cyber Threat) ---
  INFRARED_RED_CORE:   [1.00, 0.20, 0.10], // Alert / danger pulse
  INFRARED_RED_MIST:   [0.45, 0.05, 0.02], // Thermal diffusion
  INFRARED_RED_SHADOW: [0.12, 0.02, 0.01], // Sensor blackout

  // --- Chrome Cyan (Retro Hardware) ---
  CHROME_CYAN_CORE:   [0.65, 1.00, 1.00], // Polished future plastic
  CHROME_CYAN_MIST:   [0.20, 0.45, 0.50], // Industrial fog
  CHROME_CYAN_SHADOW: [0.05, 0.08, 0.10], // Machine darkness

};