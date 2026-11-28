# ULTRAGAS — заметки для Claude Code

Браузерный шутер в духе ULTRAKILL на тему колы. **Перед работой прочитай `dev/CHAT_CONTEXT.md`** — контекст прошлой переписки с пользователем. Вся игра — один файл `index.html` (three.js r128 из CDN, без сборщика). Отвечать пользователю по-русски.

## Где что лежит
- `index.html` — игра целиком. Её же отдаёт GitHub Pages (https://nicktort-17.github.io/ultragaz/).
- `models/*.json` — glTF-модели (пушки, Пепсштейн, Бамбун, девушки и т.д.), `models/*.glb` — их бинарные версии.
- `models/js/*.js` — копии моделей в виде скриптов для запуска игры двойным кликом по `index.html` (file://: Chrome блокирует XHR к `.json`). Грузит их `ugModel()` в `index.html` — все модели загружать только через неё. После любого изменения `models/*.json` запускать `python dev/tools/models_js.py` (`--check` — проверка свежести; `pep2json.py` вызывает его сам).
- `blender/*.py` — скрипты Blender, которые генерируют модели; экспорт в `models/` (см. `dev/tools/pep2json.py`).
- `art/` — исходные картинки.
- `.claude/skills/gen-model/` — скилл `/gen-model <описание>`: новая модель через ChatGPT (общий лист → виды по частям) → Tripo Multiview HD → `dev/tools/glb_check.py` (отчёт/чистка/рендер в Blender) → `dev/tools/glb_import.py` (в `models/`).
- `pipeline/<модель>/` — рабочие файлы конвейера моделей (референсы ChatGPT, 4 вида, сырые модели Tripo, заметки). Код на эту папку НЕ ссылается и не должен: итог копируется в `models/`. Сырые модели (*.glb и т.п.) — в .gitignore. См. `pipeline/README.md`.
- `dev/parts/` — исходники крупных подсистем и патч-скрипты, которыми они вклеиваются в `index.html`:
  - `story.js` — двери/шлюзы, ход уровней; `island.js`, `isle_terrain.js`, `isle_veg.js`, `isle_props.js` — остров L4; `pep.js` — босс Пепсштейн; `beer_*.js` — L3 и т.д.
  - `patch_isle.py`, `patch_story.py`, `patch_pep.py`, … — вырезают регион-маркер в `index.html` и вставляют свежий код из соответствующих `.js`. Они идемпотентны.
  - `director.js` + `patch_director.py` — модель Генерального директора из Tripo (визор-лицо, двигатели, нимб, анимации, бурлящий резервуар по HP); модель готовит `blender/director_prep.py`.
  - `patch_style.py` (метр стиля «бутылка»), `patch_capdial.py` (циферблат крышечек на Шипучке), `patch_blue.py` (синие враги острова) — правят `index.html` напрямую.
  - `NOTES.md` — журнал изменений и устройство систем. Читать перед крупной правкой.
- `dev/tools/` — тесты и утилиты на Playwright (Chrome + swiftshader):
  - `prep2.py` — делает тестовую копию игры с хуками (`window.__eval`, `__ug`, `__dt`, `__norender`) в `dev/.srv`; `srv.py` — поднимает её на порту 8765 (`--stop` — остановить, `--fg` — в текущем окне).
  - `base.py` — открыть страницу; `tour.py views.json out.jpg` — скриншоты карты (`[имя,x,y,z,yaw°,pitch°]`, y ≥ 100 → высота от рельефа);
  - `dirshot.py` (состояния Директора и резервуар крупно), `dirfight.py` (живой бой с Директором), `dirdeath.py` (взрыв «Ликвидация»), `dirfinale.py [noparry]` (финал: голова-пробка, парирование, крушение в карусель, обломки не в стенах);
  - регрессии: `l4flow.py`, `flowexit.py`, `pepsim.py`, `pep9.py`, `coop3.py`, `bluechk.py`, `smshot.py`, `cdshot.py`, `fountchk.py`, `audit.py` и др.

## Пути и тестовое окружение
Все пути — в `dev/ugenv.py` (скрипты подключают его первой строкой; переопределяются переменными `UG_INDEX`, `UG_OUT`, `UG_CHROME`, `UG_PORT`, `UG_THREE`…):
`INDEX` = `index.html` в корне, `PARTS`/`TOOLS` = `dev/parts`/`dev/tools`, `MODELS` = `models/`, `SRV` = `dev/.srv` (тестовая копия), `OUT` = `dev/out` (скриншоты, листы `pt/`, `tour/`; в .gitignore), `CHROME` — установленный Chrome, `BLENDER` — blender.exe (сейчас Steam-версия 5.3 на D:), `TMP` — системный temp (вывод Blender-скриптов).
`ugenv` также ставит `open()` по умолчанию в UTF-8 без перевода строк (на Windows иначе cp1251 и `\r\n`). `.gitattributes` держит LF в рабочей копии — патчи ищут якоря с `\n`.
Нужно: Python 3.12 + `pip install playwright` (браузер не качать — берётся установленный Chrome). three.js по умолчанию грузится с CDN (нужен интернет); для офлайна — `npm i three@0.128.0` в `dev/tools` (подхватится сам).
`UG_GPU=1` — рендер на видеокарте вместо swiftshader, `UG_HEADED=1` — видимое окно браузера.

Запуск тестов (из корня репозитория):
```
python dev/tools/prep2.py      # после каждой правки index.html
python dev/tools/srv.py
cd dev/tools && python l4flow.py && python flowexit.py
python tour.py sweep.json ../out/tour/sweep.jpg 640
```
Рабочий порядок: правишь `dev/parts/*.js` → `python dev/parts/patch_*.py` → `prep2.py` → тесты/скриншоты → коммит.
Проверить патч, не трогая игру: `UG_INDEX=<копия> python dev/parts/patch_x.py`, затем сравнить с `index.html`.

Патчи, которые правят `index.html` напрямую (`patch_blue/style/capdial`), могут менять код внутри регионов STORY/BEER/ISLE/PEP/GZ. После такой правки перенеси её в соответствующий `.js`, иначе следующий `patch_story`/`patch_beer` её сотрёт. Проверка: каждый `patch_*.py`, запущенный на копии `index.html`, должен дать файл байт в байт (сейчас так для всех восьми).

## Правила проекта
- Никаких логотипов Coca-Cola/Pepsi и маскота Pepsi; Пепсштейн — строго сатира на корпорацию-монополиста газировки.
- Никаких фото реальных людей. Персонажи — взрослые, без откровенного контента.
- Проект некоммерческий; текстуры не должны быть мыльными.
- Новые модели показывать пользователю на согласование.
- Коллизии: `solid(x,y,z,w,h,d)` (y — низ), `boxes` перебираются каждый шаг движения — держать их число небольшим. Рельеф острова — `TERR.h(x,z)` (с учётом камней).
- После правок прогонять хотя бы `l4flow.py`/`flowexit.py` и смотреть скриншоты.
