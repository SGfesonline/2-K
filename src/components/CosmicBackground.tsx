import React, { useEffect, useRef } from 'react';

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 星の生成
    const starCount = Math.min(180, Math.floor((width * height) / 8000));
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      color: string;
      twinkleSpeed: number;
    }> = [];

    const colors = ['#ffffff', '#a5f3fc', '#fbcfe8', '#e0e7ff', '#38bdf8'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.15 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // 流れ星 (Shooting star)
    let shootingStar: {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    } | null = null;

    const triggerShootingStar = () => {
      if (shootingStar && shootingStar.active) return;
      shootingStar = {
        x: Math.random() * (width * 0.8),
        y: Math.random() * (height * 0.4),
        length: Math.random() * 80 + 40,
        speed: Math.random() * 12 + 10,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        opacity: 1,
        active: true,
      };
    };

    const intervalId = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerShootingStar();
      }
    }, 3500);

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 深宇宙グラデーション
      const bgGrad = ctx.createLinearGradient(0, 0, width * 0.5, height);
      bgGrad.addColorStop(0, '#030718');
      bgGrad.addColorStop(0.5, '#070f2b');
      bgGrad.addColorStop(1, '#090b1e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // コズミック星雲（Nebula）光輪
      const nebula1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 20, width * 0.8, height * 0.2, 450);
      nebula1.addColorStop(0, 'rgba(255, 42, 133, 0.14)');
      nebula1.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
      nebula1.addColorStop(1, 'rgba(3, 7, 24, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.2, height * 0.7, 30, width * 0.2, height * 0.7, 500);
      nebula2.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      nebula2.addColorStop(0.6, 'rgba(59, 130, 246, 0.06)');
      nebula2.addColorStop(1, 'rgba(3, 7, 24, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // 星々の描画
      stars.forEach((star) => {
        // 瞬き
        star.alpha += Math.sin(tick * star.twinkleSpeed) * 0.02;
        if (star.alpha > 1) star.alpha = 1;
        if (star.alpha < 0.2) star.alpha = 0.2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 流れ星の描画
      if (shootingStar && shootingStar.active) {
        ctx.globalAlpha = shootingStar.opacity;
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + shootingStar.opacity + ')';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
          shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
        );
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.opacity -= 0.02;

        if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
          shootingStar.active = false;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
