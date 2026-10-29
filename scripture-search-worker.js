 'use strict';
importScripts('scripture-search-core.js?v=20261028-banner2');
const engines=new Map();
function load(translation){
 if(!['kjv','web'].includes(translation))throw new Error('Choose KJV or WEB.');
 if(!engines.has(translation)){
  importScripts('search-data-'+translation+'-20261028.js');
  const data=self.IWSearchData&&self.IWSearchData[translation];
  if(!data||data.release!=='20261027-search1'||data.translation!==translation)throw new Error('The verse data does not match. Upload the complete update.');
  engines.set(translation,new IWScriptureSearch.Engine(data));
 }
 return engines.get(translation);
}
self.onmessage=function(event){
 const message=event.data||{};if(message.type!=='search')return;const id=message.id;
 try{self.postMessage({id,type:'loading'});const result=load(message.options.translation).search(message.options);self.postMessage({id,type:'results',result});}
 catch(error){self.postMessage({id,type:'error',message:error.message||'Search is unavailable. Please try again.'});}
};
