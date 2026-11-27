import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
from playwright.sync_api import sync_playwright
J=lambda pg,js:pg.evaluate(js)
# Флаги: программный WebGL (swiftshader) — одинаковые скриншоты на любой машине;
# UG_GPU=1 — рендер на настоящей видеокарте (для замеров FPS).
GL_ARGS=([] if os.environ.get('UG_GPU') else ['--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader'])+['--ignore-gpu-blocklist','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']
def launch(p):
    return p.chromium.launch(executable_path=CHROME,headless=not os.environ.get('UG_HEADED'),args=GL_ARGS)
def route_libs(pg):
    if HAVE_THREE:
        pg.route('**/three@0.128.0/examples/js/**',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/'+r.request.url.split('/examples/js/')[1],content_type='text/javascript'))
        pg.route('**/three.min.js',lambda r:r.fulfill(path=THREE_DIR+'/build/three.min.js',content_type='text/javascript'))
    pg.route('**/mqtt.min.js',lambda r:r.fulfill(path=FAKEMQTT,content_type='text/javascript'))
    pg.route('**/peerjs.min.js',lambda r:r.abort());pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
def open_page(p,w=1280,h=720):
    b=launch(p)
    pg=b.new_page(viewport={'width':w,'height':h});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console:'+m.text) if m.type in('error','warning') else None)
    route_libs(pg)
    pg.goto(URL);pg.wait_for_timeout(3000)
    return b,pg,errs
def shot_screen(pg,path):
    pg.locator('#screen').screenshot(path=path)
