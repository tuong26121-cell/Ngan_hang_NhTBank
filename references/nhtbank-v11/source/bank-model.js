'use strict';
(function(root){
  const owner={name:'Nguyễn Văn Mạnh',number:'0123456789',bank:'Tài khoản mô phỏng'};
  const banks=['Tài khoản mô phỏng','Vietcombank (mẫu)','BIDV (mẫu)','Techcombank (mẫu)','MBBank (mẫu)'];
  const id=()=>root.crypto?.randomUUID?.()||'NHT-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  function initial(){
    const day=(n)=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString();};
    return upgrade({balance:28500000,transactions:[
      {id:'MAU-004',name:'The Coffee House',bank:'Tài khoản mô phỏng',account:'1112223334',amount:-65000,note:'Một chút cà phê cho ngày mới',date:day(0),category:'food'},
      {id:'MAU-003',name:'Lương tháng này',bank:'Tài khoản mô phỏng',account:'8889990001',amount:18000000,note:'Công ty mẫu · Thu nhập',date:day(1),category:'income'},
      {id:'MAU-002',name:'Nguyễn Minh Anh',bank:'Tài khoản mô phỏng',account:'0987654321',amount:-450000,note:'Chia tiền mua sắm',date:day(2),category:'transfer'},
      {id:'MAU-001',name:'Điện sinh hoạt',bank:'Tài khoản mô phỏng',account:'5556667778',amount:-1200000,note:'Chi phí gia đình',date:day(3),category:'bills'}
    ],vas:[]});
  }
  function transferDraft(state,values){
    const account=String(values.account||'').trim(),name=String(values.name||'').trim();
    const amount=Number(values.amount),note=String(values.note||'').trim()||'Chuyển tiền mẫu';
    if(!banks.includes(values.bank))throw Error('Hãy chọn ngân hàng nhận mẫu.');
    if(!/^\d{6,19}$/.test(account))throw Error('Số tài khoản cần có từ 6 đến 19 chữ số.');
    if(account===owner.number&&values.bank===owner.bank)throw Error('Hãy chọn tài khoản khác với tài khoản mẫu của bạn.');
    if(!name||name.length>60)throw Error('Tên người nhận cần có từ 1 đến 60 ký tự.');
    if(!Number.isSafeInteger(amount)||amount<=0)throw Error('Số tiền phải là số nguyên lớn hơn 0 ₫.');
    if(amount>state.balance)throw Error('Số dư mẫu không đủ cho giao dịch này.');
    if(note.length>100)throw Error('Nội dung chuyển tiền tối đa 100 ký tự.');
    if(state.transactions.length>=1000)throw Error('Đã đạt 1.000 giao dịch mẫu. Hãy đặt lại dữ liệu để thử tiếp.');
    return {bank:values.bank,account,name,amount,note};
  }
  function transfer(state,values){
    const d=transferDraft(state,values);
    const transaction={...d,id:id(),amount:-d.amount,date:new Date().toISOString(),category:'transfer',status:'completed',fee:0};
    return {state:{...state,accountUpdatedAt:transaction.date,balance:state.balance-d.amount,transactions:[transaction,...state.transactions],notifications:notice(state,'Giao dịch mô phỏng hoàn tất','Mở để xem biên nhận mô phỏng.','transaction',transaction.id)},transaction};
  }
  function addVA(state,label){
    label=String(label||'').trim();
    if(!label||label.length>40)throw Error('Nhãn tài khoản cần có từ 1 đến 40 ký tự.');
    if(state.vas.length>=50)throw Error('Bạn đã có 50 VA mẫu. Hãy xóa VA cũ để tạo thêm.');
    let number;do{number='NHTDEMO'+id().replace(/[^a-z0-9]/gi,'').slice(-8).toUpperCase();}while(state.vas.some(v=>v.number===number));
    return {...state,vas:[{id:id(),number,label,active:true},...state.vas]};
  }
  function changeVA(state,vaId,action){
    if(!state.vas.some(v=>v.id===vaId))throw Error('Không tìm thấy VA mẫu.');
    if(action==='delete')return {...state,vas:state.vas.filter(v=>v.id!==vaId)};
    if(action==='toggle')return {...state,vas:state.vas.map(v=>v.id===vaId?{...v,active:!v.active}:v)};
    throw Error('Thao tác không hợp lệ.');
  }
  function valid(s){
    const text=(x,max)=>typeof x==='string'&&x.length<=max;
    if(!s||!Number.isSafeInteger(s.balance)||s.balance<0||!Array.isArray(s.transactions)||s.transactions.length>1000||!Array.isArray(s.vas)||s.vas.length>50)return false;
    const ids=new Set(),numbers=new Set();let totalIn=0,totalOut=0;
    for(const t of s.transactions){
      if(!t||!text(t.id,100)||!t.id||ids.has(t.id)||!text(t.name,60)||!t.name||!text(t.note,100)||!text(t.bank,60)||!text(t.account,60)||!text(t.date,50)||!Number.isFinite(Date.parse(t.date))||!Number.isSafeInteger(t.amount)||!t.amount||!Object.hasOwn(categories,t.category))return false;
      if(t.amount>0)totalIn+=t.amount;else totalOut-=t.amount;
      if(!Number.isSafeInteger(totalIn)||!Number.isSafeInteger(totalOut))return false;
      ids.add(t.id);
    }
    for(const v of s.vas){if(!v||!text(v.id,100)||!v.id||ids.has(v.id)||!text(v.label,40)||!v.label.trim()||typeof v.number!=='string'||!/^NHTDEMO[A-Z0-9]{8}$/.test(v.number)||numbers.has(v.number)||typeof v.active!=='boolean')return false;ids.add(v.id);numbers.add(v.number);}
    return true;
  }
  const categories={food:'Ăn uống',income:'Thu nhập',transfer:'Chuyển tiền',bills:'Hóa đơn',shopping:'Mua sắm',uncategorized:'Chưa phân loại',internal:'Chuyển giữa tài khoản của tôi'};
  const colors={green:'#075E50',blue:'#1D4ED8',gold:'#854D0E'};
  const goalIcons=['shield','wallet','plane','gift'];
  function upgrade(s){
    const now=new Date().toISOString();
    return {...s,transactions:s.transactions.map(t=>({...t,status:'completed',fee:0})),
      profile:s.profile||{name:owner.name},settings:s.settings||{hideBalance:false,hideAll:false,inAppNotifications:true},
      accountUpdatedAt:s.accountUpdatedAt||now,cardLocked:typeof s.cardLocked==='boolean'?s.cardLocked:false,
      goals:s.goals||[{id:'GOAL-MAU',name:'Quỹ dự phòng',target:30000000,progress:4500000,deadline:'',icon:'shield',color:'green',history:[{id:'PROGRESS-MAU',date:now,delta:4500000,total:4500000,note:'Tiến độ mẫu ban đầu'}]}],
      notifications:s.notifications||[{id:'WELCOME',title:'Chào mừng đến NhTBank',body:'Dữ liệu mẫu lưu trên thiết bị này. Không giao dịch tiền thật.',type:'service',target:'',date:now,read:false}]};
  }
  function notice(s,title,body,type,target=''){
    if(!s.settings.inAppNotifications)return s.notifications;
    return [{id:id(),title,body,type,target,date:new Date().toISOString(),read:false},...s.notifications].slice(0,200);
  }
  function parseMoney(value,optional=false){
    const raw=String(value??'').trim();
    if(optional&&!raw)return null;
    if(!/^(?:\d+|\d{1,3}(?:[., ]\d{3})+)$/.test(raw))throw Error('Nhập số tiền nguyên, ví dụ 100000 hoặc 100.000.');
    const n=Number(raw.replace(/[., ]/g,''));
    if(!Number.isSafeInteger(n)||n<0)throw Error('Số tiền vượt giới hạn xử lý an toàn.');
    return n;
  }
  function goalData(values){
    const name=String(values.name||'').trim(),target=parseMoney(values.target),deadline=String(values.deadline||'');
    if(!name||name.length>60)throw Error('Tên mục tiêu cần có từ 1 đến 60 ký tự.');
    if(target<=0)throw Error('Số tiền mục tiêu phải lớn hơn 0 ₫.');
    if(deadline&&(!/^\d{4}-\d{2}-\d{2}$/.test(deadline)||!Number.isFinite(Date.parse(deadline))||new Date(deadline).toISOString().slice(0,10)!==deadline))throw Error('Ngày dự kiến không hợp lệ.');
    if(!goalIcons.includes(values.icon)||!Object.hasOwn(colors,values.color))throw Error('Chọn biểu tượng và màu được hỗ trợ.');
    return {name,target,deadline,icon:values.icon,color:values.color};
  }
  function saveGoal(s,values,goalId=''){
    const data=goalData(values),exists=goalId?s.goals.find(g=>g.id===goalId):null;
    if(goalId&&!exists)throw Error('Không tìm thấy mục tiêu.');
    if(!exists&&s.goals.length>=50)throw Error('Tối đa 50 mục tiêu.');
    const goal=exists?{...exists,...data}:{id:id(),...data,progress:0,history:[]};
    return {...s,goals:exists?s.goals.map(g=>g.id===goalId?goal:g):[...s.goals,goal]};
  }
  function progressGoal(s,goalId,value,mode='add'){
    const goal=s.goals.find(g=>g.id===goalId);if(!goal)throw Error('Không tìm thấy mục tiêu.');
    const amount=parseMoney(value),total=mode==='set'?amount:goal.progress+amount;
    if(!['set','add'].includes(mode)||!Number.isSafeInteger(total)||total<0)throw Error('Tiến độ vượt giới hạn an toàn.');
    if(mode==='add'&&!amount)throw Error('Số tiền ghi nhận phải lớn hơn 0 ₫.');
    if(goal.history.length>=1000)throw Error('Mục tiêu đã có 1.000 lần cập nhật.');
    const entry={id:id(),date:new Date().toISOString(),delta:total-goal.progress,total,note:mode==='set'?'Điều chỉnh tiến độ thủ công':'Ghi nhận tiến độ thủ công'};
    const next={...s,goals:s.goals.map(g=>g.id===goalId?{...g,progress:total,history:[entry,...g.history]}:g)};
    if(goal.progress<goal.target&&total>=goal.target)next.notifications=notice(s,'Mục tiêu đã hoàn thành','Tiến độ thủ công đã đạt số tiền mong muốn.','goal',goalId);
    return next;
  }
  function localDate(value){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
  function selectTransactions(s,f={}){
    const q=String(f.query||'').toLocaleLowerCase('vi');
    return s.transactions.filter(t=>`${t.name} ${t.note} ${t.id}`.toLocaleLowerCase('vi').includes(q)
      &&(!f.direction||f.direction==='all'||(f.direction==='in'?t.amount>0:t.amount<0))
      &&(!f.status||f.status===t.status)&&(!f.from||localDate(t.date)>=f.from)&&(!f.to||localDate(t.date)<=f.to));
  }
  function monthStats(s,now=new Date()){
    const month=localDate(now).slice(0,7),tx=s.transactions.filter(t=>localDate(t.date).startsWith(month)&&t.status==='completed');
    const income=tx.filter(t=>t.amount>0).reduce((n,t)=>n+t.amount,0),outgoing=tx.filter(t=>t.amount<0).reduce((n,t)=>n-t.amount,0);
    return {month,income,outgoing,net:income-outgoing,spending:tx.filter(t=>t.amount<0&&!['transfer','internal'].includes(t.category)).reduce((n,t)=>n-t.amount,0),count:tx.length};
  }
  function moneyWords(n){
    if(!Number.isSafeInteger(n)||n<0)throw Error('Số tiền không hợp lệ.');if(!n)return 'Không đồng';
    const digit=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
    const units=['','nghìn','triệu','tỷ','nghìn tỷ','triệu tỷ'];const parts=[];let i=0;
    function triple(n,full){let a=Math.floor(n/100),b=Math.floor(n%100/10),c=n%10,p=[];if(a||full)p.push(digit[a],'trăm');if(b>1)p.push(digit[b],'mươi');else if(b===1)p.push('mười');else if(c&&(a||full))p.push('lẻ');if(c)p.push(c===1&&b>1?'mốt':c===5&&b>0?'lăm':digit[c]);return p.join(' ');}
    while(n){const g=n%1000;if(g)parts.unshift(triple(g,n>=1000&&g<100)+' '+units[i]);n=Math.floor(n/1000);i++;}
    const text=parts.join(' ').replace(/\s+/g,' ').trim()+' đồng';return text[0].toUpperCase()+text.slice(1);
  }
  function qrPayload(amount,note='',holder=owner.name){
    if(typeof holder!=='string'||!holder.trim()||holder.length>60)throw Error('Tên chủ tài khoản minh họa không hợp lệ.');
    if(amount!==null&&(!Number.isSafeInteger(amount)||amount<=0))throw Error('Số tiền yêu cầu phải lớn hơn 0 ₫.');
    if(typeof note!=='string'||note.length>100)throw Error('Nội dung tối đa 100 ký tự.');
    return 'NHTBANK-DEMO:'+encodeURIComponent(JSON.stringify({version:1,mode:'demo',account:owner.number,holder,provider:'Tài khoản mô phỏng',amount,note}));
  }
  function readQR(raw){
    if(typeof raw!=='string'||raw.length>3000||!raw.startsWith('NHTBANK-DEMO:'))throw Error('Mã không được hỗ trợ. Chỉ đọc QR minh họa NhTBank; không mở liên kết hoặc chuyển tiền tự động.');
    let p;try{p=JSON.parse(decodeURIComponent(raw.slice(13)));}catch{throw Error('Dữ liệu QR minh họa không hợp lệ.');}
    if(!p||p.mode!=='demo'||p.version!==1||typeof p.account!=='string'||!/^\d{6,19}$/.test(p.account)||typeof p.holder!=='string'||!p.holder.trim()||p.holder.length>60||p.provider!=='Tài khoản mô phỏng'||(p.amount!==null&&(!Number.isSafeInteger(p.amount)||p.amount<=0))||typeof p.note!=='string'||p.note.length>100)throw Error('Dữ liệu QR minh họa không hợp lệ.');
    return p;
  }
  const legacyValid=valid;
  function validFull(s){
    if(!legacyValid(s))return false;
    if(!s.settings)return !('goals' in s)&&!('notifications' in s)&&!('profile' in s);
    const str=(x,n)=>typeof x==='string'&&x.length<=n,date=x=>str(x,50)&&Number.isFinite(Date.parse(x));
    if(!s.profile||!str(s.profile.name,60)||!s.profile.name.trim()||!['hideBalance','hideAll','inAppNotifications'].every(k=>typeof s.settings[k]==='boolean')||!date(s.accountUpdatedAt)||typeof s.cardLocked!=='boolean'||!Array.isArray(s.goals)||s.goals.length>50||!Array.isArray(s.notifications)||s.notifications.length>200)return false;
    const ids=new Set();
    for(const t of s.transactions)if(t.status!=='completed'||t.fee!==0)return false;
    for(const g of s.goals){try{goalData({...g,target:String(g.target)});}catch{return false;}if(!str(g.id,100)||!g.id||ids.has(g.id)||!Number.isSafeInteger(g.progress)||g.progress<0||!Array.isArray(g.history)||g.history.length>1000)return false;ids.add(g.id);let last=g.progress;
      for(const h of g.history){if(!h||!str(h.id,100)||!date(h.date)||!Number.isSafeInteger(h.delta)||!Number.isSafeInteger(h.total)||h.total<0||!str(h.note,100)||h.total!==last)return false;last=h.total-h.delta;if(!Number.isSafeInteger(last)||last<0)return false;}if(last!==0)return false;
    }
    return s.notifications.every(n=>n&&str(n.id,100)&&str(n.title,100)&&str(n.body,300)&&['service','transaction','security','goal'].includes(n.type)&&str(n.target,100)&&date(n.date)&&typeof n.read==='boolean');
  }
  const api={owner,banks,initial,transferDraft,transfer,addVA,changeVA,valid:validFull,upgrade,parseMoney,categories,colors,goalIcons,saveGoal,progressGoal,selectTransactions,monthStats,moneyWords,qrPayload,readQR,localDate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NhT=api;
})(globalThis);
