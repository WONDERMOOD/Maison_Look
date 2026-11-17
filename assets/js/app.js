(() => {
'use strict';
const D=window.MAISON; if(!D) return;
const $=(q,root=document)=>root.querySelector(q); const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
const img=(file)=>`./assets/images/${file}`;
const esc=(val)=>String(val ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getStore=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v===null?fallback:v}catch{return fallback}};
const setStore=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val));return true}catch{toast('브라우저 저장 공간이 부족하거나 저장이 제한되어 있습니다.');return false}};
const favorites=new Set(getStore('maison_favorites_v1',[]).filter(id=>Number.isInteger(id)&&id>=1&&id<=16));
let lookFilter='all',lookQuery='',seasonFilter='all',termFilter='전체',termQuery='',comparisonIndex=0,quizIndex=0,quizScore=0,quizAnswered=false,toastTimer;
let diary=getStore('maison_diary_v1',[]);if(!Array.isArray(diary))diary=[];
let capsule=new Set(getStore('maison_capsule_v1',[]).filter(Number.isInteger));
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function getLook(id){return D.looks.find(l=>l.id===Number(id))}
function renderCounts(){$('#savedCount').textContent=String(favorites.size)}
function renderLooks(){
 const items=D.looks.filter(l=>{
  const filterOk=lookFilter==='all'||(lookFilter==='favorites'?favorites.has(l.id):l.type===lookFilter);
  const seasonOk=seasonFilter==='all'||l.season===seasonFilter||l.season==='all';
  const txt=[l.title,l.en,l.type,l.summary,...l.tags,...l.items].join(' ').toLocaleLowerCase();
  return filterOk&&seasonOk&&txt.includes(lookQuery.toLocaleLowerCase());
 });
 $('#lookResultCount').textContent=`${items.length} LOOK${items.length!==1?'S':''}`;
 $('#lookEmpty').hidden=items.length!==0;
 $('#lookGrid').innerHTML=items.map(l=>`<article class="look-card"><div class="look-card-visual" data-open-look="${l.id}" tabindex="0" role="button" aria-label="${esc(l.title)} 상세 보기"><img loading="lazy" decoding="async" src="${img(l.image)}" alt="${esc(l.title)}: ${esc(l.summary)}"><span class="look-card-num">LOOK ${String(l.id).padStart(2,'0')}</span><span class="look-card-tag">${esc(l.tags.slice(0,2).join(' · '))}</span><button type="button" class="favorite-btn ${favorites.has(l.id)?'is-saved':''}" data-save-look="${l.id}" aria-label="${esc(l.title)} ${favorites.has(l.id)?'즐겨찾기 해제':'즐겨찾기 추가'}" aria-pressed="${favorites.has(l.id)}">${favorites.has(l.id)?'♥':'♡'}</button></div><div class="look-card-meta"><div><h3>${esc(l.title)}</h3><p>${esc(l.en)}</p></div><button type="button" class="card-arrow" data-open-look="${l.id}" aria-label="${esc(l.title)} 상세 보기">↗</button></div></article>`).join('');
 renderCounts();renderSaved();
}
function updateFilter(filter){lookFilter=filter;$$('.filter-chip').forEach(b=>{const on=b.dataset.filter===filter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});renderLooks()}
$('#lookFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b)updateFilter(b.dataset.filter)});
$('#lookSearch').addEventListener('input',e=>{lookQuery=e.target.value.trim();renderLooks()});
$('#seasonFilter').addEventListener('change',e=>{seasonFilter=e.target.value;renderLooks()});
$('#savedQuick').addEventListener('click',()=>updateFilter('favorites'));
function toggleFavorite(id){const l=getLook(id);if(!l)return;if(favorites.has(l.id))favorites.delete(l.id);else favorites.add(l.id);setStore('maison_favorites_v1',[...favorites]);renderLooks();toast(favorites.has(l.id)?'룩북에 저장했습니다.':'저장한 룩에서 제외했습니다.');if($('#lookDialog').open)refreshDialogFavorite(l.id)}
function openDialog(d){if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');document.body.classList.add('modal-open')}
function closeDialog(d){if(d.open){if(typeof d.close==='function')d.close();else d.removeAttribute('open')}document.body.classList.remove('modal-open')}
function refreshDialogFavorite(id){const b=$('#dialogFavorite');if(!b)return;b.textContent=favorites.has(id)?'♥ 저장됨':'♡ 내 룩북에 저장';b.dataset.saveLook=String(id)}
function showLook(id){const l=getLook(id);if(!l)return;
 $('#lookDialogContent').innerHTML=`<div class="look-dialog-content"><img src="${img(l.image)}" alt="${esc(l.title)} 패션 룩북 확대 화보"><div class="dialog-info"><span>THE EDIT / LOOK ${String(l.id).padStart(2,'0')}</span><h2 id="dialogTitle">${esc(l.title)}</h2><h3>${esc(l.en)}</h3><p>${esc(l.summary)}</p><strong>THE OUTFIT FORMULA</strong><ul>${l.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><strong>COLOR NOTES</strong><div class="dialog-colors">${l.palette.map(c=>`<span style="background:${c}" title="${c}"></span>`).join('')}</div><div class="tip-note"><b>STYLIST NOTE</b><br>${esc(l.tip)}</div><button type="button" class="btn btn-dark" id="dialogFavorite" data-save-look="${l.id}" style="margin-top:28px">${favorites.has(l.id)?'♥ 저장됨':'♡ 내 룩북에 저장'}</button></div></div>`;
 openDialog($('#lookDialog'));
}
$('#lookGrid').addEventListener('click',e=>{const fav=e.target.closest('[data-save-look]');if(fav){e.stopPropagation();toggleFavorite(fav.dataset.saveLook);return}const open=e.target.closest('[data-open-look]');if(open)showLook(open.dataset.openLook)});
$('#lookGrid').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-open-look]')){e.preventDefault();showLook(e.target.dataset.openLook)}});
$('#lookDialog').addEventListener('click',e=>{const fav=e.target.closest('[data-save-look]');if(fav)toggleFavorite(fav.dataset.saveLook)});
$('#closeLook').addEventListener('click',()=>closeDialog($('#lookDialog')));
$('#closeLesson').addEventListener('click',()=>closeDialog($('#lessonDialog')));
$('#closeQuiz').addEventListener('click',()=>closeDialog($('#quizDialog')));
[$('#lookDialog'),$('#lessonDialog'),$('#quizDialog')].forEach(dialog=>{dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog(dialog)})});
function renderSaved(){const saved=D.looks.filter(l=>favorites.has(l.id));$('#savedLooks').innerHTML=saved.length?saved.slice(0,8).map(l=>`<button type="button" class="saved-thumb" data-open-look="${l.id}"><img loading="lazy" src="${img(l.image)}" alt="${esc(l.title)}"><span>${esc(l.title)}</span></button>`).join(''):'<div class="saved-empty">아직 저장한 화보가 없어요.<br>마음에 드는 룩의 ♡를 눌러보세요.</div>'}
$('#savedLooks').addEventListener('click',e=>{const b=e.target.closest('[data-open-look]');if(b)showLook(b.dataset.openLook)});
/* Comparison: a visual analogy, explicitly NOT the same person before/after. */
const range=$('#compareSlider');
function setComparisonPosition(value){const x=Math.max(0,Math.min(100,Number(value)));$('#compareOverlay').style.clipPath=`inset(0 ${100-x}% 0 0)`;$('#compareLine').style.left=x+'%';range.value=x;range.setAttribute('aria-valuetext',x===50?'반반':`B 화보 ${x}퍼센트 노출`)}
function showComparison(index){comparisonIndex=index;const c=D.comparisons[index];if(!c)return;const before=getLook(c.before),after=getLook(c.after);
 $('#compareBefore').src=img(before.image);$('#compareBefore').alt=c.labelA+' 스타일 사진';
 $('#compareAfter').src=img(after.image);$('#compareAfter').alt=c.labelB+' 스타일 사진';
 $('#compareTitle').textContent=c.title;$('#compareSubtitle').textContent=c.subtitle;
 $('#compareLabelA').textContent='A / '+c.labelA;$('#compareLabelB').textContent='B / '+c.labelB;
 $('#comparePoints').innerHTML=c.points.map(x=>`<li>${esc(x)}</li>`).join('');
 $$('.compare-tab').forEach((b,i)=>{const current=i===index;b.classList.toggle('active',current);b.setAttribute('aria-selected',String(current));b.tabIndex=current?0:-1});setComparisonPosition(50)
}
$('#compareTabs').innerHTML=D.comparisons.map((c,i)=>`<button class="compare-tab" role="tab" aria-selected="${i===0}" data-comparison="${i}">${String(i+1).padStart(2,'0')} ${esc(c.title)}</button>`).join('');
$('#compareTabs').addEventListener('click',e=>{const b=e.target.closest('[data-comparison]');if(b)showComparison(Number(b.dataset.comparison))});
$('#compareTabs').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft'].includes(e.key))return;e.preventDefault();const next=(comparisonIndex+(e.key==='ArrowRight'?1:-1)+D.comparisons.length)%D.comparisons.length;showComparison(next);$$('.compare-tab')[next].focus()});
range.addEventListener('input',e=>setComparisonPosition(e.target.value));
$$('[data-compare-value]').forEach(b=>b.addEventListener('click',()=>setComparisonPosition(b.dataset.compareValue)));
/* Academy */
$('#lessonGrid').innerHTML=D.lessons.map(l=>`<button class="lesson-card" data-lesson="${l.id}"><div class="lesson-top"><span>LESSON ${l.no}</span><span class="level">${esc(l.level)} / ${l.minutes} MIN</span></div><h3>${esc(l.title)}</h3><p>${esc(l.lead)}</p><div class="lesson-bottom"><span>${esc(l.category)} / READ LESSON</span><b>↗</b></div></button>`).join('');
function showLesson(id){const l=D.lessons.find(x=>x.id===id);if(!l)return;
 $('#lessonDialogContent').innerHTML=`<div class="lesson-dialog-content"><span>ACADEMY / LESSON ${l.no} · ${esc(l.category)} · ${l.minutes} MIN</span><h2 id="lessonDialogTitle">${esc(l.title)}</h2><p class="lead">${esc(l.lead)}</p><ol>${l.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ol><div class="lesson-exercise"><strong>TRY IT YOURSELF / 실습 노트</strong>${esc(l.exercise)}</div><p style="font-size:11px;color:var(--muted);line-height:1.8;margin-top:23px">팁은 다양한 연출을 실험하기 위한 참고 자료입니다. 개인의 편안함과 취향을 우선하세요.</p></div>`;openDialog($('#lessonDialog'))}
$('#lessonGrid').addEventListener('click',e=>{const b=e.target.closest('[data-lesson]');if(b)showLesson(b.dataset.lesson)});
/* Quiz */
function startQuiz(){quizIndex=0;quizScore=0;quizAnswered=false;renderQuiz();openDialog($('#quizDialog'))}
function renderQuiz(){const q=D.quizzes[quizIndex];if(!q){$('#quizContent').innerHTML=`<div class="quiz-dialog-content"><div class="quiz-result"><span class="quiz-overline">COMPLETED — PERSONAL LEARNING</span><div class="score">${quizScore}<small style="font-size:32px">/8</small></div><h2 id="quizTitle">Well studied.</h2><p>${quizScore>=6?'옷차림의 기본 언어를 잘 이해하고 계시네요.':'틀린 문제를 다시 살펴보고 실제 코디에 적용해보세요.'}<br>스타일은 점수보다 경험을 통해 더 깊어집니다.</p><button class="btn btn-dark" id="quizRestart">다시 도전하기 ↗</button></div></div>`;return}
 $('#quizContent').innerHTML=`<div class="quiz-dialog-content"><span class="quiz-overline">STYLE KNOWLEDGE CHECK</span><div class="quiz-progress">${D.quizzes.map((_,i)=>`<span class="${i<=quizIndex?'done':''}"></span>`).join('')}</div><span class="quiz-overline">QUESTION ${String(quizIndex+1).padStart(2,'0')} / 08</span><h2 id="quizTitle" class="quiz-question">${esc(q.q)}</h2><div class="quiz-options">${q.opts.map((opt,i)=>`<button type="button" class="quiz-option" data-quiz-answer="${i}">${String.fromCharCode(65+i)}. ${esc(opt)}</button>`).join('')}</div><div id="quizFeedback"></div><div class="quiz-footer"><span id="quizStatus">답을 선택하세요.</span><button type="button" class="btn btn-dark" id="nextQuestion" disabled>${quizIndex===7?'결과 확인':'다음 문제'} ↗</button></div></div>`;
 quizAnswered=false;
}
$('#startQuiz').addEventListener('click',startQuiz);
$('#quizContent').addEventListener('click',e=>{
 if(e.target.closest('#quizRestart')){quizIndex=0;quizScore=0;renderQuiz();return}
 if(e.target.closest('#nextQuestion')&&quizAnswered){quizIndex++;renderQuiz();return}
 const btn=e.target.closest('[data-quiz-answer]');if(!btn||quizAnswered)return;
 quizAnswered=true;const selected=Number(btn.dataset.quizAnswer),q=D.quizzes[quizIndex];if(selected===q.answer)quizScore++;
 $$('.quiz-option').forEach((b,i)=>{b.disabled=true;b.classList.toggle('correct',i===q.answer);b.classList.toggle('incorrect',i===selected&&i!==q.answer)});
 $('#quizFeedback').innerHTML=`<div class="quiz-feedback"><strong>${selected===q.answer?'정답입니다!':'정답을 확인해보세요.'}</strong><br>${esc(q.explain)}</div>`;
 $('#quizStatus').textContent=`현재 ${quizScore}개 정답`;$('#nextQuestion').disabled=false;
});
/* Encyclopedia */
const termCategories=['전체',...new Set(D.glossary.map(g=>g[1]))];
$('#termChips').innerHTML=termCategories.map(t=>`<button type="button" class="term-chip ${t==='전체'?'active':''}" data-term-filter="${esc(t)}" aria-pressed="${t==='전체'}">${esc(t)}</button>`).join('');
function renderDictionary(){const items=D.glossary.filter(g=>(termFilter==='전체'||g[1]===termFilter)&&g.join(' ').toLowerCase().includes(termQuery.toLowerCase()));
 $('#dictionaryGrid').innerHTML=items.length?items.map(g=>`<article class="term-card"><span>${esc(g[1])}</span><h4>${esc(g[0])}</h4><p>${esc(g[2])}</p></article>`).join(''):'<div class="empty-state">검색 결과가 없습니다.</div>';
 $('#dictionaryCount').textContent=`${items.length} TERMS · ${D.glossary.length} TOTAL`;
 $$('.term-chip').forEach(b=>{const on=b.dataset.termFilter===termFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
}
$('#termChips').addEventListener('click',e=>{const b=e.target.closest('[data-term-filter]');if(b){termFilter=b.dataset.termFilter;renderDictionary()}});
$$('[data-term]').forEach(b=>b.addEventListener('click',()=>{termFilter=b.dataset.term;termQuery='';$('#termSearch').value='';renderDictionary();$('#termSearch').scrollIntoView({behavior:'smooth',block:'center'})}));
$('#termSearch').addEventListener('input',e=>{termQuery=e.target.value.trim();renderDictionary()});
$('#resetTerms').addEventListener('click',()=>{termFilter='전체';termQuery='';$('#termSearch').value='';renderDictionary()});
/* Color palettes */
let paletteIndex=0;
$('#paletteChoices').innerHTML=D.palettes.map((p,i)=>`<button type="button" class="palette-choice ${i===0?'active':''}" data-palette="${i}" aria-pressed="${i===0}">${esc(p.name)}</button>`).join('');
function renderPalette(i){paletteIndex=i;const p=D.palettes[i];$('#paletteName').textContent=p.name;$('#paletteDesc').textContent=p.desc;
 $('#paletteSwatches').innerHTML=p.colors.map((c,j)=>`<button type="button" class="swatch" style="background:${c}" data-hex="${c}" aria-label="색상 ${c} 복사"><span style="color:${j<2?'#272321':'#fffdfa'}">${c}</span></button>`).join('');
 $$('.palette-choice').forEach((b,j)=>{const on=j===i;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
}
$('#paletteChoices').addEventListener('click',e=>{const b=e.target.closest('[data-palette]');if(b)renderPalette(Number(b.dataset.palette))});
$('#paletteSwatches').addEventListener('click',async e=>{const b=e.target.closest('[data-hex]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.hex);toast(b.dataset.hex+' 색상 코드가 복사되었습니다.')}catch{toast('색상 코드: '+b.dataset.hex+' (복사가 차단된 환경입니다.)')}});
/* Outfit studio */
const outfitNotes={daily:'걷기 편한 신발과 관리하기 쉬운 소재를 우선해보세요.',work:'조직의 드레스 코드를 확인하고 앉았을 때 편안한 핏을 고르세요.',date:'내가 자연스럽게 움직일 수 있는 착장이 가장 자신감을 줍니다.',event:'초대장의 격식과 실내외 이동을 먼저 확인하세요.',travel:'기온 차와 오래 걷는 일정을 고려해 레이어를 조절하세요.'};
const weatherNotes={mild:'가벼운 셔츠·얇은 니트로 시작하세요.',cool:'니트와 트렌치 같은 겉옷을 더하고 보온을 확인하세요.',warm:'시원한 원단과 편안한 착용감을 우선하세요.',rain:'빗물에 약한 소재와 미끄러운 신발은 피하세요.'};
$('#outfitForm').addEventListener('submit',e=>{e.preventDefault();const mood=$('#moodSelect').value,occasion=$('#occasionSelect').value,weather=$('#weatherSelect').value;
 const options=D.looks.filter(l=>l.type===mood);const offset=['daily','work','date','event','travel'].indexOf(occasion)+['mild','cool','warm','rain'].indexOf(weather);let selected=options[offset%options.length] || D.looks[0];
 const recommendations=selected.items.slice();if(weather==='rain')recommendations.push('미끄럽지 않은 신발 / 가벼운 우산');if(weather==='cool')recommendations.push('보온용 스카프 또는 이너');if(weather==='warm')recommendations.push('통기성 좋은 소재 선택');
 $('#outfitResult').innerHTML=`<div class="result-active"><img src="${img(selected.image)}" alt="${esc(selected.title)} 참고 화보"><div class="result-active-text"><span>YOUR CURATED IDEA / #${String(selected.id).padStart(2,'0')}</span><h3>${esc(selected.title)}</h3><p>${esc(selected.summary)}</p><ul>${recommendations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>${esc(outfitNotes[occasion])} ${esc(weatherNotes[weather])}</p><button class="text-link" type="button" data-open-look="${selected.id}">화보 상세 보기 ↗</button></div></div>`;
 toast('선택한 무드에 맞는 코디 아이디어를 골랐습니다.');
});
$('#outfitResult').addEventListener('click',e=>{const b=e.target.closest('[data-open-look]');if(b)showLook(b.dataset.openLook)});
/* Capsule wardrobe — a checklist, not a normative shopping list */
function renderCapsule(){
 $('#capsuleChecklist').innerHTML=D.capsule.map((c,i)=>`<label><input type="checkbox" data-capsule="${i}" ${capsule.has(i)?'checked':''}><span>${esc(c[1])} <small>· ${esc(c[0])}</small></span></label>`).join('');
 $('#capsuleCount').textContent=`${capsule.size} / ${D.capsule.length}`;$('#capsuleFill').style.width=`${capsule.size/D.capsule.length*100}%`;
}
$('#capsuleChecklist').addEventListener('change',e=>{const i=Number(e.target.dataset.capsule);if(!Number.isInteger(i))return;if(e.target.checked)capsule.add(i);else capsule.delete(i);setStore('maison_capsule_v1',[...capsule]);renderCapsule()});
/* Local-only diary: resize user photos in the browser; no uploads to any server. */
$('#diaryDate').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const journalPhoto=$('#journalPhoto'),photoPreview=$('#photoPreview');let selectedPhoto=null;
journalPhoto.addEventListener('change',()=>{const file=journalPhoto.files?.[0];if(!file){selectedPhoto=null;photoPreview.hidden=true;return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){toast('8MB 이하의 JPEG, PNG, WebP 사진만 사용할 수 있습니다.');journalPhoto.value='';selectedPhoto=null;return}selectedPhoto=file;const url=URL.createObjectURL(file);photoPreview.onload=()=>URL.revokeObjectURL(url);photoPreview.src=url;photoPreview.hidden=false});
function compressPhoto(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),image=new Image();image.onload=()=>{try{const maxWidth=550,maxHeight=730,scale=Math.min(1,maxWidth/image.width,maxHeight/image.height);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');ctx.fillStyle='#f2efe8';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);const result=canvas.toDataURL('image/webp',.74);resolve(result)}catch(err){reject(err)}finally{URL.revokeObjectURL(url)}};image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Invalid image'))};image.src=url})}
function renderDiary(){if(!diary.length){$('#diaryEntries').innerHTML='<div class="empty-diary">아직 작성한 기록이 없습니다.<br>오늘의 스타일을 첫 페이지로 남겨보세요.</div>';return}
 $('#diaryEntries').innerHTML=diary.slice().reverse().map(it=>`<article class="diary-entry ${it.photo?'':'no-photo'}">${it.photo?`<img loading="lazy" src="${it.photo}" alt="${esc(it.title)} 코디 사진">`:'<div class="diary-placeholder">✧</div>'}<button type="button" class="diary-delete" data-remove-diary="${esc(it.id)}" aria-label="${esc(it.title)} 기록 삭제">✕</button><div class="diary-entry-body"><span>${esc(it.date)} · ${esc(it.mood)}</span><h4>${esc(it.title)}</h4><p>${esc(it.note)}</p></div></article>`).join('');
}
$('#journalForm').addEventListener('submit',async e=>{e.preventDefault();const title=$('#diaryTitle').value.trim();if(!title){toast('코디 이름을 입력하세요.');return}if(diary.length>=25){toast('저장 한도는 25개입니다. 백업 후 기존 기록을 정리해 주세요.');return}
 const submit=$('#journalForm button[type=submit]');submit.disabled=true;
 try{const photo=selectedPhoto?await compressPhoto(selectedPhoto):'';if(photo.length>550000){toast('사진이 너무 큽니다. 더 작은 사진을 선택하세요.');return}
 const entry={id:Date.now()+'-'+Math.random().toString(36).slice(2,7),date:$('#diaryDate').value,mood:$('#diaryMood').value,title:title.slice(0,50),note:$('#diaryNote').value.slice(0,600),photo};
 const next=[...diary,entry];if(!setStore('maison_diary_v1',next))return;diary=next;renderDiary();$('#journalForm').reset();selectedPhoto=null;photoPreview.hidden=true;photoPreview.removeAttribute('src');journalPhoto.value='';$('#diaryDate').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);toast('오늘의 코디 기록을 저장했습니다.');
 }catch(err){toast('사진을 처리하지 못했습니다. 다른 이미지로 시도해 주세요.')}finally{submit.disabled=false}
});
$('#diaryEntries').addEventListener('click',e=>{const btn=e.target.closest('[data-remove-diary]');if(!btn)return;if(!confirm('이 코디 기록을 삭제할까요? 복원하려면 백업 파일이 필요합니다.'))return;const updated=diary.filter(x=>x.id!==btn.dataset.removeDiary);if(setStore('maison_diary_v1',updated)){diary=updated;renderDiary();toast('기록을 삭제했습니다.')}});
$('#exportJournal').addEventListener('click',()=>{const payload={application:'MAISON_LOOK',version:1,exportedAt:new Date().toISOString(),diary:diary,favorites:[...favorites],capsule:[...capsule]};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='MAISON_LOOK_backup_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('룩북 백업 JSON 파일을 저장했습니다.')});
$('#importJournal').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>8*1024*1024){toast('8MB 이하의 백업 파일만 가져올 수 있습니다.');e.target.value='';return}
 try{const data=JSON.parse(await file.text());if(data.application!=='MAISON_LOOK'||data.version!==1||!Array.isArray(data.diary))throw Error('wrong format');const cleaned=data.diary.slice(0,25).map(x=>({id:String(x.id||Date.now()).slice(0,50),date:String(x.date||'').slice(0,10),mood:String(x.mood||'기타').slice(0,20),title:String(x.title||'제목 없음').slice(0,50),note:String(x.note||'').slice(0,600),photo:typeof x.photo==='string'&&/^data:image\/(webp|jpeg|png);base64,[a-zA-Z0-9+/=]+$/.test(x.photo)&&x.photo.length<=550000?x.photo:''}));
 if(!confirm(`백업에서 ${cleaned.length}개 기록을 가져옵니다. 현재 기록과 즐겨찾기·옷장 체크가 교체됩니다. 진행할까요?`))return;
 const nextFav=Array.isArray(data.favorites)?data.favorites.filter(id=>Number.isInteger(id)&&id>=1&&id<=16):[];
 const nextCap=Array.isArray(data.capsule)?data.capsule.filter(id=>Number.isInteger(id)&&id>=0&&id<D.capsule.length):[];
 // Persist diary before replacing in-memory state. A quota error will leave the current UI unchanged.
 if(!setStore('maison_diary_v1',cleaned))return;
 diary=cleaned;setStore('maison_favorites_v1',nextFav);setStore('maison_capsule_v1',nextCap);favorites.clear();nextFav.forEach(x=>favorites.add(x));capsule=new Set(nextCap);renderDiary();renderCapsule();renderLooks();toast('백업 데이터를 가져왔습니다.');
 }catch(err){toast('올바른 MAISON LOOK 백업 파일이 아닙니다.')}finally{e.target.value=''}
});
/* Header accessibility */
$('#menuButton').addEventListener('click',()=>{const nav=$('#mobileNav'),open=nav.hidden;nav.hidden=!open;$('#menuButton').setAttribute('aria-expanded',String(open));$('#menuButton').setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기')});
$$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>{$('#mobileNav').hidden=true;$('#menuButton').setAttribute('aria-expanded','false')}));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#mobileNav').hidden=true;$('#menuButton').setAttribute('aria-expanded','false')}});
/* Initialization */
renderLooks();showComparison(0);renderDictionary();renderPalette(0);renderCapsule();renderDiary();
if('serviceWorker' in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{})})}
})();
