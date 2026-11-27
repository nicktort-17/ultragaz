window.mqtt={connect(url,opts){const bc=new BroadcastChannel('mq');const h={};const subs=[];const c={on(e,f){(h[e]=h[e]||[]).push(f);return c},emit(e,...a){(h[e]||[]).forEach(f=>f(...a))},
 subscribe(t){subs.push(t.replace('+',''))},publish(t,m){bc.postMessage({t,m:String(m)})},end(){bc.close()}};
 bc.onmessage=e=>{const {t,m}=e.data;if(subs.some(s=>t.startsWith(s)&&!t.slice(s.length).includes('/')))c.emit('message',t,{toString:()=>m})};
 setTimeout(()=>c.emit('connect'),50);return c}};
