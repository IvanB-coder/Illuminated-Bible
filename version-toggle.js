// Shared KJV / WEB translation toggle for simple-template reading pages.
// Remembers the reader's last choice across chapters via localStorage.
(function(){
  function setVersion(v){
    v = (v === 'web') ? 'web' : 'kjv';
    var kjv = document.getElementById('verses-kjv');
    var web = document.getElementById('verses-web');
    if(!kjv || !web) return;
    kjv.hidden = (v !== 'kjv');
    web.hidden = (v !== 'web');
    document.querySelectorAll('.version-toggle button').forEach(function(btn){
      var active = btn.getAttribute('data-version') === v;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try{ localStorage.setItem('illuminated-word-version', v); }catch(e){}
  }

  document.addEventListener('DOMContentLoaded', function(){
    var saved = 'kjv';
    try{ saved = localStorage.getItem('illuminated-word-version') || 'kjv'; }catch(e){}
    setVersion(saved);
    document.querySelectorAll('.version-toggle button').forEach(function(btn){
      btn.addEventListener('click', function(){
        setVersion(btn.getAttribute('data-version'));
      });
    });
  });
})();
