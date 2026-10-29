(function(){
'use strict';
const form=document.getElementById('scripture-search-form');if(!form)return;
const $=id=>document.getElementById(id),query=$('verse-query'),translation=$('search-translation'),scope=$('search-scope'),mode=$('search-mode'),sort=$('search-sort');
const results=$('verse-results'),status=$('search-status'),error=$('search-error'),errorText=$('search-error-text'),pager=$('search-pagination'),summary=$('search-summary'),submit=$('search-submit');
let worker=null,workerTimer=null,workerDisabled=false,sequence=0,lastOptions=null,hasSearched=false;const fallbackEngines=new Map();
try{const saved=localStorage.getItem('illuminated-word-version');if(['kjv','web'].includes(saved))translation.value=saved;}catch(e){}
function readURL(){
 const p=new URLSearchParams(location.search);
 if(p.has('q'))query.value=p.get('q').slice(0,200);
 for(const [name,el] of [['translation',translation],['scope',scope],['mode',mode],['sort',sort]])if(p.has(name)&&Array.from(el.options).some(o=>o.value===p.get(name)))el.value=p.get(name);
 return p.has('q')&&query.value.trim();
}
function setURL(options){try{
 const u=new URL(location.href);for(const key of ['q','translation','scope','mode','sort'])u.searchParams.delete(key);
 if(options){u.searchParams.set('q',options.query);u.searchParams.set('translation',options.translation);if(options.scope!=='all')u.searchParams.set('scope',options.scope);if(options.mode!=='all')u.searchParams.set('mode',options.mode);if(options.sort!=='relevance')u.searchParams.set('sort',options.sort);u.hash='scripture-search';}
 history.replaceState(null,'',u.pathname+u.search+u.hash);
}catch(e){}}
function busy(value){if(!value)clearTimeout(workerTimer);results.setAttribute('aria-busy',String(value));submit.textContent=value?'Searching\u2026':'Search verses';$('search-region').classList.toggle('is-loading',value);}
function fail(message){$('search-region').hidden=false;busy(false);errorText.textContent=message;error.hidden=false;status.textContent='Search could not be completed.';results.replaceChildren();pager.hidden=true;summary.hidden=true;}
function highlight(text,words){
 const fragment=document.createDocumentFragment(),set=new Set(words);const re=/[\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)*/gu;let m,last=0;
 while((m=re.exec(text))){fragment.append(document.createTextNode(text.slice(last,m.index)));const token=m[0];if(set.has(IWScriptureSearch.normalize(token))){const mark=document.createElement('mark');mark.textContent=token;fragment.append(mark);}else fragment.append(document.createTextNode(token));last=re.lastIndex;}
 fragment.append(document.createTextNode(text.slice(last)));return fragment;
}
async function copyVerse(result,button){
 const text=result.reference+' ('+result.translation.toUpperCase()+') \u2014 '+result.text;
 try{
  if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);
  else{const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();let copied=false;try{copied=document.execCommand('copy');}finally{area.remove();button.focus();}if(!copied)throw new Error('Copy not available');}
  button.textContent='Copied';$('copy-status').textContent=result.reference+' copied.';setTimeout(()=>{button.textContent='Copy verse';},2000);
 }catch(e){$('copy-status').textContent='Copy is not available in this browser. Select the verse text to copy it.';}
}
function show(data){
 busy(false);error.hidden=true;results.replaceChildren();results.start=(data.page-1)*data.pageSize+1;summary.hidden=false;
 const start=data.total?(data.page-1)*data.pageSize+1:0,end=Math.min(data.page*data.pageSize,data.total);
 summary.textContent=data.total.toLocaleString()+' matching '+(data.total===1?'verse':'verses')+' \u00b7 '+data.translation.toUpperCase();
 status.textContent=data.total?'Showing '+start.toLocaleString()+'\u2013'+end.toLocaleString()+' of '+data.total.toLocaleString()+' matching verses.':data.emptyHint;
 for(const r of data.results){
  const li=document.createElement('li');li.className='verse-result';const top=document.createElement('div');top.className='verse-result-heading';
  const h=document.createElement('h3'),link=document.createElement('a');link.href=r.href;link.textContent=r.reference;link.setAttribute('aria-label',r.reference+', '+r.translation.toUpperCase()+'. Open this verse in its chapter.');h.append(link);
  const badge=document.createElement('span');badge.className='search-version';badge.textContent=r.translation.toUpperCase();top.append(h,badge);
  const text=document.createElement('p');text.className='verse-result-text';text.append(highlight(r.text,data.words));
  const actions=document.createElement('div');actions.className='verse-result-actions';const read=document.createElement('a');read.href=r.href;read.textContent='Read in chapter \u2192';read.setAttribute('aria-label','Read '+r.reference+' in its chapter');
  const copy=document.createElement('button');copy.type='button';copy.textContent='Copy verse';copy.setAttribute('aria-label','Copy '+r.reference+' in '+r.translation.toUpperCase());copy.addEventListener('click',()=>copyVerse(r,copy));actions.append(read,copy);li.append(top,text,actions);results.append(li);
 }
 pager.hidden=data.totalPages<=1;$('search-page').textContent='Page '+data.page+' of '+data.totalPages;
 $('search-previous').disabled=data.page<=1;$('search-next').disabled=data.page>=data.totalPages;
 $('search-previous').onclick=()=>{run(data.page-1);};$('search-next').onclick=()=>{run(data.page+1);};
 if(lastOptions&&lastOptions.page>1){summary.focus({preventScroll:true});summary.scrollIntoView({behavior:'auto',block:'start'});}
}
function loadScriptData(v){
 return new Promise((resolve,reject)=>{
  if(!['kjv','web'].includes(v)){reject(new Error('Choose KJV or WEB.'));return;}
  const existing=window.IWSearchData&&window.IWSearchData[v];if(existing){resolve(existing);return;}
  const script=document.createElement('script');let settled=false;
  const finish=(err)=>{if(settled)return;settled=true;clearTimeout(timer);script.onload=null;script.onerror=null;script.remove();
   if(err){reject(err);return;}const d=window.IWSearchData&&window.IWSearchData[v];
   if(!d){reject(new Error('The verse data file is incomplete. Extract all files from the latest update into the same website folder.'));return;}resolve(d);
  };
  const timer=setTimeout(()=>finish(new Error('Loading took too long. Check that all update files are together, then try again.')),30000);
  script.src='search-data-'+v+'-20261028.js';script.async=true;
  script.onload=()=>finish();script.onerror=()=>finish(new Error('The '+v.toUpperCase()+' verse data could not be loaded. Extract the complete update beside index.html, or upload all its files to the website, then try again.'));
  document.head.append(script);
 });
}
async function localEngine(v){
 if(!fallbackEngines.has(v))fallbackEngines.set(v,loadScriptData(v).then(d=>{
  if(d.release!=='20261027-search1'||d.translation!==v)throw new Error('The search data does not match. Extract the complete latest update.');
  return new IWScriptureSearch.Engine(d);
 }).catch(e=>{fallbackEngines.delete(v);throw e;}));return fallbackEngines.get(v);
}
async function fallback(options,id){try{const engine=await localEngine(options.translation);const data=engine.search(options);if(id===sequence)show(data);}catch(e){if(id===sequence)fail(e.name==='AbortError'?'Loading took too long. Check your connection and try again.':e.message);}}
function useFallback(){clearTimeout(workerTimer);if(worker)worker.terminate();worker=null;workerDisabled=true;if(lastOptions)fallback(lastOptions,sequence);}
function getWorker(){
 if(worker)return worker;
 if(!window.Worker||workerDisabled||location.protocol==='file:')return null;
 try{
  worker=new Worker('scripture-search-worker.js?v=20261028-banner2');
  worker.onmessage=event=>{const m=event.data;if(m.id!==sequence)return;if(m.type==='results')show(m.result);else if(m.type==='error')useFallback();};
  worker.onerror=useFallback;worker.onmessageerror=useFallback;return worker;
 }catch(e){return null;}
}
function run(page){
 error.hidden=true;const text=query.value.trim();
 if(!text){query.setCustomValidity('Enter a word, phrase or Bible reference.');query.reportValidity();query.focus();return;}query.setCustomValidity('');
 hasSearched=true;const id=++sequence;lastOptions={query:text,translation:translation.value,scope:scope.value,mode:mode.value,sort:sort.value,page:page||1};
 $('search-region').hidden=false;clearTimeout(workerTimer);busy(true);results.replaceChildren();pager.hidden=true;summary.hidden=true;status.textContent='Searching '+translation.value.toUpperCase()+' verses\u2026 The first search loads this translation once.';setURL(lastOptions);
 const w=getWorker();if(w){workerTimer=setTimeout(()=>{if(id===sequence)useFallback();},35000);try{w.postMessage({id,type:'search',options:lastOptions});}catch(e){useFallback();}}else fallback(lastOptions,id);
}
form.addEventListener('submit',e=>{e.preventDefault();run(1);});query.addEventListener('input',()=>query.setCustomValidity(''));
for(const el of [translation,scope,mode,sort])el.addEventListener('change',()=>{if(el===translation){try{localStorage.setItem('illuminated-word-version',translation.value);}catch(e){}}if(hasSearched&&query.value.trim())run(1);});
$('search-retry').addEventListener('click',()=>run(1));
$('search-clear').addEventListener('click',()=>{sequence++;query.value='';query.setCustomValidity('');scope.value='all';mode.value='all';sort.value='relevance';hasSearched=false;lastOptions=null;results.replaceChildren();error.hidden=true;pager.hidden=true;summary.hidden=true;busy(false);$('search-region').hidden=true;status.textContent='Enter a reference, keywords or a phrase to see matching verses.';setURL(null);query.focus();});
for(const button of document.querySelectorAll('[data-verse-example]'))button.addEventListener('click',()=>{query.value=button.getAttribute('data-verse-example');scope.value='all';mode.value='all';run(1);});
document.addEventListener('keydown',event=>{const tag=document.activeElement&&document.activeElement.tagName;if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(tag)&&!document.activeElement.isContentEditable){event.preventDefault();query.focus();query.scrollIntoView({block:'center'});}});
const autoSearch=readURL();if(scope.value!=='all'||mode.value!=='all'||sort.value!=='relevance')$('search-options').open=true;if(autoSearch)run(1);
})();
