/* Render three most recent independently linked Tripadvisor reviews from the authorised feed.
   No API credentials are sent to the browser. Existing review excerpts remain
   visible and honestly labelled if the feed has not been configured yet. */
(function () {
  'use strict';
  var grid=document.getElementById('bh-tripadvisor-review-grid');
  var note=document.getElementById('bh-review-sync-note');
  if(!grid||!note)return;
  var defaultLink='https://www.tripadvisor.co.uk/Restaurant_Review-g186397-d13531157-Reviews-The_Bulls_Head-Bidford_on_Avon_Warwickshire_England.html';
  function el(tag,cls,value){
    var item=document.createElement(tag);
    if(cls)item.className=cls;
    if(value!=null)item.textContent=String(value);
    return item;
  }
  function safeLink(url){
    try{
      var u=new URL(url);
      if(u.protocol==='https:'&&(/(^|\.)tripadvisor\.(co\.uk|com)$/).test(u.hostname))return u.href;
    }catch(e){}
    return defaultLink;
  }
  function safeRatingImage(url){
    try{
      var u=new URL(url);
      if(u.protocol==='https:'&&(u.hostname==='static.tacdn.com'||u.hostname==='www.tripadvisor.com'||u.hostname==='www.tripadvisor.co.uk'))return u.href;
    }catch(e){}
    return null;
  }
  function dateText(value){
    if(typeof value!=='string')return '';
    var date=new Date(value);
    if(!Number.isFinite(date.getTime()))return '';
    return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
  }
  function card(review){
    var article=el('article','bh-review-card');
    article.setAttribute('data-nosnippet','');
    article.appendChild(el('div','bh-review-card__source','Tripadvisor visitor review'));
    if(review.rating_image){
      var rating=safeRatingImage(review.rating_image);
      if(rating){
        var area=el('div','bh-review-card__rating');
        var img=el('img');
        img.src=rating;
        img.alt=Number.isFinite(Number(review.rating))?String(review.rating)+' out of 5':''; 
        img.loading='lazy';
        area.appendChild(img);
        article.appendChild(area);
      }
    }
    if(review.title)article.appendChild(el('h3','bh-review-card__title',review.title));
    article.appendChild(el('blockquote','bh-review-card__text','“'+review.text+'”'));
    var meta=[review.author,dateText(review.date)].filter(Boolean).join(' · ');
    if(meta)article.appendChild(el('p','bh-review-card__meta',meta));
    var bottom=el('div','bh-review-card__bottom'),link=el('a',null,'Read this review on Tripadvisor');
    link.href=safeLink(review.url);
    link.target='_blank';
    link.rel='noopener noreferrer';
    bottom.appendChild(link);
    article.appendChild(bottom);
    return article;
  }
  fetch('content/tripadvisor-reviews.json',{cache:'no-store'}).then(function(response){
    if(!response.ok)throw new Error('Reviews feed not enabled');
    return response.json();
  }).then(function(payload){
    if(!payload||payload.status!=='live'||payload.location_id!==13531157||!Array.isArray(payload.reviews))throw new Error('Invalid review feed');
    var items=payload.reviews.filter(function(x){return x&&typeof x.text==='string'&&x.text.trim()}).slice(0,3);
    if(items.length!==3)throw new Error('Incomplete review feed');
    var fragment=document.createDocumentFragment();
    items.forEach(function(item){fragment.appendChild(card(item))});
    grid.replaceChildren(fragment);
    var stamp=dateText(payload.synced_at);
    note.textContent=stamp?'Latest available Tripadvisor reviews · Refreshed '+stamp:'Latest available Tripadvisor reviews · Automatically refreshed daily';
  }).catch(function(){
    // Don't misrepresent the static examples as an automatically updated feed.
    note.textContent='Tripadvisor review excerpts · Automatic updates are not connected yet.';
  });
})();