/* Блоки і завдання. Щоб додати блок чи завдання — допишіть об'єкт у tasks.
   key — унікальний ключ завдання (module.номер): за ним зберігається прогрес і шукається хеш прапора.
   Самі прапори тут не лежать: див. tools/flags.private.json і tools/gen_hashes.py. */
window.KPI_DATA = {
  modules: [
    {
      id: "web",
      title: "Веб-безпека",
      tag: "WEB",
      icon: "web",
      desc: "SQL-ін'єкції та XSS на навчальному сайті: пошук, вхід, магазин, привітання, гостьова книга, фільтр.",
      intro: [
        "Усі шість завдань виконуються на одному навчальному сайті. Кожне завдання — це окрема сторінка сайту: відкрийте її за посиланням у завданні, знайдіть вразливість і отримайте прапор. Введіть його в поле під відповідним завданням."
      ],
      resources: [
        { label: "Навчальний сайт «Kittens»", url: "https://werrvix.github.io/kittens/" }
      ],
      tasks: [
        {
          key: "web.1",
          title: "Search (пошук)",
          tag: "SQLi",
          text: "Знайдіть прапор на сторінці «Search» навчального сайту.",
          links: [{ label: "Відкрити сторінку Search", url: "https://werrvix.github.io/kittens/" }],
          placeholder: "kpi{s0m3th1ng}",
          points: 100
        },
        {
          key: "web.2",
          title: "Login (вхід)",
          tag: "SQLi",
          text: "Знайдіть прапор на сторінці «Login» навчального сайту.",
          links: [{ label: "Відкрити сторінку Login", url: "https://werrvix.github.io/kittens/tasks/login.html" }],
          placeholder: "kpi{s0m3th1ng}",
          points: 100
        },
        {
          key: "web.3",
          title: "Shop (магазин)",
          tag: "SQLi",
          text: "Знайдіть прапор на сторінці «Shop» навчального сайту.",
          links: [{ label: "Відкрити сторінку Shop", url: "https://werrvix.github.io/kittens/tasks/union.html" }],
          placeholder: "kpi{s0m3th1ng}",
          points: 150
        },
        {
          key: "web.4",
          title: "Greeting (привітання)",
          tag: "XSS",
          text: "Знайдіть прапор на сторінці «Greeting» навчального сайту.",
          links: [{ label: "Відкрити сторінку Greeting", url: "https://werrvix.github.io/kittens/tasks/hello.html?name=guest" }],
          placeholder: "kpi{s0m3th1ng}",
          points: 100
        },
        {
          key: "web.5",
          title: "Guestbook (гостьова книга)",
          tag: "XSS",
          text: "Знайдіть прапор на сторінці «Guestbook» навчального сайту.",
          links: [{ label: "Відкрити сторінку Guestbook", url: "https://werrvix.github.io/kittens/tasks/guestbook.html" }],
          placeholder: "kpi{s0m3th1ng}",
          points: 150
        },
        {
          key: "web.6",
          title: "Filter (фільтр)",
          tag: "XSS",
          text: "Знайдіть прапор на сторінці «Filter» навчального сайту.",
          links: [{ label: "Відкрити сторінку Filter", url: "https://werrvix.github.io/kittens/tasks/filter.html?name=guest" }],
          placeholder: "kpi{s0m3th1ng}",
          points: 200
        }
      ]
    },
    {
      id: "crypto",
      title: "Криптографія",
      tag: "CRYPTO",
      icon: "crypto",
      desc: "Чотири шифри: від класичних до вкладених шарів. Інструменти — CyberChef і dCode.",
      intro: [
        "Розшифруйте повідомлення й введіть прапор у форматі flag{...}. Для розв'язання користуйтеся CyberChef, а де потрібно — dCode."
      ],
      resources: [
        { label: "CyberChef", url: "https://gchq.github.io/CyberChef/" },
        { label: "dCode", url: "https://www.dcode.fr/en" }
      ],
      tasks: [
        {
          key: "crypto.1",
          title: "Ave, Цезарю!",
          text: "Розшифруйте повідомлення.",
          codeLabel: "Шифротекст",
          code: "kqfl{ym3_h4j5fw_h1um3w_1x_f_hq4x51h}",
          links: [
            { label: "CyberChef", url: "https://gchq.github.io/CyberChef/" },
            { label: "dCode", url: "https://www.dcode.fr/en" }
          ],
          prefix: "flag",
          placeholder: "flag{s0m3th1ng}",
          points: 100
        },
        {
          key: "crypto.2",
          title: "Bonjour, Віженере!",
          text: "Розшифруйте повідомлення.",
          codeLabel: "Шифротекст",
          code: "ppyq{4rb_fmeorcbi_gc_ns5d_4w_kegf_0p_e_a14c5ma}",
          links: [
            { label: "dCode", url: "https://www.dcode.fr/en" },
            { label: "CyberChef", url: "https://gchq.github.io/CyberChef/" }
          ],
          prefix: "flag",
          placeholder: "flag{s0m3th1ng}",
          points: 150
        },
        {
          key: "crypto.3",
          title: "Бутерброд",
          text: "Розшифруйте повідомлення.",
          codeLabel: "Шифротекст",
          code: "MzczZDMwMzYyYTMzNjUyMjM0Njc2NTBlNjUzZjM1MGUzOTYyMjkwZTMwMjM2MjBlMjIzZTBlNjIzMDIyMjgwZTIzNjAzNjM5MjUyYw==",
          links: [{ label: "CyberChef", url: "https://gchq.github.io/CyberChef/" }],
          prefix: "flag",
          placeholder: "flag{s0m3th1ng}",
          points: 150
        },
        {
          key: "crypto.4",
          title: "Кіндерсюрприз",
          text: "Задача у файлах нижче. Знайдіть прапор.",
          files: [
            { name: "task4_01-password.txt", path: "assets/crypto/task4_01-password.txt", size: "13 КБ" },
            { name: "task4_02-link.txt", path: "assets/crypto/task4_02-link.txt", size: "1 КБ" }
          ],
          links: [
            { label: "CyberChef", url: "https://gchq.github.io/CyberChef/" },
            { label: "dCode", url: "https://www.dcode.fr/en" }
          ],
          prefix: "flag",
          placeholder: "flag{s0m3th1ng}",
          points: 300
        }
      ]
    },
    {
      id: "forensics",
      title: "Криміналістика",
      tag: "FORENSICS",
      icon: "forensics",
      desc: "Метадані, приховані дані, аналіз мережевого трафіку та OSINT.",
      caseName: "«Кріт»",
      story: [
        "О 17:49, коли більшість співробітників уже завершували роботу, система внутрішнього моніторингу КПІ зафіксувала аномальний відтік конфіденційних даних. З'єднання йшло з корпоративного ноутбука десь із території кампусу.",
        "Зловмисник діяв швидко, але припустився однієї фатальної помилки. У поспіху, формуючи архів для вивантаження, він випадково захопив і відправив файл зі свого робочого столу — фотографію, яку, ймовірно, щойно зробив на телефон. На знімку було видно край екрана його робочого ноутбука, а поруч стояв якийсь напій.",
        "Служба безпеки негайно пробила серійний номер і з'ясувала, кому видавали цю техніку. Але результати перевірки по базах шокували: ідентичність співробітника виявилася повністю сфабрикованою. Його диплом про вищу освіту — якісна підробка, біометрія в системі контролю доступу майстерно замінена, а паспортні дані належать людині, якої ніколи не існувало. \"Кріт\" зник, відключивши пристрій від мережі.",
        "У нас залишився лише один доказ — те саме випадково злите фото (evidence.jpg). Ваше завдання: розплутати цей цифровий слід, пройти 4 етапи розслідування та встановити справжню особу зловмисника."
      ],
      files: [
        {
          name: "evidence.jpg",
          path: "assets/evidence.jpg",
          size: "272 КБ",
          sha256: "4ae0177b614e509468d1b88db1ef2c5522809ab8392b2f66088cfd93b7b0720c"
        }
      ],
      tasks: [
        {
          key: "forensics.1",
          title: "Напій втікача",
          text: "Назвіть улюблений напій втікача і його ціну.",
          links: [
            { label: "Jimpl — дані EXIF", url: "https://jimpl.com/" },
            { label: "Google Maps", url: "https://www.google.com/maps" }
          ],
          placeholder: "kpi{drink_price}",
          points: 100
        },
        {
          key: "forensics.2",
          title: "Загублена картинка",
          text: "Загублена картинка містить приховані дані, знайдіть наступний прапор.",
          links: [
            { label: "HexEd.it — hex-редактор", url: "https://hexed.it/" }
          ],
          placeholder: "kpi{s0m3th1ng}",
          points: 150
        },
        {
          key: "forensics.3",
          title: "Перехоплений трафік",
          text: "У перехопленому трафіку десь є витік даних, знайдіть його.",
          links: [
            { label: "HexEd.it — hex-редактор", url: "https://hexed.it/" },
            { label: "vs-shark — перегляд pcap", url: "https://sankooc.github.io/vs-shark/app/" }
          ],
          placeholder: "kpi{s0m3th1ng}",
          points: 150
        },
        {
          key: "forensics.4",
          title: "Особа зловмисника",
          text: "Ми майже на шляху до ідентичності злочинця, пошукай далі.",
          links: [
            { label: "jwt.io — розбір токенів", url: "https://www.jwt.io/" },
            { label: "WhatsMyName — пошук за нікнеймом", url: "https://whatsmyname.io/" }
          ],
          placeholder: "kpi{s0m3th1ng}",
          points: 200
        }
      ]
    },
    {
      id: "reverse",
      title: "Реверс",
      tag: "REVERSE",
      icon: "reverse",
      desc: "Дослідіть код сторінки в браузері й відновіть прихований прапорець.",
      intro: [
        "Код нижче — це «перевірка» зі сторінки шкільного робота. Прочитайте його, зрозумійте алгоритм і відновіть прапорець формату SCHOOL{...}. Код можна скопіювати й запускати в консолі браузера (F12 → Console), без інтернету й додаткових програм. Просте «обійти перевірку» завдання не виконує: потрібен оригінальний прапорець."
      ],
      tasks: [
        {
          key: "reverse.1",
          title: "Архів 404",
          text: "Шкільний робот заховав код доступу до архіву гуртка. Нижче — код, яким він перевіряє введене значення. Дослідіть, як працює перевірка, і відновіть оригінальний прапорець. Додатково поясніть алгоритм своїми словами.",
          codeLabel: "Код перевірки (JavaScript)",
          code: "const archiveBytes = [68,91,81,85,84,91,99,123,104,116,96,107,124,104,68,115,125,109,127,120,99,113,111,127,102];\n\nfunction verify(candidate) {\n  if (candidate.length !== archiveBytes.length) return false;\n  for (let i = 0; i < candidate.length; i++) {\n    const key = 23 + (i % 5);\n    if ((candidate.charCodeAt(i) ^ key) !== archiveBytes[i]) return false;\n  }\n  return true;\n}",
          hints: [
            { title: "Підказка 1 — що шукати?", text: "Подивіться на функцію verify. Які дії вона виконує з кожним символом? Звідки беруться числа для порівняння?" },
            { title: "Підказка 2 — що означає ^?", text: "Це побітове XOR. Воно оборотне: (a ^ b) ^ b === a. Оператор % дає остачу від ділення, тому ключ повторюється кожні п'ять символів." },
            { title: "Підказка 3 — як отримати літери?", text: "Для кожного елемента масиву застосуйте XOR із тим самим ключем, що й у перевірці. Перетворіть числа на символи через String.fromCharCode і об'єднайте через join('')." }
          ],
          links: [],
          prefix: "SCHOOL",
          placeholder: "SCHOOL{s0m3th1ng}",
          points: 200
        }
      ]
    }
  ]
};
