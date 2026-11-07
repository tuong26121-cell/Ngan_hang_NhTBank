import { chromium } from '/workspace/Ngan_hang_NhTBank/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const out='/workspace/Ngan_hang_NhTBank/docs/bang-chung/hau-kiem-ux-20261107';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--enable-precise-memory-info']});
const result={source:'e940a9c',environment:'Linux Chromium headless, production preview, no CPU/network throttling',audits:[],metrics:[],heap:[]};
for(const width of [390]) {
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();
 await page.addInitScript({path:'/tmp/nht-audit/node_modules/web-vitals/dist/web-vitals.iife.js'});
 await page.addInitScript(()=>{window.uxVitals={}; for(const name of ['LCP','CLS','INP']) window.webVitals['on'+name](m=>window.uxVitals[name]={value:m.value,rating:m.rating,entries:m.entries.length},{reportAllChanges:true});});
 await page.goto('http://127.0.0.1:4173');
 const audit=async(name)=>{if(width===390){
 await page.locator('.scan-camera-card > p').scrollIntoViewIfNeeded();
 const texts=await page.evaluate(()=>[...document.querySelectorAll('body *')].flatMap(e=>{const st=getComputedStyle(e);if(st.visibility==='hidden'||st.display==='none')return [];return [...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).flatMap(n=>{const range=document.createRange();range.selectNodeContents(n);return [...range.getClientRects()].filter(r=>r.width&&r.height).map(r=>({occluded:(()=>{const nav=document.querySelector('.sidebar');if(!nav||nav.contains(e))return false;const b=nav.getBoundingClientRect();return getComputedStyle(nav).position==='fixed'&&r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;})(),text:n.textContent.trim(),color:st.color,size:parseFloat(st.fontSize),weight:parseInt(st.fontWeight),x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height}));});}));
 fs.writeFileSync('/tmp/ux-'+name+'.json',JSON.stringify(texts));const hide=await page.addStyleTag({content:'* { -webkit-text-fill-color: transparent !important; text-shadow:none!important; }'});await page.screenshot({path:'/tmp/ux-'+name+'.png',fullPage:true});await hide.evaluate(e=>e.remove());}
 await page.addScriptTag({path:'/tmp/nht-audit/node_modules/axe-core/axe.min.js'});const a=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));result.audits.push({width,name,violations:a.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:a.incomplete.map(v=>({id:v.id,count:v.nodes.length,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),passes:a.passes.length});};
 await page.getByRole('heading',{name:'Đăng nhập NhTBank'}).waitFor();
 await page.getByRole('button',{name:'Đăng ký tài khoản'}).click();
 await page.getByLabel('Tên đăng nhập',{exact:true}).fill('ux_audit_demo');await page.getByLabel('Mật khẩu mới',{exact:true}).fill('DemoPass12345!');await page.getByLabel('Nhập lại mật khẩu').fill('DemoPass12345!');await page.getByRole('button',{name:'Tạo tài khoản demo'}).click();
 await page.getByLabel('Tên đăng nhập',{exact:true}).fill('ux_audit_demo');await page.getByLabel('Mật khẩu',{exact:true}).fill('DemoPass12345!');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.getByRole('heading',{name:/Xin chào/}).waitFor();
 const nav=page.getByRole('navigation',{name:'Điều hướng chính'});
 for(const label of ['Quét QR']) {await nav.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(100);await audit(label);}
 if(false){const cdp=await context.newCDPSession(page);for(let round=0;round<4;round++){for(let i=0;i<10;i++){await nav.getByRole('button',{name:'Trang chủ',exact:true}).click();await nav.getByRole('button',{name:'Lịch sử',exact:true}).click();}await cdp.send('HeapProfiler.collectGarbage');result.heap.push({round,cycles:(round+1)*10,...await cdp.send('Runtime.getHeapUsage')});}}
 await page.getByRole('button',{name:'Trang chủ',exact:true}).first().click();await page.keyboard.press('Tab');await page.keyboard.press('Enter');await page.waitForTimeout(250);
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));result.metrics.push({width,...await page.evaluate(()=>({vitals:window.uxVitals,interactionCount:performance.interactionCount??null,ua:navigator.userAgent}))});await context.close();
}
await browser.close();fs.writeFileSync(out+'/audit-qr-cuon.json',JSON.stringify(result,null,2));console.log(JSON.stringify({audits:result.audits.length,violations:result.audits.filter(a=>a.violations.length).map(a=>({width:a.width,name:a.name,ids:a.violations.map(v=>v.id)})),metrics:result.metrics,heap:result.heap},null,2));
