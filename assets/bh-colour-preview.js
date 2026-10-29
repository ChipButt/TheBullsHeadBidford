/* Shared, opt-in Bulls Head colour concept. Only ?palette=warm activates it.
   Internal navigation preserves the opt-in; the normal site remains unaffected. */
(function(){
  'use strict';
  var query=new URLSearchParams(window.location.search);
  if(query.get('palette')!=='warm')return;
  document.documentElement.classList.add('bh-warm-preview');
  var sheet=document.createElement('link');
  sheet.rel='stylesheet';
  sheet.href='assets/bh-warm-palette-preview.css';
  document.head.appendChild(sheet);
  if(document.title.indexOf('Warm concept')<0)document.title+=' | Warm concept';
  function preservePreviewNavigation(){
    var links=document.querySelectorAll('a[href]');
    for(var i=0;i<links.length;i++){
      var link=links[i];
      var raw=link.getAttribute('href');
      if(!raw||raw.charAt(0)==='#'||raw.charAt(0)==='?'||raw.indexOf('mailto:')===0||raw.indexOf('tel:')===0)continue;
      try{
        var url=new URL(raw,location.href);
        if(url.origin!==location.origin)continue;
        var path=url.pathname.toLowerCase();
        // Only carry the preview across the website's own HTML pages.
        if(!/\.html$/.test(path)&&!/\/thebullsheadbidford\/?$/.test(path))continue;
        url.searchParams.set('palette','warm');
        link.setAttribute('href',url.pathname+url.search+url.hash);
      }catch(e){}
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',preservePreviewNavigation,{once:true});
  }else preservePreviewNavigation();
})();