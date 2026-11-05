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
      'ข้อกำหนดนี้ใช้กับการเข้าใช้เว็บ Valorant List (valolist) ที่ valo-thai.rosekorn.com ถ้าใช้เว็บต่อ ถือว่าคุณอ่านและยอมรับข้อกำหนดนี้แล้ว',
    sections: [
      {
        h: '1. เว็บนี้คืออะไร',
        body: [
          'Valorant List เป็นเว็บแฟนเมดที่ทำขึ้นโดยแฟนเกม เปิดให้ใช้ฟรี ไม่มีโฆษณา และไม่ได้หารายได้จากเว็บ',
          'เว็บนี้ไม่ใช่เว็บทางการของ VALORANT และไม่ได้เกี่ยวข้อง ได้รับการรับรอง หรือได้รับการสนับสนุนจาก Riot Games',
        ],
      },
      {
        h: '2. ลิขสิทธิ์และเครื่องหมายการค้า',
        body: [
          [
            'VALORANT, Riot Games และชื่อ รูป เสียง โมเดล หรือเนื้อหาอื่นจากในเกม เป็นทรัพย์สินของ Riot Games, Inc. เว็บนี้ใช้เนื้อหาเหล่านั้นภายใต้นโยบาย [Legal Jibber Jabber](https://www.riotgames.com/en/legal) ของ Riot Games',
            'ข้อมูลเกมดึงมาจาก [valorant-api.com](https://valorant-api.com) ซึ่งเป็นบริการของบุคคลที่สาม ไม่ใช่ของ Riot Games',
            'โค้ด งานออกแบบ ภาพประกอบ และข้อความที่ผู้จัดทำเขียนเอง เป็นของผู้จัดทำ Valorant List',
          ],
        ],
      },
      {
        h: '3. ใช้เว็บได้แค่ไหน',
        body: [
          'คุณใช้เว็บนี้เพื่อดูข้อมูล เล่นมินิเกม ทำการ์ดแชร์ และแชร์ลิงก์ให้เพื่อนได้ตามสบาย ส่วนสิ่งที่ขอไม่ให้ทำมีดังนี้',
          [
            'ดึงข้อมูลจากเว็บเป็นจำนวนมากหรือยิงคำขอถี่ ๆ จนเว็บช้าหรือล่ม',
            'ใช้ /api/media ของเว็บเป็นพร็อกซีให้บริการอื่น',
            'เอาเนื้อหาของเว็บไปขาย หรือทำให้คนเข้าใจว่าเป็นเว็บทางการของ Riot Games',
            'ใช้เว็บทำสิ่งที่ผิดกฎหมาย หรือพยายามเจาะระบบ',
          ],
        ],
      },
      {
        h: '4. การ์ดแชร์และข้อความที่คุณพิมพ์',
        body: [
          'ชื่อและข้อความที่คุณพิมพ์ในหน้าแชร์การ์ดถูกประมวลผลในเบราว์เซอร์ของคุณเท่านั้น เราไม่ได้รับหรือเก็บไว้ คุณรับผิดชอบสิ่งที่พิมพ์และแชร์ออกไปเอง ขออย่าใช้ทำเนื้อหาที่หมิ่นประมาท คุกคาม หรือละเมิดสิทธิ์ของคนอื่น',
        ],
      },
      {
        h: '5. ความถูกต้องของข้อมูล',
        body: [
          'เราพยายามให้ข้อมูลตรงกับเกม แต่ข้อมูลอาจคลาดเคลื่อนหรือช้ากว่าเกมจริง เพราะเว็บดึงข้อมูลใหม่ตอนสร้างเว็บเท่านั้น คำแปลภาษาไทยบางส่วนเราเขียนเอง มินิเกมทำไว้ให้สนุก ผลในมินิเกมไม่ได้สะท้อนฝีมือในเกมจริง',
        ],
      },
      {
        h: '6. ข้อจำกัดความรับผิด',
        body: [
          'เว็บนี้ให้บริการตามสภาพที่เป็นอยู่ ไม่มีการรับประกันว่าจะใช้ได้ตลอดเวลาหรือไม่มีข้อผิดพลาด เท่าที่กฎหมายอนุญาต ผู้จัดทำไม่ต้องรับผิดต่อความเสียหายที่เกิดจากการใช้หรือไม่สามารถใช้เว็บนี้',
        ],
      },
      {
        h: '7. ลิงก์ไปเว็บอื่น',
        body: ['เว็บนี้มีลิงก์ไปเว็บภายนอก เช่น valorant-api.com เราไม่ได้ควบคุมเนื้อหาหรือนโยบายของเว็บเหล่านั้น'],
      },
      {
        h: '8. การเปลี่ยนแปลง',
        body: [
          'เราอาจแก้ไขข้อกำหนดนี้ ปรับเปลี่ยนเว็บ หรือปิดเว็บได้โดยไม่ต้องแจ้งล่วงหน้า วันที่แก้ไขล่าสุดจะแสดงไว้ด้านบนของหน้านี้',
        ],
      },
      {
        h: '9. กฎหมายที่ใช้บังคับ',
        body: ['ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย'],
      },
    ],
  },
  privacy: {
    tab: 'นโยบายความเป็นส่วนตัว',
    title: 'นโยบายความเป็นส่วนตัว',
    en: 'Privacy policy',
    intro:
      'นโยบายนี้อธิบายว่า Valorant List จัดการข้อมูลส่วนบุคคลอย่างไร ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) สรุปสั้น ๆ คือ เว็บนี้ไม่มีระบบสมาชิก ไม่ขอชื่อหรืออีเมล ไม่มีโฆษณา และไม่มีตัวติดตาม',
    sections: [
      {
        h: '1. ผู้ควบคุมข้อมูล',
        body: [`ผู้จัดทำ Valorant List เป็นผู้ควบคุมข้อมูลส่วนบุคคลตามนโยบายนี้ ติดต่อได้ทาง [GitHub](${CONTACT_URL})`],
      },
      {
        h: '2. ข้อมูลที่เกี่ยวข้อง',
        body: [
          [
            'ข้อมูลทางเทคนิคตอนเปิดเว็บ เช่น IP address ประเภทเบราว์เซอร์ หน้าที่เปิด และเวลา ข้อมูลนี้ผู้ให้บริการโฮสต์ (Cloudflare) ได้รับโดยอัตโนมัติ ใช้เพื่อส่งหน้าเว็บ กันการโจมตี และดูสถิติการเข้าชมแบบรวม',
            'การตั้งค่าในเว็บ เช่น ภาษา คะแนนสูงสุดในมินิเกม หรือระดับเสียง เก็บไว้ในเบราว์เซอร์ของคุณเอง ไม่ถูกส่งมาหาเรา ดูรายละเอียดใน[นโยบายคุกกี้](/legal/cookies)',
            'ชื่อและข้อความในการ์ดแชร์ ประมวลผลในเบราว์เซอร์ทั้งหมด ไม่ถูกส่งมาที่เซิร์ฟเวอร์',
            'ถ้าคุณติดต่อเราผ่าน GitHub เราจะเห็นข้อมูลที่คุณเลือกเปิดเผยในบัญชี GitHub และข้อความที่ส่งมา',
          ],
        ],
      },
      {
        h: '3. ฐานทางกฎหมาย',
        body: [
          'เราประมวลผลข้อมูลทางเทคนิคโดยอาศัยประโยชน์โดยชอบด้วยกฎหมาย (มาตรา 24(5) PDPA) คือเพื่อให้เว็บทำงานได้และปลอดภัย เราไม่ได้ใช้ข้อมูลเพื่อการตลาดหรือทำโปรไฟล์ผู้ใช้',
        ],
      },
      {
        h: '4. ผู้ที่ได้รับข้อมูล',
        body: [
          'เราไม่ขาย ไม่ให้เช่า และไม่แชร์ข้อมูลเพื่อการโฆษณา ผู้ให้บริการที่เกี่ยวข้องมีดังนี้',
          [
            '[Cloudflare](https://www.cloudflare.com/privacypolicy/) ผู้ให้บริการโฮสต์และเครือข่ายของเว็บ',
            'media.valorant-api.com ซึ่งเบราว์เซอร์ของคุณโหลดรูปในเกมมาจากที่นั่นโดยตรง จึงได้รับ IP address ของคุณตามปกติของการโหลดรูป',
          ],
          'ผู้ให้บริการเหล่านี้อาจมีเซิร์ฟเวอร์อยู่นอกประเทศไทย และดูแลข้อมูลตามนโยบายของแต่ละราย',
        ],
      },
      {
        h: '5. ระยะเวลาเก็บ',
        body: [
          'เราไม่มีฐานข้อมูลผู้ใช้ บันทึกทางเทคนิคของ Cloudflare เก็บตามระยะเวลาของ Cloudflare ส่วนการตั้งค่าในเบราว์เซอร์อยู่จนกว่าคุณจะลบเอง',
        ],
      },
      {
        h: '6. สิทธิของคุณ',
        body: [
          'ตาม PDPA คุณมีสิทธิขอเข้าถึง ขอสำเนา ขอแก้ไข ขอลบ ขอระงับการใช้ คัดค้านการประมวลผล และขอโอนย้ายข้อมูลส่วนบุคคลของคุณ ติดต่อเราได้ตามข้อ 1 แต่เนื่องจากเราแทบไม่ได้เก็บข้อมูลที่ระบุตัวคุณได้ บางคำขออาจไม่มีข้อมูลให้ดำเนินการ',
          'ถ้าคิดว่าข้อมูลของคุณถูกใช้ไม่ถูกต้อง คุณร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.) ได้',
        ],
      },
      {
        h: '7. ผู้เยาว์',
        body: ['เว็บนี้ไม่ได้ตั้งใจเก็บข้อมูลส่วนบุคคลของใคร รวมถึงเด็กและผู้เยาว์'],
      },
      {
        h: '8. การเปลี่ยนแปลงนโยบาย',
        body: ['ถ้าเว็บเริ่มใช้บริการใหม่ที่เกี่ยวกับข้อมูลส่วนบุคคล เราจะแก้นโยบายนี้และอัปเดตวันที่ด้านบน'],
      },
    ],
  },
  cookies: {
    tab: 'นโยบายคุกกี้',
    title: 'นโยบายคุกกี้',
    en: 'Cookie policy',
    intro:
      'เว็บนี้ไม่ได้ตั้งคุกกี้เอง ไม่มีคุกกี้โฆษณา และไม่มีคุกกี้ติดตาม แต่ใช้พื้นที่เก็บข้อมูลในเบราว์เซอร์ (localStorage) จำการตั้งค่าบางอย่างให้คุณ หน้านี้บอกว่าเก็บอะไรบ้าง',
    sections: [
      {
        h: '1. คุกกี้กับ localStorage ต่างกันยังไง',
        body: [
          'คุกกี้คือไฟล์เล็ก ๆ ที่เว็บฝากไว้ในเบราว์เซอร์และถูกส่งกลับไปที่เซิร์ฟเวอร์ทุกครั้งที่เปิดเว็บ ส่วน localStorage เก็บไว้ในเบราว์เซอร์อย่างเดียว ไม่ถูกส่งไปไหน เว็บนี้ใช้ localStorage เพื่อจำสิ่งที่คุณเลือกเองเท่านั้น',
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
              ['valolist:random-excluded', 'จำเอเจนท์ที่คุณตัดออกจากวงล้อสุ่ม'],
              ['valolist:video-volume', 'จำระดับเสียงตอนดูวิดีโอสกิน'],
              ['aimrush:best:*, spikebeat:best:*', 'คะแนนสูงสุดของคุณในมินิเกม'],
            ],
          },
          'ทั้งหมดนี้จำเป็นต่อการทำงานของฟีเจอร์ที่คุณใช้เอง ไม่ใช้ระบุตัวตนและไม่ถูกส่งมาหาเรา',
        ],
      },
      {
        h: '3. คุกกี้จากผู้ให้บริการ',
        body: [
          'Cloudflare ซึ่งเป็นผู้ให้บริการโฮสต์ อาจตั้งคุกกี้ที่จำเป็นด้านความปลอดภัย เช่น __cf_bm เพื่อแยกคนออกจากบอท คุกกี้นี้มีอายุสั้นและไม่ได้ใช้ติดตามคุณข้ามเว็บ',
        ],
      },
      {
        h: '4. ทำไมไม่มีป้ายขอความยินยอม',
        body: [
          'เพราะเว็บนี้ใช้เฉพาะสิ่งที่จำเป็นต่อการทำงานและการตั้งค่าที่คุณกดเลือกเอง ไม่มีคุกกี้วิเคราะห์ การตลาด หรือโฆษณา ถ้าวันหนึ่งเราเพิ่มสิ่งเหล่านี้ จะมีป้ายขอความยินยอมก่อน',
        ],
      },
      {
        h: '5. ลบหรือปิดได้ยังไง',
        body: [
          'ลบข้อมูลเว็บไซต์ได้จากการตั้งค่าเบราว์เซอร์ (ล้างข้อมูลการท่องเว็บ หรือข้อมูลเว็บไซต์ของ valo-thai.rosekorn.com) เว็บยังใช้ได้ปกติ แค่การตั้งค่าและคะแนนสูงสุดจะหายไป',
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
      'These terms apply to Valorant List (valolist) at valo-thai.rosekorn.com. By using the site, you agree to these terms.',
    sections: [
      {
        h: '1. About this site',
        body: [
          'Valorant List is a fan-made site run by players. It is free, has no ads and makes no money.',
          'It is not an official VALORANT site and is not affiliated with, endorsed or sponsored by Riot Games.',
        ],
      },
      {
        h: '2. Copyright and trademarks',
        body: [
          [
            "VALORANT, Riot Games and in-game names, images, sounds, models and other content are the property of Riot Games, Inc. This site uses them under Riot Games' [Legal Jibber Jabber](https://www.riotgames.com/en/legal) policy.",
            'Game data comes from [valorant-api.com](https://valorant-api.com), a third-party service that is not run by Riot Games.',
            "The site's own code, design, illustrations and original text belong to the Valorant List maker.",
          ],
        ],
      },
      {
        h: '3. What you can do',
        body: [
          'Feel free to browse, play the mini games, make share cards and send links to friends. Please do not:',
          [
            'scrape the site heavily or send requests fast enough to slow it down',
            "use the site's /api/media endpoint as a proxy for other services",
            'sell the content or present it as official Riot Games material',
            'use the site for anything illegal or try to break into it',
          ],
        ],
      },
      {
        h: '4. Share cards and text you type',
        body: [
          'Names and text you type on the share card page are processed in your browser only. We never receive or store them. You are responsible for what you write and share, so please keep it free of defamation, harassment or anything that infringes on others.',
        ],
      },
      {
        h: '5. Accuracy',
        body: [
          'We try to match the game, but data can be wrong or lag behind because the site only pulls new data when it is rebuilt. Some Thai translations are our own. The mini games are just for fun and say nothing about your in-game skill.',
        ],
      },
      {
        h: '6. Limitation of liability',
        body: [
          'The site is provided as is, without any warranty that it will always be available or error-free. To the extent allowed by law, the maker is not liable for any loss arising from using or being unable to use the site.',
        ],
      },
      {
        h: '7. External links',
        body: ['The site links to other sites such as valorant-api.com. We do not control their content or policies.'],
      },
      {
        h: '8. Changes',
        body: ['We may change these terms, change the site or shut it down at any time. The date at the top of this page shows the latest update.'],
      },
      {
        h: '9. Governing law',
        body: ['These terms are governed by the laws of Thailand.'],
      },
    ],
  },
  privacy: {
    tab: 'Privacy policy',
    title: 'Privacy policy',
    en: 'Privacy policy',
    intro:
      "This policy explains how Valorant List handles personal data under Thailand's Personal Data Protection Act B.E. 2562 (PDPA). In short: no accounts, no names or emails, no ads and no trackers.",
    sections: [
      {
        h: '1. Data controller',
        body: [`The maker of Valorant List is the data controller for this policy. You can reach us on [GitHub](${CONTACT_URL}).`],
      },
      {
        h: '2. What data is involved',
        body: [
          [
            'Technical data when you open the site, such as IP address, browser type, the page you opened and the time. Our host (Cloudflare) receives this automatically and uses it to serve pages, block attacks and show aggregate traffic stats.',
            'Your settings, such as language, mini game high scores and video volume, are stored in your own browser and never sent to us. See the [cookie policy](/legal/cookies).',
            'Names and text on share cards are processed entirely in your browser and never reach our server.',
            'If you contact us on GitHub, we see whatever your GitHub profile shows and the message you send.',
          ],
        ],
      },
      {
        h: '3. Legal basis',
        body: [
          'We process technical data on the basis of legitimate interest (PDPA section 24(5)) to keep the site working and secure. We do not use it for marketing or profiling.',
        ],
      },
      {
        h: '4. Who receives data',
        body: [
          'We do not sell, rent or share data for advertising. The services involved are:',
          [
            "[Cloudflare](https://www.cloudflare.com/privacypolicy/), the site's host and network",
            'media.valorant-api.com, where your browser loads game images directly, so it sees your IP address like any image request',
          ],
          'These providers may store data outside Thailand under their own policies.',
        ],
      },
      {
        h: '5. Retention',
        body: [
          "We keep no user database. Cloudflare's technical logs follow Cloudflare's retention. Settings in your browser stay until you clear them.",
        ],
      },
      {
        h: '6. Your rights',
        body: [
          'Under the PDPA (and similar laws such as the GDPR), you can ask to access, copy, correct, delete, restrict, object to or port your personal data. Contact us as in section 1. Since we hold almost nothing that identifies you, some requests may have no data to act on.',
          "If you think your data has been misused, you can complain to Thailand's Personal Data Protection Committee (PDPC) or your local data protection authority.",
        ],
      },
      {
        h: '7. Children',
        body: ['The site does not knowingly collect personal data from anyone, including children.'],
      },
      {
        h: '8. Changes',
        body: ['If we start using a new service that involves personal data, we will update this policy and the date at the top.'],
      },
    ],
  },
  cookies: {
    tab: 'Cookie policy',
    title: 'Cookie policy',
    en: 'Cookie policy',
    intro:
      'This site sets no cookies of its own, no ad cookies and no tracking cookies. It does use browser storage (localStorage) to remember a few of your settings. This page lists them.',
    sections: [
      {
        h: '1. Cookies vs localStorage',
        body: [
          'A cookie is a small file a site stores in your browser that is sent back to the server on every visit. localStorage stays in your browser and is never sent anywhere. We only use it to remember choices you make.',
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
          'All of these are needed for features you use. They do not identify you and are never sent to us.',
        ],
      },
      {
        h: '3. Cookies from our provider',
        body: [
          'Cloudflare, our host, may set a strictly necessary security cookie such as __cf_bm to tell people from bots. It is short-lived and is not used to track you across sites.',
        ],
      },
      {
        h: '4. Why there is no consent banner',
        body: [
          'We only use storage that is needed for the site to work or that you turn on yourself. There are no analytics, marketing or ad cookies. If we ever add any, we will ask for consent first.',
        ],
      },
      {
        h: '5. How to clear it',
        body: [
          'You can clear site data in your browser settings (browsing data, or site data for valo-thai.rosekorn.com). The site keeps working; only your settings and high scores reset.',
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
