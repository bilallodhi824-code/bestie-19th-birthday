import React, { useEffect, useRef } from 'react';

export default function BackgroundStars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for interactive starlight trail
    const mouseParticles = [];
    const handlePointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      if (Math.random() < 0.6) {
        mouseParticles.push({
          x: clientX,
          y: clientY,
          size: Math.random() * 2.8 + 1.2,
          color: Math.random() > 0.5 ? '#fda4af' : '#fde047',
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          alpha: 1.0,
          decay: Math.random() * 0.025 + 0.02
        });
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // 1. Multi-layered Twinkling Stars
    const starCount = Math.min(160, Math.floor((width * height) / 9000));
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.008,
      direction: Math.random() > 0.5 ? 1 : -1,
      isSparkle: Math.random() < 0.22, // 22% of stars have 4-point diamond cross flares
      color: Math.random() > 0.4 ? '#ffffff' : Math.random() > 0.5 ? '#fbcfe8' : '#fed7aa'
    }));

    // 2. Rising Fairy Dust / Floating Fireflies
    const fireflyCount = Math.min(45, Math.floor(width / 35));
    const fireflies = Array.from({ length: fireflyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.4 + 1.2,
      baseX: Math.random() * width,
      speedY: Math.random() * 0.6 + 0.3,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayRange: Math.random() * 35 + 15,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      color: Math.random() > 0.5 ? 'rgba(251, 191, 36,' : 'rgba(244, 114, 182,'
    }));

    // 3. Shooting Stars (Meteors)
    const shootingStars = [];
    let lastMeteorTime = performance.now();

    const spawnMeteor = () => {
      shootingStars.push({
        x: Math.random() * width * 0.85,
        y: Math.random() * (height * 0.4),
        len: Math.random() * 110 + 60,
        speed: Math.random() * 7 + 9,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1.0,
        color: Math.random() > 0.4 ? '#ffffff' : '#fbcfe8'
      });
    };

    // Draw 4-point diamond sparkle star
    const drawSparkle = (x, y, radius, alpha, color) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;

      // Center core
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow
      const flareSize = radius * 4.5;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, flareSize);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, flareSize, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal flare
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - flareSize, y);
      ctx.lineTo(x + flareSize, y);
      ctx.stroke();

      // Vertical flare
      ctx.beginPath();
      ctx.moveTo(x, y - flareSize);
      ctx.lineTo(x, y + flareSize);
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // --- Draw Twinkling Stars ---
      stars.forEach(star => {
        star.alpha += star.speed * star.direction;
        if (star.alpha > 0.95) {
          star.alpha = 0.95;
          star.direction = -1;
        } else if (star.alpha < 0.15) {
          star.alpha = 0.15;
          star.direction = 1;
        }

        if (star.isSparkle && star.alpha > 0.4) {
          drawSparkle(star.x, star.y, star.radius, star.alpha, star.color);
        } else {
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.alpha;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      // --- Draw Rising Fairy Dust / Fireflies ---
      fireflies.forEach(f => {
        f.y -= f.speedY;
        f.phase += f.swaySpeed;
        f.x = f.baseX + Math.sin(f.phase) * f.swayRange;

        // Reset if floats above top
        if (f.y < -20) {
          f.y = height + 20;
          f.baseX = Math.random() * width;
        }

        // Pulse brightness
        const currentAlpha = 0.3 + 0.45 * Math.sin(f.phase * 1.5);

        // Firefly outer aura
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 4);
        glow.addColorStop(0, `${f.color} ${currentAlpha})`);
        glow.addColorStop(1, `${f.color} 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Firefly bright center core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = currentAlpha * 1.2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // --- Draw Interactive Mouse/Touch Particles ---
      for (let i = mouseParticles.length - 1; i >= 0; i--) {
        const p = mouseParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          mouseParticles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Soft trail glow
          const trailGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          trailGrad.addColorStop(0, p.color);
          trailGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = trailGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // --- Draw Shooting Stars / Meteors ---
      const now = performance.now();
      if (now - lastMeteorTime > 3600 && Math.random() < 0.03 && shootingStars.length < 2) {
        spawnMeteor();
        lastMeteorTime = now;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const endX = s.x - Math.cos(s.angle) * s.len;
        const endY = s.y - Math.sin(s.angle) * s.len;

        const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        grad.addColorStop(0.3, `rgba(244, 114, 182, ${s.opacity * 0.8})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Meteor glowing head
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.016;

        if (s.opacity <= 0 || s.x > width + 150 || s.y > height + 150) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Living Atmospheric Aurora Glow Mesh Layers */}
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      {/* Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.95 }}
      />
    </>
  );
}
