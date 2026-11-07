import {chromium} from '/workspace/Ngan_hang_NhTBank/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});const results=[];
for(const width of [320,390,1440]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();
 await page.addInitScript({content:fs.readFileSync('/tmp/nht-audit/node_modules/web-vitals/dist/web-vitals.iife.js','utf8')+';window.uxVitals={}; for(const n of ["LCP","CLS","INP"]) webVitals["on"+n](m=>{window.uxVitals[n]={value:m.value,rating:m.rating,entries:m.entries.length}},{reportAllChanges:true});'});
 await page.goto('http://127.0.0.1:4173');await page.bringToFront();await page.getByRole('heading',{name:'Đăng nhập NhTBank'}).waitFor();await page.waitForTimeout(500);
 await page.getByRole('button',{name:'Đăng ký tài khoản'}).click();await page.getByLabel('Tên đăng nhập',{exact:true}).fill('ux_metrics');await page.getByLabel('Mật khẩu mới',{exact:true}).fill('DemoPass12345!');await page.getByLabel('Nhập lại mật khẩu').fill('DemoPass12345!');await page.getByRole('button',{name:'Tạo tài khoản demo'}).click();await page.getByLabel('Tên đăng nhập',{exact:true}).fill('ux_metrics');await page.getByLabel('Mật khẩu',{exact:true}).fill('DemoPass12345!');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.getByRole('heading',{name:/Xin chào/}).waitFor();
 const nav=page.getByRole('navigation',{name:'Điều hướng chính'});for(let i=0;i<3;i++)for(const label of ['Giao dịch','Lịch sử','Cá nhân','Trang chủ'])await nav.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(1100);
 const hide=await context.newPage();await hide.bringToFront();await page.waitForTimeout(200);
 results.push({width,...await page.evaluate(()=>({vitals:window.uxVitals,interactionCount:performance.interactionCount,visibility:document.visibilityState,supported:PerformanceObserver.supportedEntryTypes}))});await context.close();
}
await browser.close();fs.writeFileSync('/workspace/Ngan_hang_NhTBank/docs/bang-chung/hau-kiem-ux-20261107/hieu-nang.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
