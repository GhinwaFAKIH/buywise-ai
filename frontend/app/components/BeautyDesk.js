"use client";
import { useEffect, useMemo, useState } from "react";
const categories = ["Skincare", "Haircare", "Makeup"];
const steps = ["Cleanse", "Treat", "Moisturize", "Protect", "Wash", "Condition", "Style", "Other"];
const money = n => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);
const empty = { name:"", category:"Skincare", step:"Treat", price:"", size:"", note:"" };
const storageKey = email => "ghineva-beauty-desk-v1:" + (email || "preview").toLowerCase();
export default function BeautyDesk({ account, onUpgrade }) {
  const user = account?.user;
  const plan = user?.plan || "free";
  const paid = Boolean(user && ["starter", "plus"].includes(plan));
  const plus = Boolean(user && plan === "plus");
  const key = storageKey(user?.email);
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState("40");
  const [form, setForm] = useState(empty);
  const [tab, setTab] = useState("routine");
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    setLoaded(false);
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      setItems(Array.isArray(raw.items) ? raw.items.slice(0, 100) : []);
      setBudget(typeof raw.budget === "string" ? raw.budget : "40");
    } catch { setItems([]); setBudget("40"); }
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(key, JSON.stringify({ items, budget })); } catch { setNotice("Browser storage is unavailable. Your changes may not be saved."); }
  }, [items, budget, key, loaded]);
  const limit = plus ? 60 : paid ? 20 : 1;
  const spent = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0), 0), [items]);
  const remaining = Number(budget) - spent;
  const byStep = steps.map(step => ({ step, rows: items.filter(x => x.step === step && x.status === "routine") })).filter(x => x.rows.length);
  const wishlist = items.filter(x => x.status === "wishlist");
  function add(event) {
    event.preventDefault();
    if (items.length >= limit) { setNotice("You've reached your current plan's saved-item limit."); return; }
    if (!form.name.trim()) return;
    setItems(old => [...old, { ...form, name:form.name.trim().slice(0,100), note:form.note.slice(0,250), price:form.price === "" ? "" : String(Math.max(0, Number(form.price) || 0)), id: String(Date.now()) + "-" + String(old.length), status:tab === "wishlist" ? "wishlist" : "routine" }]);
    setForm(empty);
    setNotice("");
  }
  function move(id) { setItems(old => old.map(item => item.id === id ? { ...item, status:item.status === "wishlist" ? "routine" : "wishlist" } : item)); }
  function remove(id) { setItems(old => old.filter(item => item.id !== id)); }
  return <section id="beauty-workspace" className="bdSection" aria-label="My Beauty Desk">
    <div className="bdHeading"><div><span className="eyebrow">NEW · YOUR BEAUTY SPACE</span><h2>Meet your Beauty Desk</h2><p>Build a routine. Save your wishlist. Plan a budget.</p></div><div className="bdPlan">{paid ? (plus ? "PLUS" : "STARTER") : "FREE PREVIEW"}</div></div>
    <div className="bdTabs" role="group" aria-label="Beauty Desk tools">{[["routine","✦ My routine"],["wishlist","♡ Wishlist"],["budget","€ Budget"]].map(([id,label]) => <button key={id} type="button" aria-pressed={tab===id} onClick={() => {setTab(id);setNotice("");}}>{label}</button>)}</div>
    <div className="bdBody">
      {tab !== "budget" ? <div className="bdColumns">
        <div className="bdForm">
          <h3>{tab === "wishlist" ? "Save a product to consider" : "Add a routine step"}</h3>
          <form onSubmit={add}>
            <label>Product or step<input required maxLength={100} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Gentle cleanser"/></label>
            <div className="bdFields"><label>Category<select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Step<select value={form.step} onChange={e=>setForm(f=>({...f,step:e.target.value}))}>{steps.map(c=><option key={c}>{c}</option>)}</select></label></div>
            <label>Estimated price (€)<input type="number" min="0" step=".01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="Optional"/></label>
            {paid && <label>Personal note<textarea maxLength={250} rows={2} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Why you're considering it"/></label>}
            <button className="bdPrimary" type="submit" disabled={items.length >= limit}>+ Save {tab === "wishlist" ? "to wishlist" : "to routine"}</button>
          </form>
          <small>{items.length}/{limit} saved items · Saved in this browser only</small>
          {!paid && <p className="bdUpgrade">Want more than one saved item, notes and detailed planning? <button type="button" onClick={onUpgrade}>Explore paid plans →</button></p>}
        </div>
        <div className="bdSaved">
          <h3>{tab === "wishlist" ? "Your wishlist" : "Your routine"}</h3>
          {(tab==="wishlist" ? wishlist : items.filter(x=>x.status==="routine")).length === 0 ? <div className="bdEmpty">Your space is ready. Add your first {tab === "wishlist" ? "product" : "step"}.</div> : (tab==="wishlist" ? wishlist : items.filter(x=>x.status==="routine")).map(item => <article key={item.id} className="bdItem"><div><span>{item.category} · {item.step}</span><strong>{item.name}</strong>{item.note && <small>{item.note}</small>}</div><div><b>{item.price ? money(Number(item.price)) : "—"}</b><div className="bdItemActions"><button type="button" onClick={()=>move(item.id)} title="Move between wishlist and routine">Move ↔</button><button type="button" onClick={()=>remove(item.id)} title="Remove saved item">Remove</button></div></div></article>)}
        </div>
      </div> : <div className="bdBudget">
        <div><h3>Beauty spending planner</h3><p>Set an amount and see the estimated cost of your saved products.</p><label>Monthly budget (€)<input type="number" min="0" step="1" value={budget} onChange={e=>setBudget(e.target.value)} disabled={!plus}/></label>{!plus && <p className="bdUpgrade">Editable monthly budgets are available with Plus. <button type="button" onClick={onUpgrade}>View plans →</button></p>}</div>
        <div className="bdBudgetStats"><div><small>Your saved items</small><strong>{money(spent)}</strong></div><div><small>{plus ? "Remaining budget" : "Example €40 budget balance"}</small><strong>{money(remaining)}</strong></div><div className="bdBudgetBar" role="progressbar" aria-label="Budget used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(budget)>0?Math.min(100,Math.round(spent/Number(budget)*100)):0}><span style={{width:(Number(budget)>0?Math.min(100,spent/Number(budget)*100):0)+"%"}}/></div><small>Estimated costs entered by you—not live prices or a financial account.</small></div>
      </div>}
      {notice && <p role="status" className="bdNotice">{notice}</p>}
    </div>
    <p className="bdDisclaimer">Beauty Desk stores information locally in your current browser. It does not sync across devices or provide skincare diagnoses. Do not store sensitive personal information.</p>
  </section>;
}
