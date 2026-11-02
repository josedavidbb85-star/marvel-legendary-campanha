#!/usr/bin/env python3
import base64,json,os,subprocess,time,urllib.request,zipfile
VOICE='pt-BR-Chirp3-HD-Algenib'; PROJECT='ecos-da-ruptura'; OUT='audio_narracao'
SRC='https://raw.githubusercontent.com/josedavidbb85-star/marvel-legendary-campanha/main/index_v0827.html'
s=urllib.request.urlopen(SRC).read().decode('utf-8')
def obj(name):
 st=s.index('const '+name+'=')+len('const '+name+'='); op=s[st]; cl={'{':'}','[':']'}[op]; d=0; q=False; esc=False
 for i in range(st,len(s)):
  c=s[i]
  if q:
   if esc: esc=False
   elif c=='\\': esc=True
   elif c=='"': q=False
  else:
   if c=='"': q=True
   elif c==op:d+=1
   elif c==cl:
    d-=1
    if d==0:return json.loads(s[st:i+1])
DATA=obj('DATA'); TESTS=obj('TESTS'); items=[]
def add(fn,text):
 if text and text.strip():items.append((fn,text.strip()))
for m in DATA['missions']:
 mid=m['id']; add(f'm{mid}_abertura.mp3',' '.join(m.get('story',[])))
 for ri,r in enumerate(m['responsibilities'],1):
  add(f'm{mid}_r{ri}_n1_cena.mp3',r['scene']); add(f'm{mid}_r{ri}_n2_cena.mp3',r['level2']['scene'])
  for lv,key in [('n1',f'{mid}-{ri-1}'),('n2',f'{mid}-{ri-1}-L2')]:
   for ci,c in enumerate(TESTS[key]['choices'],1):
    add(f'm{mid}_r{ri}_{lv}_op{ci}.mp3',c.get('text',''))
    add(f'm{mid}_r{ri}_{lv}_op{ci}_sucesso.mp3',c.get('successNarrative') or c.get('success',''))
    add(f'm{mid}_r{ri}_{lv}_op{ci}_falha.mp3',c.get('failNarrative') or c.get('fail',''))
 add(f'm{mid}_vitoria.mp3',m.get('win','')); add(f'm{mid}_derrota.mp3',m.get('loss',''))
os.makedirs(OUT,exist_ok=True)
def tok():return subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
def synth(text,path):
 body=json.dumps({'input':{'text':text},'voice':{'languageCode':'pt-BR','name':VOICE},'audioConfig':{'audioEncoding':'MP3'}},ensure_ascii=False).encode()
 for n in range(4):
  try:
   req=urllib.request.Request('https://texttospeech.googleapis.com/v1/text:synthesize',data=body,headers={'Authorization':'Bearer '+tok(),'x-goog-user-project':PROJECT,'Content-Type':'application/json; charset=utf-8'},method='POST')
   with urllib.request.urlopen(req,timeout=120) as r:d=json.load(r)
   open(path,'wb').write(base64.b64decode(d['audioContent'])); return
  except Exception:
   if n==3:raise
   time.sleep(2*(n+1))
for i,(fn,text) in enumerate(items,1):
 path=os.path.join(OUT,fn)
 if os.path.exists(path) and os.path.getsize(path)>1000:print(f'[{i}/{len(items)}] já existe {fn}');continue
 print(f'[{i}/{len(items)}] {fn}');synth(text,path);time.sleep(.12)
zipname='ecos_da_ruptura_narracoes_algenib.zip'
with zipfile.ZipFile(zipname,'w',zipfile.ZIP_DEFLATED) as z:
 for fn,_ in items:z.write(os.path.join(OUT,fn),fn)
print(f'CONCLUÍDO: {len(items)} áudios | {zipname}')