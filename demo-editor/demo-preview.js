(() => {
if (new URLSearchParams(location.search).get('demo') !== '1') return;
const path = location.pathname.split('/').pop() || 'index.html';
function get(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } }
const texts = get('bulls-head-demo-edit-v1')[path] || {};
const photos = get('bulls-head-demo-photos')[path] || {};
const selector = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,small,strong,span,a,button,td,th';
[...document.querySelectorAll(selector)].filter(el =>
 !el.querySelector(selector) && el.textContent.trim() && el.children.length === 0
).forEach((el,index) => {
 if (Object.prototype.hasOwnProperty.call(texts,index)) el.textContent=texts[index];
});
document.querySelectorAll('img').forEach((image,index) => {
 if (Object.prototype.hasOwnProperty.call(photos,index)) image.src=photos[index];
});
const ribbon=document.createElement('div');
ribbon.textContent='Editor demonstration preview — changes saved in this browser, not published online';
ribbon.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:2147483647;background:#173f35;color:white;padding:9px;text-align:center;font:13px system-ui,sans-serif';
document.body.appendChild(ribbon);
})();