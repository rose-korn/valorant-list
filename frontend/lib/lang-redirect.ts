import { LANG_KEY } from './i18n'

/**
 * สคริปต์เล็ก ๆ ที่ฝังในหน้า 404 และ public/index.html:
 * ถ้า path ยังไม่มี /th หรือ /en (เช่นเข้าหน้าแรก หรือลิงก์เก่า /agents) ให้เด้งไปภาษาที่เคยเลือกไว้ (ค่าเริ่มต้นไทย)
 */
export const LANG_REDIRECT_JS = `(function(){var p=location.pathname;if(/^\\/(th|en)(\\/|$)/.test(p))return;var l;try{l=localStorage.getItem(${JSON.stringify(LANG_KEY)})}catch(e){}if(l!=='en')l='th';location.replace('/'+l+(p==='/'?'':p.replace(/\\/index\\.html$/,''))+location.search+location.hash)})()`
