// AXE_PATH points to a local, verified axe-core script used only by this test.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(process.env.DEMO_URL||'http://127.0.0.1:8080');
 const axe=fs.readFileSync(process.env.AXE_PATH||'/tmp/nhtbank-axe.js','utf8');
 const audit=async label=>{await page.addScriptTag({content:axe});const results=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});assert.deepEqual(results,[],label+' accessibility violations: '+JSON.stringify(results));};
 await audit('welcome');await page.getByRole('button',{name:/Trải nghiệm bản minh họa/}).click();
 for(const label of ['Tổng quan','Giao dịch','QR','Mục tiêu','Cá nhân']){await page.locator('.mobile-nav').getByRole('button',{name:label,exact:true}).click();await audit(label);}
 await page.locator('.mobile-nav').getByRole('button',{name:'Tổng quan',exact:true}).click();await page.locator('.quick-actions').getByRole('button',{name:'Chuyển tiền',exact:true}).click();await audit('transfer');
 await page.setViewportSize({width:1280,height:900});await page.locator('.sidebar').getByRole('button',{name:'Tổng quan',exact:true}).click();await page.getByRole('heading',{name:'Rời biểu mẫu đang nhập?'}).count().then(async n=>{if(n)await page.getByRole('button',{name:'Rời biểu mẫu',exact:true}).click();});
 for(const label of ['Tổng quan','Giao dịch','QR','Mục tiêu','Cá nhân']){
  await page.locator('.sidebar').getByRole('button',{name:label,exact:true}).click();await page.evaluate(()=>{const data=[...document.querySelectorAll('body *')].filter(e=>!(e instanceof SVGElement)).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const[e,size]of data)e.style.fontSize=size*2+'px';});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,label+' at 200% text');
  await page.evaluate(()=>{for(const el of document.querySelectorAll('body *'))if(!(el instanceof SVGElement))el.style.fontSize='';});
  // Re-render before the next scenario.
  await page.locator('.sidebar').getByRole('button',{name:label==='Tổng quan'?'Giao dịch':'Tổng quan',exact:true}).click();
 }
 console.log('PASS: axe automated checks across welcome, five pages and transfer; desktop 200% text reflow without horizontal overflow. Manual screen-reader/device checks remain unverified.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
