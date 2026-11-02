// คำอธิบายสกิลภาษาไทยที่เขียนใหม่เอง แทนคำแปลจาก valorant-api ที่อ่านแล้วงง
// (เช่น EQUIP แปลเป็น "ติดตั้ง", ALT FIRE แปลเป็น "กดโหมดยิงเสริม")
//
// key ชั้นแรก = uuid ของเอเจนต์, ชั้นที่สอง = slot ของสกิล (Ability1, Ability2, Grenade, Ultimate, Passive)
// `en` = คำอธิบายภาษาอังกฤษตอนที่เราเขียนฉบับไทยนี้ ถ้า Riot แก้สกิล (ตัวเลขเปลี่ยน ฯลฯ)
// ข้อความอังกฤษจาก API จะไม่ตรงกับ `en` แล้วเว็บจะกลับไปใช้คำแปลจาก API เอง จะได้ไม่โชว์ข้อมูลเก่า
// ดูรายการที่ตกรุ่นได้จาก `node scripts/dump-abilities.mjs`
//
// แท็กอย่าง <whitebold>…</> และ <teal>…</> ใช้ได้เหมือนข้อความจาก API (components/RichText.tsx แปลงให้)
// ชื่อสกิลคงเป็นภาษาอังกฤษตามในเกม

import type { Agent } from './valorant'

export interface ThAbilityOverride {
  en: string
  th: string
}

export const TH_ABILITY_OVERRIDES: Record<string, Record<string, ThAbilityOverride>> = {
  // Astra
  '41fb69c1-4189-7b37-f117-bcaf1e96f1bf': {
    Ability1: {
      en: "ACTIVATE a <whitebold>Star</> to detonate it, <debuffred>concussing</> all players hit.",
      th: "เลือก<whitebold>ดาว</>แล้วกดสกิลนี้เพื่อจุดระเบิด ผู้เล่นทุกคนที่โดนจะ<debuffred>มึน</>",
    },
    Ability2: {
      en: "ACTIVATE a <whitebold>Star</> to transform it into a smoke.",
      th: "เลือก<whitebold>ดาว</>แล้วกดสกิลนี้เพื่อเปลี่ยนดาวเป็นควัน",
    },
    Grenade: {
      en: "ACTIVATE a <whitebold>Star</> to create a zone that <debuffred>pulls</> all players to the center, exploding and applying <debuffred>vulnerable</> to all players.",
      th: "เลือก<whitebold>ดาว</>แล้วกดสกิลนี้เพื่อสร้างโซนที่<debuffred>ดูด</>ผู้เล่นทุกคนเข้าหาจุดกลาง จากนั้นระเบิด ทำให้ผู้เล่นทุกคนติด<debuffred>เปราะบาง</>",
    },
    Ultimate: {
      en: "ENTER <whitebold>Astral Form</>. ALT FIRE to EQUIP <whitebold>Cosmic Divide</>. FIRE to set, pivot and FIRE again to create an indestructible wall that blocks audio.",
      th: "เข้าร่าง <whitebold>Astral Form</> แล้วคลิกขวาเพื่อหยิบ <whitebold>Cosmic Divide</> คลิกซ้ายเพื่อปักจุด หมุนหาทิศ แล้วคลิกซ้ายอีกครั้งเพื่อสร้างกำแพงยาวที่ทำลายไม่ได้และกันเสียงข้ามฝั่ง",
    },
    Passive: {
      en: "ACTIVATE ULTIMATE to ENTER <whitebold>Astral Form</>. FIRE to cast <whitebold>Stars</>. \r\n\r\nINTERACT to recall a <whitebold>Star</>. Recalling a <whitebold>Star</> forms a brief smoke.",
      th: "กดอัลติเพื่อเข้าร่าง <whitebold>Astral Form</> คลิกซ้ายเพื่อวาง<whitebold>ดาว</> กด F เพื่อเรียก<whitebold>ดาว</>กลับ ตอนเรียกกลับจะมีควันขึ้นแป๊บหนึ่ง",
    },
  },
  // Breach
  '5f8d3a7f-467b-97f3-062c-13acf203c006': {
    Ability1: {
      en: "EQUIP a <whitebold>Flashpoint</>. FIRE to send it through a wall, exploding to <debuffred>flash</> all players looking at it.",
      th: "หยิบ <whitebold>Flashpoint</> ขึ้นมา คลิกซ้ายเพื่อยิงทะลุกำแพง ระเบิดแล้ว<debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่",
    },
    Ability2: {
      en: "EQUIP <whitebold>Fault Line</>. HOLD FIRE to increase distance. RELEASE to detonate a zone that <debuffred>concusses</> all players.",
      th: "หยิบ <whitebold>Fault Line</> ขึ้นมา กดคลิกซ้ายค้างเพื่อยืดระยะ ปล่อยเพื่อระเบิดเป็นแนว ผู้เล่นทุกคนในแนวจะ<debuffred>มึน</>",
    },
    Grenade: {
      en: "EQUIP <whitebold>Aftershock</>. FIRE to send a zone through a wall, exploding to repeatedly deal <debuffred>damage</> to all players.",
      th: "หยิบ <whitebold>Aftershock</> ขึ้นมา คลิกซ้ายเพื่อยิงทะลุกำแพง ระเบิดเป็นจังหวะหลายครั้ง ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคนในโซน",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Rolling Thunder</>. FIRE to send forward a wave that <debuffred>concusses</> and <debuffred>knocks up</> all players.",
      th: "หยิบ <whitebold>Rolling Thunder</> ขึ้นมา คลิกซ้ายเพื่อปล่อยคลื่นไปข้างหน้า ผู้เล่นทุกคนที่โดนจะ<debuffred>มึน</>และ<debuffred>กระเด็นลอย</>",
    },
  },
  // Brimstone
  '9f0d8ba9-4140-b941-57d3-a7ad57c6b417': {
    Grenade: {
      en: "INSTANTLY throw a <whitebold>Stim Beacon</>. On landing, create a zone that grants <teal>combat stim</> and <teal>haste</> to allies.",
      th: "ขว้าง <whitebold>Stim Beacon</> ออกไปทันที ตกพื้นแล้วสร้างโซนที่ให้เพื่อนได้ <teal>Combat Stim</> และ<teal>วิ่งเร็วขึ้น</>",
    },
    Ability1: {
      en: "EQUIP <whitebold>Incendiary</>. FIRE to launch. On landing, create a zone that deals <debuffred>damage</> to all players.",
      th: "หยิบ <whitebold>Incendiary</> ขึ้นมา คลิกซ้ายเพื่อยิงออกไป ตกพื้นแล้วเกิดโซนไฟที่ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคน",
    },
    Ability2: {
      en: "EQUIP a tactical map. FIRE to set smoke locations. ALT FIRE to cast smokes.",
      th: "เปิดแผนที่ยุทธวิธี คลิกซ้ายเพื่อเลือกจุดลงควัน คลิกขวาเพื่อปล่อยควัน",
    },
    Ultimate: {
      en: "EQUIP a tactical map. FIRE to cast an <whitebold>Orbital Strike</> at a location, dealing high <debuffred>damage</> over time to all players.",
      th: "เปิดแผนที่ยุทธวิธี คลิกซ้ายเพื่อสั่ง <whitebold>Orbital Strike</> ลงจุดที่เลือก ทำ<debuffred>ดาเมจ</>หนักต่อเนื่องกับผู้เล่นทุกคนในโซน",
    },
  },
  // Chamber
  '22697a3d-45bf-8dd7-4fec-84a9e28c69d7': {
    Ability2: {
      en: "EQUIP a destructible <whitebold>Rendezvous</>. FIRE to place. While in range, REACTIVATE to instantly teleport to it.\r\n\r\nCan be recalled.",
      th: "หยิบ <whitebold>Rendezvous</> ขึ้นมา คลิกซ้ายเพื่อวาง ถ้ายืนอยู่ในระยะ กดสกิลซ้ำเพื่อวาร์ปกลับไปที่จุดนั้นทันที ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Trademark</>. FIRE to place. Triggers on nearby visible enemies in range, creating a zone that <debuffred>slows</> all players.\r\n\r\nCan be recalled.",
      th: "หยิบ <whitebold>Trademark</> ขึ้นมา คลิกซ้ายเพื่อวาง ทำงานเมื่อเห็นศัตรูเข้ามาใกล้ แล้วสร้างโซนที่<debuffred>สโลว์</>ผู้เล่นทุกคน ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Ability1: {
      en: "EQUIP <whitebold>Headhunter</>. FIRE to shoot. ALT FIRE to aim down sights.",
      th: "หยิบปืนพก <whitebold>Headhunter</> ขึ้นมา คลิกซ้ายเพื่อยิง คลิกขวาเพื่อส่องสโคป",
    },
    Ultimate: {
      en: "ACTIVATE to access a sniper rifle that deals <debuffred>lethal damage</> with direct hits to the upper body.\r\n\r\nFIRE to shoot. ALT FIRE to aim down sights. On kills, create a zone that <debuffred>slows</> all players.",
      th: "กดใช้เพื่อเรียกปืนสไนเปอร์ ยิงโดนลำตัวท่อนบนขึ้นไปตาย<debuffred>ในนัดเดียว</> คลิกซ้ายเพื่อยิง คลิกขวาเพื่อส่องสโคป ฆ่าได้แล้วจะเกิดโซนที่<debuffred>สโลว์</>ผู้เล่นทุกคน",
    },
  },
  // Clove
  '1dbf2edd-4729-0984-3115-daa5eed44993': {
    Grenade: {
      en: "ACTIVATE on a targeted dead enemy that you damaged or killed to gain <teal>haste</> and <teal>overheal</>.",
      th: "เล็งศพศัตรูที่เราเพิ่งทำดาเมจหรือฆ่าไป แล้วกดใช้ จะได้<teal>วิ่งเร็วขึ้น</>และ<teal>เลือดเกิน</>ชั่วคราว",
    },
    Ability2: {
      en: "EQUIP a tactical map. FIRE to set smoke locations. ALT FIRE to cast smokes.\r\n\r\nWhile dead, Clove can access <whitebold>Ruse</> to cast brief smokes.",
      th: "เปิดแผนที่ยุทธวิธี คลิกซ้ายเพื่อเลือกจุดลงควัน คลิกขวาเพื่อปล่อยควัน ถึงตายไปแล้ว Clove ก็ยังใช้ <whitebold>Ruse</> ลงควันสั้น ๆ ได้",
    },
    Ultimate: {
      en: "On death, ACTIVATE to channel a <teal>self-resurrect</>. During the channel, Clove is <teal>intangible</>. REACTIVATE to end the channel early. Once resurrected, secure a kill or damaging assist to stay alive.",
      th: "ตอนตาย กดใช้เพื่อเริ่ม<teal>ชุบชีวิตตัวเอง</> ระหว่างนั้น Clove จะ<teal>ไร้ตัวตน</> โดนอะไรไม่ได้ กดซ้ำเพื่อหยุดก่อน ฟื้นแล้วต้องฆ่าหรือช่วยทำดาเมจให้ได้ ไม่อย่างนั้นจะตายอีกรอบ",
    },
    Ability1: {
      en: "EQUIP <whitebold>Meddle</>. FIRE to throw. Explodes on landing, <debuffred>decaying</> all players.",
      th: "หยิบ <whitebold>Meddle</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วระเบิด ผู้เล่นทุกคนที่โดนจะ<debuffred>เลือดลดชั่วคราว</>",
    },
  },
  // Cypher
  '117ed9e3-49f3-6512-3ccf-0cada7e3823b': {
    Ability1: {
      en: "INSTANTLY throw a <whitebold>Cyber Cage</>. INTERACT to create a vision-blocking cylinder that plays an audio cue when enemies come in contact.\r\n\r\nCan be picked up during BUY PHASE.",
      th: "ขว้าง <whitebold>Cyber Cage</> ออกไปทันที กด F เพื่อเปิดกรงเป็นม่านทรงกระบอกบังสายตา ศัตรูเดินผ่านจะมีเสียงเตือน เก็บคืนได้ช่วงซื้อของ",
    },
    Ability2: {
      en: "EQUIP a destructible <whitebold>Spycam</>. FIRE to place. <whitebold>Spycam</> <teal>stealths</> after placement. REACTIVATE to control it. FIRE to shoot a dart that <debuffred>snapshots</> enemies hit until they remove it.\r\n\r\nCan be picked up.",
      th: "หยิบ <whitebold>Spycam</> ขึ้นมา คลิกซ้ายเพื่อติด กล้องจะ<teal>ล่องหน</>หลังติดเสร็จ กดสกิลซ้ำเพื่อเข้าไปดูกล้อง คลิกซ้ายเพื่อยิงลูกดอกที่<debuffred>เผยตำแหน่ง</>ศัตรูที่โดนเป็นระยะจนกว่าจะดึงออก ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Trapwire</>. FIRE to place a wire between surfaces. <whitebold>Trapwire</> <teal>stealths</> after placement. Triggers when enemies come in contact, <debuffred>tethering</> enemies, and after a delay, <debuffred>revealing</> them if <whitebold>Trapwire</> is not destroyed.\r\n\r\nCan be picked up.",
      th: "หยิบ <whitebold>Trapwire</> ขึ้นมา คลิกซ้ายเพื่อขึงลวดระหว่างสองผนัง ลวดจะ<teal>ล่องหน</>หลังขึงเสร็จ ศัตรูเดินชนจะ<debuffred>ตรึงอยู่กับที่</> ถ้าศัตรูไม่ยิงลวดพังทัน จะโดน<debuffred>เผยตำแหน่ง</> ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Ultimate: {
      en: "ACTIVATE on a targeted dead enemy. After a delay, <debuffred>snapshot</> living enemies twice.",
      th: "เล็งศพศัตรูแล้วกดใช้ ผ่านไปครู่หนึ่งจะ<debuffred>เผยตำแหน่ง</>ศัตรูที่ยังรอดอยู่ทั้งหมดสองครั้ง",
    },
  },
  // Deadlock
  'cc8b64c8-4b25-4ff9-6e7f-37b4da43d235': {
    Ability1: {
      en: "EQUIP a destructible <whitebold>Sonic Sensor</>. FIRE to place. Triggers on nearby detected enemy noise, creating a zone that <debuffred>concusses</> all players. <whitebold>Sonic Sensor</> <teal>stealths</> after placement.\r\n\r\nCan be picked up.",
      th: "หยิบ <whitebold>Sonic Sensor</> ขึ้นมา คลิกซ้ายเพื่อวาง ถ้าได้ยินเสียงศัตรูใกล้ ๆ จะสร้างโซนที่ทำให้ผู้เล่นทุกคน<debuffred>มึน</> เซนเซอร์จะ<teal>ล่องหน</>หลังวาง ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Grenade: {
      en: "EQUIP <whitebold>Barrier Mesh</>. FIRE to throw. On landing, create destructible markers that fortify after a delay. These markers form barriers that block player movement.",
      th: "หยิบ <whitebold>Barrier Mesh</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วจะปักหมุดที่ค่อย ๆ แข็งขึ้น หมุดพวกนี้สร้างแนวกั้นไม่ให้ผู้เล่นเดินผ่าน หมุดยิงพังได้",
    },
    Ability2: {
      en: "EQUIP <whitebold>GravNet</>. FIRE to throw. ALT FIRE to lob. Explodes on landing, forcing all players to <debuffred>crouch</> and move <debuffred>slowly</> until they remove the net.",
      th: "หยิบ <whitebold>GravNet</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ ตกพื้นแล้วระเบิด ผู้เล่นทุกคนที่โดนต้อง<debuffred>ย่อตัว</>และ<debuffred>เดินช้าลง</>จนกว่าจะแกะตาข่ายออก",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Annihilation</>. FIRE to launch a zone, forcing the first enemy caught into a destructible cocoon that pulls them along a path for <debuffred>lethal damage</> unless the cocoon is destroyed.",
      th: "หยิบ <whitebold>Annihilation</> ขึ้นมา คลิกซ้ายเพื่อยิงออกไป ศัตรูคนแรกที่โดนจะถูกลวดนาโนห่อตัวแล้วลากไปตามทาง ถ้าเพื่อนไม่ยิงทำลายรังลวดทันจะ<debuffred>ตาย</>",
    },
  },
  // Fade
  'dade69b4-4f5a-8528-247b-219e5a1facd6': {
    Ability1: {
      en: "EQUIP <whitebold>Seize</>. FIRE to throw. REACTIVATE to drop early. On landing, <debuffred>deafen</>, <debuffred>decay</>, and <debuffred>tether</> enemies.",
      th: "หยิบ <whitebold>Seize</> ขึ้นมา คลิกซ้ายเพื่อขว้าง กดสกิลซ้ำเพื่อให้ร่วงลงก่อน ตกพื้นแล้วศัตรูในโซนจะ<debuffred>หูอื้อ</> <debuffred>เลือดลดชั่วคราว</> และ<debuffred>ตรึงอยู่กับที่</>",
    },
    Ability2: {
      en: "EQUIP a destructible <whitebold>Haunt</>. FIRE to throw. REACTIVATE to drop early. On landing, <debuffred>mark</> and <debuffred>reveal</> enemies in range and line of sight.",
      th: "หยิบ <whitebold>Haunt</> ขึ้นมา คลิกซ้ายเพื่อขว้าง กดสกิลซ้ำเพื่อให้ร่วงลงก่อน ตกพื้นแล้วจะ<debuffred>ติดเครื่องหมาย</>และ<debuffred>เผยตำแหน่ง</>ศัตรูที่อยู่ในระยะและมองเห็นได้ ศัตรูยิงพังได้",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Prowler</>. FIRE to send it forward. HOLD FIRE to steer towards your crosshair. <debuffred>Chases</> the first enemy or <whitebold>Terror Trail</> it sees, <debuffred>nearsighting</> on impact.",
      th: "หยิบ <whitebold>Prowler</> ขึ้นมา คลิกซ้ายเพื่อปล่อยไปข้างหน้า กดคลิกซ้ายค้างเพื่อบังคับทิศตามเป้าเล็ง จะ<debuffred>วิ่งไล่</>ศัตรูหรือ <whitebold>Terror Trail</> อันแรกที่เห็น กัดโดนแล้วศัตรูจะ<debuffred>มองเห็นแค่ระยะใกล้</> ศัตรูยิงพังได้",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Nightfall</>. FIRE to send forward a wave that <debuffred>deafens</>, <debuffred>decays</>, and <debuffred>marks</> enemies.",
      th: "หยิบ <whitebold>Nightfall</> ขึ้นมา คลิกซ้ายเพื่อปล่อยคลื่นไปข้างหน้า ศัตรูที่โดนจะ<debuffred>หูอื้อ</> <debuffred>เลือดลดชั่วคราว</> และ<debuffred>ติดเครื่องหมาย</>",
    },
    Passive: {
      en: "<debuffred>Marked</> enemies have their location tracked by <whitebold>Terror Trails</>.",
      th: "ศัตรูที่<debuffred>ติดเครื่องหมาย</>จะทิ้ง <whitebold>Terror Trails</> ไว้ตามทางที่เดิน ทำให้ตามตัวได้",
    },
  },
  // Gekko
  'e370fa57-4757-3604-3648-499e1f642d3f': {
    Ability1: {
      en: "EQUIP a destructible <whitebold>Wingman</>. FIRE to send it forward. <debuffred>Chases</> the first enemy it sees, <debuffred>concussing</> on impact. ALT FIRE to have <whitebold>Wingman</> plant or defuse at a targeted bomb site.\r\n\r\nReverts to a <whitebold>Globule</>.",
      th: "หยิบ <whitebold>Wingman</> ขึ้นมา คลิกซ้ายเพื่อปล่อยไปข้างหน้า จะ<debuffred>วิ่งไล่</>ศัตรูคนแรกที่เห็น ชนแล้วศัตรูจะ<debuffred>มึน</> หรือคลิกขวาที่ไซต์เพื่อสั่งให้ไปวางหรือกู้ Spike แทน ใช้เสร็จจะกลายเป็น <whitebold>Globule</> ศัตรูยิงพังได้",
    },
    Ability2: {
      en: "EQUIP a destructible <whitebold>Dizzy</>. FIRE to throw. Fires plasma at enemies in line of sight, <debuffred>blinding</> them.\r\n\r\nReverts to a <whitebold>Globule</>.",
      th: "หยิบ <whitebold>Dizzy</> ขึ้นมา คลิกซ้ายเพื่อขว้าง จะพ่นพลาสมาใส่ศัตรูที่มองเห็น ทำให้<debuffred>ตาบอด</> ใช้เสร็จจะกลายเป็น <whitebold>Globule</> ศัตรูยิงพังได้",
    },
    Grenade: {
      en: "EQUIP <whitebold>Mosh</>. FIRE to throw. ALT FIRE to lob. On landing, create a zone that deals low <debuffred>damage</> over time before exploding, dealing high <debuffred>damage</> to all players.\r\n\r\nReverts to a <whitebold>Globule</>.",
      th: "หยิบ <whitebold>Mosh</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ ตกพื้นแล้วเกิดโซนที่ทำ<debuffred>ดาเมจ</>เบา ๆ ต่อเนื่อง ก่อนระเบิดทำ<debuffred>ดาเมจ</>หนักกับผู้เล่นทุกคน ใช้เสร็จจะกลายเป็น <whitebold>Globule</>",
    },
    Ultimate: {
      en: "EQUIP a destructible <whitebold>Thrash</>. FIRE to take control. FIRE again to lunge and explode, <debuffred>detaining</> all players. FIRE while lunging to explode early.\r\n\r\nReverts to a <whitebold>Globule</> only once.",
      th: "หยิบ <whitebold>Thrash</> ขึ้นมา คลิกซ้ายเพื่อบังคับ คลิกซ้ายอีกครั้งเพื่อพุ่งแล้วระเบิด ผู้เล่นทุกคนที่โดนจะ<debuffred>ติดขัง</> ระหว่างพุ่งคลิกซ้ายเพื่อระเบิดก่อนได้ กลายเป็น <whitebold>Globule</> ได้ครั้งเดียว ศัตรูยิงพังได้",
    },
    Passive: {
      en: "Gekko’s abilities transform into a <whitebold>Globule</> after use.\r\n\r\nINTERACT to reclaim nearby <whitebold>Globules</> to gain another charge after a short cooldown.",
      th: "สกิลของ Gekko ใช้เสร็จจะกลายเป็น <whitebold>Globule</> เดินไปใกล้ ๆ แล้วกด F เพื่อเก็บ รอคูลดาวน์สั้น ๆ ก็ได้สกิลนั้นคืนมาอีกครั้ง",
    },
  },
  // Harbor
  '95b78ed7-4637-86d9-7e41-71ba8c293152': {
    Ability1: {
      en: "EQUIP <whitebold>High Tide</>. FIRE to send forward a vision-blocking wall that <debuffred>slows</> all players who come in contact. HOLD FIRE to steer towards your crosshair. ALT FIRE to stop early.",
      th: "หยิบ <whitebold>High Tide</> ขึ้นมา คลิกซ้ายเพื่อปล่อยกำแพงน้ำบังสายตาไปข้างหน้า ใครเดินผ่านจะโดน<debuffred>สโลว์</> กดคลิกซ้ายค้างเพื่อบังคับทิศตามเป้าเล็ง คลิกขวาเพื่อหยุดก่อน",
    },
    Grenade: {
      en: "EQUIP <whitebold>Storm Surge</>. FIRE to throw. Explodes on landing, <debuffred>nearsighting</> and <debuffred>slowing</> all players.",
      th: "หยิบ <whitebold>Storm Surge</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วระเบิด ผู้เล่นทุกคนที่โดนจะ<debuffred>มองเห็นแค่ระยะใกล้</>และโดน<debuffred>สโลว์</>",
    },
    Ability2: {
      en: "ENTER The Deep. REACTIVATE to cast a smoke. HOLD FIRE/ALT FIRE to adjust distance. RELOAD to toggle view. After casting, REACTIVATE to transform the smoke into a destructible shield.",
      th: "เข้ามุมมอง The Deep กดสกิลซ้ำเพื่อปล่อยควัน กดคลิกซ้ายหรือคลิกขวาค้างเพื่อปรับระยะ กด R เพื่อสลับมุมมอง พอลงควันแล้ว กดสกิลซ้ำอีกครั้งเพื่อเปลี่ยนควันเป็นโล่ที่ยิงพังได้",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Reckoning</>. FIRE to push forward a vision-blocking wall that <debuffred>nearsights</> and <debuffred>slows</> all players who come in contact. REACTIVATE to stop the wall early.",
      th: "หยิบ <whitebold>Reckoning</> ขึ้นมา คลิกซ้ายเพื่อดันกำแพงน้ำบังสายตาไปข้างหน้า ใครโดนจะ<debuffred>มองเห็นแค่ระยะใกล้</>และโดน<debuffred>สโลว์</> กดสกิลซ้ำเพื่อหยุดกำแพงก่อน",
    },
  },
  // Hush
  'ddd5a15c-4fbe-42fa-3789-11a55ca5ee04': {
    Ability1: {
      en: "EQUIP <whitebold>Flashbulb</>. FIRE to throw. ALT FIRE to prepare it instead. REACTIVATE to direct it towards your crosshair. Explodes on any surface or after a delay, <debuffred>flashing</> all players looking at it.",
      th: "หยิบ <whitebold>Flashbulb</> ขึ้นมา คลิกซ้ายเพื่อขว้าง หรือคลิกขวาเพื่อเตรียมไว้ก่อน กดสกิลซ้ำเพื่อสั่งให้พุ่งไปทางเป้าเล็ง ระเบิดเมื่อชนอะไรก็ได้หรือเมื่อครบเวลา แล้ว<debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่",
    },
    Ability2: {
      en: "EQUIP <whitebold>Displacement</>. FIRE to throw. ALT FIRE to prepare it instead. REACTIVATE to direct it towards your crosshair. Explodes on any surface or after a delay, <debuffred>pulling</> all players towards the center and <debuffred>concussing</> them if they collide with any surface or another player.\r\n\r\nResets every two kills.",
      th: "หยิบ <whitebold>Displacement</> ขึ้นมา คลิกซ้ายเพื่อขว้าง หรือคลิกขวาเพื่อเตรียมไว้ก่อน กดสกิลซ้ำเพื่อสั่งให้พุ่งไปทางเป้าเล็ง ระเบิดเมื่อชนอะไรก็ได้หรือเมื่อครบเวลา แล้ว<debuffred>ดูด</>ผู้เล่นทุกคนเข้าหาจุดกลาง ใครชนผนังหรือชนคนอื่นจะ<debuffred>มึน</> ได้สกิลคืนทุก 2 คิล",
    },
    Grenade: {
      en: "INSTANTLY create an anchor. If Hush is in the air, briefly levitate in place. After a delay, propel towards it.",
      th: "ปักหมุดไว้ทันที ถ้า Hush อยู่กลางอากาศจะลอยค้างอยู่แป๊บหนึ่ง ผ่านไปครู่หนึ่งจะพุ่งตัวไปหาหมุด",
    },
    Ultimate: {
      en: "INSTANTLY prepare <whitebold>Suspension</>. FIRE to send it forward, steering with your crosshair. REACTIVATE or press FIRE again to detonate, <debuffred>levitating</> all players.",
      th: "เตรียม <whitebold>Suspension</> ทันที คลิกซ้ายเพื่อปล่อยไปข้างหน้า บังคับทิศด้วยเป้าเล็ง กดสกิลซ้ำหรือคลิกซ้ายอีกครั้งเพื่อระเบิด ผู้เล่นทุกคนที่โดนจะ<debuffred>ลอยขึ้น</>",
    },
    Passive: {
      en: "Hush can pick up weapons, the Spike, and INTERACT with switches from an increased range.",
      th: "Hush เก็บปืน เก็บ Spike และกดสวิตช์ได้จากระยะไกลกว่าคนอื่น",
    },
  },
  // Iso
  '0e38b510-41a8-5780-5e8f-568b2a4f2d6c': {
    Ability1: {
      en: "EQUIP an <whitebold>Undercut</>. FIRE to send it forward. Applies <debuffred>suppress</> and <debuffred>vulnerable</> to all players.",
      th: "หยิบ <whitebold>Undercut</> ขึ้นมา คลิกซ้ายเพื่อปล่อยไปข้างหน้า ผู้เล่นทุกคนที่โดนจะ<debuffred>ใช้สกิลไม่ได้</>และติด<debuffred>เปราะบาง</>",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Kill Contract</>. FIRE to send forward a zone that pulls you and the first enemy hit into a duel.\r\n\r\nChannel <whitebold>Focus</> at the start of a duel.",
      th: "หยิบ <whitebold>Kill Contract</> ขึ้นมา คลิกซ้ายเพื่อปล่อยโซนไปข้างหน้า ดึงตัวเราและศัตรูคนแรกที่โดนเข้าไปดวลกันตัวต่อตัว เริ่มดวลมาจะเข้าสถานะ <whitebold>Focus</> ทันที",
    },
    Ability2: {
      en: "INSTANTLY channel <whitebold>Focus</>. Gain a shield that blocks one instance of damage.",
      th: "เข้าสถานะ <whitebold>Focus</> ทันที ได้โล่ที่กันดาเมจได้หนึ่งครั้ง",
    },
    Grenade: {
      en: "EQUIP <whitebold>Contingency</>. FIRE to push forward an indestructible vision-blocking wall. ALT FIRE for a slower wall.",
      th: "หยิบ <whitebold>Contingency</> ขึ้นมา คลิกซ้ายเพื่อดันกำแพงบังสายตาที่ทำลายไม่ได้ไปข้างหน้า คลิกขวาถ้าอยากให้กำแพงเดินช้าลง",
    },
    Passive: {
      en: "While <whitebold>Focused</>, reload faster and spawn destructible energy orbs from dead enemies Iso has damaged or killed.\r\n\r\nWhen an energy orb is shot, grant a shield that blocks one instance of damage and refresh <whitebold>Focus</>.",
      th: "ระหว่างอยู่ในสถานะ <whitebold>Focus</> จะรีโหลดเร็วขึ้น และศัตรูที่ Iso ทำดาเมจหรือฆ่าจะทิ้งลูกพลังงานไว้ ยิงลูกพลังงานแล้วจะได้โล่ที่กันดาเมจได้หนึ่งครั้ง และต่อเวลา <whitebold>Focus</> ออกไป",
    },
  },
  // Jett
  'add6443a-41bd-e414-f6ad-e58d267f4e95': {
    Ability1: {
      en: "INSTANTLY propel high into the air.",
      th: "พุ่งตัวขึ้นฟ้าทันที",
    },
    Ability2: {
      en: "INSTANTLY prepare a dash. REACTIVATE to dash forward or in your movement direction.\r\n\r\nResets every two kills.",
      th: "เตรียมแดชทันที กดสกิลซ้ำเพื่อแดชไปข้างหน้าหรือไปทางที่กำลังเดิน ได้สกิลคืนทุก 2 คิล",
    },
    Grenade: {
      en: "INSTANTLY throw a cloud. Forms into a brief smoke on any surface or after a delay. HOLD ACTIVATE to steer towards your crosshair.",
      th: "ขว้างก้อนเมฆออกไปทันที กลายเป็นควันสั้น ๆ เมื่อชนอะไรหรือเมื่อครบเวลา กดปุ่มสกิลค้างเพื่อบังคับทิศตามเป้าเล็ง",
    },
    Ultimate: {
      en: "INSTANTLY access five accurate throwing knives that deal <debuffred>lethal damage</> with direct hits to the head.\r\n\r\nFIRE to shoot. On kills, refresh your knives. ALT FIRE to throw all remaining knives without a refresh.",
      th: "เรียกมีดบินที่แม่นยำ 5 เล่มทันที ปาโดนหัวตาย<debuffred>ในเล่มเดียว</> คลิกซ้ายเพื่อปาทีละเล่ม ฆ่าได้แล้วมีดจะเติมเต็ม คลิกขวาเพื่อปามีดที่เหลือทั้งหมดพร้อมกัน แต่จะไม่ได้มีดคืน",
    },
    Passive: {
      en: "HOLD JUMP while falling to <teal>glide</>.",
      th: "กดกระโดดค้างตอนร่วงเพื่อ<teal>ร่อน</>ลงช้า ๆ",
    },
  },
  // KAY/O
  '601dbbe7-43ce-be57-2a40-4abd24953621': {
    Grenade: {
      en: "EQUIP <whitebold>FRAG/ment</>. FIRE to throw. ALT FIRE to lob. Explodes on landing, repeatedly dealing pulses of <debuffred>damage</> to all players.",
      th: "หยิบ <whitebold>FRAG/ment</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ ตกพื้นแล้วระเบิดเป็นจังหวะหลายครั้ง ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคนในโซน",
    },
    Ability1: {
      en: "EQUIP a <whitebold>FLASH/drive</>. FIRE to throw. ALT FIRE to lob. After a delay, explode, <debuffred>flashing</> all players looking at it.",
      th: "หยิบ <whitebold>FLASH/drive</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ ผ่านไปครู่หนึ่งจะระเบิด แล้ว<debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่",
    },
    Ability2: {
      en: "EQUIP a destructible <whitebold>ZERO/point</>. FIRE to throw. Pulses on any surface, <debuffred>suppressing</> enemies within range.",
      th: "หยิบ <whitebold>ZERO/point</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ติดผนังหรือพื้นแล้วปล่อยคลื่น ศัตรูในระยะจะ<debuffred>ใช้สกิลไม่ได้</> ศัตรูยิงพังได้",
    },
    Ultimate: {
      en: "INSTANTLY gain <teal>overloaded</> and repeatedly send out a pulse that <debuffred>suppresses</> enemies within range.\r\n\r\n<teal>Overloaded</> grants <teal>combat stim</>. Upon taking <debuffred>lethal damage</>, KAY/O is downed and can be re-stabilized.",
      th: "เข้าสถานะ<teal>โอเวอร์โหลด</>ทันที แล้วปล่อยคลื่นรอบตัวเป็นระยะ ศัตรูในระยะจะ<debuffred>ใช้สกิลไม่ได้</> ระหว่าง<teal>โอเวอร์โหลด</>จะได้ <teal>Combat Stim</> ด้วย ถ้าโดน<debuffred>ดาเมจถึงตาย</> KAY/O จะล้มลงแทน และให้เพื่อนมาช่วยพยุงให้ลุกขึ้นได้",
    },
  },
  // Killjoy
  '1e58de9c-4950-5125-93e9-a0aee9f98746': {
    Grenade: {
      en: "EQUIP a destructible <whitebold>Nanoswarm</>. FIRE to throw. ALT FIRE to lob. <whitebold>Nanoswarm</> <teal>stealths</> after landing. INTERACT to create a zone that deals <debuffred>damage</> to all players.\r\n\r\nCan be picked up during BUY PHASE.",
      th: "หยิบ <whitebold>Nanoswarm</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ ตกพื้นแล้วจะ<teal>ล่องหน</> กด F เพื่อเปิดโซนนาโนที่ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคน ศัตรูยิงพังได้ เก็บคืนได้ช่วงซื้อของ",
    },
    Ability1: {
      en: "EQUIP a destructible <whitebold>Alarmbot</>. FIRE to place. <whitebold>Alarmbot</> <teal>stealths</> after placement. Triggers on nearby visible enemies in range. <debuffred>Chases</> the first enemy it sees, exploding and applying <debuffred>vulnerable</>.\r\n\r\nCan be recalled.",
      th: "หยิบ <whitebold>Alarmbot</> ขึ้นมา คลิกซ้ายเพื่อวาง บอทจะ<teal>ล่องหน</>หลังวาง พอเห็นศัตรูเข้าใกล้จะ<debuffred>วิ่งไล่</>คนแรกที่เห็น แล้วระเบิด ทำให้ติด<debuffred>เปราะบาง</> ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Ability2: {
      en: "EQUIP a destructible <whitebold>Turret</>. While equipped, REACTIVATE to flip the direction or HOLD ALT FIRE to rotate. FIRE to place. Shoots at enemies in line of sight.\r\n\r\nCan be recalled.",
      th: "หยิบ <whitebold>Turret</> ขึ้นมา ระหว่างถืออยู่ กดสกิลซ้ำเพื่อกลับด้าน หรือกดคลิกขวาค้างเพื่อหมุน คลิกซ้ายเพื่อวาง ป้อมจะยิงศัตรูที่มองเห็น ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Ultimate: {
      en: "EQUIP a destructible <whitebold>Lockdown</>. FIRE to prepare a zone. After a delay, <debuffred>detain</> enemies within range.",
      th: "หยิบ <whitebold>Lockdown</> ขึ้นมา คลิกซ้ายเพื่อวางเครื่อง ผ่านไปครู่หนึ่งศัตรูในระยะจะ<debuffred>ติดขัง</> ศัตรูยิงพังได้",
    },
  },
  // Miks
  '7c8a4701-4de6-9355-b254-e09bc2a34b72': {
    Grenade: {
      en: "EQUIP a destructible <whitebold>M-Pulse</>. ALT FIRE to toggle between <debuffred>concuss</> or <teal>heal</>. FIRE to throw. Repeatedly pulses on landing, applying the selected effect on all players within range.",
      th: "หยิบ <whitebold>M-Pulse</> ขึ้นมา คลิกขวาเพื่อสลับโหมด<debuffred>มึน</>หรือ<teal>ฮีล</> คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วปล่อยคลื่นเป็นระยะ ผู้เล่นทุกคนในระยะจะโดนผลของโหมดที่เลือก ศัตรูยิงพังได้",
    },
    Ability2: {
      en: "EQUIP a tactical map. FIRE to set smoke locations. ALT FIRE to cast smokes.",
      th: "เปิดแผนที่ยุทธวิธี คลิกซ้ายเพื่อเลือกจุดลงควัน คลิกขวาเพื่อปล่อยควัน",
    },
    Ability1: {
      en: "EQUIP <whitebold>Harmonize</>. FIRE on a targeted ally to grant <teal>combat stim</> and <teal>haste</> to them and yourself. On kills while active, refresh the <teal>buff</> if both <whitebold>Harmonized</> players are still alive. ALT FIRE to self-cast with no refresh.",
      th: "หยิบ <whitebold>Harmonize</> ขึ้นมา คลิกซ้ายใส่เพื่อนเพื่อให้ทั้งเพื่อนและตัวเองได้ <teal>Combat Stim</> และ<teal>วิ่งเร็วขึ้น</> ระหว่างบัฟยังอยู่ ถ้าฆ่าได้และทั้งสองคนยังไม่ตาย <teal>บัฟ</>จะต่อเวลา คลิกขวาเพื่อใช้กับตัวเองคนเดียว แต่จะต่อเวลาไม่ได้",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Bassquake</>. FIRE to send forward a zone that <debuffred>deafens</>, <debuffred>knocks back</>, and <debuffred>slows</> all players.",
      th: "หยิบ <whitebold>Bassquake</> ขึ้นมา คลิกซ้ายเพื่อปล่อยคลื่นเสียงไปข้างหน้า ผู้เล่นทุกคนที่โดนจะ<debuffred>หูอื้อ</> <debuffred>กระเด็นถอยหลัง</> และโดน<debuffred>สโลว์</>",
    },
  },
  // NEON
  'bb2a4828-46eb-8cd1-e765-15848195d751': {
    Ability2: {
      en: "INSTANTLY consume fuel to gain <teal>haste</>. REACTIVATE to cancel. ALT FIRE to slide forward or in your movement direction.\r\n\r\nSlide resets every two kills.",
      th: "ใช้พลังงานเพื่อ<teal>วิ่งเร็วขึ้น</>ทันที กดสกิลซ้ำเพื่อหยุดวิ่ง คลิกขวาเพื่อสไลด์ไปข้างหน้าหรือไปทางที่กำลังเดิน ได้สไลด์คืนทุก 2 คิล",
    },
    Ability1: {
      en: "INSTANTLY throw a bolt that bounces once. Explodes on each surface, <debuffred>concussing</> all players.",
      th: "ขว้างลูกสายฟ้าออกไปทันที เด้งได้หนึ่งครั้ง ระเบิดทุกครั้งที่ชนพื้นหรือผนัง ผู้เล่นทุกคนที่โดนจะ<debuffred>มึน</>",
    },
    Grenade: {
      en: "INSTANTLY launch two vision-blocking walls that extend until they hit a surface.",
      th: "ยิงกำแพงไฟฟ้าบังสายตาออกไปสองข้างทันที ยืดออกไปเรื่อย ๆ จนชนผนัง",
    },
    Ultimate: {
      en: "INSTANTLY refresh <whitebold>High Gear</>. Access an accurate lightning beam that can be used while activating <whitebold>High Gear</>.\r\n\r\nFIRE to shoot. On kills, fully recharge fuel.",
      th: "เติม <whitebold>High Gear</> เต็มทันที แล้วได้ลำแสงสายฟ้าที่ยิงแม่น ใช้ยิงได้ระหว่างวิ่ง <whitebold>High Gear</> คลิกซ้ายเพื่อยิง ฆ่าได้แล้วพลังงานจะเติมเต็ม",
    },
    Passive: {
      en: "Passively recharge fuel over time.",
      th: "พลังงานค่อย ๆ เติมเองตามเวลา",
    },
  },
  // Omen
  '8e253930-4c05-31dd-1b6c-968525494517': {
    Ability1: {
      en: "EQUIP <whitebold>Paranoia</>. FIRE to send it forward. Applies <debuffred>nearsight</> and <debuffred>deafens</> all players.",
      th: "หยิบ <whitebold>Paranoia</> ขึ้นมา คลิกซ้ายเพื่อปล่อยเงาไปข้างหน้า ผู้เล่นทุกคนที่โดนจะ<debuffred>มองเห็นแค่ระยะใกล้</>และ<debuffred>หูอื้อ</>",
    },
    Ability2: {
      en: "ENTER Shadow Vision. REACTIVATE to cast a smoke. HOLD FIRE/ALT FIRE to adjust distance. RELOAD to toggle view.",
      th: "เข้ามุมมอง Shadow Vision กดสกิลซ้ำเพื่อปล่อยควัน กดคลิกซ้ายหรือคลิกขวาค้างเพื่อปรับระยะ กด R เพื่อสลับมุมมอง",
    },
    Grenade: {
      en: "EQUIP a <whitebold>Shrouded Step</>. FIRE to briefly channel, then teleport to a targeted location.",
      th: "หยิบ <whitebold>Shrouded Step</> ขึ้นมา คลิกซ้ายเพื่อเริ่มร่ายแป๊บหนึ่ง แล้ววาร์ปไปจุดที่เล็งไว้",
    },
    Ultimate: {
      en: "EQUIP a tactical map. FIRE to begin a teleport to a selected location. While teleporting, Omen appears as a destructible shade at the destination. REACTIVATE to cancel.",
      th: "เปิดแผนที่ยุทธวิธี คลิกซ้ายที่จุดไหนก็ได้เพื่อเริ่มวาร์ป ระหว่างวาร์ป Omen จะโผล่เป็นร่างเงาที่ปลายทาง ซึ่งศัตรูยิงทำลายได้ กดสกิลซ้ำเพื่อยกเลิก",
    },
  },
  // Phoenix
  'eb93336a-449b-9c1b-0a54-a891f7921d69': {
    Grenade: {
      en: "EQUIP <whitebold>Blaze</>. FIRE to send forward a vision-blocking <whitebold>fire</> wall that deals <debuffred>damage</> to all players. HOLD FIRE to steer towards your crosshair.",
      th: "หยิบ <whitebold>Blaze</> ขึ้นมา คลิกซ้ายเพื่อปล่อยกำแพง<whitebold>ไฟ</>บังสายตาไปข้างหน้า ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคนที่เดินผ่าน กดคลิกซ้ายค้างเพื่อบังคับทิศตามเป้าเล็ง",
    },
    Ability1: {
      en: "EQUIP <whitebold>Hot Hands</>. FIRE to throw. ALT FIRE to lob. On landing, create a <whitebold>fire</> zone that deals <debuffred>damage</> to all players.",
      th: "หยิบ <whitebold>Hot Hands</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ ตกพื้นแล้วเกิดโซน<whitebold>ไฟ</>ที่ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคน",
    },
    Ability2: {
      en: "EQUIP a <whitebold>Curveball</>. FIRE to curve left, ALT FIRE to curve right. After a delay, explode, <debuffred>flashing</> all players looking at it.\r\n\r\nResets every two kills.",
      th: "หยิบ <whitebold>Curveball</> ขึ้นมา คลิกซ้ายเพื่อปาโค้งไปทางซ้าย คลิกขวาเพื่อปาโค้งไปทางขวา ผ่านไปครู่หนึ่งจะระเบิด แล้ว<debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่ ได้สกิลคืนทุก 2 คิล",
    },
    Ultimate: {
      en: "INSTANTLY place a marker at your location. Upon taking <debuffred>lethal damage</> or when <whitebold>Run it Back</> expires, return to the marker with full health and the amount of armor you had when the ability was activated.",
      th: "ปักหมุดไว้ตรงที่ยืนทันที ถ้าโดน<debuffred>ดาเมจถึงตาย</>หรือครบเวลา <whitebold>Run it Back</> จะกลับมาเกิดที่หมุดพร้อมเลือดเต็ม และเกราะเท่ากับตอนกดใช้",
    },
    Passive: {
      en: "Phoenix <teal>heals</> while standing in his own <whitebold>fire</> instead of taking damage.",
      th: "Phoenix ยืนใน<whitebold>ไฟ</>ของตัวเองแล้วจะ<teal>ฮีล</>แทนที่จะเสียเลือด",
    },
  },
  // Raze
  'f94c3b30-42be-e959-889c-5aa313dba261': {
    Ability1: {
      en: "INSTANTLY throw a destructible <whitebold>Blast Pack</> that sticks to surfaces that fully arms after a delay. REACTIVATE to detonate, <debuffred>knocking away</> anything hit.\r\n\r\nIf fully armed, <whitebold>Blast Pack</> will also deal <debuffred>damage</> to enemies.",
      th: "ปา <whitebold>Blast Pack</> ออกไปทันที ติดหนึบกับผนังหรือพื้น และพร้อมเต็มที่หลังผ่านไปครู่หนึ่ง กดสกิลซ้ำเพื่อระเบิด ทุกอย่างที่โดนจะ<debuffred>กระเด็น</> ถ้าพร้อมเต็มที่แล้วจะทำ<debuffred>ดาเมจ</>ศัตรูด้วย ศัตรูยิงพังได้",
    },
    Ability2: {
      en: "EQUIP <whitebold>Paint Shells</>. FIRE to throw. ALT FIRE to lob. After a delay, explode, dealing <debuffred>damage</> and creating sub-munitions, each also dealing <debuffred>damage</> to all players.\r\n\r\nResets every two kills.",
      th: "หยิบ <whitebold>Paint Shells</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ ผ่านไปครู่หนึ่งจะระเบิด ทำ<debuffred>ดาเมจ</> แล้วแตกเป็นลูกระเบิดย่อยอีกหลายลูกที่ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคน ได้สกิลคืนทุก 2 คิล",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Boom Bot</>. FIRE to send it forward. <debuffred>Chases</> the first enemy it sees, exploding and dealing <debuffred>damage</> to enemies on impact.",
      th: "หยิบ <whitebold>Boom Bot</> ขึ้นมา คลิกซ้ายเพื่อปล่อยไปข้างหน้า จะ<debuffred>วิ่งไล่</>ศัตรูคนแรกที่เห็น ชนแล้วระเบิด ทำ<debuffred>ดาเมจ</>ศัตรู ศัตรูยิงพังได้",
    },
    Ultimate: {
      en: "INSTANTLY prepare <whitebold>Showstopper</>. FIRE to launch. Explodes on any surface, dealing high <debuffred>damage</> to all players.",
      th: "เตรียม <whitebold>Showstopper</> ทันที คลิกซ้ายเพื่อยิงจรวด ชนอะไรก็ระเบิด ทำ<debuffred>ดาเมจ</>หนักกับผู้เล่นทุกคนในรัศมี",
    },
  },
  // Reyna
  'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc': {
    Ability1: {
      en: "INSTANTLY consume a <whitebold>Soul Orb</> to <teal>heal</>. Excess healing is converted into <teal>overheal</>.\r\n\r\nWhile ULTIMATE is active, <whitebold>Devour</> auto-casts.",
      th: "ดูด <whitebold>Soul Orb</> ทันทีเพื่อ<teal>ฮีล</> ฮีลที่ล้นเลือดเต็มจะกลายเป็น<teal>เลือดเกิน</> ระหว่างใช้อัลติ <whitebold>Devour</> จะทำงานเอง",
    },
    Ability2: {
      en: "INSTANTLY consume a <whitebold>Soul Orb</> to briefly become <teal>intangible</>. REACTIVATE to cancel early.\r\n\r\nWhile ULTIMATE is active, also gain <teal>invisibility</>.",
      th: "ดูด <whitebold>Soul Orb</> ทันทีเพื่อ<teal>ไร้ตัวตน</>ไปแป๊บหนึ่ง โดนอะไรไม่ได้ กดสกิลซ้ำเพื่อออกก่อน ระหว่างใช้อัลติจะ<teal>ล่องหน</>ด้วย",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Leer</>. FIRE to send. After a delay, form, <debuffred>nearsighting</> enemies looking at it.",
      th: "หยิบ <whitebold>Leer</> ขึ้นมา คลิกซ้ายเพื่อส่งตาออกไป ผ่านไปครู่หนึ่งจะกลายเป็นดวงตา ศัตรูที่มองอยู่จะ<debuffred>มองเห็นแค่ระยะใกล้</> ศัตรูยิงพังได้",
    },
    Ultimate: {
      en: "INSTANTLY gain <teal>Empress</>.\r\n\r\n<teal>Empress</> grants <teal>combat stim</>, endless <whitebold>Soul Orb</> consumption, and permanent <teal>overheal</>.",
      th: "เข้าสถานะ <teal>Empress</> ทันที ระหว่างนั้นจะได้ <teal>Combat Stim</> ดูด <whitebold>Soul Orb</> ได้ไม่จำกัด และ<teal>เลือดเกิน</>ไม่ลดลง",
    },
    Passive: {
      en: "Spawn a <whitebold>Soul Orb</> from dead enemies Reyna has damaged or killed.",
      th: "ศัตรูที่ Reyna ทำดาเมจหรือฆ่า ตายแล้วจะทิ้ง <whitebold>Soul Orb</> ไว้",
    },
  },
  // Sage
  '569fdd95-4d10-43ab-ca70-79becc718b46': {
    Ability1: {
      en: "EQUIP a <whitebold>Slow Orb</>. FIRE to throw. On landing, create a zone that <debuffred>slows</> all players and plays an audio cue when enemies run through it.",
      th: "หยิบ <whitebold>Slow Orb</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วเกิดโซนน้ำแข็งที่<debuffred>สโลว์</>ผู้เล่นทุกคน และมีเสียงดังเมื่อศัตรูวิ่งผ่าน",
    },
    Ability2: {
      en: "EQUIP <whitebold>Healing Orb</>. FIRE on a damaged ally to grant <teal>healing</>. ALT FIRE to self-cast.",
      th: "หยิบ <whitebold>Healing Orb</> ขึ้นมา เล็งเพื่อนที่เลือดไม่เต็มแล้วคลิกซ้ายเพื่อ<teal>ฮีล</>ให้ หรือคลิกขวาเพื่อฮีลตัวเอง",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Barrier Orb</>. While equipped, REACTIVATE to pivot the wall or HOLD ALT FIRE to rotate. FIRE to place a destructible wall that fortifies after a delay.",
      th: "หยิบ <whitebold>Barrier Orb</> ขึ้นมา ระหว่างถืออยู่ กดสกิลซ้ำเพื่อพลิกกำแพง หรือกดคลิกขวาค้างเพื่อหมุน คลิกซ้ายเพื่อวางกำแพงน้ำแข็ง ผ่านไปครู่หนึ่งกำแพงจะแข็งขึ้น กำแพงยิงพังได้",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Resurrection</>. FIRE on a targeted dead ally to <teal>resurrect</> them.",
      th: "หยิบ <whitebold>Resurrection</> ขึ้นมา เล็งศพเพื่อนแล้วคลิกซ้ายเพื่อ<teal>ชุบชีวิต</>",
    },
  },
  // Skye
  '6f2a04ca-43e0-be17-7f36-b3908627744d': {
    Ability1: {
      en: "EQUIP a destructible <whitebold>Trailblazer</>. FIRE to take control. FIRE again to lunge and explode, <debuffred>concussing</> all players and dealing <debuffred>damage</> to enemies on direct hits.",
      th: "หยิบ <whitebold>Trailblazer</> ขึ้นมา คลิกซ้ายเพื่อบังคับเสือ คลิกซ้ายอีกครั้งเพื่อกระโจนแล้วระเบิด ผู้เล่นทุกคนที่โดนจะ<debuffred>มึน</> และศัตรูที่โดนตรง ๆ จะเสีย<debuffred>ดาเมจ</>ด้วย ศัตรูยิงพังได้",
    },
    Ability2: {
      en: "EQUIP a <whitebold>Guiding Light</>. FIRE to send it forward. HOLD FIRE to steer towards your crosshair. REACTIVATE to detonate, <debuffred>flashing</> all players looking at it.",
      th: "หยิบ <whitebold>Guiding Light</> ขึ้นมา คลิกซ้ายเพื่อปล่อยเหยี่ยวไปข้างหน้า กดคลิกซ้ายค้างเพื่อบังคับทิศตามเป้าเล็ง กดสกิลซ้ำเพื่อระเบิด แล้ว<debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่",
    },
    Grenade: {
      en: "EQUIP <whitebold>Regrowth</>. HOLD FIRE to <teal>heal</> allies in range and line of sight. Uses a limited healing pool.\r\n\r\nCannot heal self.",
      th: "หยิบ <whitebold>Regrowth</> ขึ้นมา กดคลิกซ้ายค้างเพื่อ<teal>ฮีล</>เพื่อนที่อยู่ในระยะและมองเห็น ฮีลได้ตามปริมาณที่มีจำกัด ฮีลตัวเองไม่ได้",
    },
    Ultimate: {
      en: "EQUIP destructible <whitebold>Seekers</>. FIRE to send out up to three <whitebold>Seekers</>. <debuffred>Chases</> the three closest enemies, <debuffred>nearsighting</> and <debuffred>slowing</> on impact.",
      th: "หยิบ <whitebold>Seekers</> ขึ้นมา คลิกซ้ายเพื่อปล่อยได้สูงสุด 3 ตัว แต่ละตัวจะ<debuffred>วิ่งไล่</>ศัตรูสามคนที่อยู่ใกล้ที่สุด เข้าถึงตัวแล้วศัตรูจะ<debuffred>มองเห็นแค่ระยะใกล้</>และโดน<debuffred>สโลว์</> ศัตรูยิงพังได้",
    },
  },
  // Sova
  '320b2a48-4d9b-a075-30f1-1f93a9b638fa': {
    Ability1: {
      en: "EQUIP a <whitebold>Shock Bolt</>. FIRE to shoot a bolt that explodes on any surface, dealing <debuffred>damage</> to all players. HOLD FIRE to increase the bolt’s velocity. ALT FIRE to add up to two bounces.",
      th: "หยิบ <whitebold>Shock Bolt</> ขึ้นมา คลิกซ้ายเพื่อยิงลูกธนูไฟฟ้าที่ระเบิดเมื่อชนอะไรก็ได้ ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคนในรัศมี กดคลิกซ้ายค้างเพื่อเพิ่มแรงยิง คลิกขวาเพื่อเพิ่มการเด้งได้สูงสุด 2 ครั้ง",
    },
    Ability2: {
      en: "EQUIP a destructible <whitebold>Recon Bolt</>. FIRE to shoot a bolt that repeatedly <debuffred>reveals</> nearby enemies in range and line of sight. HOLD FIRE to increase the bolt’s velocity. ALT FIRE to add up to two bounces.",
      th: "หยิบ <whitebold>Recon Bolt</> ขึ้นมา คลิกซ้ายเพื่อยิงลูกธนูสแกนที่<debuffred>เผยตำแหน่ง</>ศัตรูใกล้ ๆ ที่อยู่ในระยะสายตาเป็นระยะ กดคลิกซ้ายค้างเพื่อเพิ่มแรงยิง คลิกขวาเพื่อเพิ่มการเด้งได้สูงสุด 2 ครั้ง ศัตรูยิงพังได้",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Owl Drone</>. FIRE to take control. FIRE again to shoot a dart that repeatedly <debuffred>reveals</> enemies.",
      th: "หยิบ <whitebold>Owl Drone</> ขึ้นมา คลิกซ้ายเพื่อบังคับโดรน คลิกซ้ายอีกครั้งเพื่อยิงลูกดอกที่<debuffred>เผยตำแหน่ง</>ศัตรูที่โดนเป็นระยะ ศัตรูยิงพังได้",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Hunter’s Fury</>. FIRE to shoot a zone that deals <debuffred>damage</>. Can be fired up to two more times.\r\n\r\nEnemies hit are <debuffred>revealed</> to Sova.",
      th: "หยิบ <whitebold>Hunter’s Fury</> ขึ้นมา คลิกซ้ายเพื่อยิงลำแสงที่ทำ<debuffred>ดาเมจ</> ยิงได้อีก 2 ครั้ง ศัตรูที่โดนจะถูก<debuffred>เผยตำแหน่ง</>ให้ Sova เห็น",
    },
  },
  // Tejo
  'b444168c-4e35-8076-db47-ef9bf368f384': {
    Ability2: {
      en: "EQUIP a tactical map. FIRE to set locations. ALT FIRE to launch missiles that travel to and repeatedly pulse, dealing <debuffred>damage</> to all players.",
      th: "เปิดแผนที่ยุทธวิธี คลิกซ้ายเพื่อเลือกจุด คลิกขวาเพื่อยิงมิสไซล์ลงจุดที่เลือก ระเบิดเป็นจังหวะหลายครั้ง ทำ<debuffred>ดาเมจ</>ผู้เล่นทุกคนในโซน",
    },
    Ability1: {
      en: "EQUIP <whitebold>Special Delivery</>. FIRE to launch. ALT FIRE to launch with a bounce. Explodes on any surface, <debuffred>concussing</> and <debuffred>damaging</> all players.",
      th: "หยิบ <whitebold>Special Delivery</> ขึ้นมา คลิกซ้ายเพื่อยิงออกไป คลิกขวาเพื่อยิงให้เด้งหนึ่งครั้ง ระเบิดเมื่อชนอะไรก็ได้ ผู้เล่นทุกคนที่โดนจะ<debuffred>มึน</>และเสีย<debuffred>ดาเมจ</>",
    },
    Ultimate: {
      en: "EQUIP a tactical map. FIRE to set, pivot and FIRE again to cast a wave that deals high <debuffred>damage</> to all players. ALT FIRE to cancel targeting.",
      th: "เปิดแผนที่ยุทธวิธี คลิกซ้ายเพื่อปักจุด หมุนหาทิศ แล้วคลิกซ้ายอีกครั้งเพื่อปล่อยระลอกระเบิดที่ทำ<debuffred>ดาเมจ</>หนักกับผู้เล่นทุกคน คลิกขวาเพื่อยกเลิกการเล็ง",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Stealth Drone</>. FIRE to take control. FIRE again to <debuffred>reveal</> and <debuffred>suppress</> nearby enemies in range and line of sight.",
      th: "หยิบ <whitebold>Stealth Drone</> ขึ้นมา คลิกซ้ายเพื่อบังคับโดรน คลิกซ้ายอีกครั้งเพื่อปล่อยคลื่น ศัตรูใกล้ ๆ ที่อยู่ในระยะสายตาจะโดน<debuffred>เผยตำแหน่ง</>และ<debuffred>ใช้สกิลไม่ได้</> ศัตรูยิงพังได้",
    },
  },
  // Veto
  '92eeef5d-43b5-1d4a-8d03-b3927a09034b': {
    Ability2: {
      en: "EQUIP a destructible <whitebold>Interceptor</>. FIRE to place. REACTIVATE to activate. While active, destroy any enemy utility that can be shot or would bounce off players in range and line of sight.\r\n\r\nCan be recalled.",
      th: "หยิบ <whitebold>Interceptor</> ขึ้นมา คลิกซ้ายเพื่อวาง กดสกิลซ้ำเพื่อเปิดใช้ ระหว่างทำงานจะทำลายสกิลของศัตรูที่อยู่ในระยะสายตา (สกิลที่ยิงทำลายได้ หรือสกิลที่ปกติจะเด้งออกจากตัวผู้เล่น) ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Crosscut</>. FIRE to place. While in range, INTERACT to teleport to it.\r\n\r\nCan be recalled during BUY PHASE.",
      th: "หยิบ <whitebold>Crosscut</> ขึ้นมา คลิกซ้ายเพื่อวาง ถ้ายืนอยู่ในระยะ กด F เพื่อวาร์ปไปที่จุดนั้น ศัตรูยิงพังได้ เก็บคืนได้ช่วงซื้อของ",
    },
    Ultimate: {
      en: "INSTANTLY gain <teal>evolution</>.\r\n\r\n<teal>Evolution</> grants <teal>combat stim</>, continuous <teal>healing</>, and <teal>immunity</> to all debuffs and damage, except weapons.",
      th: "เข้าสถานะ <teal>Evolution</> ทันที ระหว่างนั้นจะได้ <teal>Combat Stim</> <teal>ฮีล</>ต่อเนื่อง และ<teal>ไม่โดนผล</>จากดีบัฟและดาเมจทุกอย่าง ยกเว้นกระสุนปืน",
    },
    Ability1: {
      en: "EQUIP a destructible <whitebold>Chokehold</>. FIRE to throw. <whitebold>Chokehold</> <teal>stealths</> after landing. Triggers on nearby visible enemies in range, <debuffred>deafening</>, <debuffred>decaying</>, and <debuffred>tethering</> enemies.\r\n\r\nCan be recalled during BUY PHASE.",
      th: "หยิบ <whitebold>Chokehold</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วจะ<teal>ล่องหน</> พอเห็นศัตรูเข้าใกล้จะทำงาน ศัตรูที่โดนจะ<debuffred>หูอื้อ</> <debuffred>เลือดลดชั่วคราว</> และ<debuffred>ตรึงอยู่กับที่</> ศัตรูยิงพังได้ เก็บคืนได้ช่วงซื้อของ",
    },
  },
  // Viper
  '707eab51-4836-f488-046a-cda6bf494859': {
    Ability1: {
      en: "EQUIP <whitebold>Poison Cloud</>. FIRE to throw. ALT FIRE to lob. REACTIVATE to consume fuel to create a <whitebold>toxic</> smoke that <debuffred>decays</> enemies.\r\n\r\nCan be picked up during BUY PHASE.",
      th: "หยิบ <whitebold>Poison Cloud</> ขึ้นมา คลิกซ้ายเพื่อขว้าง คลิกขวาเพื่อโยนระยะใกล้ กดสกิลซ้ำเพื่อใช้พลังงานเปิดควัน<whitebold>พิษ</> ศัตรูที่อยู่ในควันจะ<debuffred>เลือดลดชั่วคราว</> เก็บคืนได้ช่วงซื้อของ",
    },
    Ability2: {
      en: "EQUIP <whitebold>Toxic Screen</>. FIRE to send forward and place a line of emitters. REACTIVATE to consume fuel to create a <whitebold>toxic</> vision-blocking wall that <debuffred>decays</> enemies.",
      th: "หยิบ <whitebold>Toxic Screen</> ขึ้นมา คลิกซ้ายเพื่อยิงแนวหัวพ่นควันไปข้างหน้า กดสกิลซ้ำเพื่อใช้พลังงานเปิดกำแพง<whitebold>พิษ</>บังสายตา ศัตรูที่เดินผ่านจะ<debuffred>เลือดลดชั่วคราว</>",
    },
    Grenade: {
      en: "EQUIP <whitebold>Snake Bite</>. FIRE to launch. On landing, create a zone that grants <debuffred>vulnerable</> and deals low <debuffred>damage</> to all players.",
      th: "หยิบ <whitebold>Snake Bite</> ขึ้นมา คลิกซ้ายเพื่อยิงออกไป ตกพื้นแล้วเกิดบ่อกรดที่ทำให้ผู้เล่นทุกคนติด<debuffred>เปราะบาง</> และเสีย<debuffred>ดาเมจ</>เล็กน้อย",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Viper’s Pit</>. FIRE to form a large <whitebold>toxic</> vision-blocking cloud that <debuffred>decays</> enemies inside.\r\n\r\nHOLD ACTIVATE to cancel the cloud.",
      th: "หยิบ <whitebold>Viper’s Pit</> ขึ้นมา คลิกซ้ายเพื่อปล่อยหมอก<whitebold>พิษ</>ก้อนใหญ่บังสายตา ศัตรูที่อยู่ข้างในจะ<debuffred>เลือดลดชั่วคราว</> กดปุ่มสกิลค้างเพื่อยกเลิกหมอก",
    },
    Passive: {
      en: "Viper’s <whitebold>Toxin</> continuously inflicts <debuffred>decay</> when enemies come in contact. Passively recharge fuel over time.",
      th: "ศัตรูที่โดน<whitebold>พิษ</>ของ Viper จะ<debuffred>เลือดลดชั่วคราว</>ไปเรื่อย ๆ ส่วนพลังงานจะค่อย ๆ เติมเองตามเวลา",
    },
  },
  // Vyse
  'efba5359-4016-a1e5-7626-b1ae76895940': {
    Ability1: {
      en: "EQUIP <whitebold>Shear</>. FIRE to place. <whitebold>Shear</> <teal>stealths</> after placement. Triggers when enemies walk on it, and after a delay, create a brief indestructible wall.\r\n\r\nCan be recalled during BUY PHASE.",
      th: "หยิบ <whitebold>Shear</> ขึ้นมา คลิกซ้ายเพื่อวาง จะ<teal>ล่องหน</>หลังวาง ศัตรูเดินเหยียบแล้ว ผ่านไปครู่หนึ่งจะมีกำแพงที่ทำลายไม่ได้โผล่ขึ้นมาแป๊บหนึ่ง เก็บคืนได้ช่วงซื้อของ",
    },
    Ability2: {
      en: "EQUIP a destructible <whitebold>Arc Rose</>. FIRE to place. ALT FIRE to place it through a wall. REACTIVATE to <debuffred>flash</> all players looking at it. \r\n\r\nCan be recalled.",
      th: "หยิบ <whitebold>Arc Rose</> ขึ้นมา คลิกซ้ายเพื่อวาง คลิกขวาเพื่อวางทะลุกำแพง กดสกิลซ้ำเพื่อ<debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่ ศัตรูยิงพังได้ และเก็บคืนได้",
    },
    Grenade: {
      en: "EQUIP a destructible <whitebold>Razorvine</>. FIRE to throw. <whitebold>Razorvine</> <teal>stealths</> after landing. INTERACT to create a zone that <debuffred>slows</> and deals <debuffred>damage</> when players move through it.\r\n\r\nCan be recalled during BUY PHASE.",
      th: "หยิบ <whitebold>Razorvine</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วจะ<teal>ล่องหน</> กด F เพื่อเปิดดงหนาม ใครเดินผ่านจะโดน<debuffred>สโลว์</>และเสีย<debuffred>ดาเมจ</> ศัตรูยิงพังได้ เก็บคืนได้ช่วงซื้อของ",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Steel Garden</>. FIRE to prepare a zone. After a delay, <debuffred>jam</> enemy primary weapons within range.",
      th: "หยิบ <whitebold>Steel Garden</> ขึ้นมา คลิกซ้ายเพื่อวางเครื่อง ผ่านไปครู่หนึ่งปืนหลักของศัตรูในระยะจะ<debuffred>ใช้ไม่ได้</>ชั่วคราว",
    },
  },
  // Waylay
  'df1cb487-4902-002e-5c17-d28e83e78588': {
    Ability2: {
      en: "INSTANTLY place a marker at your location. REACTIVATE to travel to it. While traveling, Waylay is <teal>immune</> but cannot see enemies.\r\n\r\nResets every two kills.",
      th: "ปักหมุดไว้ตรงที่ยืนทันที กดสกิลซ้ำเพื่อพุ่งกลับไปที่หมุด ระหว่างพุ่ง Waylay จะ<teal>ไม่โดนอะไรเลย</> แต่ก็มองไม่เห็นศัตรู ได้สกิลคืนทุก 2 คิล",
    },
    Grenade: {
      en: "EQUIP <whitebold>Saturate</>. FIRE to throw. Explodes on landing, <debuffred>hindering</> all players.",
      th: "หยิบ <whitebold>Saturate</> ขึ้นมา คลิกซ้ายเพื่อขว้าง ตกพื้นแล้วระเบิด ผู้เล่นทุกคนที่โดนจะ<debuffred>ขยับลำบาก</>",
    },
    Ability1: {
      en: "EQUIP <whitebold>Lightspeed</>. FIRE to dash forward twice. ALT FIRE to dash forward once.\r\n\r\nOnly the first dash can launch upward.",
      th: "หยิบ <whitebold>Lightspeed</> ขึ้นมา คลิกซ้ายเพื่อแดชไปข้างหน้าสองครั้ง หรือคลิกขวาเพื่อแดชครั้งเดียว แดชแรกเท่านั้นที่พุ่งขึ้นที่สูงได้",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Convergent Paths</>. FIRE to gain <teal>haste</> and send forward a zone that <debuffred>hinders</> all players.",
      th: "หยิบ <whitebold>Convergent Paths</> ขึ้นมา คลิกซ้ายเพื่อ<teal>วิ่งเร็วขึ้น</> และปล่อยคลื่นไปข้างหน้า ผู้เล่นทุกคนที่โดนจะ<debuffred>ขยับลำบาก</>",
    },
  },
  // Yoru
  '7f94d92c-4234-0a36-9646-3a87eb8b5c89': {
    Grenade: {
      en: "EQUIP <whitebold>Fakeout</>. FIRE to send a destructible clone forward. ALT FIRE to place a marker at your location. INTERACT to transform the marker into a clone.\r\n\r\nClones continuously walk forward and will turn toward the first enemy that shoots it, <debuffred>flashing</> all players looking at it.",
      th: "หยิบ <whitebold>Fakeout</> ขึ้นมา คลิกซ้ายเพื่อปล่อยร่างโคลนเดินไปข้างหน้า คลิกขวาเพื่อปักหมุดตรงที่ยืน แล้วกด F เพื่อเปลี่ยนหมุดเป็นร่างโคลน โคลนจะเดินตรงไปเรื่อย ๆ ถ้าศัตรูยิงใส่จะหันไปหาคนแรกที่ยิง แล้ว<debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่ ศัตรูยิงโคลนพังได้",
    },
    Ability1: {
      en: "EQUIP <whitebold>Blindside</>. FIRE to throw. After bouncing off a surface, explode, <debuffred>flashing</> all players looking at it.",
      th: "หยิบ <whitebold>Blindside</> ขึ้นมา คลิกซ้ายเพื่อขว้าง เด้งผนังแล้วจะระเบิด <debuffred>แฟลช</>ใส่ทุกคนที่มองอยู่",
    },
    Ability2: {
      en: "EQUIP <whitebold>Gatecrash</>. FIRE to send it forward. ALT FIRE to place. REACTIVATE to teleport to it. INTERACT to fake a teleport.\r\n\r\nResets every two kills.",
      th: "หยิบ <whitebold>Gatecrash</> ขึ้นมา คลิกซ้ายเพื่อปล่อยไปข้างหน้า คลิกขวาเพื่อวางไว้กับที่ กดสกิลซ้ำเพื่อวาร์ปไปหา หรือกด F เพื่อหลอกว่าวาร์ป ได้สกิลคืนทุก 2 คิล",
    },
    Ultimate: {
      en: "EQUIP <whitebold>Dimensional Drift</>. FIRE to become <teal>intangible</> and <teal>invisible</>. <whitebold>Gatecrash</> is accessible during this state. REACTIVATE to exit early.",
      th: "หยิบ <whitebold>Dimensional Drift</> ขึ้นมา คลิกซ้ายเพื่อเข้ามิติอื่น จะ<teal>ไร้ตัวตน</>และ<teal>ล่องหน</> ระหว่างนั้นใช้ <whitebold>Gatecrash</> ได้ กดสกิลซ้ำเพื่อออกก่อน",
    },
  },
}

const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

/** ใส่คำอธิบายไทยที่เขียนใหม่ลงใน agents ภาษาไทย เทียบกับ agents ภาษาอังกฤษว่ายังเป็นสกิลเวอร์ชันเดิมอยู่ */
export function applyThAbilityOverrides(th: Agent[], en: Agent[]): Agent[] {
  const enByUuid = new Map(en.map((a) => [a.uuid, a]))
  return th.map((agent) => {
    const fixes = TH_ABILITY_OVERRIDES[agent.uuid]
    const enAgent = enByUuid.get(agent.uuid)
    if (!fixes || !enAgent) return agent
    return {
      ...agent,
      abilities: agent.abilities.map((ab) => {
        const fix = fixes[ab.slot]
        const enAb = enAgent.abilities.find((x) => x.slot === ab.slot)
        if (!fix || !enAb || norm(enAb.description) !== norm(fix.en)) return ab
        return { ...ab, description: fix.th }
      }),
    }
  })
}
