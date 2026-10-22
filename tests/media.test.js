import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const media=JSON.parse(fs.readFileSync(new URL('../data/media.json',import.meta.url)));
test('all 176 WordPress media files and two About-page images are catalogued',()=>{
 assert.equal(media.length,178);
 assert.equal(new Set(media.map(m=>m.url)).size,178);
 assert.equal(media.filter(m=>m.kind==='video').length,23);
 assert.equal(media.filter(m=>m.kind==='image').length,155);
 assert.ok(media.every(m=>new URL(m.url).hostname==='alkanbiz.com'));
 assert.equal(media.filter(m=>m.category==='Stock imagery').length,15);
 assert.ok(media.filter(m=>m.url.includes('/pexels-')).every(m=>m.category==='Stock imagery'));
 assert.ok(media.some(m=>m.url==='https://alkanbiz.com/wp-content/uploads/2026/07/Alkan-promo-final.mp4'));
 assert.ok(media.some(m=>m.url==='https://alkanbiz.com/wp-content/uploads/2021/11/logo-2.png'));
});
