export const COMMON = [
        "123456",
        "password",
        "qwerty",
        "12345678",
        "111111",
        "abc123",
        "123456789",
        "iloveyou",
        "admin",
        "messi10",
        "boca",
        "river",
        "contraseña",
        "hola123",
      ];

export const FLAGS = [
        [
          "Strange sender address",
          "The real company would use its own domain. This one has a spelling mistake (acount) and ends in .xyz.",
        ],
        [
          "Urgent, scary subject",
          "Capital letters and !!! try to make you panic so you don't think.",
        ],
        [
          "Generic greeting",
          '"Dear Customer" means they don\'t know your name. Real companies usually use it.',
        ],
        [
          "Pressure and threats",
          '"24 hours" and "permanently deleted" are pressure tricks.',
        ],
        [
          "Asks for your password and card",
          'A real company never asks for your password by email. Also: "you\'re" should be "your". Spelling errors are a red flag.',
        ],
        [
          "Suspicious button",
          "The button takes you to a fake website. Never click. Go to the real app or website yourself.",
        ],
      ];

export const SMS = [
        [
          "+54 9 11 5555-0192",
          "Congratulations!! You won an iPhone 17. Claim your prize now: bit.ly/fr33-ph0ne",
          true,
          "Prizes you never entered are a classic scam. The link is shortened to hide where it goes.",
        ],
        [
          "Mom",
          "Can you buy bread on your way home? 🍞",
          false,
          "A normal message from a known contact that doesn't ask for anything strange.",
        ],
        [
          "Unknown number",
          "Hi, it's me, I changed my number. I need you to send me money urgently, I'll explain later.",
          true,
          'Scammers pretend to be friends or family with a "new number". Call the person on their old number to check.',
        ],
        [
          "Your school",
          "Reminder: the parents' meeting is on Friday at 6 pm in the main hall.",
          false,
          "Information only. No links, no requests for money or passwords.",
        ],
        [
          "Delivery Service",
          "Your package is on hold. Pay a $2 fee to receive it: deliv-ery-track.info",
          true,
          "Fake delivery messages ask for small payments to steal your card details.",
        ],
      ];

export const POSTS = [
        [
          "A photo of your new puppy 🐶",
          true,
          "OK! A pet photo is fine. Just don't use your pet's name as a password.",
        ],
        [
          "A photo of your ID card (DNI) to show your new picture",
          false,
          "Not OK. Your ID number can be used for identity theft.",
        ],
        [
          '"On vacation in Brazil for 2 weeks!" posted while you\'re away',
          false,
          "Not OK. It tells everyone your house is empty. Post the photos when you come back.",
        ],
        [
          "A selfie in your school uniform with the school name and your street",
          false,
          "Not OK. It shows where you study and live. Strangers can find you.",
        ],
        [
          "A drawing you made in art class",
          true,
          "OK! Sharing your art is great.",
        ],
        [
          "Your phone number in your public bio",
          false,
          "Not OK. Anyone, including scammers, can contact you.",
        ],
      ];

export const HAB = [
        "I use a different password for each account",
        "I have 2FA on my email and social media",
        "My phone has a PIN, pattern or fingerprint",
        "I install updates when they appear",
        "I only download apps from official stores",
        "I log out on shared computers",
        "My social media accounts are private",
        "I have a backup of my important files",
      ];

export const TL = [
        [
          1949,
          "Programs that copy themselves",
          "Mathematician John von Neumann writes that a computer program could reproduce itself. For now, it's only an idea.",
          "Idea",
          "Virus",
        ],
        [
          1959,
          "Core Wars",
          "Researchers at Bell Labs create a game where programs called “organisms” fight for computer time.",
          "Game",
          "Malware",
        ],
        [
          1971,
          "The first worm",
          "Creeper travels from computer to computer on ARPANET, the ancestor of the internet, and shows a message.",
          "Worm",
          "Internet worm",
        ],
        [
          1982,
          "Elk Cloner",
          "A 15-year-old writes a virus for the Apple II. It spreads on floppy disks and shows a short poem every 50th time the computer starts.",
          "Virus",
          "Virus",
        ],
        [
          1986,
          "Brain, the first PC virus",
          "Two brothers in Pakistan write the first virus for IBM PCs. It copies itself onto floppy disks.",
          "Virus",
          "Boot sector malware",
        ],
        [
          1987,
          "The Christmas tree worm",
          "An email Christmas card draws a tree and secretly sends itself to everyone in your contacts. The traffic blocks IBM's worldwide network.",
          "Worm",
          "Email malware",
        ],
        [
          1988,
          "The Internet Worm",
          "A 23-year-old student releases a worm that infects thousands of computers. An error makes it infect them again and again until they crash.",
          "Worm",
          "Internet worm",
        ],
        [
          1989,
          "The first ransom demand",
          "The AIDS Trojan arrives on a floppy disk. It encrypts the hard disk and asks for money in exchange for the password.",
          "Ransomware",
          "Ransomware",
        ],
        [
          1992,
          "The Michelangelo panic",
          "A virus designed to erase hard disks every March 6 causes worldwide panic, but very few computers are infected.",
          "Virus",
          "Virus",
        ],
        [
          1994,
          "The first email hoax",
          "The “Good Times” message warns about a virus that erases your disk if you open an email. The virus doesn't exist.",
          "Hoax",
          "Hoax",
        ],
        [
          1995,
          "The first document virus",
          "Concept hides inside Microsoft Word documents and spreads using macros.",
          "Document malware",
          "Document malware",
        ],
        [
          1999,
          "Email viruses go global",
          "Melissa forwards itself by email and spreads around the world.",
          "Email malware",
          "Email malware",
        ],
        [
          2000,
          "Big websites go offline",
          "DDoS attacks take Yahoo!, eBay and Amazon offline for hours. The Love Bug becomes the most successful email virus so far.",
          "DDoS",
          "Denial-of-service attack",
        ],
        [
          2003,
          "Zombies and phishing",
          "The Sobig worm turns PCs into zombies that send spam. The Mimail worm pretends to be PayPal to steal credit card details.",
          "Zombie · Phishing",
          "Zombie",
        ],
        [
          2005,
          "Rootkits",
          "A copy protection system on music CDs installs a rootkit that hides files. Hackers use it to hide their own malware.",
          "Rootkit",
          "Rootkit",
        ],
        [
          2006,
          "Early ransomware and APTs",
          "Trojans like Archiveus encrypt files and ask for payment. The term “advanced persistent threat” (APT) is used for the first time.",
          "Ransomware · APT",
          "Advanced persistent threat",
        ],
        [
          2008,
          "Fake antivirus",
          "Scary warnings trick people into paying for fake security products. The first iPhone malware also appears.",
          "Fake antivirus",
          "Fake antivirus",
        ],
        [
          2009,
          "The first Android malware",
          "FakePlayer looks like a normal app but sends SMS messages to expensive numbers. The Conficker worm makes headlines worldwide.",
          "Mobile malware",
          "Mobile phone malware",
        ],
        [
          2010,
          "Stuxnet",
          "A worm with a special mission: attacking industrial control systems. Its main target is believed to be uranium enrichment in Iran.",
          "Worm",
          "Internet worm",
        ],
        [
          2013,
          "Ransomware is back",
          "Ransomware becomes one of the top threats. Strong encryption makes locked files almost impossible to recover.",
          "Ransomware",
          "Ransomware",
        ],
      ].map(([y, t, d, tag, g]) => ({ y, t, d, tag, g }));
