import { useEffect, useRef } from "react";
import "./Background3D.css";

function Background3D({ theme = "default", mouse = { x: 0, y: 0 } }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle nodes for 3D depth network
    const particleCount = Math.min(65, Math.floor(window.innerWidth / 20));
    const particles = [];

    const colors =
      theme === "dark" || theme === "plan"
        ? ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#a855f7"]
        : ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1.8 + 0.2, // 3D depth layer
        radius: Math.random() * 2.8 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        originalX: Math.random() * width,
        originalY: Math.random() * height,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Mouse Parallax factor
      const targetParallaxX = (mouse.x - width / 2) * 0.035;
      const targetParallaxY = (mouse.y - height / 2) * 0.035;

      // Draw connecting 3D constellation lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around boundaries
        if (p1.x < -20) p1.x = width + 20;
        if (p1.x > width + 20) p1.x = -20;
        if (p1.y < -20) p1.y = height + 20;
        if (p1.y > height + 20) p1.y = -20;

        const renderedX = p1.x + targetParallaxX * p1.z;
        const renderedY = p1.y + targetParallaxY * p1.z;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const renderedP2X = p2.x + targetParallaxX * p2.z;
          const renderedP2Y = p2.y + targetParallaxY * p2.z;

          const dx = renderedX - renderedP2X;
          const dy = renderedY - renderedP2Y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18 * (theme === "dark" || theme === "plan" ? 1.5 : 0.8);
            ctx.beginPath();
            ctx.strokeStyle = theme === "dark" || theme === "plan" ? `rgba(168, 85, 247, ${alpha})` : `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1 * p1.z;
            ctx.moveTo(renderedX, renderedY);
            ctx.lineTo(renderedP2X, renderedP2Y);
            ctx.stroke();
          }
        }

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(renderedX, renderedY, p1.radius * p1.z, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.shadowBlur = 12 * p1.z;
        ctx.shadowColor = p1.color;
        ctx.globalAlpha = 0.65;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, mouse]);

  return <canvas ref={canvasRef} className={`background-3d-canvas theme-${theme}`} />;
}

export default Background3D;
