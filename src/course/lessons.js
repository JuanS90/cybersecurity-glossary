export function createLessons({ v, words, quiz, reducedMotion }) {
  const RM = reducedMotion;
  return [
        {
          t: "What is cybersecurity?",
          short: "Introduction",
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Lesson 1 · Introduction</span><h1>What is cybersecurity?</h1>
 <p class="lead">Learn simple ways to protect your accounts, devices and personal information.</p></div>
 <div class="prose">
  <p>${v("Cybersecurity", "ciberseguridad")} is the practice of protecting computers, phones, ${v("networks", "redes")} and ${v("personal information", "datos personales")} from attacks. An attack can come from a ${v("hacker", "pirata informático")}, a fake message or a dangerous app.</p>
  <p>Attackers usually want three things: your <b>accounts</b> (Instagram, email, games), your <b>money</b> and your <b>data</b>. The good news: most attacks fail if you have a few good habits. You don't need to be an expert to be safe.</p>
 </div>
 <div class="box"><h2>The three things we protect</h2>
  <div class="grid g3">
   <div class="mini"><span class="lbl">Confidentiality</span><h3>Keep it secret</h3><p>Only the right people can see your information. Example: nobody can read your private messages.</p></div>
   <div class="mini"><span class="lbl">Integrity</span><h3>Keep it correct</h3><p>Nobody can change your information without permission. Example: nobody can change your grades.</p></div>
   <div class="mini"><span class="lbl">Availability</span><h3>Keep it working</h3><p>You can use your information when you need it. Example: your files are not locked by a virus.</p></div>
  </div>
  <p class="note">Experts call this the <b>CIA triad</b>. Here CIA means Confidentiality, Integrity and Availability.</p>
 </div>
 ${words([
   ["attack", "ataque"],
   ["threat", "amenaza"],
   ["data", "datos"],
   ["account", "cuenta"],
   ["device", "dispositivo"],
 ])}
 ${quiz("q1", "A virus locks all the photos on your phone and you can't open them. What is affected?", ["Confidentiality", "Availability", "Integrity"], 1, "Availability means you can use your information when you need it. Locked files are not available.")}
`,
        },
        {
          t: "Strong passwords",
          short: "Passwords",
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Lesson 2 · Passwords</span><h1>Strong passwords</h1>
 <p class="lead">Your ${v("password", "contraseña")} is the key to your digital life. A weak one is like leaving your house open.</p></div>
 <div class="prose">
  <p>Attackers use programs that try millions of passwords per second. Short passwords and common words like <code>123456</code>, <code>password</code> or your pet's name are ${v("cracked", "descifradas")} in seconds.</p>
  <p>A ${v("strong password", "contraseña segura")} is <b>long</b> (12 characters or more) and <b>unique</b> (you use it for only one account). A great trick is a ${v("passphrase", "frase de contraseña")}: four random words together, like <code>Purple-Mate-Rocket-47</code>. It's long, easy to remember and hard to crack.</p>
  <p>Also turn on ${v("two-factor authentication (2FA)", "autenticación de dos factores (verificación en dos pasos)")}. With 2FA, you use your password and a second way to prove it is you, such as a code or an app. If someone steals your password, they still need that second proof to ${v("log in", "iniciar sesión")}.</p>
 </div>
 <div class="box activity"><span class="eyebrow">Try it</span><h2>Password strength tester</h2>
  <p class="note">Type an example password (don't use your real one). Nothing is saved or sent.</p>
  <input class="pw" id="pw" type="text" autocomplete="off" spellcheck="false" value="messi10" aria-label="Test password">
  <div class="meter" id="meter"><i></i><i></i><i></i><i></i></div>
  <p class="verdict" id="verdict"></p>
  <ul class="checks" id="checks"></ul>
 </div>
 ${words([
   ["weak", "débil"],
   ["strong", "fuerte, segura"],
   ["unique", "única"],
   ["guess", "adivinar"],
   ["2FA", "autenticación de dos factores (verificación en dos pasos)"],
 ])}
 ${quiz("q2", "Which password is the strongest?", ["Juan2009", "qwerty123", "Taco-Cloud-Violin-Seven", "P@ss"], 2, "The passphrase is long and uses random words. Length is the most important thing.")}
`,
        },
        {
          t: "Phishing",
          short: "Phishing",
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Lesson 3 · Phishing</span><h1>Don't take the bait</h1>
 <p class="lead">${v("Phishing", "phishing, suplantación")} sounds like <i>fishing</i> because the attacker throws a hook and waits for you to bite.</p></div>
 <div class="prose">
  <p>A phishing message pretends to come from someone you trust: your bank, a streaming service, a game or even your school. It tries to make you ${v("click a link", "hacer clic en un enlace")}, open an ${v("attachment", "archivo adjunto")} or type your password on a ${v("fake website", "sitio web falso")}.</p>
  <p>Phishing works because it plays with emotions: <b>fear</b> ("your account will be blocked"), <b>urgency</b> ("only 24 hours") or <b>greed</b> ("you won a prize"). When a message makes you feel a strong emotion, stop and think.</p>
  <p>Phishing by text message is called ${v("smishing", "smishing (por SMS)")}. By phone call, it's ${v("vishing", "vishing (por llamada)")}.</p>
 </div>
 <div class="box activity"><span class="eyebrow">Activity</span><h2>Find the 6 red flags</h2>
  <p class="note">Tap the parts of this email that look suspicious. The company is invented.</p>
  <div class="chipbar"><span class="pill" id="flag-n">0 / 6 found</span><button class="sm" id="flag-all">Show all</button></div>
  <div class="mail">
   <div class="mail-h">
    <span><b>From:</b> <button class="flag from" data-f="0">StreamBox Support &lt;security@streambox-acount-verify.xyz&gt;</button></span>
    <span><b>Subject:</b> <button class="flag" data-f="1">URGENT!!! Your account will be deleted</button></span>
   </div>
   <div class="mail-b">
    <p><button class="flag" data-f="2">Dear Customer,</button></p>
    <p>We detected a problem with your payment. <button class="flag" data-f="3">If you do not verify your account in 24 hours, it will be permanently deleted.</button></p>
    <p><button class="flag" data-f="4">Please confirm your password and card number</button> using the button below.</p>
    <p><button class="flag fakebtn" data-f="5">Verify my account</button></p>
    <p>Thank you,<br>StreamBox Team</p>
   </div>
  </div>
  <ol class="found-list" id="found-list"></ol>
 </div>
 <div class="box activity"><span class="eyebrow">Activity</span><h2>Scam or safe?</h2>
  <p class="note">Read each text message and decide.</p>
  <div id="sms-area"></div>
 </div>
 ${words([
   ["bait", "carnada"],
   ["red flag", "señal de alerta"],
   ["sender", "remitente"],
   ["suspicious", "sospechoso"],
   ["urgent", "urgente"],
 ])}
`,
        },
        {
          t: "Malware",
          short: "Malware",
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Lesson 4 · Malware</span><h1>Meet the malware family</h1>
 <p class="lead">${v("Malware", "software malicioso")} = <b>mal</b>icious + soft<b>ware</b>. It is software made to harm a device, spy on someone, steal information, or control a device without permission.</p></div>
 <div class="prose">
  <p>Malware usually enters when you ${v("download", "descargar")} pirated games or apps, open strange attachments, plug in an unknown USB drive or click a phishing link. Once inside, each type does something different.</p>
 </div>
 <div class="box"><div class="tw"><table>
  <thead><tr><th>Type</th><th>What it does</th><th>Spanish</th></tr></thead>
  <tbody>
   <tr><td><b>Virus</b></td><td>Attaches itself to a file or program. It can spread when someone opens or shares that file.</td><td>virus</td></tr>
   <tr><td><b>Trojan horse</b></td><td>Pretends to be a useful or safe program, but is harmful.</td><td>troyano</td></tr>
   <tr><td><b>Ransomware</b></td><td>Locks your files and asks for money (a <i>ransom</i>) to unlock them.</td><td>secuestro de datos</td></tr>
   <tr><td><b>Spyware</b></td><td>Secretly watches what you do and sends it to someone else.</td><td>software espía</td></tr>
   <tr><td><b>Keylogger</b></td><td>Records everything you type, including passwords.</td><td>registrador de teclas</td></tr>
   <tr><td><b>Adware</b></td><td>Fills your screen with unwanted ads.</td><td>software publicitario</td></tr>
  </tbody></table></div></div>
 <div class="box"><h2>How to protect your device</h2>
  <div class="grid">
   <div class="mini"><h3>Update</h3><p>Install ${v("updates", "actualizaciones")}. They close the holes malware uses to enter.</p></div>
   <div class="mini"><h3>Use official stores</h3><p>Download apps only from Google Play, the App Store or the official website.</p></div>
   <div class="mini"><h3>Antivirus</h3><p>Keep an ${v("antivirus", "antivirus")} active. It finds and removes malware.</p></div>
   <div class="mini"><h3>Backup</h3><p>Make a ${v("backup", "copia de seguridad")}. If ransomware locks your files, you still have a copy.</p></div>
  </div>
 </div>
 <div class="row"><span class="note">There are many more types, like worms, rootkits and zombies.</span><button class="btn" type="button" data-go="glossary">See all 47 threats in the Security glossary A–Z →</button></div>
 ${quiz("q4", 'You download a "free" version of a paid game from a strange website. Later, your passwords are stolen. What was the game probably?', ["A firewall", "A Trojan horse", "An update", "A backup"], 1, "A Trojan horse looks useful or fun but hides malware inside.")}
`,
        },
        {
          t: "Privacy and social media",
          short: "Privacy",
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Lesson 5 · Privacy</span><h1>Think before you post</h1>
 <p class="lead">What you post online can stay there forever. This is your ${v("digital footprint", "huella digital")}.</p></div>
 <div class="prose">
  <p>${v("Privacy", "privacidad")} is your right to decide who sees your information. Criminals can use small details from your posts to guess your passwords, find where you live or pretend to be you. This is called ${v("identity theft", "robo de identidad")}.</p>
  <p>Check your ${v("privacy settings", "configuración de privacidad")}: make your account private, accept only people you know and turn off location on your photos. And remember: ${v("cyberbullying", "ciberacoso")} is never OK. If you see it, don't share it: ${v("report", "denunciar")} it and tell an adult you trust.</p>
 </div>
 <div class="box activity"><span class="eyebrow">Activity</span><h2>Would you post this?</h2>
  <p class="note">Choose OK or Not OK for each post.</p>
  <div class="posts" id="posts"></div>
  <p class="fb" id="post-fb"></p>
 </div>
 ${words([
   ["post", "publicar, publicación"],
   ["share", "compartir"],
   ["follower", "seguidor"],
   ["location", "ubicación"],
   ["stranger", "desconocido"],
 ])}
`,
        },
        {
          t: "Wi-Fi and everyday habits",
          short: "Everyday habits",
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Lesson 6 · Everyday habits</span><h1>Safe habits every day</h1>
 <p class="lead">Cybersecurity is not a program you install once. It's a set of small habits.</p></div>
 <div class="prose">
  <p>${v("Public Wi-Fi", "wifi público")} in cafés, airports or shopping centers is useful, but other people on the same network can sometimes see what you send. Don't use your bank app or type important passwords there. If you must, use a ${v("VPN", "red privada virtual")}, which ${v("encrypts", "cifra")} your connection.</p>
  <p>On shared computers, like the ones at school, always ${v("log out", "cerrar sesión")} when you finish, and never click "remember my password". Lock your phone with a PIN or fingerprint so nobody can use it if you lose it.</p>
 </div>
 <div class="box"><h2>Your checklist</h2><div class="posts" id="habits"></div><p class="note" id="habit-n"></p></div>
 ${quiz("q6", "You're at a café and want to check your bank account. What's the safest choice?", ["Use the café's free Wi-Fi", "Use your phone's mobile data", "Ask a stranger to share their hotspot"], 1, "Mobile data is safer than public Wi-Fi because other people can't join your connection.")}
`,
        },
        {
          t: "A short history of malware",
          short: "Malware history",
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Lesson 7 · History</span><h1>A short history of malware</h1>
 <p class="lead">The first computer ${v("viruses", "virus")} were experiments and jokes. Today, malware is a business. Travel through time and see how it changed.</p></div>
 <figure class="scene tl${RM ? " paused" : ""}" id="tl">
  <div class="tl-top"><div class="tl-year" id="tl-year" aria-live="polite">1949</div><span class="tl-era" id="tl-era"></span></div>
  <div class="tl-scroll"><div class="tl-track" id="tl-track"></div></div>
  <div id="tl-card-wrap"></div>
  <figcaption><span>Based on the “Malware timeline” in the Sophos Threatsaurus (pp. 92–98).</span>
   <button class="sm" type="button" id="tl-prev">← Before</button><button class="sm playbtn" type="button">${RM ? "Play" : "Pause"}</button><button class="sm" type="button" id="tl-next">After →</button></figcaption>
 </figure>
 <div class="box"><h2>Three eras of malware</h2>
  <div class="grid g3">
   <div class="mini" style="border-color:var(--accent)"><span class="lbl">1949 – 1981</span><h3>Experiments</h3><p>Scientists and students test programs that can ${v("copy themselves", "copiarse a sí mismos")}. Nobody wants to cause damage.</p></div>
   <div class="mini" style="border-color:var(--warn)"><span class="lbl">1982 – 1999</span><h3>Pranks and vandalism</h3><p>Viruses travel on floppy disks and by email. They show messages, crash computers or ${v("erase", "borrar")} files.</p></div>
   <div class="mini" style="border-color:var(--flag)"><span class="lbl">2000 – 2013</span><h3>Crime for money</h3><p>Criminals use ${v("zombies", "zombis")}, phishing and ransomware to steal money and data. Malware tries to stay hidden.</p></div>
  </div>
  <p class="note">The Threatsaurus was published in 2013, so the timeline ends there.</p>
 </div>
 ${words([
   ["floppy disk", "disquete"],
   ["spread", "propagarse"],
   ["crash", "colgarse, fallar"],
   ["ransom", "rescate"],
   ["worldwide", "en todo el mundo"],
 ])}
 ${quiz("q7", "Which was the first malware that asked for money to unlock a computer?", ["Brain (1986)", "The AIDS Trojan (1989)", "Melissa (1999)", "Creeper (1971)"], 1, "In 1989 the AIDS Trojan encrypted the hard disk and asked for a payment. It was the first ransomware.")}
`,
        },
        {
          t: "Certificate",
          short: "Certificate",
          cert: true,
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Final step</span><h1>You're cyber safe!</h1>
 <p class="lead">Write your name to get your certificate.</p></div>
 <div class="row"><input id="cname" placeholder="Your name" aria-label="Your name" maxlength="40"></div>
 <div class="cert" id="cert">
  <span class="eyebrow">Certificate of completion</span>
  <p class="big">Cyber Basics</p>
  <p class="note">This certifies that</p>
  <div class="name" id="cert-name">Your name</div>
  <p class="note">completed the seven lessons of the Cyber Basics course and knows how to stay safe online.</p>
  <ul><li>✓ Strong passwords</li><li>✓ Phishing</li><li>✓ Malware</li><li>✓ Privacy</li><li>✓ Safe habits</li><li>✓ Malware history</li></ul>
  <p class="note" id="cert-score"></p>
 </div>
 <div class="box"><h2>Golden rules to remember</h2><ol class="found-list" style="font-size:16px">
  <li>Use long, unique passwords and turn on 2FA.</li>
  <li>Stop and think before you click a link.</li>
  <li>Update your apps and devices.</li>
  <li>Download only from official stores.</li>
  <li>Make backups of important files.</li>
  <li>Protect your personal information and privacy settings.</li>
  <li>Avoid important accounts on public Wi-Fi.</li>
  <li>If something is strange, ask for help.</li>
 </ol></div>
 <div class="row"><button class="btn" type="button" data-go="glossary">Open the Security glossary A–Z →</button></div>
`,
        },
        {
          t: "Security glossary A–Z",
          short: "Security glossary A–Z",
          ref: true,
          html: () => `
 <div class="lesson-head"><span class="eyebrow">Adapted from the Sophos Threatsaurus (2013)</span><h1>Security glossary A–Z</h1>
 <p class="lead">Explore threats and security tools in simple English, with Spanish translations. Page numbers show where each term appears in the Threatsaurus.</p></div>
 <div class="gbar">
  <input id="gq" type="search" placeholder="Search in English or Spanish…" aria-label="Search the glossary">
  <button class="chip2" type="button" data-k="all" aria-pressed="true">All</button>
  <button class="chip2" type="button" data-k="t" aria-pressed="false">Threats</button>
  <button class="chip2" type="button" data-k="d" aria-pressed="false">Security tools</button>
 </div>
 <div class="letters" id="gl"></div>
 <span class="note" id="gcount"></span>
 <div class="glist" id="glist"></div>
`,
        },
  ];
}
