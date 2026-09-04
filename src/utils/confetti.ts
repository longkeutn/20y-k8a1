import confetti from 'canvas-confetti';

/**
 * Triggers a festive fullscreen fireworks confetti effect across the entire screen
 * Designed for celebrating RSVP participation confirmations in the 20-year reunion app.
 */
export function triggerFullscreenFireworks() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;

  const celebratoryColors = [
    '#c5a880', // brand gold
    '#e5c378', // bright gold
    '#e07a5f', // warm terracotta / rose
    '#f4a261', // celebratory orange
    '#2a9d8f', // jade / emerald
    '#264653', // navy
    '#e63946', // festive red
    '#ffffff'  // white sparkle
  ];

  // 1. Initial big celebratory pop from bottom center
  confetti({
    particleCount: 80,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.65 },
    colors: celebratoryColors,
    zIndex: 99999
  });

  // 2. High-arc firework bursts from left and right corners
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = Math.floor(40 * (timeLeft / duration));

    // Left cannon
    confetti({
      particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
      colors: celebratoryColors,
      startVelocity: 55,
      zIndex: 99999
    });

    // Right cannon
    confetti({
      particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
      colors: celebratoryColors,
      startVelocity: 55,
      zIndex: 99999
    });

    // Sky stars/bursts
    if (Math.random() > 0.4) {
      confetti({
        particleCount: 25,
        spread: 360,
        startVelocity: 25,
        origin: { x: 0.2 + Math.random() * 0.6, y: 0.15 + Math.random() * 0.35 },
        colors: celebratoryColors,
        zIndex: 99999
      });
    }
  }, 250);
}
