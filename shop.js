export const books = [
 {id:'modern',title:'The Modern Branch Manager’s Companion',author:'Alberta Quarcoopome',cover:'/assets/site/modern-branch-manager.png',description:'A practical companion to the practice of banking, digital banking and risk management, and the soft skills that help branch managers lead.',isbn:'978-9988-3-1037-0'},
 {id:'teller',title:'The Twenty-First Century Bank Teller: A Strategic Partner',author:'Alberta Quarcoopome',cover:'/assets/site/bank-teller.jpeg',description:'Explores the multi-faceted role of bank tellers and their significant contribution to the success of financial institutions.'},
 {id:'front',title:'My Front Desk Experience: A Young Banker’s Story',author:'Alberta Quarcoopome',cover:'/assets/site/front-desk.jpeg',description:'A three-day journey with an inexperienced but smart Front Desk Officer, balancing risk, return and great customer service.'}
];
export const totalQuantity = cart => cart.reduce((sum,item)=>sum+item.qty,0);
export function orderMessage(cart,buyer){
 return `BOOK ORDER REQUEST — ALKAN BUSINESS CONSULT\n\n${cart.map(item=>`${books.find(b=>b.id===item.id).title}\nFormat: ${item.format} | Quantity: ${item.qty} | Price on request`).join('\n\n')}\n\nTotal quantity: ${totalQuantity(cart)}\nOrder total: To be confirmed — all prices on request. Delivery costs, availability and digital fulfilment to be confirmed by Alkan.\n\nBuyer: ${buyer.name}\nPhone: ${buyer.phone}\nEmail / digital delivery: ${buyer.email}\nDelivery address: ${buyer.address || 'Digital order — not applicable'}\nNotes: ${buyer.notes || 'None'}\n\nPlease confirm pricing and payment / delivery arrangements.`;
}
export const whatsappUrl = message => `https://wa.me/233244333051?text=${encodeURIComponent(message)}`;
export const emailUrl = message => `mailto:alberta@alkanbiz.com?subject=${encodeURIComponent('Book order request — Alkan Business Consult')}&body=${encodeURIComponent(message)}`;
