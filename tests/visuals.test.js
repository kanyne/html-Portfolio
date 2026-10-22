import {test} from 'node:test';
import assert from 'node:assert/strict';
import {glyph,badge,learningGraphic,methodologyGraphic} from '../visuals.js';
test('dimensional icons are original inline SVG with decorative accessibility semantics',()=>{
 for(const name of ['people','shield','growth','compass','puzzle','practice','book','ethics','chat','phone','mail','pin']){
  const svg=glyph(name);assert.match(svg,/viewBox="0 0 24 24"/);assert.match(svg,/aria-hidden="true"/);
 }
 assert.match(badge('shield','copper'),/tone-copper/);
});
test('infographic text preserves source methodology rather than sample placeholder copy',()=>{
 const ring=learningGraphic();assert.match(ring,/60 percent activity-based learning/);assert.match(ring,/Role plays/);
 const process=methodologyGraphic();assert.equal((process.match(/<li /g)||[]).length,3);
 for(const value of ['vision, mission, values','mystery shopping','role plays','Modular training','certificates of participation'])assert.ok(process.includes(value));
 for(const value of ['lorem ipsum','shutterstock','envato','VectorStock','Design</h3>','Code</h3>','Deploy</h3>'])assert.ok(!(ring+process).includes(value));
 assert.ok(!(ring+process).includes('<img'));
});
