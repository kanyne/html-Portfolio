type P = { size?: number; className?: string };
const base = (size = 22) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconHome = ({ size }: P) => (<svg {...base(size)}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h5v-6h4v6h5V10" /></svg>);
export const IconPin = ({ size }: P) => (<svg {...base(size)}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>);
export const IconCheck = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>);
export const IconMap = ({ size }: P) => (<svg {...base(size)}><path d="m9 4 6 2 5-2v14l-5 2-6-2-5 2V6z" /><path d="M9 4v14M15 6v14" /></svg>);
export const IconUser = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c1.2-3.5 3.9-5.5 7-5.5s5.8 2 7 5.5" /></svg>);
export const IconCart = ({ size }: P) => (<svg {...base(size)}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6" /></svg>);
export const IconSearch = ({ size }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>);
export const IconBack = ({ size }: P) => (<svg {...base(size)}><path d="M15 5 8 12l7 7" /></svg>);
export const IconShare = ({ size }: P) => (<svg {...base(size)}><circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" /><path d="m8.4 10.8 7.2-4.1M8.4 13.2l7.2 4.1" /></svg>);
export const IconHeart = ({ size, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20Z" /></svg>
);
export const IconClock = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.2 2" /></svg>);
export const IconTicket = ({ size }: P) => (<svg {...base(size)}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" /><path d="M13 6v2m0 4v2m0 4v2" strokeDasharray="1.5 3" /></svg>);
export const IconQr = ({ size }: P) => (<svg {...base(size)}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h3v3h-3zM20 14v6h-3" /></svg>);
export const IconWc = ({ size }: P) => (<svg {...base(size)}><circle cx="8" cy="5" r="1.8" /><path d="M6 20v-5H4.6l1.6-5h3.6l1.6 5H10v5z" /><circle cx="17" cy="5" r="1.8" /><path d="M14.5 20 16 12h-1.6l1.4-4h2.4l1.4 4H18l1.5 8z" /></svg>);
export const IconFood = ({ size }: P) => (<svg {...base(size)}><path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10" /><path d="M17 3c-1.5 1.5-2 3.5-2 6 0 1.6.8 2.5 2 2.5V21" /></svg>);
export const IconExit = ({ size }: P) => (<svg {...base(size)}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 8 6 12l4 4M6 12h9" /></svg>);
export const IconCar = ({ size }: P) => (<svg {...base(size)}><path d="M5 16v2M19 16v2" /><path d="M4 16v-3l1.8-4.4A2 2 0 0 1 7.6 7h8.8a2 2 0 0 1 1.8 1.6L20 13v3z" /><circle cx="7.5" cy="16" r="0.8" /><circle cx="16.5" cy="16" r="0.8" /></svg>);
export const IconInfo = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.5" /></svg>);
export const IconElevator = ({ size }: P) => (<svg {...base(size)}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="m9 10 1.6-2 1.6 2M12.8 14l1.6 2 1.6-2" /></svg>);
export const IconBell = ({ size }: P) => (<svg {...base(size)}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></svg>);
export const IconTrash = ({ size }: P) => (<svg {...base(size)}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>);
export const IconMail = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>);
export const IconPhone = ({ size }: P) => (<svg {...base(size)}><path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3Z" /></svg>);
export const IconCam = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="7" width="18" height="13" rx="3" /><circle cx="12" cy="13.5" r="3.4" /><path d="M9 7l1.5-3h3L15 7" /></svg>);
export const IconGrid = ({ size }: P) => (<svg {...base(size)}><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></svg>);
export const IconList = ({ size }: P) => (<svg {...base(size)}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>);
