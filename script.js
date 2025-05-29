// Cho chuyển động của con cá, interact với chuột
const fishElements = document.querySelectorAll('.fish');
    const fishes = [];

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    fishElements.forEach(el => {
      const size = 200 + Math.random() * 20; // Kích thước từ 200px -> 220px
      el.style.width =  `${size}px`;

      fishes.push({
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        speed: 0.3 + Math.random() * 0.3, // cá bơi chậm lại
        direction: 1, // 1 = right, -1 = left trái phải
        angle: 0,
        wiggle: 0
      });
    });

    function animate() {
      fishes.forEach(fish => {
        const dx = mouse.x - fish.x;
        const dy = mouse.y - fish.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          const angleToMouse = Math.atan2(dy, dx);
          fish.vx += Math.cos(angleToMouse) * 0.05;
          fish.vy += Math.sin(angleToMouse) * 0.05;
        } else {
          // wander slightly
          fish.vx += (Math.random() - 0.5) * 0.05;
          fish.vy += (Math.random() - 0.5) * 0.05;
        }

        // normalize speed
        const mag = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
        fish.vx = (fish.vx / mag) * fish.speed;
        fish.vy = (fish.vy / mag) * fish.speed;

        // update position
        fish.x += fish.vx;
        fish.y += fish.vy;

        // bounce
        if (fish.x < 0 || fish.x > window.innerWidth) fish.vx *= -1;
        if (fish.y < 0 || fish.y > window.innerHeight) fish.vy *= -1;

        // face direction
        fish.direction = fish.vx >= 0 ? 1 : -1;

        // Cá hơi lắc lư nhẹ
        fish.wiggle += 0.01;
        const wiggleAmount = Math.sin(fish.wiggle) * 5;

        // Cho cá di chuyển và 
        const flip = fish.direction === 1 ? 1 : -1;
        fish.el.style.transform = `
          translate(${fish.x}px, ${fish.y}px)
          rotateZ(${wiggleAmount}deg)
          scaleX(${flip})
        `;
      });

      requestAnimationFrame(animate);
    }

    animate();
