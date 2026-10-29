/* Illuminated Word: deterministic, local verse search. No external services. */
(function(root){
  'use strict';
  function normalize(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\u2018\u2019']/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');}
  function bookKey(s){return normalize(s).replace(/^(first|second|third|iii|ii|i)\s+/,function(_,v){return ({first:'1',second:'2',third:'3',i:'1',ii:'2',iii:'3'})[v]+' ';}).replace(/ /g,'');}
  function Engine(data){
    if(!data||data.schema!==1||!Array.isArray(data.rows)||!Array.isArray(data.books)||!['kjv','web'].includes(data.translation))throw new Error('The scripture index is not valid.');
    this.data=data; this.aliases=new Map();this.index=new Map();this.normal=[];
    data.books.forEach((b,i)=>b.aliases.forEach(a=>this.aliases.set(bookKey(a),i)));
    data.rows.forEach((r,i)=>{
      if(!Array.isArray(r)||r.length!==4||!data.books[r[0]]||!Number.isInteger(r[1])||!Number.isInteger(r[2])||typeof r[3]!=='string'||!/[A-Za-z]/.test(r[3]))throw new Error('The scripture index contains an invalid verse.');
      const text=normalize(r[3]);this.normal.push(' '+text+' ');
      new Set(text.split(' ')).forEach(word=>{if(!this.index.has(word))this.index.set(word,[]);this.index.get(word).push(i);});
    });
  }
  Engine.prototype.reference=function(query){
    const whole=this.aliases.get(bookKey(query));if(whole!==undefined)return {book:whole,chapter:null,start:null,end:null};
    const m=query.trim().match(/^(.+?)\s*(\d+)\s*(?:[:.]\s*(\d+)\s*(?:[-\u2013\u2014]\s*(\d+))?)?$/);
    if(!m)return null;
    const book=this.aliases.get(bookKey(m[1]));if(book===undefined)return null;
    const chapter=Number(m[2]),start=m[3]===undefined?null:Number(m[3]),end=m[4]===undefined?start:Number(m[4]);
    const meta=this.data.books[book];
    if(chapter<1||chapter>meta.chapters)throw new Error(meta.name+' has '+meta.chapters+' chapters. Check the reference.');
    if(start!==null&&(start<1||end<start||end>200))throw new Error('Enter a valid verse or verse range, for example John 3:16-18.');
    return {book,chapter,start,end};
  };
  Engine.prototype.search=function(options){
    const q=String(options.query||'').trim();
    if(!q)throw new Error('Enter a word, phrase or Bible reference.');
    if(q.length>200)throw new Error('Please use a search of 200 characters or fewer.');
    const mode=['all','any','phrase'].includes(options.mode)?options.mode:'all';
    const sort=options.sort==='bible'?'bible':'relevance';
    const scope=options.scope||'all';let selected=null;
    if(!['all','ot','nt'].includes(scope)){selected=this.data.books.findIndex(b=>b.slug===scope);if(selected<0)throw new Error('Choose a valid book filter.');}
    const ref=this.reference(q);let units=[],words=[],matches=[];
    const allow=(r)=>scope==='all'||(selected===null?this.data.books[r[0]].testament===scope:r[0]===selected);
    if(ref){
      this.data.rows.forEach((r,i)=>{if(allow(r)&&r[0]===ref.book&&(ref.chapter===null||r[1]===ref.chapter)&&(ref.start===null||(r[2]>=ref.start&&r[2]<=ref.end)))matches.push({i,score:0});});
    }else{
      const quoted=q.replace(/[\u201c\u201d]/g,'"');
      if((quoted.match(/"/g)||[]).length%2)throw new Error('Close the quotation marks around your phrase.');
      if(mode==='phrase'){const phrase=normalize(quoted);if(phrase)units=[phrase];}
      else{const re=/"([^"]+)"|(\S+)/g;let m;while((m=re.exec(quoted))){const unit=normalize(m[1]||m[2]);if(unit)units.push(unit);}}
      words=Array.from(new Set(units.flatMap(u=>u.split(' '))));
      if(!words.length)throw new Error('Enter at least one word, or a reference such as John 3:16.');
      if(words.length>20)throw new Error('Please use 20 search words or fewer.');
      let candidates;
      if(mode==='any'){
        const union=new Set();words.forEach(w=>(this.index.get(w)||[]).forEach(i=>union.add(i)));candidates=Array.from(union);
      }else{
        const lists=words.map(w=>this.index.get(w)||[]).sort((a,b)=>a.length-b.length);candidates=lists[0]||[];
      }
      const exact=' '+normalize(quoted)+' ';
      for(const i of candidates){
        const r=this.data.rows[i];if(!allow(r))continue;
        const text=this.normal[i];const hits=units.reduce((n,u)=>n+(text.includes(' '+u+' ')?1:0),0);
        if((mode==='any'&&hits>0)||(mode!=='any'&&hits===units.length)){
          matches.push({i,score:hits*100+(text.includes(exact)?50:0)+Math.min(10,400/text.length)});
        }
      }
    }
    matches.sort((a,b)=>(!ref&&sort==='relevance'?b.score-a.score:0)||a.i-b.i);
    const pageSize=20,total=matches.length,totalPages=Math.max(1,Math.ceil(total/pageSize));
    const requested=Number(options.page);const page=Math.min(totalPages,Math.max(1,Number.isFinite(requested)?Math.floor(requested):1));
    const results=matches.slice((page-1)*pageSize,page*pageSize).map(({i})=>{
      const r=this.data.rows[i],b=this.data.books[r[0]],translation=this.data.translation;
      return {book:b.name,slug:b.slug,chapter:r[1],verse:r[2],text:r[3],translation,reference:b.name+' '+r[1]+':'+r[2],href:b.slug+'-read'+(r[1]===1?'':'-'+r[1])+'.html?translation='+translation+'#verse-'+translation+'-'+r[2]};
    });
    return {query:q,kind:ref?'reference':'keywords',translation:this.data.translation,page,pageSize,total,totalPages,words:ref?[]:words,results,
      emptyHint:ref?'No numbered verse matches this reference in the selected translation and book filter. Check the filter or try the other translation; some verse numbering differs.':'No verses contain the requested words with these filters. Try fewer words, Any word, another book filter or the other translation.'};
  };
  const api={Engine,normalize,bookKey};root.IWScriptureSearch=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
