function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStat(ctx, x, y, value, label, color) {
  ctx.fillStyle = color;
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText(value, x, y);

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 22px "IBM Plex Mono", monospace';
  ctx.fillText(label, x, y + 36);
}

function drawSparkline(ctx, series, x, y, width, height) {
  if (!series || series.length === 0) {
    return;
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const threshold = 1.5;
  const toCanvasX = (index) => x + (index / Math.max(series.length - 1, 1)) * width;
  const toCanvasY = (value) => y + height - ((value - min) / range) * height;

  const thresholdY = toCanvasY(threshold);
  ctx.strokeStyle = 'rgba(224, 90, 90, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(x, thresholdY);
  ctx.lineTo(x + width, thresholdY);
  ctx.stroke();
  ctx.setLineDash([]);

  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  gradient.addColorStop(0, 'rgba(224, 90, 90, 0.3)');
  gradient.addColorStop(1, 'rgba(224, 90, 90, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), y + height);
  series.forEach((value, index) => {
    ctx.lineTo(toCanvasX(index), toCanvasY(value));
  });
  ctx.lineTo(toCanvasX(series.length - 1), y + height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#e05a5a';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  series.forEach((value, index) => {
    if (index === 0) {
      ctx.moveTo(toCanvasX(index), toCanvasY(value));
    } else {
      ctx.lineTo(toCanvasX(index), toCanvasY(value));
    }
  });
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, toCanvasY(0));
  ctx.lineTo(x + width, toCanvasY(0));
  ctx.stroke();
}

export async function generateClimateCard({
  cityName,
  country,
  currentAnomaly,
  crossingYear,
  regime,
  regimeEmoji,
  anomalySeries,
}) {
  const width = 1080;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable.');
  }

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#0d0d0d');
  background.addColorStop(1, '#1a0a0a');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 8000; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const accent = ctx.createLinearGradient(0, 0, width, 0);
  accent.addColorStop(0, '#e05a5a');
  accent.addColorStop(1, '#ff9a5a');
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, width, 6);

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 28px "IBM Plex Mono", monospace';
  ctx.fillText('THE NEW NORM', 60, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 110px Georgia, serif';
  ctx.fillText(cityName.toUpperCase(), 60, 230);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '400 36px Georgia, serif';
  ctx.fillText(country || '', 60, 285);

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 320);
  ctx.lineTo(width - 60, 320);
  ctx.stroke();

  const regimeColors = {
    tipping: '#e05a5a',
    accelerating: '#e0a05a',
    stable: '#5ae07a',
  };
  const badgeColor = regimeColors[regime] || '#888888';

  ctx.fillStyle = `${badgeColor}22`;
  roundRect(ctx, 60, 345, 260, 60, 8);
  ctx.fill();
  ctx.strokeStyle = badgeColor;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 60, 345, 260, 60, 8);
  ctx.stroke();

  ctx.fillStyle = badgeColor;
  ctx.font = 'bold 26px "IBM Plex Mono", monospace';
  ctx.fillText(`${regimeEmoji || ''} ${String(regime || '').toUpperCase()}`.trim(), 82, 383);

  drawStat(ctx, 60, 460, `${currentAnomaly >= 0 ? '+' : ''}${Number(currentAnomaly).toFixed(2)}°C`, 'CURRENT ANOMALY', '#e05a5a');
  drawStat(ctx, 400, 460, crossingYear ? String(crossingYear) : '> 2100', 'CROSSES 1.5°C', '#ff9a5a');

  drawSparkline(ctx, anomalySeries, 60, 620, width - 120, 280);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '22px "IBM Plex Mono", monospace';
  ctx.fillText('1950', 60, 935);
  ctx.fillText('2024', width - 120, 935);

  ctx.fillStyle = 'rgba(224, 90, 90, 0.6)';
  ctx.font = '20px "IBM Plex Mono", monospace';
  ctx.fillText('— 1.5°C Paris threshold', width - 420, 935);

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '22px "IBM Plex Mono", monospace';
  ctx.fillText('Forecast powered by Amazon Chronos · The New Normal', 60, 1020);

  return canvas.toDataURL('image/png');
}