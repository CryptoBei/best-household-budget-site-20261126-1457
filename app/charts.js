// Hand-drawn SVG charts for Hearthledger: a category donut, share bars and a six-month
// income-versus-spending trend. No chart library and no network: each function returns
// SVG markup computed from the numbers it is given, with text alternatives for readers
// who cannot see the drawing.

function polarPoint(cx, cy, radius, angleDegrees) {
  const radians = ((angleDegrees - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const [x1, y1] = polarPoint(cx, cy, radius, startAngle);
  const [x2, y2] = polarPoint(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// slices: [{ label, value, color }]. Renders a ring with the total in the middle.
export function donutChart(slices, centerLabel, centerValue) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = 110;
  const cy = 110;
  const radius = 84;
  let angle = 0;
  const arcs = slices
    .filter((s) => s.value > 0)
    .map((slice) => {
      const sweep = total ? (slice.value / total) * 360 : 0;
      const path = arcPath(cx, cy, radius, angle, angle + Math.max(sweep - 1.5, 0.5));
      angle += sweep;
      return `<path d="${path}" fill="none" stroke="${slice.color}" stroke-width="26"><title>${slice.label}: ${slice.value}</title></path>`;
    })
    .join('');
  const summary = slices.map((s) => `${s.label} ${s.value}`).join(', ');
  return `<svg class="chart donut" viewBox="0 0 220 220" role="img" aria-label="Spending by category: ${summary}">
  ${arcs}
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="donut-center-value">${centerValue}</text>
  <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-center-label">${centerLabel}</text>
</svg>`;
}

// rows: [{ label, value, color, display }]. Horizontal bars scaled to the largest value.
export function shareBars(rows) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const items = rows
    .map(
      (row) => `<div class="share-row">
    <span class="share-label"><span class="swatch" style="background:${row.color}"></span>${row.label}</span>
    <span class="share-track"><span class="share-fill" style="width:${Math.max(2, Math.round((row.value / max) * 100))}%;background:${row.color}"></span></span>
    <span class="share-value">${row.display}</span>
  </div>`,
    )
    .join('');
  return `<div class="share-bars">${items}</div>`;
}

// rows: [{ month, income, spending, saved }]. Grouped bars with a savings marker line.
export function trendChart(rows) {
  const width = 640;
  const height = 260;
  const padLeft = 44;
  const padBottom = 30;
  const padTop = 14;
  const plotWidth = width - padLeft - 12;
  const plotHeight = height - padTop - padBottom;
  const max = Math.max(...rows.map((r) => Math.max(r.income, r.spending)), 1) * 1.08;
  const groupWidth = plotWidth / rows.length;
  const barWidth = Math.min(26, groupWidth / 3);
  const y = (value) => padTop + plotHeight - (value / max) * plotHeight;
  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((fraction) => {
      const value = max * fraction;
      const yy = y(value);
      return `<line x1="${padLeft}" y1="${yy.toFixed(1)}" x2="${width - 12}" y2="${yy.toFixed(1)}" class="grid-line"></line>
      <text x="${padLeft - 6}" y="${(yy + 4).toFixed(1)}" text-anchor="end" class="axis-label">$${Math.round(value / 1000)}k</text>`;
    })
    .join('');
  const bars = rows
    .map((row, i) => {
      const groupX = padLeft + i * groupWidth + groupWidth / 2;
      const incomeX = groupX - barWidth - 2;
      const spendingX = groupX + 2;
      return `<rect x="${incomeX.toFixed(1)}" y="${y(row.income).toFixed(1)}" width="${barWidth}" height="${(padTop + plotHeight - y(row.income)).toFixed(1)}" rx="3" class="bar-income"><title>${row.month} income $${row.income}</title></rect>
      <rect x="${spendingX.toFixed(1)}" y="${y(row.spending).toFixed(1)}" width="${barWidth}" height="${(padTop + plotHeight - y(row.spending)).toFixed(1)}" rx="3" class="bar-spending"><title>${row.month} spending $${row.spending}</title></rect>
      <circle cx="${groupX.toFixed(1)}" cy="${y(row.saved).toFixed(1)}" r="4" class="saved-dot"><title>${row.month} saved $${row.saved}</title></circle>
      <text x="${groupX.toFixed(1)}" y="${height - 8}" text-anchor="middle" class="axis-label">${row.month}</text>`;
    })
    .join('');
  const savedLine = rows
    .map((row, i) => `${(padLeft + i * groupWidth + groupWidth / 2).toFixed(1)},${y(row.saved).toFixed(1)}`)
    .join(' ');
  return `<svg class="chart trend" viewBox="0 0 ${width} ${height}" role="img" aria-label="Six months of income, spending and savings">
  ${gridLines}
  ${bars}
  <polyline points="${savedLine}" fill="none" class="saved-line"></polyline>
</svg>
<div class="chart-legend">
  <span><span class="swatch swatch-income"></span>Income</span>
  <span><span class="swatch swatch-spending"></span>Spending</span>
  <span><span class="swatch swatch-saved"></span>Saved</span>
</div>`;
}

export function progressBar(usedPercent, tone) {
  const width = Math.min(100, Math.max(0, usedPercent));
  return `<span class="progress" role="img" aria-label="${usedPercent}% used"><span class="progress-fill tone-${tone}" style="width:${width}%"></span></span>`;
}

export function toneForPercent(usedPercent) {
  if (usedPercent > 100) return 'over';
  if (usedPercent >= 85) return 'warn';
  return 'ok';
}
