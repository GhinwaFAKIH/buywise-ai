/* Content-aware editorial illustrations. Every guide gets a deterministic, distinct
   composition based on its slug and subject, without implying photographed products. */
const palettes = [
  ["#f7e7ed","#e7c7db","#a86c94","#70446a"],
  ["#e8f1ef","#c5dfd5","#699f93","#3c7167"],
  ["#f9ece0","#efd0b3","#c98f67","#885c49"],
  ["#e9e5f5","#d3c8f1","#8b80c1","#5b538f"],
  ["#e3eef7","#c4dce9","#7faabf","#477d9e"],
  ["#f1e8df","#e7d2bf","#b79a7d","#80684e"],
  ["#f6e7e9","#f0cbd3","#cd8193","#8a5666"],
  ["#e6efe3","#cedfca","#83a986","#527c59"]
];
function hash(text) { return [...text].reduce((value, char) => (value * 33 + char.charCodeAt(0)) >>> 0, 5381); }
function subjectFor(text) {
  const s = text.toLowerCase();
  if (/hair|shampoo|conditioner|scalp|frizz/.test(s)) return "hair";
  if (/sunscreen|uv.filter|spf|mineral/.test(s)) return "sun";
  if (/price|budget|value|buying.checklist/.test(s)) return "price";
  if (/retinol/.test(s)) return "retinol";
  if (/salicylic|glycolic|lactic|exfoli/.test(s)) return "acid";
  if (/hyaluronic|hydration|ceramide|moisturiz/.test(s)) return "hydration";
  if (/ingredient|inci/.test(s)) return "ingredients";
  if (/niacinamide|vitamin.c|serum/.test(s)) return "serum";
  if (/makeup|primer|glow/.test(s)) return "makeup";
  return "skincare";
}
function Bottle({ x=100, y=85, color="#fff", accent="#8e7daa", tall=false }) {
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx="0" cy="156" rx="57" ry="10" fill="#433453" opacity=".09"/>
    <rect x="-25" y="-3" width="50" height="26" rx="7" fill={accent} opacity=".75"/>
    <rect x="-12" y="-26" width="24" height="26" rx="4" fill={accent} opacity=".95"/>
    <rect x="-40" y="20" width="80" height={tall?139:115} rx="18" fill={color} stroke="#ffffff" strokeWidth="3"/>
    <rect x="-29" y="60" width="58" height={tall?73:61} rx="6" fill={accent} opacity=".17"/>
    <path d="M-22 46h44" stroke={accent} opacity=".55" strokeWidth="3" strokeLinecap="round"/>
    <path d="M-22 100h44M-18 112h36" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity=".43"/>
    <rect x="-27" y="30" width="9" height="43" rx="4" fill="#fff" opacity=".65"/>
  </g>;
}
function Jar({ x=100,y=136,accent="#8e7daa" }) {
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx="0" cy="100" rx="75" ry="11" fill="#433453" opacity=".08"/>
    <rect x="-70" y="0" width="140" height="32" rx="10" fill={accent}/>
    <rect x="-67" y="28" width="134" height="70" rx="18" fill="#fff" stroke="#f3edf5" strokeWidth="3"/>
    <rect x="-56" y="48" width="112" height="35" rx="5" fill={accent} opacity=".20"/>
    <path d="M-29 61h58M-18 73h36" stroke={accent} opacity=".52" strokeWidth="3"/>
  </g>;
}
function Hair({ accent }) {
  return <g fill="none" stroke={accent} strokeLinecap="round">
    <path d="M124 55C30 96 175 125 92 237M170 42C84 109 225 137 134 247M220 51C151 119 270 160 181 248M272 65C199 123 315 152 236 236" strokeWidth="14" opacity=".8"/>
    <path d="M124 55C30 96 175 125 92 237M170 42C84 109 225 137 134 247M220 51C151 119 270 160 181 248" strokeWidth="3" stroke="#fff" opacity=".46"/>
  </g>;
}
function Symbol({ subject, accent, id, version }) {
  if(subject==="hair")return <Hair accent={accent}/>;
  if(subject==="sun")return <g><circle cx="184" cy="124" r="69" fill="#fff4cb" stroke="#ffe2a1" strokeWidth="9"/>{Array.from({length:12},(_,i)=><path key={i} d="M184 24v-14" transform={`rotate(${i*30} 184 124)`} stroke={accent} strokeWidth="7" strokeLinecap="round"/>)}<Bottle x={250} y={122} color="#fff" accent={accent}/></g>;
  if(subject==="price")return <g><rect x="60" y="50" width="168" height="196" rx="16" fill="#fff" transform="rotate(-8 144 150)"/><path d="M96 100h94M96 127h66M96 154h94M96 181h54" stroke={accent} strokeWidth="8" opacity=".33" strokeLinecap="round"/><circle cx="260" cy="178" r="56" fill={accent}/><text x="260" y="194" textAnchor="middle" fill="#fff" fontSize="49" fontWeight="800">€</text></g>;
  if(subject==="ingredients")return <g><Bottle x={132} y={105} accent={accent}/><path d="M234 216Q313 171 272 76Q218 114 234 216Z" fill="#a5bc92"/><path d="M236 215L271 105" stroke="#fff" strokeWidth="5" opacity=".85"/><path d="M241 190l-25-26m36-9l-27-22" stroke="#fff" strokeWidth="4" opacity=".5"/></g>;
  if(subject==="hydration")return <g><Jar x={175} y={141} accent={accent}/>{[0,1,2].map((i)=><path key={i} d={`M${91+i*92} ${68+i*11}q-24 35 0 48q24-13 0-48Z`} fill="#fff" opacity=".85"/>)}</g>;
  if(subject==="acid")return <g><Bottle x={124} y={103} accent={accent}/><circle cx="261" cy="125" r="57" fill="#fff" opacity=".8"/><circle cx="250" cy="113" r="17" fill={accent} opacity=".7"/><circle cx="284" cy="147" r="13" fill={accent} opacity=".4"/><circle cx="278" cy="97" r="10" fill={accent} opacity=".3"/></g>;
  if(subject==="retinol")return <g><Bottle x={129} y={105} accent={accent}/><path d="M244 55l16 40 41 16-41 16-16 40-16-40-40-16 40-16Z" fill="#fff" opacity=".85"/><circle cx="269" cy="203" r="30" fill={accent} opacity=".35"/></g>;
  if(subject==="makeup")return <g><circle cx="168" cy="153" r="95" fill="#fff" opacity=".75"/><circle cx="168" cy="153" r="73" fill={accent} opacity=".28"/><path d="M235 245L283 93" stroke={accent} strokeWidth="19" strokeLinecap="round"/><ellipse cx="293" cy="76" rx="26" ry="38" fill={accent} transform="rotate(22 293 76)"/></g>;
  return <g><Bottle x={subject==="serum"?122:166} y={91+version%2*10} accent={accent}/><Bottle x={subject==="serum"?251:255} y={117-version%3*7} accent={accent} color="#fff6f4" tall={version%2===0}/></g>;
}
export default function EditorialVisual({ slug="", title="", topic="", className="" }) {
 const key = slug || title || topic || "beauty";
 const code = hash(key);
 const colors = palettes[code % palettes.length];
 const subject = subjectFor([slug,title,topic].join(" "));
 const gradientId = "art-" + key.replace(/[^a-zA-Z0-9]/g,"").slice(0,36);
 return <svg className={className} viewBox="0 0 380 290" preserveAspectRatio="xMidYMid slice" role="img" aria-label={title ? `Illustration for ${title}` : `${topic || "Beauty"} illustration`}>
  <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop stopColor={colors[0]}/><stop offset="1" stopColor={colors[1]}/></linearGradient></defs>
  <rect width="380" height="290" fill={`url(#${gradientId})`}/>
  <circle cx={65+code%45} cy={44+code%19} r="76" fill="#fff" opacity=".25"/>
  <circle cx={305-code%33} cy={246-code%15} r="115" fill={colors[2]} opacity=".16"/>
  <path d="M0 260Q140 220 250 268T380 249V290H0Z" fill="#fff" opacity=".22"/>
  <Symbol subject={subject} accent={colors[3]} id={gradientId} version={code%7}/>
  <circle cx={328-code%18} cy={39+code%12} r="7" fill={colors[3]} opacity=".25"/>
  <circle cx={46+code%12} cy="206" r="5" fill={colors[3]} opacity=".2"/>
 </svg>;
}
