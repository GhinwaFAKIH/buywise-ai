"use client";
import { useEffect, useState } from "react";
export default function PwaSupport() {
 const [online,setOnline]=useState(true), [prompt,setPrompt]=useState(null), [installed,setInstalled]=useState(false), [ios,setIos]=useState(false), [help,setHelp]=useState(false);
 useEffect(() => {
  const display=window.matchMedia("(display-mode: standalone)");
  const syncDisplay=()=>setInstalled(display.matches || navigator.standalone===true), syncOnline=()=>setOnline(navigator.onLine);
  const capture=event=>{event.preventDefault();setPrompt(event);}, installedHandler=()=>{setInstalled(true);setPrompt(null);};
  syncDisplay();syncOnline();setIos(/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1));
  window.addEventListener("online",syncOnline);window.addEventListener("offline",syncOnline);window.addEventListener("beforeinstallprompt",capture);window.addEventListener("appinstalled",installedHandler);display.addEventListener("change",syncDisplay);
  if ("serviceWorker" in navigator && process.env.NODE_ENV==="production") navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});
  return ()=>{window.removeEventListener("online",syncOnline);window.removeEventListener("offline",syncOnline);window.removeEventListener("beforeinstallprompt",capture);window.removeEventListener("appinstalled",installedHandler);display.removeEventListener("change",syncDisplay);};
 },[]);
 async function install(){if(!prompt){setHelp(value=>!value);return;}await prompt.prompt();await prompt.userChoice;setPrompt(null);}
 return <aside className="pwaSupport" aria-label="App installation and connection">{!online&&<p role="status" className="offlineNotice">You’re offline. Reconnect to analyze products or access your account.</p>}{!installed&&<div className="installBar"><span><strong>Your skincare shopping companion</strong><br/>Add BuyWise AI to your home screen for quick access.</span><button type="button" onClick={install} aria-expanded={prompt?undefined:help}>{prompt?"Install app":"How to install"}</button>{help&&<p>{ios?"Open this website in Safari, tap Share, then Add to Home Screen.":"Open your browser’s menu and choose Install app or Add to Home Screen, if available."}</p>}</div>}</aside>;
}
