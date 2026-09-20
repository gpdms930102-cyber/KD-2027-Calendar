'use strict';
(() => {
  const modal = document.getElementById('cardDialog');
  const canvas = document.getElementById('cardCanvas');
  const ctx = canvas.getContext('2d');
  const input = document.getElementById('cardMessage');
  const download = document.getElementById('downloadCard');
  const status = document.getElementById('cardStatus');
  const drafts = new Map();
  const images = new Map();
  const segmenter = new Intl.Segmenter('ko', {granularity: 'grapheme'});
  const letters = text => [...segmenter.segment(text)].map(part => part.segment);
  let currentKey = 'TOP';
  let revision = 0;
  let composing = false;
  let downloadUrl;
  let ready = false;
  function image(src) {
    if (!images.has(src)) images.set(src, new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => { images.delete(src); reject(new Error('카드 이미지를 불러오지 못했습니다. 창을 닫고 다시 열어주세요.')); };
      img.src = src;
    }));
    return images.get(src);
  }
  function wrap(text, width) {
    const lines = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const letter of letters(paragraph)) {
        if (line && ctx.measureText(line + letter).width > width) {
          // Keep Latin words together when a useful word boundary is available.
          const breakAt = line.lastIndexOf(' ');
          if (breakAt > line.length * .45) { lines.push(line.slice(0, breakAt)); line = line.slice(breakAt + 1) + letter; }
          else { lines.push(line); line = letter; }
        } else line += letter;
      }
      lines.push(line.trimEnd());
    }
    return lines;
  }
  function fit(text) {
    let normalized = text.trim().replace(/\n{3,}/g, '\n\n');
    // Extremely many manual line breaks are reflowed for a readable postcard.
    if (normalized.split('\n').length > 8) normalized = normalized.replace(/\n/g, ' ');
    for (let size = letters(normalized).length < 55 ? 34 : 30; size >= 12; size--) {
      ctx.font = `400 ${size}px "Pretendard"`;
      const lines = wrap(normalized, 617);
      if (lines.length * size * 1.65 <= 320) return {lines, size, lineHeight:size * 1.65};
    }
    return {lines:wrap(normalized, 617),size:12,lineHeight:19.8};
  }
  async function render() {
    const ticket = ++revision;
    ready = false; download.removeAttribute('href'); download.setAttribute('aria-disabled', 'true');
    status.textContent = '카드를 준비하고 있습니다…';
    const key = currentKey;
    const message = input.value;
    const theme = window.CARD_THEMES[key];
    try {
      const [art, logo, fonts] = await Promise.all([
        image(`assets/cards/${key}-supplied.png`), image(theme.logo === 'white' ? 'assets/kd-symbol-white.svg' : 'assets/kd-symbol.svg'),
        document.fonts.load('400 48px "Pretendard"', message || '새해 복 많이 받으세요')
      ]);
      if (ticket !== revision) return;
      if (!fonts.length) throw new Error('Pretendard 폰트를 불러오지 못했습니다. 창을 닫고 다시 열어주세요.');
      ctx.clearRect(0, 0, 737, 1078);
      // Supplied image and message panel each occupy exactly 737 × 539 pixels.
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, 737, 1078);
      const artHeight = 539;
      ctx.drawImage(art, 0, 0, 737, artHeight);
      const content = fit(message);
      ctx.font = `400 ${content.size}px "Pretendard"`;
      ctx.fillStyle = theme.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const textHeight = message.trim() ? content.lines.length * content.lineHeight : 0;
      const logoWidth = 40, logoHeight = logoWidth * 425.19 / 566.93;
      const top = 784 - textHeight / 2;
      const logoTop = 1078 - 38 - logoHeight;
      const centerX = 368.5;
      if (textHeight) content.lines.forEach((line, i) => ctx.fillText(line, centerX, top + content.lineHeight * (i + .5)));
      ctx.drawImage(logo, centerX - logoWidth / 2, logoTop, logoWidth, logoHeight);
      canvas.setAttribute('aria-label', `${key === 'TOP' ? '2027 표지' : key} 메시지 카드: ${message || '메시지 없음'}`);
      canvas.dataset.lines = content.lines.length;
      canvas.dataset.fontSize = content.size;
      canvas.dataset.textHeight = textHeight;
      canvas.dataset.card = key;
      canvas.dataset.logo = theme.logo;
      canvas.dataset.logoTop = logoTop;
      canvas.dataset.background = theme.background;
      canvas.dataset.artHeight = artHeight;
      canvas.dataset.messageHeight = 539;
      canvas.dataset.textTop = top;
      const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG 생성에 실패했습니다. 메시지를 다시 입력해주세요.')), 'image/png'));
      if (ticket !== revision) return;
      if (downloadUrl) { const previous = downloadUrl; setTimeout(() => URL.revokeObjectURL(previous), 60000); }
      downloadUrl = URL.createObjectURL(blob);
      download.href = downloadUrl;
      download.download = `KyungDong-2027-${key}-card.png`;
      download.setAttribute('aria-disabled', 'false');
      ready = true;
      status.textContent = '';
    } catch (error) { if (ticket === revision) status.textContent = error.message; }
  }
  function update() {
    if (composing) return;
    const characters = letters(input.value.replace(/\r\n/g, '\n'));
    if (characters.length > 200) input.value = characters.slice(0, 200).join('');
    document.getElementById('cardCount').textContent = `${Math.min(characters.length, 200)} / 200`;
    drafts.set(currentKey, input.value);
    render();
  }
  document.getElementById('openCard').addEventListener('click', () => {
    currentKey = index < 0 ? 'TOP' : MONTHS[index].abbr;
    document.getElementById('cardEdition').textContent = index < 0 ? '2027 · COVER' : `2027 · ${MONTHS[index].name}`;
    input.value = drafts.get(currentKey) ?? '새로운 시작,\n당신의 모든 날에\n쾌적한 하루가 가득하기를\n\n- KD -';
    modal.showModal(); update();
  });
  document.getElementById('closeCard').addEventListener('click', () => modal.close());
  modal.addEventListener('close', () => { revision++; });
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; update(); });
  input.addEventListener('input', update);
  download.addEventListener('click', event => {
    if (!ready) { event.preventDefault(); return; }
    status.textContent = 'PNG 다운로드를 시작했습니다.';
  });
})();
