/* VAZ Tech website - shared script for every page */
(function(){
  var art0=document.querySelector('.page');
  var PAGE=art0?art0.getAttribute('data-page'):'home';
  var HOME=(art0&&art0.getAttribute('data-home'))||'index.html';
  var MAIN=[['home','Home','01',HOME],['about','About','02','about.html'],['work','What we do','03','work.html'],['contact','Contact','04','contact.html']];
  var article=document.querySelector('.page');
  var NUM=article?article.getAttribute('data-num'):'';
  var TITLE=article?article.getAttribute('data-title'):'';

  // ---- right rail (desktop) and menu sheet (mobile) ----
  var railNav=document.getElementById('rail-nav'), sheetNav=document.getElementById('sheet-nav');
  if(railNav) railNav.innerHTML=MAIN.map(function(m){
    var cur=m[0]===PAGE?' aria-current="page"':'';
    return '<a class="ri" href="'+m[3]+'"'+cur+'>'+m[1]+'<span class="n">'+m[2]+'</span><span class="sq"></span></a><div class="subs" data-subs="'+m[0]+'" hidden></div>';
  }).join('');
  if(sheetNav) sheetNav.innerHTML=MAIN.map(function(m){
    var cur=m[0]===PAGE?' aria-current="page"':'';
    return '<a class="big" href="'+m[3]+'"'+cur+'>'+m[1]+'<span class="n">'+m[2]+'</span></a>';
  }).join('');

  // ---- legal page contents lists ----
  [].forEach.call(document.querySelectorAll('[data-toc]'),function(toc){
    var doc=toc.parentNode.querySelector('.doc');
    toc.innerHTML=[].map.call(doc.querySelectorAll('section[id]'),function(s){
      var h=s.querySelector('h2');
      return '<a href="#'+s.id+'" data-jump="'+s.id+'">'+h.textContent.replace(/^\d+/,'').trim()+'</a>';
    }).join('');
  });

  // ---- section sub-menu under the active page in the rail ----
  var secs=[].slice.call(document.querySelectorAll('main [data-sec]'));
  var holder=document.querySelector('[data-subs="'+PAGE+'"]');
  if(holder && secs.length>2){
    holder.innerHTML=secs.map(function(s){return '<a href="#'+s.id+'" data-jump="'+s.id+'">'+s.getAttribute('data-sec')+'</a>';}).join('');
    holder.hidden=false;
  }

  // ---- mobile dock label + progress ----
  var dockLbl=document.getElementById('dock-lbl'), dockBar=document.getElementById('dock-bar');
  function updateDock(sec){
    if(!dockLbl) return;
    dockLbl.innerHTML=(NUM?'<b>'+NUM+'</b>':'')+TITLE.toUpperCase()+(sec&&sec!=='Intro'?' / '+sec.toUpperCase():'');
  }

  // ---- scroll-spy: last section whose top passed 35% of the viewport; bottom of page = last section;
  //      a clicked item stays active until the user scrolls again ----
  var forced=null, forcedAt=0, ticking=false;
  function setActive(sec){
    if(!sec) return;
    [].forEach.call(document.querySelectorAll('.subs a'),function(a){a.classList.toggle('on',a.getAttribute('data-jump')===sec.id);});
    updateDock(sec.getAttribute('data-sec'));
  }
  function spyUpdate(){
    ticking=false;
    if(dockBar){
      var h=document.documentElement.scrollHeight-innerHeight;
      dockBar.style.width=(h>0?Math.min(100,window.pageYOffset/h*100):0)+'%';
    }
    if(!secs.length) return;
    if(forced){ if(Date.now()-forcedAt<500){ setActive(forced); return; } forced=null; }
    var line=innerHeight*0.35, act=secs[0];
    secs.forEach(function(s){ if(s.getBoundingClientRect().top<=line) act=s; });
    var doc=document.documentElement;
    if(window.pageYOffset+innerHeight>=doc.scrollHeight-2 && window.pageYOffset>0) act=secs[secs.length-1];
    setActive(act);
  }
  window.addEventListener('scroll',function(){ if(!ticking){ticking=true; requestAnimationFrame(spyUpdate);} },{passive:true});
  window.addEventListener('resize',spyUpdate);

  // ---- in-page jumps (instant scroll, with a fallback for embedded viewers) ----
  function jumpTo(el){
    if(!el) return;
    if(secs.indexOf(el)>-1){ forced=el; forcedAt=Date.now(); setActive(el); }
    var y=el.getBoundingClientRect().top+window.pageYOffset-16;
    try{window.scrollTo({top:y,behavior:'auto'});}catch(e){window.scrollTo(0,y);}
    setTimeout(function(){ if(Math.abs(el.getBoundingClientRect().top-16)>40){ try{el.scrollIntoView({block:'start'});}catch(e){} } },60);
    try{history.replaceState(null,'','#'+el.id);}catch(e){}
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a');
    if(!a) return;
    var href=a.getAttribute('href')||'';
    if(href.charAt(0)==='#' && href.length>1){
      var el=document.getElementById(href.slice(1));
      if(el){ e.preventDefault(); closeSheet(); jumpTo(el); }
    }
  });
  window.addEventListener('hashchange',function(){ var el=document.getElementById(location.hash.slice(1)); if(el) jumpTo(el); });

  // ---- mobile menu sheet ----
  var sheet=document.getElementById('sheet'), dockBtn=document.getElementById('dock-btn');
  function closeSheet(){ if(sheet && sheet.classList.contains('open')){ sheet.classList.remove('open'); if(dockBtn) dockBtn.focus({preventScroll:true}); } }
  if(dockBtn) dockBtn.addEventListener('click',function(){ sheet.classList.add('open'); var c=sheet.querySelector('[aria-current]')||sheet.querySelector('a'); if(c) c.focus(); });
  var sc=document.getElementById('sheet-close'); if(sc) sc.addEventListener('click',closeSheet);
  if(sheet) sheet.addEventListener('click',function(e){ if(e.target===sheet) closeSheet(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeSheet(); });

  var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

  // ---- initial state ----
  if(location.hash.length>1){
    var t=document.getElementById(location.hash.slice(1));
    if(t) requestAnimationFrame(function(){ jumpTo(t); });
  }
  if(secs.length) setActive(secs[0]);
  spyUpdate();
})();
