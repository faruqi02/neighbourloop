import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(timeout=30.0) as c:
        try:
            r = await c.post('https://script.google.com/macros/s/AKfycbzkqZXmoM0WFknW5vVG60UAf_D3ZEOGyjtZuHbPkEs07GudJbZIA4ieukV60WIIqx0P/exec', json={'action':'create_user', 'id':'u_test', 'name':'Test'}, follow_redirects=True)
            print(r.status_code)
            print(r.text)
        except Exception as e:
            print("ERROR:", e)

asyncio.run(test())
