/* Add stable verse anchors without changing the existing translation toggles. */
(function(){
'use strict';let initialized=false;
function initialize(){
 if(initialized)return;initialized=true;
 for(const version of ['kjv','web']){
  const block=document.getElementById('text-'+version)||document.getElementById('verses-'+version);if(!block)continue;
  for(const p of block.querySelectorAll('p')){const number=p.querySelector('sup, .vnum');if(!number)continue;const verse=number.textContent.trim();if(/^\d+$/.test(verse))p.id='verse-'+version+'-'+verse;}
 }
 function reveal(){
  const match=location.hash.match(/^#verse-(kjv|web)-(\d+)$/);if(!match)return;
  const version=match[1],target=document.getElementById('verse-'+version+'-'+match[2]);if(!target)return;
  if(typeof window.showTranslation==='function')window.showTranslation(version);
  else{const button=document.querySelector('.version-toggle button[data-version="'+version+'"]');if(button)button.click();}
  document.querySelectorAll('.verse-search-target').forEach(p=>p.classList.remove('verse-search-target'));
  target.classList.add('verse-search-target');target.setAttribute('tabindex','-1');
  requestAnimationFrame(()=>{try{target.focus({preventScroll:true});}catch(e){target.focus();}target.scrollIntoView({block:'center',behavior:'auto'});});
 }
 reveal();window.addEventListener('hashchange',reveal);
}
if(document.readyState==='complete')initialize();else document.addEventListener('DOMContentLoaded',initialize,{once:true});
})();
