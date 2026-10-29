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
  // Responsive hero framing is content data, not a destructive crop of the photograph.
  if(slug==='index'){
    const hero=document.querySelector('.home-hero .hero-bg img[data-chipin-image="img01"]');
    if(hero){
      const framing=current.heroFraming||{};
      const percent=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(100,Number(value))):50;
      const desktop=framing.desktop||{};
      const mobile=framing.mobile||{};
      hero.style.setProperty('--bh-hero-desktop',percent(desktop.x)+'% '+percent(desktop.y)+'%');
      hero.style.setProperty('--bh-hero-mobile',percent(mobile.x)+'% '+percent(mobile.y)+'%');
    }
  }
  // Food follow tiles. A missing Instagram profile must never link to a guessed account.
  if(slug==='food'){
    const socialUrl=(value,domain)=>{
      if(typeof value!=='string'||!value.trim())return null;
      try{
        const parsed=new URL(value);
        if(parsed.protocol!=='https:')return null;
        if(parsed.hostname!==domain&&parsed.hostname!=='www.'+domain)return null;
        return parsed.toString();
      }catch{return null}
    };
    const facebook=document.querySelector('[data-bh-facebook]');
    const facebookUrl=socialUrl(site.facebook,'facebook.com');
    if(facebook&&facebookUrl)facebook.href=facebookUrl;
    const instagram=document.querySelector('[data-bh-instagram]');
    const instagramUrl=socialUrl(site.instagram,'instagram.com');
    if(instagram){
      const action=instagram.querySelector('.bh-food-follow-card__action');
      if(instagramUrl){
        instagram.href=instagramUrl;
        instagram.target='_blank';
        instagram.rel='noopener noreferrer';
        instagram.removeAttribute('aria-disabled');
        instagram.removeAttribute('tabindex');
        instagram.classList.remove('is-unavailable');
        instagram.setAttribute('aria-label','Follow The Bulls Head on Instagram');
        if(action)action.textContent='Follow on Instagram';
      }else{
        instagram.removeAttribute('href');
        instagram.removeAttribute('target');
        instagram.removeAttribute('rel');
        instagram.setAttribute('aria-disabled','true');
        instagram.setAttribute('tabindex','-1');
        instagram.classList.add('is-unavailable');
        instagram.setAttribute('aria-label','Instagram profile link to be confirmed');
        if(action)action.textContent='Profile link to be confirmed';
      }
    }
  }
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

if(window.parent!==window){
 const keyOf=element=>{
   if(element.hasAttribute('data-chipin-brand-image'))return 'site.editorBrand.logo';
   if(element.dataset.chipinImage)return 'site.editorPages.'+slug+'.'+element.dataset.chipinImage;
   if(element.dataset.chipinText)return 'site.editorPages.'+slug+'.'+element.dataset.chipinText;
   return null;
 };
 const elements=document.querySelectorAll('[data-chipin-text],[data-chipin-image],[data-chipin-brand-image]');
 elements.forEach(element=>{
   const key=keyOf(element);
   element.style.cursor='pointer';
   element.title=element.tagName==='IMG'?'Select image to replace in editor':'Click to edit this text';
   element.addEventListener('mouseenter',()=>window.parent.postMessage({type:'hospolp-preview-hover',key},'*'));
   element.addEventListener('click',event=>{
     event.preventDefault();event.stopPropagation();
     if(element.tagName==='IMG'){
       window.parent.postMessage({type:'hospolp-preview-image-select',key},'*');
       return;
     }
     element.contentEditable='true';
     element.focus();
     element.style.outline='2px dashed #d8aa48';
     window.parent.postMessage({type:'hospolp-preview-select',key},'*');
   });
   if(element.tagName!=='IMG'){
     element.addEventListener('input',()=>{
       window.parent.postMessage({type:'hospolp-preview-change',key,value:element.textContent},'*');
     });
     element.addEventListener('blur',()=>{
       element.contentEditable='false';
       element.style.outline='';
     });
   }
 });
}
