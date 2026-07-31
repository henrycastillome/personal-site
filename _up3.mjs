import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const S = '/private/tmp/claude-501/-Users-henrycastillomelo-madeline-portfolio/defc6b75-74b1-4ecd-8c31-333361cd4f4f/scratchpad';
const raw = readFileSync('.env.local','utf8');
const E = Object.fromEntries(raw.split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const db = createClient(E.NEXT_PUBLIC_SUPABASE_URL, E.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const b = await chromium.launch();
const gen = await (await b.newContext()).newPage(); await gen.goto('about:blank');
const dataUrl = await gen.evaluate(()=>{const c=document.createElement('canvas');c.width=3200;c.height=3200;const x=c.getContext('2d');const im=x.createImageData(3200,3200);for(let i=0;i<im.data.length;i+=4){im.data[i]=Math.random()*255;im.data[i+1]=Math.random()*255;im.data[i+2]=Math.random()*255;im.data[i+3]=255;}x.putImageData(im,0,0);return c.toDataURL('image/jpeg',0.92);});
const buffer = Buffer.from(dataUrl.split(',')[1],'base64');
console.log('source JPEG:', (buffer.length/1024/1024).toFixed(1),'MB');
const cookies = JSON.parse(readFileSync(`${S}/cookies.json`,'utf8'));
const ctx = await b.newContext({viewport:{width:900,height:900}}); await ctx.addCookies(cookies);
const p = await ctx.newPage();
p.on('pageerror', e=>console.log('  [pageerror]', e.message));
await p.goto('http://localhost:3200/admin/hero',{waitUntil:'domcontentloaded'});
const before = await p.locator('input[name="profile_image"]').inputValue();
await p.locator('input[type="file"]').first().setInputFiles({name:'huge-photo.jpg',mimeType:'image/jpeg',buffer});
let after = before, errText='';
for(let i=0;i<50;i++){
  after = await p.locator('input[name="profile_image"]').inputValue();
  if(after && after!==before && after.startsWith('http')) break;
  errText = await p.getByTestId('image-uploader-profile_image').locator('text=/failed|smaller|Use a/i').first().innerText().catch(()=>'');
  if(errText) break;
  await p.waitForTimeout(500);
}
if(errText) console.log('  UI error shown:', JSON.stringify(errText));
const uploaded = (after && after!==before && after.startsWith('http')) ? after : '';
const name = uploaded ? uploaded.split('/henry-portfolio-images/')[1] : '';
console.log('new object:', name || '(none captured)');
let pass=false;
if(uploaded){
  const r = await fetch(uploaded);
  const kb = ((+r.headers.get('content-length'))/1024).toFixed(0);
  console.log('  type=', r.headers.get('content-type'), 'size=', kb+'KB');
  pass = r.ok && r.headers.get('content-type')==='image/webp' && (+r.headers.get('content-length'))<2_000_000;
  // SURGICAL delete: only if the path clearly contains 'huge-photo'
  if(name.includes('huge-photo')){ const {error}=await db.storage.from('henry-portfolio-images').remove([name]); console.log('  cleanup:', error?error.message:'deleted '+name); }
  else console.log('  WARNING: not deleting, name lacks huge-photo:', name);
}
// re-confirm avatar
const { data: all } = await db.storage.from('henry-portfolio-images').list('hero',{limit:100});
console.log('avatar present:', all.some(o=>o.name.includes('sidebar-avatar'))?'YES ✓':'NO ✗');
console.log(pass?'RESULT: PASS':'RESULT: FAIL');
await b.close(); process.exit(pass?0:1);
