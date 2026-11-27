# Общие пути и настройки тестового окружения ULTRAGAS.
# Все скрипты dev/parts и dev/tools берут пути отсюда (раньше были зашиты пути облачной
# среды /home/claude/ultra, /tmp/an, /tmp/srv ...). Любой путь можно переопределить
# переменной окружения UG_<ИМЯ>, например UG_CHROME, UG_OUT, UG_PORT.
import os, sys, builtins, shutil, tempfile

def _env(name, default):
    return os.environ.get('UG_' + name) or default

DEV   = os.path.dirname(os.path.abspath(__file__))
ROOT  = _env('ROOT', os.path.dirname(DEV))                      # корень репозитория
INDEX = _env('INDEX', os.path.join(ROOT, 'index.html'))         # игра (её правят patch_*.py)
PARTS = os.path.join(DEV, 'parts')                              # исходники подсистем
TOOLS = os.path.join(DEV, 'tools')                              # тесты/утилиты
MODELS = os.path.join(ROOT, 'models')
OUT   = _env('OUT', os.path.join(DEV, 'out'))                   # скриншоты и прочий вывод тестов (в .gitignore)
SRV   = _env('SRV', os.path.join(DEV, '.srv'))                  # тестовая копия игры с хуками (prep2.py)
PORT  = int(_env('PORT', '8765'))
URL   = 'http://localhost:%d/index.html' % PORT
FAKEMQTT = os.path.join(TOOLS, 'fakemqtt.js')                   # заглушка MQTT (BroadcastChannel между вкладками)

# three.js r128 для офлайн-тестов (npm i three@0.128.0 в dev/tools). Если его нет —
# браузер берёт three.js с CDN, как в обычной игре.
THREE_DIR = _env('THREE', os.path.join(TOOLS, 'node_modules', 'three'))
HAVE_THREE = os.path.exists(os.path.join(THREE_DIR, 'build', 'three.min.js'))

def _find_chrome():
    c = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
         r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
         os.path.expandvars(r'%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe'),
         r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
         '/usr/bin/google-chrome', '/usr/bin/chromium',
         '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    for p in c:
        if os.path.exists(p): return p
    return shutil.which('chrome') or shutil.which('google-chrome') or shutil.which('chromium')
CHROME = _env('CHROME', _find_chrome())

# шрифт для подписей на листах скриншотов (tour.py и т.п.)
FONTS = [r'C:\Windows\Fonts\arialbd.ttf', r'C:\Windows\Fonts\arial.ttf', r'C:\Windows\Fonts\segoeuib.ttf',
         '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']

TMP = tempfile.gettempdir()

for d in (OUT, os.path.join(OUT, 'pt'), os.path.join(OUT, 'tour'), os.path.join(OUT, 'out4')):
    os.makedirs(d, exist_ok=True)

# Windows: open() по умолчанию читает в cp1251 и пишет \r\n. Скрипты писались под Linux,
# поэтому для текстового режима по умолчанию ставим UTF-8 и не трогаем переводы строк.
if not getattr(builtins.open, '_ug', False):
    _open = builtins.open
    def _ug_open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None):
        if 'b' not in mode:
            if encoding is None: encoding = 'utf-8'
            if newline is None: newline = ''
        return _open(file, mode, buffering, encoding, errors, newline, closefd, opener)
    _ug_open._ug = True
    builtins.open = _ug_open
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
