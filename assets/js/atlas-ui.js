/* MAISON LOOK v4 — interactive image-first encyclopedia (offline, no tracking). */
(()=>{'use strict';
const items=Array.isArray(window.MAISON_ATLAS)?window.MAISON_ATLAS:[];
const $=s=>document.querySelector(s), all=s=>Array.from(document.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const imagePath=i=>'./assets/images/'+i.image;
const groups={전체:()=>true,스커트:i=>i.group==='스커트',팬츠:i=>i.group==='팬츠',상의:i=>i.group==='상의'||i.group==='이너·상의','이너·상의':i=>i.group==='이너·상의',원피스:i=>i.group==='원피스',아우터:i=>i.group==='아우터',스타일링:i=>i.group==='스타일링',레그웨어:i=>i.group==='레그웨어'};
let group='전체',q='',lastTrigger=null;
const dialog=$('#atlasDialog'),count=$('#heroTermCount');
if(!dialog||!items.length)return;
const corpus=i=>[i.name,i.en,i.group,i.description,...i.aliases].join(' ').toLocaleLowerCase('ko');
$('#atlasTotal').textContent=String(items.length);
if(count)count.textContent=String(window.MAISON.glossary.length)+'+';
function render(){
 const matched=items.filter(i=>groups[group](i)&&corpus(i).includes(q.toLocaleLowerCase('ko')));
 $('#atlasResults').textContent=matched.length+' VISUAL GUIDES / '+items.length+' TOTAL';
 $('#atlasEmpty').hidden=matched.length!==0;
 $('#atlasGrid').innerHTML=matched.map((i,index)=>`<button type="button" class="atlas-card" data-atlas-key="${esc(i.id)}" aria-label="${esc(i.name)} 사진과 설명 자세히 보기"><span class="atlas-card-photo"><img src="${imagePath(i)}" alt="${esc(i.name)} ${i.photoType==='diagram'?'구조 형태 도해':'실사풍 의류 화보'}" loading="lazy" decoding="async"><span class="atlas-card-count">${String(items.indexOf(i)+1).padStart(2,'0')}</span></span><span class="atlas-card-meta"><span class="atlas-card-group">${esc(i.group)} ${i.photoType==='diagram'?'· 형태 도해':'· 고화질 화보'}</span><strong>${esc(i.name)}</strong><em>${esc(i.en)}</em><small>${esc(i.description)}</small><span class="atlas-card-link">VIEW THE DETAILS ↗</span></span></button>`).join('');
 all('.atlas-filter').forEach(b=>{const active=b.dataset.atlasGroup===group;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}
function related(term){return items.filter(i=>i.id!==term.id&&(i.group===term.group||term.aliases.some(a=>corpus(i).includes(a.toLowerCase())))).slice(0,3)}
function showTerm(id,trigger){const i=items.find(x=>x.id===id);if(!i)return;
 lastTrigger=trigger||document.activeElement;
 $('#atlasDialogContent').innerHTML=`<div class="atlas-modal-layout"><div class="atlas-modal-photo"><img src="${imagePath(i)}" alt="${esc(i.name)}의 ${i.photoType==='diagram'?'형태 도해':'패션 화보'}"><a class="atlas-full-image" href="${imagePath(i)}" target="_blank" rel="noopener" aria-label="${esc(i.name)} 원본 크기로 보기">원본 WebP 크게 보기 ↗</a><div class="atlas-modal-photo-caption">${i.photoType==='diagram'?'의류의 기본 형태를 설명하는 벡터 도해 · 실사 사진 아님':'AI로 제작한 실사풍 패션 이미지 · 가상 인물 · 고품질 WebP'}</div></div><div class="atlas-modal-info"><span class="atlas-modal-suptitle">FASHION ATLAS / ${esc(i.group.toUpperCase())}</span><h2 id="atlasDialogTitle">${esc(i.name)}</h2><span class="atlas-modal-en">${esc(i.en)}</span><p class="atlas-modal-lead">${esc(i.description)}</p>${i.imageCaveat?`<div class="atlas-accuracy-note"><strong>사진 대표성 안내</strong><p>${esc(i.imageCaveat)}</p></div>`:""}<h3>LOOK FOR THIS <span>어디를 봐야 할까요?</span></h3><ul class="atlas-feature-points">${i.features.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="atlas-modal-tip"><strong>✦ STYLIST'S NOTE</strong><p>${esc(i.tip)}</p></div><div class="atlas-modal-alias"><strong>함께 찾는 이름</strong><p>${esc(i.aliases.join(' · '))}</p></div><div class="atlas-related"><strong>비슷한 의류도 비교해보세요</strong><div>${related(i).map(r=>`<button type="button" data-atlas-related="${esc(r.id)}">${esc(r.name)} ↗</button>`).join('')}</div></div><a class="atlas-to-index" href="#dictionaryGrid" id="atlasBackToDictionary">전체 용어 사전 살펴보기 ↗</a></div></div>`;
 if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
 document.body.classList.add('modal-open');
 $('#closeAtlas').focus();
}
function close(){if(dialog.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}document.body.classList.remove('modal-open');if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true})}
$('#atlasFilters').addEventListener('click',e=>{const b=e.target.closest('[data-atlas-group]');if(b){group=b.dataset.atlasGroup;q=$('#atlasSearch').value.trim();render();}});
$('#atlasSearch').addEventListener('input',e=>{q=e.target.value.trim();render()});
$('#atlasClear').addEventListener('click',()=>{q='';group='전체';$('#atlasSearch').value='';render();$('#atlasSearch').focus()});
$('#atlasGrid').addEventListener('click',e=>{const b=e.target.closest('[data-atlas-key]');if(b)showTerm(b.dataset.atlasKey,b)});
all('.atlas-spotlight').forEach(b=>b.addEventListener('click',()=>showTerm(b.dataset.atlasKey,b)));
$('#atlasVersus').innerHTML=[
 {a:'term-001',b:'term-002',title:'주름의 반복 / 직선의 절제',desc:'플리츠와 H라인은 원단을 접는 방식과 퍼짐의 정도가 다릅니다.'},
 {a:'term-003',b:'term-004',title:'층층이 볼륨 / 감싸는 곡선',desc:'캉캉은 여러 층의 프릴, 튤립은 꽃잎처럼 겹치는 앞판을 관찰하세요.'},
 {a:'term-008',b:'term-017',title:'나팔 밑단 / 와이드 레그',desc:'플레어는 무릎 아래 퍼지고 와이드는 허벅지부터 넉넉하게 내려옵니다.'},
 {a:'term-009',b:'term-010',title:'민소매 상의 / 짧은 상의',desc:'나시는 소매 유무, 크롭은 옷의 기장을 가리키는 용어입니다.'},
 {a:'term-037',b:'term-045',title:'얇은 타이츠 / 불투명 타이츠',desc:'시어 타이츠는 피부가 비치고, 오페이크 타이츠는 비교적 비침이 적습니다.'},
 {a:'term-035',b:'term-038',title:'레깅스 / 팬티스타킹',desc:'레깅스는 발을 덮지 않는 경우가 많고, 팬티스타킹은 발끝까지 이어집니다.'}
].map(p=>{let a=items.find(i=>i.id===p.a),b=items.find(i=>i.id===p.b);return `<article class="atlas-versus-card"><div class="atlas-versus-photos"><button data-atlas-key="${a.id}" aria-label="${esc(a.name)} 상세 보기"><img loading="lazy" src="${imagePath(a)}" alt="${esc(a.name)} 예시"><span>${esc(a.name)}</span></button><span>VS</span><button data-atlas-key="${b.id}" aria-label="${esc(b.name)} 상세 보기"><img loading="lazy" src="${imagePath(b)}" alt="${esc(b.name)} 예시"><span>${esc(b.name)}</span></button></div><h4>${esc(p.title)}</h4><p>${esc(p.desc)}</p></article>`}).join('');
document.querySelector('.hosiery-focus')?.addEventListener('click',e=>{const b=e.target.closest('[data-hosiery-id]');if(b)showTerm(b.dataset.hosieryId,b)});
$('#atlasVersus').addEventListener('click',e=>{let b=e.target.closest('[data-atlas-key]');if(b)showTerm(b.dataset.atlasKey,b)});
$('#closeAtlas').addEventListener('click',close);
dialog.addEventListener('click',e=>{if(e.target===dialog)close();const b=e.target.closest('[data-atlas-related]');if(b)showTerm(b.dataset.atlasRelated,lastTrigger);if(e.target.closest('#atlasBackToDictionary'))close()});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true})});
// Enhance existing plain-text dictionary entries: a photo icon opens the matching atlas record.
const dictionary=$('#dictionaryGrid');
function applyDictionaryLinks(){
 dictionary.querySelectorAll('.term-card').forEach(card=>{
  const title=card.querySelector('h4')?.textContent?.trim();
  if(!title||card.querySelector('.atlas-inline-link'))return;
  const norm=x=>x.replace(/\s/g,'').toLowerCase();
  const match=items.find(i=>norm(i.name)===norm(title)||i.aliases.some(a=>norm(a)===norm(title)));
  if(!match)return;
  const btn=document.createElement('button');btn.type='button';btn.className='atlas-inline-link';btn.dataset.atlasKey=match.id;btn.textContent='사진 보기 ↗';btn.setAttribute('aria-label',title+' 사진과 스타일 설명 보기');card.appendChild(btn);
 });
}
dictionary.addEventListener('click',e=>{const b=e.target.closest('[data-atlas-key]');if(b)showTerm(b.dataset.atlasKey,b)});
const obs=new MutationObserver(applyDictionaryLinks);obs.observe(dictionary,{childList:true});
render();applyDictionaryLinks();
})();
