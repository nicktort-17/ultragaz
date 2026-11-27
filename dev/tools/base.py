from playwright.sync_api import sync_playwright
J=lambda pg,js:pg.evaluate(js)
def open_page(p,w=1280,h=720):
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
    pg=b.new_page(viewport={'width':w,'height':h});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console:'+m.text) if m.type in('error','warning') else None)
    pg.route('**/three@0.128.0/examples/js/**',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/'+r.request.url.split('/examples/js/')[1],content_type='text/javascript'))
    pg.route('**/three.min.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/build/three.min.js',content_type='text/javascript'))
    pg.route('**/mqtt.min.js',lambda r:r.fulfill(path='/tmp/fakemqtt.js',content_type='text/javascript'))
    pg.route('**/peerjs.min.js',lambda r:r.abort());pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(3000)
    return b,pg,errs
def shot_screen(pg,path):
    pg.locator('#screen').screenshot(path=path)
