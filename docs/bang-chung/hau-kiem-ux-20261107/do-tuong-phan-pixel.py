from PIL import Image
import json,glob,math

def lum(rgb):
 a=[v/255 for v in rgb];a=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in a];return sum(x*y for x,y in zip(a,[.2126,.7152,.0722]))
all_results=[]
for p in glob.glob('/tmp/ux-*.json'):
 try: records=json.load(open(p));im=Image.open(p[:-5]+'.png').convert('RGB')
 except:continue
 for t in records:
  if t.get('occluded'):continue
  import re
  color=[float(c) for c in re.findall(r'[\d.]+',t['color'])]
  if len(color)<3:continue
  vals=[]
  for i in [.15,.35,.5,.65,.85]:
   for j in [.3,.5,.7]:
    x=int(t['x']+t['w']*i);y=int(t['y']+t['h']*j)
    if 0<=x<im.width and 0<=y<im.height:
     bg=im.getpixel((x,y));alpha=color[3] if len(color)>3 else 1
     fg=[c*alpha+b*(1-alpha) for c,b in zip(color,bg)];a,b=lum(fg),lum(bg);vals.append((max(a,b)+.05)/(min(a,b)+.05))
  if vals:
   limit=3 if t['size']>=24 or (t['size']>=18.66 and t['weight']>=700) else 4.5
   all_results.append({'screen':p[8:-5],'text':t['text'],'ratio':round(min(vals),2),'limit':limit,'color':t['color']})
print(json.dumps({'samples':len(all_results),'flags':[r for r in all_results if r['ratio']<r['limit']],'all':all_results},ensure_ascii=False,indent=2))
