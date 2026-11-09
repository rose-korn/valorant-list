import { LANG_KEY } from './i18n'

/**
 * สคริปต์เล็ก ๆ ที่ฝังในหน้า 404 และ public/index.html:
 * ถ้า path ยังไม่มี /th หรือ /en (เช่นเข้าหน้าแรก หรือลิงก์เก่า /agents) ให้เด้งไปภาษาที่เคยเลือกไว้
 * ยังไม่เคยเลือก: เบราว์เซอร์ตั้งภาษาไทย หรือเครื่องอยู่โซนเวลาไทย (Asia/Bangkok — คนไทยที่ตั้งมือถือเป็นอังกฤษ) = /th
 * นอกนั้น (คนต่างประเทศ) = /en
 * ถ้าแก้ตรงนี้ ต้องแก้สคริปต์ใน public/index.html ให้ตรงกันด้วย
 */
export const LANG_REDIRECT_JS = `(function(){var p=location.pathname;if(/^\\/(th|en)(\\/|$)/.test(p))return;var l;try{l=localStorage.getItem(${JSON.stringify(LANG_KEY)})}catch(e){}if(l!=='th'&&l!=='en'){var b=navigator.languages||[navigator.language||''];l='en';for(var i=0;i<b.length;i++)if(/^th\\b/i.test(b[i]))l='th';try{if(Intl.DateTimeFormat().resolvedOptions().timeZone==='Asia/Bangkok')l='th'}catch(e){}}location.replace('/'+l+(p==='/'?'':p.replace(/\\/index\\.html$/,''))+location.search+location.hash)})()`
