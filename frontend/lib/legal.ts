// เนื้อหาหน้ากฎหมาย 3 หน้า (ข้อกำหนดการใช้งาน / นโยบายความเป็นส่วนตัว / นโยบายคุกกี้) ทั้ง 2 ภาษา
// เขียนให้ตรงกับที่เว็บทำจริง: ไม่มีระบบสมาชิก ไม่มีโฆษณา ไม่มีตัวติดตาม ตั้งค่าเก็บใน localStorage
// ถ้าเพิ่ม localStorage key ใหม่ หรือเพิ่มบริการภายนอก (analytics, ฟอร์มติดต่อ ฯลฯ) ต้องมาแก้ตรงนี้ด้วย
//
// รูปแบบ block: string = ย่อหน้า, string[] = bullet, { rows } = ตาราง
// ในข้อความใส่ลิงก์ได้แบบ [ข้อความ](url) — url ที่ขึ้นต้นด้วย / คือหน้าในเว็บ

import type { Lang } from './i18n'

export const LEGAL_DOCS = ['terms', 'privacy', 'cookies'] as const
export type LegalDoc = (typeof LEGAL_DOCS)[number]

/** ปีที่เปิดเว็บ ใช้กับ © ท้ายเว็บ */
export const SITE_START_YEAR = 2026
/** วันที่เนื้อหาหน้ากฎหมายมีผล (แก้เมื่อเปลี่ยนเนื้อหา) */
export const LEGAL_UPDATED = '2026-11-05'
/** ช่องทางติดต่อผู้จัดทำ */
export const CONTACT_URL = 'https://github.com/rose-korn/valorant-list/issues'

export type LegalBlock = string | string[] | { rows: [string, string][]; head: [string, string] }
export type LegalSection = { h: string; body: LegalBlock[] }
export type LegalContent = { title: string; tab: string; en: string; intro: string; sections: LegalSection[] }

const th: Record<LegalDoc, LegalContent> = {
  terms: {
    tab: 'ข้อกำหนดการใช้งาน',
    title: 'ข้อกำหนดการใช้งาน',
    en: 'Terms of use',
    intro:
      'ข้อกำหนดนี้ใช้กับเว็บ Valorant List (valolist) ที่ valo-thai.rosekorn.com การเข้าใช้เว็บถือว่ายอมรับข้อกำหนดนี้ ถ้าไม่ยอมรับ ขอให้หยุดใช้เว็บ',
    sections: [
      {
        h: '1. เว็บนี้คืออะไร',
        body: [
          'Valorant List เป็นเว็บแฟนเมดที่แฟนเกมทำขึ้นเอง ใช้ฟรี ไม่มีโฆษณา และไม่หารายได้จากเว็บ',
          'เว็บนี้ไม่ใช่เว็บทางการของ VALORANT ไม่มีส่วนเกี่ยวข้องกับ Riot Games และ Riot Games ไม่ได้รับรองหรือสนับสนุนเว็บนี้',
        ],
      },
      {
        h: '2. ลิขสิทธิ์และเครื่องหมายการค้า',
        body: [
          [
            'VALORANT, Riot Games รวมถึงชื่อ ภาพ เสียง โมเดล และเนื้อหาอื่นในเกม เป็นทรัพย์สินของ Riot Games, Inc. เว็บนี้ใช้เนื้อหาเหล่านี้ภายใต้นโยบาย [Legal Jibber Jabber](https://www.riotgames.com/en/legal) ของ Riot Games',
            'ข้อมูลเกมมาจาก [valorant-api.com](https://valorant-api.com) ซึ่งเป็นบริการของบุคคลภายนอก ไม่ใช่ของ Riot Games',
            'โค้ด งานออกแบบ ภาพประกอบ และข้อความที่ผู้จัดทำเขียนเอง เป็นของผู้จัดทำ Valorant List ห้ามนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต',
          ],
        ],
      },
      {
        h: '3. ขอบเขตการใช้งาน',
        body: [
          'ใช้เว็บดูข้อมูล เล่นมินิเกม ทำการ์ดแชร์ และส่งลิงก์ให้เพื่อนได้ตามปกติ แต่ห้ามทำสิ่งต่อไปนี้',
          [
            'ดึงข้อมูลจากเว็บจำนวนมาก หรือส่งคำขอถี่จนเว็บช้าหรือล่ม',
            'ใช้ /api/media ของเว็บเป็นพร็อกซีให้บริการอื่น',
            'นำเนื้อหาของเว็บไปขาย หรือทำให้คนเข้าใจว่าเป็นเว็บทางการของ Riot Games',
            'ใช้เว็บทำสิ่งที่ผิดกฎหมาย หรือพยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต',
          ],
        ],
      },
      {
        h: '4. การ์ดแชร์และข้อความที่พิมพ์เอง',
        body: [
          'ชื่อและข้อความที่พิมพ์ในหน้าแชร์การ์ดใช้วาดการ์ดในเบราว์เซอร์ และจะติดไปกับลิงก์ตอนกดแชร์ ใครเปิดลิงก์ก็เห็นข้อความนั้น ผู้พิมพ์รับผิดชอบข้อความของตัวเอง ห้ามใช้ทำเนื้อหาที่หมิ่นประมาท คุกคาม หรือละเมิดสิทธิของผู้อื่น',
        ],
      },
      {
        h: '5. ความถูกต้องของข้อมูล',
        body: [
          'เราพยายามให้ข้อมูลตรงกับเกม แต่ข้อมูลอาจผิดหรือช้ากว่าเกม เพราะเว็บดึงข้อมูลใหม่ตอนอัปเดตเว็บเท่านั้น คำอธิบายภาษาไทยบางส่วนเราเขียนเอง จึงอาจไม่ตรงกับคำแปลในเกม มินิเกมมีไว้เล่นสนุก ผลที่ได้ไม่ได้วัดฝีมือในเกมจริง',
        ],
      },
      {
        h: '6. ข้อจำกัดความรับผิด',
        body: [
          'เว็บนี้ให้บริการตามสภาพที่เป็นอยู่ ไม่รับประกันว่าจะใช้ได้ตลอดเวลา ไม่มีข้อผิดพลาด หรือเหมาะกับวัตถุประสงค์ใดเป็นพิเศษ ผู้จัดทำไม่ต้องรับผิดต่อความเสียหายจากการใช้เว็บหรือใช้เว็บไม่ได้ เท่าที่กฎหมายอนุญาต',
          'ข้อนี้ไม่ยกเว้นความรับผิดในกรณีที่กฎหมายห้ามยกเว้น เช่น ความเสียหายจากการกระทำโดยจงใจหรือประมาทเลินเล่ออย่างร้ายแรง',
        ],
      },
      {
        h: '7. ลิงก์และบริการภายนอก',
        body: [
          'เว็บมีลิงก์ไปเว็บอื่น เช่น valorant-api.com และ GitHub ปุ่มแชร์จะเปิดแอปหรือเว็บอื่นในเครื่องของคุณ เราไม่ได้ควบคุมเนื้อหาหรือนโยบายของบริการเหล่านั้น',
        ],
      },
      {
        h: '8. แจ้งปัญหาลิขสิทธิ์',
        body: [
          'เจ้าของสิทธิ์ที่เห็นว่าเนื้อหาในเว็บละเมิดสิทธิ์ของตน แจ้งเราได้ตามช่องทางท้ายหน้านี้ พร้อมบอกว่าเป็นเนื้อหาส่วนไหน ถ้าพบว่ามีปัญหาจริง เราจะลบออก',
        ],
      },
      {
        h: '9. การแก้ไขข้อกำหนดและการปิดเว็บ',
        body: [
          'เราอาจแก้ข้อกำหนดนี้ ปรับเว็บ หรือปิดเว็บเมื่อใดก็ได้ วันที่ด้านบนบอกฉบับล่าสุด การใช้เว็บต่อหลังวันที่นั้นถือว่ายอมรับฉบับใหม่',
        ],
      },
      {
        h: '10. กฎหมายที่ใช้บังคับ',
        body: [
          'ข้อกำหนดนี้ใช้กฎหมายไทย และให้ศาลไทยมีอำนาจพิจารณาข้อพิพาท',
          'ถ้าข้อใดใช้บังคับไม่ได้ ข้ออื่นยังมีผลตามเดิม ถ้าฉบับภาษาไทยกับภาษาอังกฤษขัดกัน ให้ถือตามฉบับภาษาไทย',
        ],
      },
    ],
  },
  privacy: {
    tab: 'นโยบายความเป็นส่วนตัว',
    title: 'นโยบายความเป็นส่วนตัว',
    en: 'Privacy policy',
    intro:
      'นโยบายนี้อธิบายว่า Valorant List จัดการข้อมูลส่วนบุคคลอย่างไร ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) เว็บนี้ไม่มีระบบสมาชิก ไม่ขอชื่อหรืออีเมล ไม่มีโฆษณา และไม่ใช้ตัวติดตาม ใช้เว็บได้โดยไม่ต้องให้ข้อมูลส่วนตัวใดเลย',
    sections: [
      {
        h: '1. ผู้ควบคุมข้อมูลส่วนบุคคล',
        body: [
          `ผู้ควบคุมข้อมูลส่วนบุคคลตามนโยบายนี้คือผู้จัดทำ Valorant List ซึ่งเป็นบุคคลธรรมดา ติดต่อได้ทาง [GitHub](${CONTACT_URL})`,
          'หน้า Issues บน GitHub เปิดให้ทุกคนเห็น อย่าใส่ข้อมูลส่วนตัวลงไป ถ้าเป็นเรื่องส่วนตัว เปิด issue บอกแค่ว่าต้องการติดต่อ แล้วเราจะตอบในนั้นเพื่อนัดช่องทางส่วนตัว',
        ],
      },
      {
        h: '2. ข้อมูลที่เกี่ยวข้องและเอาไปใช้ทำอะไร',
        body: [
          [
            'ข้อมูลทางเทคนิคตอนเปิดเว็บ เช่น IP address ประเภทเบราว์เซอร์ หน้าที่เปิด และเวลา Cloudflare ซึ่งเป็นผู้ให้บริการโฮสต์ได้รับข้อมูลนี้โดยอัตโนมัติ เราใช้เพื่อส่งหน้าเว็บ กันการโจมตี แก้ปัญหาเว็บล่ม และดูสถิติการเข้าชมแบบรวม',
            'การตั้งค่าในเว็บ เช่น ภาษา คะแนนสูงสุดในมินิเกม และระดับเสียง เก็บอยู่ในเบราว์เซอร์ของคุณ ไม่ได้ส่งมาที่เรา รายละเอียดอยู่ใน[นโยบายคุกกี้](/legal/cookies)',
            'ชื่อและข้อความในการ์ดแชร์ใช้วาดการ์ดในเบราว์เซอร์ ถ้ากดแชร์หรือคัดลอกลิงก์ ข้อความเหล่านี้จะอยู่ในลิงก์ด้วย พอมีคนเปิดลิงก์ Cloudflare ก็ได้รับลิงก์นั้นไปพร้อมข้อมูลทางเทคนิคข้อแรก จึงไม่ควรใส่ข้อมูลที่ไม่อยากให้คนอื่นเห็น',
            'ถ้าติดต่อเราผ่าน GitHub เราจะเห็นข้อมูลที่เปิดเผยในบัญชี GitHub ของคุณกับข้อความที่ส่งมา และใช้เพื่อตอบเรื่องนั้นเท่านั้น',
          ],
        ],
      },
      {
        h: '3. ฐานทางกฎหมาย',
        body: [
          'เราใช้ฐานประโยชน์โดยชอบด้วยกฎหมาย (มาตรา 24(5) PDPA) เพื่อให้เว็บทำงานได้ ปลอดภัย และตอบคนที่ติดต่อมาได้ เราไม่ได้ใช้ข้อมูลทำการตลาด ไม่ทำโปรไฟล์ผู้ใช้ และไม่ใช้ระบบอัตโนมัติตัดสินใจเรื่องใดเกี่ยวกับตัวคุณ',
        ],
      },
      {
        h: '4. ผู้ที่ได้รับข้อมูล',
        body: [
          'เราไม่ขาย ไม่ให้เช่า และไม่แชร์ข้อมูลเพื่อการโฆษณา ข้อมูลอาจไปถึงผู้ให้บริการเหล่านี้',
          [
            '[Cloudflare](https://www.cloudflare.com/privacypolicy/) ผู้ให้บริการโฮสต์และเครือข่ายของเว็บ',
            'media.valorant-api.com ที่เบราว์เซอร์ของคุณโหลดรูปในเกมมาโดยตรง จึงได้รับ IP address ของคุณเหมือนการโหลดรูปจากเว็บใดก็ตาม',
            '[GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) ถ้าคุณติดต่อเราผ่านช่องทางนั้น',
          ],
          'ถ้ากฎหมายหรือหน่วยงานรัฐที่มีอำนาจสั่ง เราอาจต้องเปิดเผยข้อมูลที่มีอยู่',
        ],
      },
      {
        h: '5. การส่งข้อมูลไปต่างประเทศ',
        body: [
          'ผู้ให้บริการในข้อ 4 มีเซิร์ฟเวอร์อยู่นอกประเทศไทยด้วย ข้อมูลจึงอาจไปอยู่ต่างประเทศ และอยู่ภายใต้นโยบายความเป็นส่วนตัวของผู้ให้บริการแต่ละราย',
        ],
      },
      {
        h: '6. ระยะเวลาเก็บ',
        body: [
          'เราไม่มีฐานข้อมูลผู้ใช้ บันทึกทางเทคนิคใน Cloudflare เก็บตามระยะเวลาของ Cloudflare การตั้งค่าในเบราว์เซอร์อยู่จนกว่าคุณจะลบ ข้อความที่ติดต่อผ่าน GitHub อยู่จนกว่าคุณหรือเราจะลบ',
        ],
      },
      {
        h: '7. ความปลอดภัย',
        body: ['เว็บรับส่งข้อมูลผ่าน HTTPS และเราไม่ได้เก็บข้อมูลส่วนบุคคลไว้ในฐานข้อมูลของเราเอง'],
      },
      {
        h: '8. สิทธิของเจ้าของข้อมูล',
        body: [
          'ตาม PDPA คุณขอเข้าถึงและขอสำเนาข้อมูลส่วนบุคคลของคุณได้ รวมถึงขอให้แก้ไข ลบ หรือระงับการใช้ คัดค้านการประมวลผล และขอโอนย้ายข้อมูล ติดต่อเราตามข้อ 1 แล้วเราจะตอบภายใน 30 วัน เราแทบไม่มีข้อมูลที่ระบุตัวคุณได้ บางคำขอจึงอาจไม่มีข้อมูลให้ดำเนินการ',
          'ถ้าเห็นว่าข้อมูลของคุณถูกใช้โดยไม่ชอบ ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.) ได้',
        ],
      },
      {
        h: '9. ผู้เยาว์',
        body: [
          'เว็บนี้ไม่ได้ตั้งใจเก็บข้อมูลส่วนบุคคลของใคร รวมถึงผู้เยาว์ ถ้าผู้ปกครองพบว่าเรามีข้อมูลของบุตรหลาน เช่น ในข้อความที่ติดต่อมา แจ้งให้เราลบได้',
        ],
      },
      {
        h: '10. การแก้ไขนโยบาย',
        body: [
          'ถ้าเว็บจะเริ่มใช้บริการใหม่ที่เกี่ยวกับข้อมูลส่วนบุคคล เช่น เครื่องมือวัดสถิติ เราจะแก้นโยบายนี้และเปลี่ยนวันที่ด้านบนก่อนเริ่มใช้',
        ],
      },
    ],
  },
  cookies: {
    tab: 'นโยบายคุกกี้',
    title: 'นโยบายคุกกี้',
    en: 'Cookie policy',
    intro:
      'เว็บนี้ไม่ได้ตั้งคุกกี้ของตัวเอง ไม่มีคุกกี้โฆษณาหรือคุกกี้ติดตาม แต่ใช้พื้นที่เก็บข้อมูลในเบราว์เซอร์ (localStorage) จำการตั้งค่าบางอย่าง หน้านี้บอกว่าเก็บอะไรไว้บ้าง',
    sections: [
      {
        h: '1. คุกกี้กับ localStorage',
        body: [
          'คุกกี้คือข้อมูลชิ้นเล็กที่เว็บฝากไว้ในเบราว์เซอร์ และเบราว์เซอร์ส่งกลับไปที่เซิร์ฟเวอร์ทุกครั้งที่เปิดเว็บ localStorage ก็อยู่ในเบราว์เซอร์เหมือนกัน แต่ไม่ได้ส่งออกไปไหน เว็บนี้ใช้ localStorage จำสิ่งที่คุณเลือกเองเท่านั้น',
        ],
      },
      {
        h: '2. สิ่งที่เก็บในเบราว์เซอร์ของคุณ',
        body: [
          {
            head: ['ชื่อ', 'ใช้ทำอะไร'],
            rows: [
              ['valolist:lang', 'จำภาษาที่เลือก (ไทย / English)'],
              ['valolist:fx', 'จำว่าเปิดหรือปิดลูกเล่นบนหน้าเว็บ'],
              ['valolist:random-excluded', 'จำเอเจนท์ที่ตัดออกจากวงล้อสุ่ม'],
              ['valolist:video-volume', 'จำระดับเสียงตอนดูวิดีโอสกิน'],
              ['aimrush:best:*, spikebeat:best:*', 'คะแนนสูงสุดในมินิเกม'],
            ],
          },
          'ทั้งหมดนี้ใช้กับฟีเจอร์ที่คุณกดใช้เอง ไม่ได้ใช้ระบุตัวตน และไม่ได้ส่งมาที่เรา',
        ],
      },
      {
        h: '3. คุกกี้จาก Cloudflare',
        body: [
          'Cloudflare ผู้ให้บริการโฮสต์อาจตั้งคุกกี้ด้านความปลอดภัย เช่น __cf_bm หรือ cf_clearance เพื่อแยกคนออกจากบอท คุกกี้กลุ่มนี้จำเป็นต่อการเปิดเว็บ และไม่ได้ใช้ติดตามคุณข้ามเว็บ ดูรายละเอียดได้ที่[หน้าคุกกี้ของ Cloudflare](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/)',
        ],
      },
      {
        h: '4. ทำไมไม่มีป้ายขอความยินยอม',
        body: [
          'เว็บนี้ใช้เฉพาะคุกกี้และพื้นที่เก็บข้อมูลที่จำเป็นต่อการทำงาน หรือที่มาจากการตั้งค่าที่คุณเลือกเอง แบบนี้ไม่ต้องขอความยินยอมก่อน เว็บไม่มีคุกกี้วิเคราะห์ การตลาด หรือโฆษณา ถ้าจะเพิ่มในอนาคต เราจะขอความยินยอมก่อนใช้',
        ],
      },
      {
        h: '5. ลบได้อย่างไร',
        body: [
          'ล้างข้อมูลเว็บไซต์ของ valo-thai.rosekorn.com ได้จากการตั้งค่าเบราว์เซอร์ เว็บยังใช้ได้ตามปกติ แค่การตั้งค่ากับคะแนนสูงสุดจะหายไป',
        ],
      },
    ],
  },
}

const en: Record<LegalDoc, LegalContent> = {
  terms: {
    tab: 'Terms of use',
    title: 'Terms of use',
    en: 'Terms of use',
    intro:
      'These terms apply to Valorant List (valolist) at valo-thai.rosekorn.com. By using the site you accept them. If you do not, please stop using the site.',
    sections: [
      {
        h: '1. About this site',
        body: [
          'Valorant List is a fan-made site built by players. It is free, has no ads and makes no money.',
          'It is not an official VALORANT site. It is not affiliated with Riot Games, and Riot Games does not endorse or sponsor it.',
        ],
      },
      {
        h: '2. Copyright and trademarks',
        body: [
          [
            "VALORANT, Riot Games and in-game names, images, sounds, models and other content are the property of Riot Games, Inc. This site uses them under Riot Games' [Legal Jibber Jabber](https://www.riotgames.com/en/legal) policy.",
            'Game data comes from [valorant-api.com](https://valorant-api.com), a third-party service not run by Riot Games.',
            "The site's own code, design, illustrations and original text belong to the Valorant List maker and may not be used commercially without permission.",
          ],
        ],
      },
      {
        h: '3. Acceptable use',
        body: [
          'You can browse, play the mini games, make share cards and send links to friends. You may not:',
          [
            'scrape the site heavily or send requests fast enough to slow it down',
            "use the site's /api/media endpoint as a proxy for other services",
            'sell the content or present the site as official Riot Games material',
            'use the site for anything illegal or try to access its systems without permission',
          ],
        ],
      },
      {
        h: '4. Share cards and text you type',
        body: [
          'The name and text you type on the share card page are used to draw the card in your browser and are included in the link when you share it, so anyone who opens the link sees them. You are responsible for what you write. Do not use it for defamation, harassment or anything that infringes on the rights of others.',
        ],
      },
      {
        h: '5. Accuracy',
        body: [
          'We try to match the game, but data may be wrong or out of date because the site only pulls new data when it is rebuilt. Some Thai descriptions are our own and may differ from the in-game translation. The mini games are for fun and do not measure your in-game skill.',
        ],
      },
      {
        h: '6. Limitation of liability',
        body: [
          'The site is provided as is, with no warranty that it will always be available, be error-free or fit any particular purpose. To the extent permitted by law, the maker is not liable for any loss arising from using or being unable to use the site.',
          'This does not exclude liability that the law does not allow to be excluded, such as for loss caused intentionally or by gross negligence.',
        ],
      },
      {
        h: '7. External links and services',
        body: [
          'The site links to other sites such as valorant-api.com and GitHub, and share buttons open other apps or sites on your device. We do not control their content or policies.',
        ],
      },
      {
        h: '8. Copyright complaints',
        body: [
          'If you own rights in something on the site and believe it infringes them, contact us using the link at the bottom of this page and say which content it is. If the complaint holds up, we will remove it.',
        ],
      },
      {
        h: '9. Changes and shutdown',
        body: [
          'We may change these terms, change the site or shut it down at any time. The date at the top shows the current version. Using the site after that date means you accept it.',
        ],
      },
      {
        h: '10. Governing law',
        body: [
          'These terms are governed by the laws of Thailand, and the courts of Thailand have jurisdiction over any dispute.',
          'If any part of these terms cannot be enforced, the rest still applies. If the Thai and English versions conflict, the Thai version prevails.',
        ],
      },
    ],
  },
  privacy: {
    tab: 'Privacy policy',
    title: 'Privacy policy',
    en: 'Privacy policy',
    intro:
      "This policy explains how Valorant List handles personal data under Thailand's Personal Data Protection Act B.E. 2562 (PDPA). The site has no accounts, asks for no name or email, shows no ads and uses no trackers. You can use it without giving any personal data.",
    sections: [
      {
        h: '1. Data controller',
        body: [
          `The data controller is the maker of Valorant List, a private individual. You can reach us on [GitHub](${CONTACT_URL}).`,
          'GitHub issues are public, so do not post personal data there. For a private matter, open an issue saying only that you want to get in touch, and we will reply there to arrange a private channel.',
        ],
      },
      {
        h: '2. What data is involved and why',
        body: [
          [
            'Technical data when you open the site, such as IP address, browser type, the page you opened and the time. Our host, Cloudflare, receives this automatically. We use it to serve pages, block attacks, fix outages and see aggregate traffic.',
            'Your settings, such as language, mini game high scores and video volume, stay in your browser and are not sent to us. See the [cookie policy](/legal/cookies).',
            'The name and text on a share card are used to draw the card in your browser. If you share or copy the link, they are part of that link, so when someone opens it Cloudflare receives the link along with the technical data above. Do not put anything there you would not want others to see.',
            'If you contact us on GitHub, we see what your GitHub profile shows and the message you send, and use them only to answer you.',
          ],
        ],
      },
      {
        h: '3. Legal basis',
        body: [
          'We rely on legitimate interest (PDPA section 24(5)) to keep the site working and secure and to answer people who contact us. We do not use data for marketing or profiling, and we make no automated decisions about you.',
        ],
      },
      {
        h: '4. Who receives data',
        body: [
          'We do not sell, rent or share data for advertising. Data may reach these providers:',
          [
            "[Cloudflare](https://www.cloudflare.com/privacypolicy/), the site's host and network",
            'media.valorant-api.com, where your browser loads game images directly, so it sees your IP address as with any image request',
            '[GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement), if you contact us there',
          ],
          'We may also have to disclose data we hold when the law or a competent authority requires it.',
        ],
      },
      {
        h: '5. Transfers outside Thailand',
        body: [
          'The providers in section 4 also run servers outside Thailand, so data may be stored abroad under each provider’s own privacy policy.',
        ],
      },
      {
        h: '6. Retention',
        body: [
          "We keep no user database. Cloudflare's technical logs follow Cloudflare's retention. Settings in your browser stay until you clear them. Messages on GitHub stay until you or we delete them.",
        ],
      },
      {
        h: '7. Security',
        body: ['The site is served over HTTPS, and we do not keep personal data in a database of our own.'],
      },
      {
        h: '8. Your rights',
        body: [
          'Under the PDPA (and similar laws such as the GDPR), you can ask to access or get a copy of your personal data, and ask us to correct, delete or restrict it, object to its processing or port it. Contact us as in section 1 and we will reply within 30 days. Since we hold almost nothing that identifies you, some requests may have no data to act on.',
          "If you believe your data has been misused, you can complain to Thailand's Office of the Personal Data Protection Committee (PDPC) or your local data protection authority.",
        ],
      },
      {
        h: '9. Children',
        body: [
          'The site does not knowingly collect personal data from anyone, including children. If a parent finds we hold data about their child, for example in a message sent to us, they can ask us to delete it.',
        ],
      },
      {
        h: '10. Changes',
        body: [
          'If the site is going to use a new service that involves personal data, such as an analytics tool, we will update this policy and the date at the top before it starts.',
        ],
      },
    ],
  },
  cookies: {
    tab: 'Cookie policy',
    title: 'Cookie policy',
    en: 'Cookie policy',
    intro:
      'This site sets no cookies of its own and has no ad or tracking cookies. It does use browser storage (localStorage) to remember a few settings. This page lists what is stored.',
    sections: [
      {
        h: '1. Cookies and localStorage',
        body: [
          'A cookie is a small piece of data a site stores in your browser, which the browser sends back to the server on every visit. localStorage also lives in your browser but is never sent anywhere. This site only uses it to remember choices you make.',
        ],
      },
      {
        h: '2. What is stored in your browser',
        body: [
          {
            head: ['Name', 'Purpose'],
            rows: [
              ['valolist:lang', 'Your language (Thai / English)'],
              ['valolist:fx', 'Whether page effects are on or off'],
              ['valolist:random-excluded', 'Agents you removed from the random wheel'],
              ['valolist:video-volume', 'Volume for skin videos'],
              ['aimrush:best:*, spikebeat:best:*', 'Your mini game high scores'],
            ],
          },
          'These only serve features you use. They do not identify you and are never sent to us.',
        ],
      },
      {
        h: '3. Cookies from Cloudflare',
        body: [
          'Cloudflare, our host, may set security cookies such as __cf_bm or cf_clearance to tell people from bots. They are needed for the site to load and are not used to track you across sites. See [Cloudflare’s cookie page](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/) for details.',
        ],
      },
      {
        h: '4. Why there is no consent banner',
        body: [
          'The site only uses cookies and storage that are needed for it to work or that come from settings you choose, which do not require prior consent. There are no analytics, marketing or ad cookies. If we ever add any, we will ask for consent first.',
        ],
      },
      {
        h: '5. How to clear it',
        body: [
          'Clear site data for valo-thai.rosekorn.com in your browser settings. The site keeps working; only your settings and high scores reset.',
        ],
      },
    ],
  },
}

export const legal: Record<Lang, Record<LegalDoc, LegalContent>> = { th, en }

/** ข้อความเล็ก ๆ บนหน้ากฎหมายกับท้ายเว็บ */
export const legalUi: Record<Lang, { updated: string; contact: string; contactLink: string; heading: string }> = {
  th: {
    updated: 'มีผลตั้งแต่',
    contact: 'มีคำถามเรื่องนโยบายนี้ ติดต่อได้ที่',
    contactLink: 'GitHub ของโปรเจกต์',
    heading: 'ข้อกำหนดและนโยบาย',
  },
  en: {
    updated: 'Effective',
    contact: 'Questions about this policy? Reach us on',
    contactLink: "the project's GitHub",
    heading: 'Legal',
  },
}
