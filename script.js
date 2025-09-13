const grid=document.getElementById('grid'),
      q=document.getElementById('q'),
      categories=document.getElementById('categories');
const cats=[...new Set(tools.map(t=>t.category))].sort();
let activeCategory=null;

function renderCategoryPills(){
  categories.innerHTML='';
  const all=document.createElement('button');
  all.className='pill'+(activeCategory===null?' active':''); all.textContent='All';
  all.onclick=()=>{activeCategory=null;renderCategoryPills();renderTools();};
  categories.appendChild(all);
  cats.forEach(c=>{
    const b=document.createElement('button');
    b.className='pill'+(activeCategory===c?' active':'');
    b.textContent=c;
    b.onclick=()=>{activeCategory=(activeCategory===c?null:c);renderCategoryPills();renderTools();};
    categories.appendChild(b);
  });
}

function renderTools(filterText=''){
  const ft=filterText.trim().toLowerCase(); grid.innerHTML='';
  const matches=tools.filter(t=>{
    if(activeCategory && t.category!==activeCategory) return false;
    if(!ft) return true;
    return [t.name,t.short,t.tags.join(' '),t.desc].join(' ').toLowerCase().includes(ft);
  });
  if(matches.length===0){
    grid.innerHTML='<div style="color:var(--muted)">No tools found.</div>';
    return;
  }
  matches.forEach(t=>{
    const c=document.createElement('article');
    c.className='card'; c.tabIndex=0; c.setAttribute('role','button');

    c.innerHTML=`
      <img src="${t.logo}" alt="${t.name} Logo">
      <div class="category-badge">${t.category}</div>
      <h3>${escapeHtml(t.name)}</h3>
      <p>${escapeHtml(t.short)}</p>
      <div class="price-badge">${t.price}</div>
    `;

    const tagsWrap=document.createElement('div'); tagsWrap.className='tags';
    t.tags.forEach(tag=>{
      const sp=document.createElement('span'); sp.className='tag'; sp.textContent=tag;
      sp.onclick=e=>{e.stopPropagation(); q.value=tag; onSearch();};
      tagsWrap.appendChild(sp);
    });
    c.appendChild(tagsWrap);

    c.onclick=()=>openModal(t);
    c.onkeypress=e=>{if(e.key==='Enter'||e.key===' ')openModal(t)};
    grid.appendChild(c);
  });
}

function openModal(t){
  document.getElementById('modalBackdrop').style.display='grid';
  document.getElementById('mdTitle').textContent=t.name;
  document.getElementById('mdMeta').textContent=t.short+' · '+t.category+' · '+t.price;
  document.getElementById('mdDesc').textContent=t.desc;
  const mdTags=document.getElementById('mdTags'); mdTags.innerHTML='';
  t.tags.forEach(tag=>{
    const s=document.createElement('span'); s.className='tag'; s.textContent=tag; mdTags.appendChild(s);
  });
  document.getElementById('mdOpen').href=t.url;
  document.getElementById('mdCopy').onclick=()=>{navigator.clipboard.writeText(t.url).then(()=>alert('Link copied'))};
}

function closeModal(){document.getElementById('modalBackdrop').style.display='none';}
document.getElementById('closeModal').onclick=closeModal;
document.getElementById('modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')closeModal();}

let debounceTimer;
function onSearch(){
  clearTimeout(debounceTimer);
  debounceTimer=setTimeout(()=>renderTools(q.value),120);
}
q.addEventListener('input',onSearch);

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

renderCategoryPills();
renderTools();

document.getElementById('menuBtn').onclick=()=>{
  document.getElementById('mainNav').classList.toggle('show');
};
// Preloader hide after page load
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.classList.add("hide");
    setTimeout(() => preloader.remove(), 600); // remove from DOM after fadeout
  }
});

/* ================================
   NEW: Featured Tools Carousel Logic
   ================================ */
(function(){
  const carousel = document.getElementById('carousel');
  if (!carousel) return; // if section not on page

  // Pick featured tools (first 5 for now)
  const featured = tools.slice(0,5);

  // Build track
  const track = document.createElement('div');
  track.className = 'carousel-track';
  carousel.appendChild(track);

  featured.forEach(t=>{
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `
      <img src="${t.logo}" alt="${t.name} Logo">
      <h3>${escapeHtml(t.name)}</h3>
      <p>${escapeHtml(t.short)}</p>
    `;
    item.onclick = ()=>openModal(t);
    track.appendChild(item);
  });

  let currentIndex = 0;
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  function updateCarousel(){
    const itemWidth = track.querySelector('.carousel-item').offsetWidth + 14; // width + gap
    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  }

  prevBtn.addEventListener('click', ()=>{
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });
  nextBtn.addEventListener('click', ()=>{
    currentIndex = Math.min(featured.length - 1, currentIndex + 1);
    updateCarousel();
  });

  // Auto-slide every 5s
  setInterval(()=>{
    currentIndex = (currentIndex + 1) % featured.length;
    updateCarousel();
  }, 5000);

})();
  