(function(){
  var yr=document.getElementById('yr');if(yr)yr.textContent=new Date().getFullYear();
  var embed=false;try{embed=window.top!==window}catch(e){embed=true}
  if(embed)document.documentElement.classList.add('embed');
  [].forEach.call(document.querySelectorAll('a[href^="#"]'),function(l){l.addEventListener('click',function(ev){
    var t=document.getElementById(l.getAttribute('href').slice(1));if(!t)return;ev.preventDefault();
    t.scrollIntoView({behavior:embed?'auto':'smooth',block:'start'})})});
  /* scroll-triggered reveals (IntersectionObserver fires on visibility, so it also works inside the Files viewer) */
  (function(){
    var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce||!('IntersectionObserver' in window))return;
    var groups=[
      ['.panel .num','rv rv-line'],
      ['.panel h2','rv rv-h'],
      ['#about>p,#about>h3,#contact>p,#education article,.projsec article','rv rv-card'],
      ['.chips li','rv rv-pop'],
      ['.contact li','rv rv-left'],
      ['.intro h1,.intro .lead,.intro .cta,.phrase','rv rv-up']
    ];
    var els=[];
    groups.forEach(function(g){[].forEach.call(document.querySelectorAll(g[0]),function(el,i){
      g[1].split(' ').forEach(function(c){el.classList.add(c)});
      var sib=el.parentNode?[].indexOf.call(el.parentNode.children,el):0;
      el.style.setProperty('--d',Math.min(sib%6,5)*0.08+'s');els.push(el)})});
    document.documentElement.classList.add('rvon');
    var io=new IntersectionObserver(function(en){en.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(el){io.observe(el)});
  })();
  var st=document.getElementById('stage');
  if(st&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    var tx=0,ty=0,cx=0,cy=0;
    window.addEventListener('pointermove',function(e){tx=e.clientX/innerWidth*2-1;ty=e.clientY/innerHeight*2-1});
    (function loop(){cx+=(tx-cx)*.07;cy+=(ty-cy)*.07;st.style.setProperty('--px',cx.toFixed(3));st.style.setProperty('--py',cy.toFixed(3));requestAnimationFrame(loop)})();
  }


  /* letter-by-letter headings */
  [].forEach.call(document.querySelectorAll('.panel h2'),function(h){
    var t=h.textContent;h.setAttribute('aria-label',t);h.innerHTML='';
    t.split('').forEach(function(c,i){var s=document.createElement('span');s.className='ch';s.setAttribute('aria-hidden','true');s.style.setProperty('--i',i);s.textContent=c;h.appendChild(s)})});
  var reduceM=matchMedia('(prefers-reduced-motion:reduce)').matches||(navigator.connection&&navigator.connection.saveData);
  /* ratio-driven motion: IntersectionObserver ratios set --r (0 to 1) as an element moves through the screen */
  (function(){
    if(reduceM||!('IntersectionObserver' in window))return;
    var th=[];for(var i=0;i<=40;i++)th.push(i/40);
    var rio=new IntersectionObserver(function(en){en.forEach(function(e){e.target.style.setProperty('--r',e.intersectionRatio.toFixed(3))})},{threshold:th});
    [].forEach.call(document.querySelectorAll('.show .screen,.projsec article'),function(el){rio.observe(el)});
    var hero=document.querySelector('.hero')||document.querySelector('.stage'),hio;
    if(hero){hio=new IntersectionObserver(function(en){en.forEach(function(e){document.documentElement.style.setProperty('--h',(1-e.intersectionRatio).toFixed(3))})},{threshold:th});hio.observe(hero)}
  })();
  /* project showcases: real screenshots played like a short video */
  (function(){
    var LIST=window.__PF_FRAMES||null;
    var DEF={fc:{p:'g',n:8},cb:{p:'c',n:8},hm:{p:'h',n:14}};
    function pad(i){return i<10?'0'+i:''+i}
    [].forEach.call(document.querySelectorAll('.show'),function(box){
      var key=box.getAttribute('data-p'),d=DEF[key],cv=box.querySelector('canvas'),ctx=cv.getContext('2d'),imgs=[],cur=-1,started=false;
      if(reduceM)return;
      function src(i){return LIST?LIST[key][i]:d.p+pad(i)+'.webp'}
      function draw(i,force){var im=imgs[i];if(!im||!im.complete||!im.naturalWidth)return;
        if(i===cur&&!force)return;cur=i;ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(im,0,0,cv.width,cv.height);box.classList.add('live')}
      function load(){if(started)return;started=true;
        for(var i=0;i<d.n;i++){(function(i){var im=new Image();imgs[i]=im;
          if(LIST&&window.fetch){fetch(src(i)).then(function(r){return r.blob()}).then(function(b){im.src=URL.createObjectURL(b);im.onload=function(){if(cur<0&&i===d.n-1)draw(i,true)}}).catch(function(){im.src=src(i)})}
          else{im.onload=function(){if(cur<0&&i===d.n-1)draw(i,true)};im.src=src(i)}})(i)}}
      var zoom=key==='hm'?7:8;
      if(embed){
        load();
        var vis=false,timer=null;
        function seq(){
          var st=[],i;
          for(i=0;i<zoom;i++)st.push([i,90]);
          if(key==='hm'){for(i=zoom;i<d.n;i++)st.push([i,1500]);st.push([d.n-1,1000])}else st.push([zoom-1,3200]);
          for(i=zoom-2;i>=0;i--)st.push([i,60]);
          var k=0;(function next(){if(!vis)return;var s=st[k];draw(s[0]);k=(k+1)%st.length;timer=setTimeout(next,s[1])})();
        }
        new IntersectionObserver(function(en){var v=en[0].intersectionRatio>.3;
          if(v&&!vis){vis=true;seq()}else if(!v&&vis){vis=false;clearTimeout(timer)}},{threshold:[0,.3,.6]}).observe(box.querySelector('.screen'));
        return;
      }
      /* normal page: frame follows scroll position */
      function frameAt(p){
        var z0=.1,z1=key==='hm'?.34:.42;
        if(p<z0)return 0;
        if(p<z1)return Math.round((p-z0)/(z1-z0)*(zoom-1));
        if(key!=='hm')return zoom-1;
        var q=Math.min(1,(p-z1)/(.86-z1));return zoom+Math.min(d.n-zoom-1,Math.floor(q*(d.n-zoom)))}
      function onScroll(){var r=box.getBoundingClientRect(),vh=innerHeight;
        if(r.top<vh*1.5&&r.bottom>-vh*.5)load();
        var p=Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height)));draw(frameAt(p))}
      addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();
    });
  })();
})();
