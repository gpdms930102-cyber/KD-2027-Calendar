'use strict';
const MONTHS = window.MONTHS;
const $ = id => document.getElementById(id);
const video = $('heroVideo');
const strip = $('monthStrip');
const dialog = $('infoDialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let index = -1;
let userPaused = reducedMotion.matches;
let touchStart;

function initialMonth() {
  const value = new URLSearchParams(location.search).get('m');
  if (value !== null) {
    const month = Number(value);
    return Number.isInteger(month) && month >= 1 && month <= 12 ? month - 1 : -1;
  }
  const now = new Date();
  return now.getFullYear() === 2027 ? now.getMonth() : -1;
}
function updatePlayback() {
  $('playIcon').textContent = video.paused ? '▷' : 'Ⅱ';
  $('playText').textContent = video.paused ? '재생' : '일시정지';
  $('play').setAttribute('aria-label', video.paused ? '영상 재생' : '영상 일시정지');
}
function tryPlay() {
  if (!userPaused && !document.hidden) video.play().catch(updatePlayback);
}
function togglePlayback() {
  userPaused = !video.paused;
  if (userPaused) video.pause(); else video.play().catch(updatePlayback);
}
function centerMonth() {
  const active = strip.children[index + 1];
  if (active && strip.scrollWidth > strip.clientWidth) {
    strip.scrollTo({left: active.offsetLeft - strip.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
}
function showMonth(next, updateUrl = true) {
  index = Math.max(-1, Math.min(11, next));
  const cover = index === -1;
  const month = MONTHS[index];
  $('coverUI').hidden = !cover;
  $('monthUI').hidden = cover;
  $('house').hidden = false;
  const navigation = document.querySelector('.month-navigation');
  if (cover) $('coverUI').append(navigation);
  else $('monthUI').insertBefore(navigation, document.querySelector('.concept'));
  if (!cover) {
    $('monthLabel').textContent = `${String(month.n).padStart(2, '0')} · ${month.name}`;
    $('keyword').textContent = month.keyword;
    $('korean').textContent = month.ko;
    $('counter').textContent = `${String(month.n).padStart(2, '0')} / 12`;
    $('conceptCopy').textContent = month.desc;
    $('elementRow').replaceChildren(...month.elements.map(text => {
      const element = document.createElement('span');
      element.className = 'element-chip'; element.textContent = text; return element;
    }));

  }
  [...strip.children].forEach((button, i) => button.setAttribute('aria-current', String(index === i - 1)));
  requestAnimationFrame(centerMonth);
  $('prev').setAttribute('aria-label', index <= 0 ? '이전 달 · 12월' : `이전 달 · ${index}월`);
  $('next').setAttribute('aria-label', index === 11 ? '다음 달 · 1월' : `다음 달 · ${index + 2}월`);
  $('mediaError').hidden = true;
  video.pause();
  video.poster = `assets/poster/${cover ? 'TOP' : month.abbr}.jpg`;
  video.src = `assets/video/${cover ? 'TOP.mp4' : month.file}`;
  video.setAttribute('aria-label', cover ? '2027 경동 캘린더 표지 모션' : `2027년 ${month.n}월 · ${month.keyword} 캘린더 모션`);
  video.load();
  document.title = cover ? 'KD 2027 CALENDAR' : `${month.n}월 ${month.keyword} · KD 2027 CALENDAR`;
  if (updateUrl) {
    const url = new URL(location.href);
    if (cover) url.searchParams.delete('m'); else url.searchParams.set('m', String(month.n));
    history.replaceState(null, '', url);
  }
}
function move(delta) { showMonth(index < 0 ? (delta > 0 ? 0 : 11) : (index + delta + 12) % 12); }
[{n: 0, keyword:'표지'}, ...MONTHS].forEach((month, position) => {
  const i = position - 1;
  const button = document.createElement('button');
  button.className = 'month-chip'; button.type = 'button';
  button.textContent = i < 0 ? '2027' : String(month.n).padStart(2, '0');
  if(i < 0) button.classList.add('cover-chip');
  button.setAttribute('aria-label', i < 0 ? '2027 표지' : `${month.n}월 ${month.keyword}`);
  button.addEventListener('click', () => showMonth(i)); strip.append(button);
});
$('brand').addEventListener('click', () => showMonth(-1));
$('enter').addEventListener('click', () => { const now = new Date(); showMonth(now.getFullYear() === 2027 ? now.getMonth() : 0); strip.children[index + 1].focus({preventScroll: true}); });
$('prev').addEventListener('click', () => move(-1));
$('next').addEventListener('click', () => move(1));
$('play').addEventListener('click', togglePlayback);
video.addEventListener('click', togglePlayback);
video.addEventListener('canplay', tryPlay);
video.addEventListener('play', updatePlayback);
video.addEventListener('pause', updatePlayback);
video.addEventListener('error', () => { $('mediaError').hidden = false; updatePlayback(); });
$('retry').addEventListener('click', () => { $('mediaError').hidden = true; video.load(); tryPlay(); });
$('info').addEventListener('click', () => {
  $('sheetTitle').textContent = index < 0 ? '12 Elements of Comfort' : `${MONTHS[index].keyword} · ${MONTHS[index].ko}`;
  $('sheetText').textContent = index < 0 ? '기술을 통해 사람을 둘러싼 생활환경이 더 나은 일상으로 최적화되는 과정을 12개의 시각 언어로 표현합니다.' : MONTHS[index].desc;
  dialog.showModal();
});
$('closeSheet').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
document.addEventListener('keydown', event => {
  if (dialog.open || $('cardDialog').open || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    if (strip.contains(document.activeElement)) strip.children[index + 1].focus({preventScroll:true});
  }
});
const visual = document.querySelector('.visual');
visual.addEventListener('touchstart', event => { const point = event.changedTouches[0]; touchStart = {x:point.clientX,y:point.clientY}; }, {passive:true});
visual.addEventListener('touchend', event => { if (!touchStart) return; const point=event.changedTouches[0]; const dx=point.clientX-touchStart.x; const dy=point.clientY-touchStart.y; touchStart=null; if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) move(dx<0?1:-1); }, {passive:true});
visual.addEventListener('touchcancel', () => {touchStart=null;});
document.addEventListener('visibilitychange', () => {if(document.hidden) video.pause(); else tryPlay();});
reducedMotion.addEventListener('change', event => {userPaused=event.matches; if(userPaused) video.pause(); else tryPlay();});
window.addEventListener('popstate', () => showMonth(initialMonth(), false));
window.addEventListener('resize', centerMonth);
showMonth(initialMonth(), false);
