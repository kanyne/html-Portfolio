// Original lightweight SVG/CSS artwork inspired by the user's infographic references.
// No reference image, watermark or placeholder copy is reproduced.
const paths={
 people:'<circle cx="9" cy="8" r="3.3"/><path d="M2.5 21v-2.5a6.5 6.5 0 0 1 13 0V21M17 5a3.5 3.5 0 0 1 0 7m1 3a5 5 0 0 1 3.5 4.8V21"/>',
 shield:'<path d="M12 2 3.5 5.5v6c0 5.3 8.5 10.5 8.5 10.5s8.5-5.2 8.5-10.5v-6L12 2Z"/><path d="m8 12 2.8 2.8L16.5 9"/>',
 growth:'<path d="M3 20V4m0 16h18M7 16l5-6 4 3 5-8m-5 0h5v5"/>',
 compass:'<circle cx="12" cy="12" r="9.5"/><path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3 5.3-2.1Z"/>',
 puzzle:'<path d="M9 3H4v6a3 3 0 1 1 0 6v6h6a3 3 0 1 1 6 0h5v-6a3 3 0 1 1 0-6V3h-6a3 3 0 1 1-6 0Z"/>',
 practice:'<path d="M4 3h16v12H4zM12 15v6m-5 0h10M7 11l3-3 3 2 4-4"/>',
 book:'<path d="M12 5C8 2 4 3 2 4v16c3-1.5 6-1.5 10 1 4-2.5 7-2.5 10-1V4c-2-1-6-2-10 1Zm0 0v16"/>',
 ethics:'<path d="M12 2v19M7 21h10M4 6h16M6 6l-4 8h8L6 6Zm12 0-4 8h8l-4-8Z"/>',
 chat:'<path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L2 22l2-6a9 9 0 1 1 17-5Z"/><path d="M7 10h10M7 14h6"/>',
 phone:'<path d="m7 2 3 5-3 3a16 16 0 0 0 7 7l3-3 5 3-1 4c-1 3-9 0-14-5S-1 3 2 2h5Z"/>',
 mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/>',
 pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'
};
export const glyph=name=>`<svg class="infographic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.compass}</svg>`;
export const badge=(name,tone='teal',extra='')=>`<span class="dimensional-badge tone-${tone} ${extra}" aria-hidden="true"><span class="badge-disc">${glyph(name)}</span></span>`;
export function learningGraphic(){return `<div class="learning-infographic" aria-label="60 percent activity-based learning, as stated in Alkan’s training proposal"><div class="learning-ring"><div class="learning-core"><span class="ring-kicker">THE ALKAN APPROACH</span><strong>60<span>%</span></strong><span class="ring-label">activity-based<br>learning</span></div></div><div class="learning-orbit orbit-one">${badge('people','teal')}<span>Group work</span></div><div class="learning-orbit orbit-two">${badge('chat','copper')}<span>Role plays</span></div><div class="learning-orbit orbit-three">${badge('practice','slate')}<span>Real case studies</span></div><span class="graphic-footnote">PRACTICAL. PARTICIPATORY. PERSONAL.</span></div>`}
export function methodologyGraphic(){return `<ol class="process-infographic" aria-label="Alkan’s training approach"><li class="process-step tone-teal"><div class="process-visual">${badge('compass','teal')}<span class="process-number">01</span></div><div class="process-copy"><span class="process-kicker">UNDERSTAND</span><h3>Your institution first</h3><p>We bring your vision, mission, values and strategy into the sessions. When agreed, mystery shopping helps identify service delivery gaps.</p></div></li><li class="process-step tone-copper"><div class="process-visual">${badge('puzzle','copper')}<span class="process-number">02</span></div><div class="process-copy"><span class="process-kicker">PARTICIPATE</span><h3>Learn by doing</h3><p>Videos, role plays, group discussions and real case studies make learning practical. Flexible seating encourages everyone to contribute.</p></div></li><li class="process-step tone-slate"><div class="process-visual">${badge('practice','slate')}<span class="process-number">03</span></div><div class="process-copy"><span class="process-kicker">PUT INTO PRACTICE</span><h3>Take learning back to work</h3><p>Modular training is available when required. Soft-copy presentations go to the training coordinator, with certificates of participation and feedback to management.</p></div></li></ol>`}
