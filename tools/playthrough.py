"""自动走通测试：用真实的点击/长按/滑动/拖动完成每一个互动，并逐拍截图。
用法：python3 tools/playthrough.py <home|far> <输出目录> [宽 高] [--fast]
"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright

ROUTE = sys.argv[1]
OUT = sys.argv[2]
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 and sys.argv[3].isdigit() else (390, 844)
FAST = '--fast' in sys.argv
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
URL = 'file://' + os.path.join(ROOT, sys.argv[5] if len(sys.argv) > 5 and sys.argv[5].endswith('.html') else 'index.html')

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1, has_touch=False)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:' + m.text) if m.type in ('error', 'warning') else None)
        await pg.goto(URL)
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'{OUT}/000_title.png')
        await pg.click('#start')
        if '--act' in sys.argv:
            a = int(sys.argv[sys.argv.index('--act') + 1])
            await pg.wait_for_timeout(800)
            await pg.evaluate(f"ENGINE.startRoute('{ROUTE}', {a})")
        n = 1
        last = None
        stuck = 0
        for step in range(220):
            await pg.wait_for_timeout(700 if FAST else 2600)
            st = await pg.evaluate("(()=>{const s=window.__H5;return {screen:s.screen,route:s.route,act:s.actIdx,beat:s.beatIdx}})()")
            key = json.dumps(st)
            if await pg.is_visible('#chapter.on'):
                try: await pg.click('#chapter', timeout=1500)
                except Exception: pass
                continue
            tag = f"{st['screen']}_{st['route']}_{st['act']}_{st['beat']}"
            if key != last or stuck in (0,):
                await pg.screenshot(path=f'{OUT}/{n:03d}_{tag}.png'); n += 1
            if st['screen'] == 'ending':
                await pg.wait_for_timeout(1500)
                await pg.screenshot(path=f'{OUT}/{n:03d}_ending.png'); n += 1
                await pg.click('#mkPoster'); await pg.wait_for_timeout(2500)
                await pg.screenshot(path=f'{OUT}/{n:03d}_poster.png'); n += 1
                src = await pg.get_attribute('#posterImg', 'src')
                if src:
                    data = await pg.evaluate("async u=>{let b=await (await fetch(u)).blob();return await new Promise(r=>{let f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)})}", src)
                    import base64; open(f'{OUT}/poster_full.png', 'wb').write(base64.b64decode(data.split(',')[1]))
                await pg.click('#closePoster')
                el = await pg.query_selector('.end-scroll')
                await pg.evaluate("document.querySelector('.end-scroll').scrollTop=9999")
                await pg.wait_for_timeout(500)
                await pg.screenshot(path=f'{OUT}/{n:03d}_ending_scrolled.png'); n += 1
                await pg.click('#toFinale')
                for k in range(9):
                    await pg.wait_for_timeout(1300)
                    if await pg.is_visible('#next'): await pg.click('#next')
                await pg.wait_for_timeout(1500)
                await pg.screenshot(path=f'{OUT}/{n:03d}_finale.png'); n += 1
                break
            stuck = stuck + 1 if key == last else 0
            last = key
            if stuck > 6:
                print('STUCK at', st); break
            if await pg.is_visible('.choice'):
                try: await pg.click(f'.choice[data-id="{ROUTE}"]', timeout=2000)
                except Exception: pass
                await pg.wait_for_timeout(2500); continue
            if await pg.is_visible('.hit.hold'):
                bb = await pg.locator('.hit.hold').bounding_box()
                await pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2)
                await pg.mouse.down(); await pg.wait_for_timeout(1300); await pg.mouse.up(); continue
            if await pg.is_visible('.hit.drag'):
                bb = await pg.locator('.hit.drag').bounding_box(); dz = await pg.locator('.drop-zone').bounding_box()
                await pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); await pg.mouse.down()
                for k in range(1, 13):
                    await pg.mouse.move(bb['x'] + bb['width'] / 2 + (dz['x'] + dz['width'] / 2 - bb['x'] - bb['width'] / 2) * k / 12, bb['y'] + bb['height'] / 2 + (dz['y'] + dz['height'] / 2 - bb['y'] - bb['height'] / 2) * k / 12)
                    await pg.wait_for_timeout(40)
                await pg.screenshot(path=f'{OUT}/{n:03d}_dragging.png'); n += 1
                await pg.mouse.up(); continue
            if await pg.is_visible('.hit.tap'):
                await pg.screenshot(path=f'{OUT}/{n:03d}_{tag}_hint.png'); n += 1
                await pg.click('.hit.tap', force=True, timeout=3000); continue
            if await pg.is_visible('.pan-ui'):
                for k in range(3):
                    if not await pg.is_visible('.swipe-zone.pan'): break
                    z = await pg.locator('.swipe-zone.pan').bounding_box()
                    await pg.mouse.move(z['x'] + z['width'] * .8, z['y'] + z['height'] / 2); await pg.mouse.down()
                    await pg.mouse.move(z['x'] + z['width'] * .2, z['y'] + z['height'] / 2, steps=6); await pg.mouse.up()
                    await pg.wait_for_timeout(1200)
                    await pg.screenshot(path=f'{OUT}/{n:03d}_pan{k}.png'); n += 1
                continue
            if await pg.is_visible('.swipe-zone'):
                z = await pg.locator('.swipe-zone').bounding_box()
                await pg.mouse.move(z['x'] + z['width'] * .75, z['y'] + z['height'] / 2); await pg.mouse.down()
                await pg.mouse.move(z['x'] + z['width'] * .25, z['y'] + z['height'] / 2, steps=8); await pg.mouse.up(); continue
            if await pg.is_visible('#next'):
                try: await pg.click('#next', timeout=3000)
                except Exception: continue
                await pg.wait_for_timeout(200)
                if await pg.is_visible('#next'):
                    st2 = await pg.evaluate("window.__H5.beatIdx")
                    if st2 == st['beat']:
                        try: await pg.click('#next', timeout=2000)
                        except Exception: pass
                continue
        print('errors:', errs[:10])
        await b.close()

asyncio.run(main())
