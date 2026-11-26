import re,sys,json,urllib.request,html
from html.parser import HTMLParser
S=sys.argv[1]
urls=[u.strip() for u in open(S+'/urls.txt') if u.strip()]
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.h1=0;s.h2=0;s.links=[];s.inmain=0;s.text=[];s.skip=0;s.details=0;s.imgs_noalt=0
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=='main': s.inmain+=1
        if t in('script','style'): s.skip+=1
        if t=='h1': s.h1+=1
        if t=='h2': s.h2+=1
        if t=='details' and s.inmain: s.details+=1
        if t=='a' and s.inmain and a.get('href'): s.links.append(a['href'])
        if t=='img' and a.get('alt') is None: s.imgs_noalt+=1
    def handle_endtag(s,t):
        if t=='main': s.inmain-=1
        if t in('script','style'): s.skip-=1
    def handle_data(s,d):
        if s.inmain and not s.skip: s.text.append(d)
rows=[]
for u in urls:
    path=u.replace('https://missoessecretasgta.com.br','')
    h=urllib.request.urlopen('http://localhost:3200'+path).read().decode()
    p=P();p.feed(h)
    title=html.unescape(re.search(r'<title>(.*?)</title>',h).group(1))
    desc=re.search(r'<meta name="description" content="([^"]*)"',h); desc=html.unescape(desc.group(1)) if desc else ''
    ld=re.findall(r'"@type":"([A-Za-z]+)"',h)
    internal=[l for l in p.links if l.startswith('/') ]
    external=[l for l in p.links if l.startswith('http') and 'missoessecretasgta' not in l]
    words=len(' '.join(p.text).split())
    rows.append(dict(path=path,title=title,tl=len(title),desc=desc,dl=len(desc),h1=p.h1,h2=p.h2,faq=p.details,faqld='FAQPage' in ld,ld=sorted(set(ld)),internal=len(set(internal)),external=len(set(external)),words=words,noalt=p.imgs_noalt))
json.dump(rows,open(S+'/audit.json','w'),ensure_ascii=False,indent=1)
import collections
def kind(p):
    parts=[x for x in p.split('/') if x]
    if len(parts)==3: return 'ficha'
    if len(parts)==2 and parts[0]=='gta-6': return 'categoria'
    return 'outra'
g=collections.defaultdict(list)
for r in rows: g[kind(r['path'])].append(r)
for k,v in g.items():
    n=len(v)
    print(f"== {k}: {n} páginas")
    print(" título >60:",sum(r['tl']>60 for r in v)," desc vazia:",sum(r['dl']==0 for r in v)," desc >160:",sum(r['dl']>160 for r in v)," desc <110:",sum(0<r['dl']<110 for r in v))
    print(" h1!=1:",sum(r['h1']!=1 for r in v)," sem FAQ:",sum(r['faq']==0 for r in v)," sem FAQ JSON-LD:",sum(not r['faqld'] for r in v))
    print(" links internos (mín/med):",min(r['internal'] for r in v),sorted(r['internal'] for r in v)[n//2]," externos zero:",sum(r['external']==0 for r in v))
    print(" palavras (mín/med):",min(r['words'] for r in v),sorted(r['words'] for r in v)[n//2], " img sem alt:",sum(r['noalt'] for r in v))
for r in g['outra']: print(r['path'],r['tl'],r['dl'],'faq',r['faq'],'int',r['internal'],'ext',r['external'],'w',r['words'])
