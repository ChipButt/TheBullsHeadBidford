(() => {
const frame = document.getElementById('preview');
const picker = document.getElementById('photoFile');
const page = () => document.getElementById('page').value;
const key = 'bulls-head-demo-photos';
const read = () => JSON.parse(localStorage.getItem(key) || '{}');
let target;
frame.addEventListener('load', () => {
  const all = read(), photos = all[page()] || {};
  frame.contentDocument.querySelectorAll('img').forEach((img, index) => {
    if (photos[index]) img.src = photos[index];
    img.title = 'Click to replace picture';
    img.style.cursor = 'pointer';
    img.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation();
      target = {img, index}; picker.click();
    }, true);
  });
});
picker.addEventListener('change', () => {
  const file = picker.files[0]; picker.value = '';
  if (!file || !target || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 800 / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      target.img.src = canvas.toDataURL('image/jpeg', .72);
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});
document.getElementById('save').addEventListener('click', () => {
  const all = read(), photos = {};
  frame.contentDocument.querySelectorAll('img').forEach((img, i) => {
    if (img.src.startsWith('data:image/')) photos[i] = img.src;
  });
  all[page()] = photos;
  try { localStorage.setItem(key, JSON.stringify(all)); }
  catch { document.getElementById('message').textContent = 'Photo too large for demo storage.'; }
});
document.getElementById('reset').addEventListener('click', () => {
  const all = read(); delete all[page()];
  localStorage.setItem(key, JSON.stringify(all));
});
})();