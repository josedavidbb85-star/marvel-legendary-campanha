#!/usr/bin/env python3
import base64,json,os,re,subprocess,time,urllib.request,zipfile
VOICE='pt-BR-Chirp3-HD-Algenib'; PROJECT='ecos-da-ruptura'; OUT='audio_narracao'
SRC='https://raw.githubusercontent.com/josedavidbb85-star/marvel-legendary-campanha/main/index_v0838.html'
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
 if text and text.strip():items.append((fn,re.sub(r'<[^>]+>','',text).strip()))
for m in DATA['missions']:
 mid=m['id']
 add(f'm{mid}_abertura.mp3',' '.join(m.get('story',[])))
 for si,text in enumerate(m.get('story',[]),1): add(f'm{mid}_abertura_cena_{si}.mp3',text)
 for hi,h in enumerate(m.get('heroes',[]),1): add(f'm{mid}_heroi_{hi}.mp3',h[1])
 # Conflito: somente reprodução manual pelo botão abaixo do texto.
 add(f'm{mid}_conflito.mp3',m.get('relation',''))
 for ri,r in enumerate(m['responsibilities'],1):
  add(f'm{mid}_r{ri}_n1_cena.mp3',r['scene'])
  # Mantém o antigo N2 apenas por compatibilidade; a interface usa as variantes contextuais abaixo.
  add(f'm{mid}_r{ri}_n2_cena.mp3',r['level2']['scene'])
  for lv,key in [('n1',f'{mid}-{ri-1}'),('n2',f'{mid}-{ri-1}-L2')]:
   for ci,c in enumerate(TESTS[key]['choices'],1):
    add(f'm{mid}_r{ri}_{lv}_op{ci}.mp3',c.get('text',''))
    add(f'm{mid}_r{ri}_{lv}_op{ci}_sucesso.mp3',c.get('successNarrative') or c.get('success',''))
    add(f'm{mid}_r{ri}_{lv}_op{ci}_falha.mp3',c.get('failNarrative') or c.get('fail',''))
 add(f'm{mid}_vitoria.mp3',m.get('win','')); add(f'm{mid}_derrota.mp3',m.get('loss',''))
# N2 contextual: exatamente o texto que continuationNarrative exibe, conforme resultado do N1.
arcs=re.findall(r'"(\d+)-(\d+)":\{\s*continuation:\{success:"((?:\\.|[^"\\])*)",fail:"((?:\\.|[^"\\])*)"\}',s)
if len(arcs)!=15: raise RuntimeError(f'Esperados 15 arcos N2; encontrados {len(arcs)}')
for mid0,ri0,succ,fail in arcs:
 mid=int(mid0); ri=int(ri0)+1
 succ=json.loads('"'+succ+'"'); fail=json.loads('"'+fail+'"')
 add(f'm{mid}_r{ri}_n2_cena_sucesso_n1.mp3',succ)
 add(f'm{mid}_r{ri}_n2_cena_falha_n1.mp3',fail)
# Fechamentos N2: exatamente o texto visível em "Fechamento desta Responsabilidade".
epis=re.findall(r'epilogue:\{success:"((?:\\.|[^"\\])*)",fail:"((?:\\.|[^"\\])*)"\}',s)
if len(epis)!=15: raise RuntimeError(f'Esperados 15 epílogos; encontrados {len(epis)}')
for idx,(succ,fail) in enumerate(epis):
 mid=idx//3+1; ri=idx%3+1
 succ=json.loads('"'+succ+'"'); fail=json.loads('"'+fail+'"')
 add(f'm{mid}_r{ri}_n2_fechamento_sucesso.mp3',succ)
 add(f'm{mid}_r{ri}_n2_fechamento_falha.mp3',fail)
os.makedirs(OUT,exist_ok=True)
with open('narracoes_textos_v0838.json','w',encoding='utf-8') as f:
 json.dump([{'arquivo':fn,'texto':text} for fn,text in items],f,ensure_ascii=False,indent=2)
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
zipname='ecos_da_ruptura_narracoes_algenib_v0838.zip'
with zipfile.ZipFile(zipname,'w',zipfile.ZIP_DEFLATED) as z:
 for fn,_ in items:z.write(os.path.join(OUT,fn),fn)
 z.write('narracoes_textos_v0838.json','narracoes_textos_v0838.json')
print(f'CONCLUÍDO: {len(items)} áudios | {zipname}')