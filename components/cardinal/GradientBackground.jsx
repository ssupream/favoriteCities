"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const GradientBackground = () => {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const scrollYRef = useRef(0);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.transition = "opacity 1s ease-in-out";
        canvasRef.current.style.opacity = 1;
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const ditherPalette = (palette) => {
      const ditheredPalette = [];

      for (let i = 0; i < palette.length; i++) {
        let color = palette[i];

        color = addNoise(color);

        ditheredPalette.push(color);
      }
      return ditheredPalette;
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.style.width = "2000px";
    canvas.style.height = "2000px";

    const colors = {
      color1:
        (theme === "system" ? resolvedTheme : theme) === "dark"
          ? "#3730cc"
          : "#c29dff",
      color2:
        (theme === "system" ? resolvedTheme : theme) === "dark"
          ? "#000000"
          : "#ffc99d",
      color3:
        (theme === "system" ? resolvedTheme : theme) === "dark"
          ? "#cb6ad8"
          : "#a2c6fc",
      color4:
        (theme === "system" ? resolvedTheme : theme) === "dark"
          ? "#3730cc"
          : "#baabff",
    };

    const imgSize = 1024;
    const mapSize = 2048;

    const image = ctx.createImageData(imgSize, imgSize);
    for (let i = 0; i < image.data.length; i += 4) {
      image.data[i] = 0;
      image.data[i + 1] = 0;
      image.data[i + 2] = 0;
      image.data[i + 3] = 255;
    }

    const distance = (x, y) => Math.sqrt(x * x + y * y);

    const heightMap1 = [];
    for (let u = 0; u < mapSize; u++) {
      for (let v = 0; v < mapSize; v++) {
        const i = u * mapSize + v;
        const cx = u - mapSize / 2;
        const cy = v - mapSize / 2;
        const d = distance(cx, cy);
        const stretch = (3 * Math.PI) / (mapSize / 2);
        const ripple = Math.sin(d * stretch);
        const normalized = (ripple + 1) / 2;
        heightMap1[i] = Math.floor(normalized * 128);
      }
    }

    const heightMap2 = [];
    for (let u = 0; u < mapSize; u++) {
      for (let v = 0; v < mapSize; v++) {
        const i = u * mapSize + v;
        const cx = u - mapSize / 2;
        const cy = v - mapSize / 2;
        const d1 = distance(0.8 * cx, 1.3 * cy) * 0.022;
        const d2 = distance(1.35 * cx, 0.45 * cy) * 0.022;
        const s = Math.sin(d1);
        const c = Math.cos(d2);
        const h = s + c;
        const normalized = (h + 2) / 4;
        heightMap2[i] = Math.floor(normalized * 127);
      }
    }

    const interpolate = (c1, c2, f) => {
      return {
        r: Math.floor(c1.r + (c2.r - c1.r) * f),
        g: Math.floor(c1.g + (c2.g - c1.g) * f),
        b: Math.floor(c1.b + (c2.b - c1.b) * f),
      };
    };

    const hexToRgb = (hex) => {
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      };
    };

    const makeGradient = (c1, c2, c3, c4) => {
      const g = [];

      for (let i = 0; i < 64; i++) {
        const f = i / 64;
        g[i] = interpolate(c1, c2, f);
      }
      for (let i = 64; i < 128; i++) {
        const f = (i - 64) / 64;
        g[i] = interpolate(c2, c3, f);
      }
      for (let i = 128; i < 192; i++) {
        const f = (i - 128) / 64;
        g[i] = interpolate(c3, c4, f);
      }
      for (let i = 192; i < 256; i++) {
        const f = (i - 192) / 64;
        g[i] = interpolate(c4, c4, f);
      }

      return ditherPalette(g);
    };

    const color1Rgb = hexToRgb(colors.color1);
    const color2Rgb = hexToRgb(colors.color2);
    const color3Rgb = hexToRgb(colors.color3);
    const color4Rgb = hexToRgb(colors.color4);

    const palette = makeGradient(color1Rgb, color2Rgb, color3Rgb, color4Rgb);

    let dx1 = 0;
    let dy1 = 0;
    let dx2 = 0;
    let dy2 = 0;

    const moveHeightMaps = (t) => {
      const timeFactor = 0.00004;

      dx1 = Math.floor(
        (((Math.cos(t * timeFactor + 0.4 + Math.PI) + 1) / 2) * mapSize) / 2
      );
      dy1 = Math.floor(
        (((Math.cos(t * timeFactor - 0.1) + 1) / 2) * mapSize) / 2
      );
      dx2 = Math.floor(
        (((Math.cos(t * -timeFactor + 1.2) + 1) / 2) * mapSize) / 2
      );
      dy2 = Math.floor(
        (((Math.cos(t * -timeFactor - 0.8 + Math.PI) + 1) / 2) * mapSize) / 2
      );
    };

    const updateImageData = () => {
      for (let u = 0; u < imgSize; u++) {
        for (let v = 0; v < imgSize; v++) {
          const i = (u + dy1) * mapSize + (v + dx1);
          const k = (u + dy2) * mapSize + (v + dx2);
          const j = u * imgSize * 4 + v * 4;

          let h = heightMap1[i] + heightMap2[k];
          let c = palette[h];

          image.data[j] = c.r;
          image.data[j + 1] = c.g;
          image.data[j + 2] = c.b;
        }
      }
    };

    const tick = (time) => {
      moveHeightMaps(time);
      updateImageData();
      ctx.putImageData(image, 0, 0);
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);

    const animateRotation = () => {
      rotationRef.current += 0.02;
      const scrollRotation = scrollYRef.current * 0.1;
      const scrollY = scrollYRef.current;

      const scaleFactor = 1 + scrollY * 0.0005;

      canvas.style.transform = `
        rotate(${rotationRef.current + scrollRotation}deg)
        translateY(${scrollY * 0.5}px) 
        scale(${scaleFactor})
      `;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.rotate(rotationRef.current);
      ctx.putImageData(image, 0, 0);
      ctx.restore();

      requestAnimationFrame(animateRotation);
    };
    animateRotation();
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [theme, resolvedTheme]);

  const addNoise = (color, intensity = 2) => {
    return {
      r: Math.min(
        255,
        Math.max(
          0,
          color.r + Math.floor(Math.random() * intensity - intensity / 2)
        )
      ),
      g: Math.min(
        255,
        Math.max(
          0,
          color.g + Math.floor(Math.random() * intensity - intensity / 2)
        )
      ),
      b: Math.min(
        255,
        Math.max(
          0,
          color.b + Math.floor(Math.random() * intensity - intensity / 2)
        )
      ),
    };
  };

  return (
    <div className="flex justify-center blur-3xl fixed z-[-1] opacity-90">
      <canvas
        id="gradient-canvas"
        ref={canvasRef}
        data-transition-in
        style={{
          height: "100%",
          width: "100%",
          clipPath:
            "polygon(50% 10%, 60% 40%, 90% 50%, 60% 60%, 50% 90%, 40% 60%, 10% 50%, 40% 40%)",
          transform: "rotate(0deg)",
          opacity: 0,
          transition: "opacity 1s ease-in-out",
        }}
      />
    </div>
  );
};

export default GradientBackground;
