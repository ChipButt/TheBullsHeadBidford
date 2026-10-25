const EDITOR_DATA_URL='https://script.google.com/macros/s/AKfycbzz7FWTrjHkH8LUCrEElzr1MFCN9lN408-C_wC2o2FAU5j8HYXd43uUBgUHRDsiB78/exec';
const EDITOR_SITE_ID='bulls-head-bidford';
const slug=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'');
let editorPreviewData=null;
const applyChipInData = data => {
  const site=data && data.site;
  if (!site) return;
  const current=site.editorPages && site.editorPages[slug] || {};
  document.querySelectorAll('[data-chipin-text]').forEach(el=>{
    const key=el.dataset.chipinText;
    if(typeof current[key]==='string')el.textContent=current[key];
  });
  document.querySelectorAll('[data-chipin-image]').forEach(el=>{
    const value=current[el.dataset.chipinImage];
    if(typeof value==='string'&&value.trim())el.setAttribute('src',value.replace(/^\//,''));
  });
  const logo=site.editorBrand && site.editorBrand.logo;
  if(typeof logo==='string'&&logo.trim())
    document.querySelectorAll('[data-chipin-brand-image]').forEach(el=>el.setAttribute('src',logo.replace(/^\//,'')));
};
fetch('content/site.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()})
.then(site=>{if(!editorPreviewData)applyChipInData({site})}).catch(err=>console.warn('Site content:',err));
window.addEventListener('message',event=>{
  if(event.data && event.data.type==='hospolp-preview' && event.data.data){
    editorPreviewData=event.data.data;
    applyChipInData(editorPreviewData);
  }
});
if(window.parent!==window){
  const notify=()=>window.parent.postMessage({type:'hospolp-preview-page',pathname:location.pathname},'*');
  window.addEventListener('pageshow',notify);setTimeout(notify,0);
}
