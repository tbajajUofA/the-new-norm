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

function drawAnomalyChart(ctx, series, x, y, width, height) {
  if (!series || series.length < 2) {
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

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '16px "IBM Plex Mono", monospace';
  ctx.fillText('1.5C', x + width - 52, thresholdY - 8);

  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  gradient.addColorStop(0, 'rgba(239, 68, 68, 0.34)');
  gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), y + height);
  series.forEach((value, index) => {
    ctx.lineTo(toCanvasX(index), toCanvasY(value));
  });
  ctx.lineTo(toCanvasX(series.length - 1), y + height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ef4444';
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

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, toCanvasY(0));
  ctx.lineTo(x + width, toCanvasY(0));
  ctx.stroke();
}

function drawExtremeHeatBars(ctx, series, x, y, width, height) {
  if (!series || series.length < 2) {
    return;
  }

  const bars = series.slice(-14);
  const barMax = Math.max(...bars, 1);
  const spacing = width / bars.length;
  const barWidth = Math.max(3, spacing * 0.6);

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();

  bars.forEach((value, index) => {
    const barHeight = (value / barMax) * (height - 8);
    const bx = x + index * spacing + (spacing - barWidth) / 2;
    const by = y + height - barHeight;
    const barGradient = ctx.createLinearGradient(0, by, 0, y + height);
    barGradient.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
    barGradient.addColorStop(1, 'rgba(239, 68, 68, 0.28)');
    ctx.fillStyle = barGradient;
    roundRect(ctx, bx, by, barWidth, barHeight, 2);
    ctx.fill();
  });
}

function drawLocationGlobe(ctx, centerX, centerY, radius, latitude, longitude) {
  const globeGradient = ctx.createRadialGradient(centerX - 16, centerY - 18, 4, centerX, centerY, radius + 6);
  globeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  globeGradient.addColorStop(1, 'rgba(239, 68, 68, 0.15)');
  ctx.fillStyle = globeGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.stroke();

  if (typeof latitude === 'number' && typeof longitude === 'number') {
    const markerX = centerX + (longitude / 180) * radius * 0.88;
    const markerY = centerY - (latitude / 90) * radius * 0.88;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export async function generateClimateCard({
  cityName,
  country,
  currentAnomaly,
  crossingYear,
  regime,
  regimeEmoji,
  anomalySeries,
  extremeDaysSeries = [],
  extremeIncrease = null,
  currentExtremeDays = null,
  latitude = null,
  longitude = null,
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
  background.addColorStop(0, '#16040f');
  background.addColorStop(1, '#250814');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 8000; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 0, width, 6);

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 28px "IBM Plex Mono", monospace';
  ctx.fillText('THE NEW NORMAL · CITY CLIMATE SNAPSHOT', 60, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 110px Georgia, serif';
  ctx.fillText(cityName.toUpperCase(), 60, 230);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '400 36px Georgia, serif';
  ctx.fillText(country || '', 60, 285);

  drawLocationGlobe(ctx, width - 130, 124, 48, latitude, longitude);

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 320);
  ctx.lineTo(width - 60, 320);
  ctx.stroke();

  const regimeColors = {
    tipping: '#ef4444',
    accelerating: '#f97316',
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

  drawStat(ctx, 60, 460, `${currentAnomaly >= 0 ? '+' : ''}${Number(currentAnomaly).toFixed(2)}°C`, 'CURRENT ANOMALY', '#ef4444');
  drawStat(ctx, 400, 460, crossingYear ? String(crossingYear) : '> 2100', 'CROSSES 1.5C', '#f97316');

  const increaseText = typeof extremeIncrease === 'number' ? `${extremeIncrease >= 0 ? '+' : ''}${extremeIncrease}%` : 'n/a';
  drawStat(ctx, 720, 460, increaseText, 'EXTREME HEAT VS BASELINE', '#f59e0b');

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.fillText('ANOMALY TREND', 60, 560);
  ctx.fillText('EXTREME HEAT DAYS', 60, 820);

  drawAnomalyChart(ctx, anomalySeries, 60, 585, width - 120, 190);
  drawExtremeHeatBars(ctx, extremeDaysSeries, 60, 840, width - 120, 120);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '18px "IBM Plex Mono", monospace';
  ctx.fillText('Recent years', 60, 992);
  ctx.fillText(`Current extreme days: ${currentExtremeDays ?? 'n/a'}`, width - 390, 992);

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '18px "IBM Plex Mono", monospace';
  ctx.fillText('Chronos AI climate outlook · Model: amazon/chronos-t5-large', 60, 1038);

  return canvas.toDataURL('image/png');
}