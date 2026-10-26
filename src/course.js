import { createLessons } from "./course/lessons.js";
import { COMMON, FLAGS, HAB, POSTS, SMS, TL } from "./course/activity-data.js";

// v("word","spanish") — vocabulary marker
      const v = (w, es) =>
        `<button class="v" type="button">${w}<span class="es">${es}</span></button>`;
      const words = (list) =>
        `<div class="words">${list.map(([a, b]) => `<span class="word"><b>${a}</b> · <i>${b}</i></span>`).join("")}</div>`;
      const quiz = (id, q, opts, right, exp) =>
        `<div class="box activity" data-quiz="${id}"><span class="eyebrow">Quick check</span><h3>${q}</h3><div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}" data-r="${right}">${o}</button>`).join("")}</div><p class="fb" data-exp="${exp.replace(/"/g, "&quot;")}"></p></div>`;

      // ===== animated scenes
      const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = (body, cap, extra = "", id = "") =>
        `<figure class="scene${RM ? " paused" : ""}"${id ? ` id="${id}"` : ""}><div class="stage">${body}</div><figcaption><span>${cap}</span>${extra}<button class="sm playbtn" type="button">${RM ? "Play" : "Pause"}</button></figcaption></figure>`;
      const atk = (x0, y0, x1, y1, label, d) =>
        `<g class="atk" style="--x0:${x0}px;--y0:${y0}px;--x1:${x1}px;--y1:${y1}px;animation-delay:${d}s"><circle r="13" class="ff"/><text y="6" text-anchor="middle" class="fs" style="font-size:17px">!</text><text y="-20" text-anchor="middle" class="ff" style="font-size:14px">${label}</text></g>`;
      const S1 = () =>
        scene(
          `<svg viewBox="0 0 600 240" role="img" aria-label="Red attacks fly toward a phone and break against a shield, while a green message gets through">
 <text x="300" y="24" text-anchor="middle" class="fa mono" style="font-size:13px;letter-spacing:.12em">GOOD HABITS = YOUR SHIELD</text>
 <circle cx="300" cy="125" r="85" class="fas pulse"/>
 <circle cx="300" cy="125" r="85" class="fn sa ring" stroke-width="3" stroke-dasharray="8 7"/>
 <g class="msgp"><rect x="-17" y="-12" width="34" height="24" rx="3" class="fg"/><path d="M-17 -12 L0 2 L17 -12" class="fn ss" stroke-width="2"/></g>
 <rect x="276" y="80" width="48" height="90" rx="9" class="fs si"/>
 <rect x="282" y="90" width="36" height="62" rx="3" class="fas"/>
 <path d="M292 121 l6 6 l11 -13" class="fn sa" stroke-width="3" stroke-linecap="round"/>
 <circle cx="300" cy="162" r="3" class="fi"/>
 ${atk(20, 50, 219, 100, "virus", 0)}${atk(580, 50, 381, 100, "hacker", 1)}${atk(30, 225, 219, 152, "phishing", 2)}${atk(570, 225, 381, 152, "scam", 3)}
</svg>`,
          "Good habits work like a shield: attacks break against it, and your normal messages still get through.",
        );

      const lockSvg = (open) =>
        `<svg class="lock" viewBox="0 0 30 34" aria-hidden="true"><path d="${open ? "M8 15 V9 a7 7 0 0 1 14 0 V6" : "M8 15 V10 a7 7 0 0 1 14 0 V15"}" fill="none" stroke="${open ? "var(--flag)" : "var(--good)"}" stroke-width="3" stroke-linecap="round"/><rect x="3" y="15" width="24" height="17" rx="3" fill="${open ? "var(--flag)" : "var(--good)"}"/></svg>`;
      const S2 = () =>
        scene(
          `<div class="bf">
 <div class="robot">🤖 attack program · trying combinations...</div>
 <div class="lane"><div class="lane-h"><span class="lbl">Short password</span><span class="st" id="bfa-st"></span></div><div class="slotrow" id="bfa"></div></div>
 <div class="lane"><div class="lane-h"><span class="lbl">Long passphrase</span><span class="st" id="bfb-st"></span></div><div class="slotrow" id="bfb"></div></div>
</div>`,
          "Attack programs try billions of guesses. A short password falls in seconds; a long passphrase resists for years.",
          "",
          "bf-scene",
        );

      let wave = "M0 44";
      for (let k = 0; k < 7; k++) wave += " q30 -10 60 0 q30 10 60 0";
      wave += " V240 H0 Z";
      const S3 = () =>
        scene(
          `<svg viewBox="0 0 600 240" role="img" aria-label="An email hangs on a fishing line as bait; a fish comes close, sees the hidden hook and swims away">
 <path class="fas wave" d="${wave}"/>
 <g class="bait">
  <line x1="360" y1="-180" x2="360" y2="96" class="si" stroke-width="1.5"/>
  <g class="hook"><path d="M360 132 V156 A10 10 0 0 1 340 156 l-3 -9" class="fn sf" stroke-width="3.5" stroke-linecap="round"/><text x="374" y="166" class="ff" style="font-size:15px">hook = a fake link</text></g>
  <rect x="332" y="96" width="56" height="36" rx="4" class="fs si"/>
  <path d="M332 96 L360 116 L388 96" class="fn si" stroke-width="2"/>
  <text x="398" y="120" class="fi" style="font-size:15px">“You won a prize!”</text>
 </g>
 <g class="fish"><path d="M-26 0 L-50 -17 L-50 17 Z" class="fw"/><ellipse rx="32" ry="19" class="fw"/><path d="M-4 -18 q8 -10 18 -2" class="fn" stroke="var(--warn)" stroke-width="5"/><circle cx="16" cy="-5" r="4.5" class="fs"/><circle cx="17" cy="-5" r="2.2" class="fi"/></g>
 <text x="316" y="116" class="qm fi" style="font-size:28px">?</text>
 <text x="20" y="30" class="fm mono" style="font-size:13px;letter-spacing:.1em">PHISHING = FISHING FOR YOUR DATA</text>
</svg>`,
          "The message is the bait and the fake link is the hook. Be the fish that stops, thinks and swims away.",
        );

      const bug = (x, y) =>
        `<g class="bug" style="--bx:${x}px;--by:${y}px"><path d="M-10 -6 L10 6 M-10 6 L10 -6 M0 -9 V9" class="sf" stroke-width="2"/><ellipse rx="8" ry="6" class="ff"/><circle cx="8" cy="0" r="3.5" class="ff"/></g>`;
      const S4 = () =>
        scene(
          `<svg viewBox="0 0 600 240" role="img" aria-label="A free game gift enters a laptop, bugs come out, and an antivirus scan removes them">
 <rect x="180" y="28" width="240" height="152" rx="10" class="fs si"/>
 <rect x="192" y="40" width="216" height="128" rx="4" class="fas"/>
 <path d="M150 180 H450 L472 204 H128 Z" class="fl si"/>
 <rect x="192" y="40" width="216" height="128" rx="4" class="ffs alert"/>
 <g class="dl"><text x="300" y="96" text-anchor="middle" class="fi" style="font-size:14px">Downloading FREE_GAME.exe…</text><rect x="220" y="108" width="160" height="10" rx="5" class="fs"/><rect x="220" y="108" width="160" height="10" rx="5" class="fa dlbar"/></g>
 <text x="300" y="110" text-anchor="middle" class="ff alert" style="font-size:16px">Malware is stealing your data!</text>
 ${bug(225, 62)}${bug(375, 62)}${bug(212, 130)}${bug(388, 130)}${bug(260, 152)}${bug(340, 152)}
 <rect x="192" y="40" width="8" height="128" class="fg scan"/>
 <g class="okc"><circle cx="300" cy="86" r="22" class="fg"/><path d="M289 86 l8 8 l14 -16" class="fn ss" stroke-width="4" stroke-linecap="round"/><text x="300" y="138" text-anchor="middle" class="fg" style="font-size:15px">Antivirus: 6 threats removed</text></g>
 <g class="gift"><rect x="-28" y="-24" width="56" height="48" rx="4" class="fw si"/><rect x="-5" y="-24" width="10" height="48" class="ff"/><path d="M0 -24 q-16 -16 -20 -4 q4 6 20 4 q16 2 20 -4 q-4 -12 -20 4" class="ff si" stroke-width="1.5"/><text y="44" text-anchor="middle" class="fi" style="font-size:14px">FREE GAME</text></g>
 <text x="20" y="226" class="fm mono" style="font-size:13px;letter-spacing:.1em">TROJAN HORSE → ANTIVIRUS</text>
</svg>`,
          "A Trojan looks like a free gift, but it hides malware inside. An antivirus finds it and removes it.",
        );

      const FEET = [
        [62, 208, 80, "pet's name"],
        [140, 172, 100, "school"],
        [218, 208, 80, "birthday"],
        [296, 172, 100, "street"],
        [374, 208, 80, "on vacation"],
      ];
      const S5 = () =>
        scene(
          `<svg viewBox="0 0 600 240" role="img" aria-label="Footprints appear, each one a post; a magnifying glass follows them and builds a profile of you">
 ${FEET.map(
   (
     [x, y, r, l],
     k,
   ) => `<g class="foot" style="--fx:${x}px;--fy:${y}px;--r:${r}deg;animation-delay:${k * 0.8}s"><ellipse rx="9" ry="15" class="fa"/><circle cx="-5" cy="-19" r="3" class="fa"/><circle cx="0" cy="-21" r="3" class="fa"/><circle cx="5" cy="-19" r="3" class="fa"/></g>
 <g class="ftag" style="animation-delay:${k * 0.8}s"><rect x="${x - 44}" y="${y - 58}" width="88" height="26" rx="13" class="fs sl" stroke-width="1.5"/><text x="${x}" y="${y - 40}" text-anchor="middle" class="fi" style="font-size:13px">${l}</text></g>`,
 ).join("")}
 <g class="mag"><circle r="24" class="fas si" stroke-width="4" fill-opacity=".6"/><path d="M17 17 L36 36" class="si" stroke-width="7" stroke-linecap="round"/></g>
 <g class="pcard"><rect x="440" y="18" width="150" height="204" rx="12" class="fs sf" stroke-width="2"/>
  <text x="454" y="46" class="ff" style="font-size:14px">A stranger knows:</text>
  ${["pet's name", "school", "birthday", "street", "empty house"].map((t, k) => `<text x="454" y="${78 + k * 30}" class="fi" style="font-size:14px">✓ ${t}</text>`).join("")}
 </g>
 <text x="20" y="28" class="fm mono" style="font-size:13px;letter-spacing:.1em">EVERY POST = A FOOTPRINT</text>
</svg>`,
          "Every post leaves a footprint. One alone says little, but together they tell a stranger a lot about you.",
        );

      const pkt = (d) =>
        `<g class="pkt" style="animation-delay:${d}s"><g class="plain"><rect x="-46" y="-13" width="92" height="26" rx="6" class="ffs sf" stroke-width="1.5"/><text y="5" text-anchor="middle" class="ff mono" style="font-size:14px">pass: 1234</text></g><g class="enc"><rect x="-46" y="-13" width="92" height="26" rx="6" class="fa"/><text y="5" text-anchor="middle" class="fs mono" style="font-size:14px">#x9@Qa!</text></g></g>`;
      const S6 = () =>
        scene(
          `<svg viewBox="0 0 600 240" role="img" aria-label="Data travels from a phone through public Wi-Fi to the internet; without VPN a stranger reads it, with VPN it is encrypted">
 <rect x="54" y="98" width="494" height="44" rx="22" class="fas enc" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 5"/>
 <text x="300" y="92" text-anchor="middle" class="fa enc mono" style="font-size:13px;letter-spacing:.1em">VPN TUNNEL</text>
 <rect x="40" y="80" width="46" height="80" rx="8" class="fs si"/><rect x="46" y="90" width="34" height="56" rx="3" class="fas"/>
 <text x="63" y="182" text-anchor="middle" class="fi" style="font-size:14px">you</text>
 <path d="M272 106 L264 80 M328 106 L336 80" class="si" stroke-width="3" stroke-linecap="round"/>
 <path d="M284 74 q16 -14 32 0 M290 82 q10 -8 20 0" class="fn sa" stroke-width="3" stroke-linecap="round"/>
 <rect x="255" y="106" width="90" height="30" rx="6" class="fs si"/>
 <circle cx="272" cy="121" r="3" class="fg"/><circle cx="284" cy="121" r="3" class="fg"/>
 <text x="300" y="158" text-anchor="middle" class="fi" style="font-size:14px">public Wi-Fi</text>
 <path d="M478 142 a22 22 0 0 1 4 -44 a30 30 0 0 1 56 6 a20 20 0 0 1 4 38 Z" class="fs si"/>
 <text x="512" y="130" text-anchor="middle" class="fi" style="font-size:14px">Internet</text>
 <path d="M338 138 L400 190" class="fn sl" stroke-width="2.5" stroke-dasharray="5 5"/>
 <circle cx="412" cy="196" r="12" class="fm"/><path d="M392 236 q20 -34 40 0 Z" class="fm"/>
 <rect x="438" y="186" width="156" height="42" rx="10" class="fs sl" stroke-width="1.5"/>
 <text x="448" y="204" class="fi plain" style="font-size:13px">I can read it:</text><text x="448" y="220" class="ff plain mono" style="font-size:13px">pass: 1234 😈</text>
 <text x="448" y="204" class="fi enc" style="font-size:13px">I can't read it:</text><text x="448" y="220" class="fa enc mono" style="font-size:13px">#x9@Qa! ???</text>
 ${pkt(0)}${pkt(1.5)}${pkt(3)}
</svg>`,
          "On public Wi-Fi, a stranger on the same network can read what you send. A VPN encrypts it inside a tunnel.",
          `<button class="sm" type="button" id="vpn-btn">Turn VPN on</button>`,
          "wifi-scene",
        );
      const SCENES = [S1, S2, S3, S4, S5, S6];

      // brute-force animation (JS driven)
      let bfTimer = null;
      function startBF() {
        clearInterval(bfTimer);
        const A = "messi10",
          B = "Taco-Cloud-Violin-7",
          CS =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-#!@";
        const r = () => CS[Math.floor(Math.random() * CS.length)];
        const fig = document.getElementById("bf-scene");
        const rowA = document.getElementById("bfa"),
          rowB = document.getElementById("bfb");
        rowA.innerHTML =
          A.split("")
            .map(() => `<span class="ch"></span>`)
            .join("") + `<span data-lock></span>`;
        rowB.innerHTML =
          B.split("")
            .map(() => `<span class="ch"></span>`)
            .join("") + `<span data-lock></span>`;
        rowB.querySelector("[data-lock]").innerHTML = lockSvg(false);
        const ca = [...rowA.querySelectorAll(".ch")],
          cb = [...rowB.querySelectorAll(".ch")];
        let t = 0,
          g = 0;
        const tick = () => {
          if (!document.body.contains(fig)) {
            clearInterval(bfTimer);
            return;
          }
          if (fig.classList.contains("paused")) return;
          const c = t % 80;
          const fixed = Math.min(A.length, Math.floor(c / 3));
          ca.forEach((el, k) => {
            if (k < fixed) {
              el.textContent = A[k];
              el.classList.add("fix");
            } else {
              el.textContent = r();
              el.classList.remove("fix");
            }
          });
          const cracked = fixed === A.length;
          rowA.querySelector("[data-lock]").innerHTML = lockSvg(cracked);
          const sa = document.getElementById("bfa-st");
          sa.className = "st " + (cracked ? "bad" : "");
          sa.textContent = cracked
            ? "CRACKED in 0.0002 seconds"
            : `${(c * 48213 + 1).toLocaleString("en")} guesses…`;
          cb.forEach((el) => (el.textContent = r()));
          g += Math.floor(3e8 + Math.random() * 2e8);
          const sb = document.getElementById("bfb-st");
          sb.className = "st good";
          sb.textContent = `${g.toLocaleString("en")} guesses · still safe`;
          t++;
        };
        tick();
        bfTimer = setInterval(tick, RM ? 400 : 70);
      }

      const L = createLessons({ v, words, quiz, reducedMotion: RM });

      let cur = 0;
      const done = new Set();
      let points = 0;
      const scored = new Set();
      const $ = (id) => document.getElementById(id);
      const LESSONS = L.filter((l) => !l.cert && !l.ref).length; // 7
      const LAST = L.findIndex((l) => l.cert) - 1,
        CERT = L.findIndex((l) => l.cert),
        GLOSS = L.findIndex((l) => l.ref);
      function renderRail() {
        $("lessons").innerHTML = L.map(
          (l, i) =>
            `${l.ref ? `<li class="sep">Reference</li>` : ""}<li><button data-i="${i}" class="${done.has(i) ? "done" : ""}" ${i === cur ? 'aria-current="step"' : ""}><span class="n">${l.cert ? "★" : l.ref ? "Az" : i + 1}</span>${l.short}</button></li>`,
        ).join("");
        const n = [...done].filter((i) => !L[i].cert && !L[i].ref).length;
        $("prog").style.width = (n / LESSONS) * 100 + "%";
        $("prog-t").textContent = `${n} of ${LESSONS} lessons completed`;
      }
      function go(i, opts = {}) {
        cur = i;
        const l = L[i];
        const nextBtn =
          l.cert || l.ref
            ? ""
            : `<button class="btn primary" id="next">${i === LAST ? "Finish course →" : "Next lesson →"}</button>`;
        $("panel").innerHTML =
          l.html() +
          `<div class="nav"><button class="btn" id="back" ${i === 0 ? "disabled" : ""}>← Back</button>${nextBtn}</div>`;
        $("back").onclick = () => go(cur - 1);
        if ($("next"))
          $("next").onclick = () => {
            done.add(cur);
            if (cur === LAST) done.add(CERT);
            go(cur + 1);
          };
        clearInterval(bfTimer);
        clearInterval(tlTimer);
        if (i === LAST) bindTimeline();
        if (l.ref) bindGlossary(opts.q || "");
        if (SCENES[i])
          $("panel")
            .querySelector(".lesson-head")
            .insertAdjacentHTML("afterend", SCENES[i]());
        $("panel")
          .querySelectorAll(".playbtn")
          .forEach(
            (b) =>
              (b.onclick = () => {
                const f = b.closest(".scene");
                f.classList.toggle("paused");
                b.textContent = f.classList.contains("paused")
                  ? "Play"
                  : "Pause";
              }),
          );
        if (i === 1) startBF();
        if ($("vpn-btn"))
          $("vpn-btn").onclick = () => {
            const f = $("wifi-scene");
            f.classList.toggle("vpn");
            $("vpn-btn").textContent = f.classList.contains("vpn")
              ? "Turn VPN off"
              : "Turn VPN on";
          };
        if (l.cert) confetti();
        bindQuiz();
        if (i === 1) bindPw();
        if (i === 2) {
          bindFlags();
          bindSms();
        }
        if (i === 4) bindPosts();
        if (i === 5) bindHabits();
        if (l.cert) bindCert();
        renderRail();
        if (window.innerWidth < 820)
          $("panel").scrollIntoView({ block: "start" });
        else window.scrollTo({ top: 0 });
      }
      $("lessons").addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (b) go(+b.dataset.i);
      });
      $("panel").addEventListener("click", (e) => {
        const b = e.target.closest("[data-go]");
        if (b) go(GLOSS, { q: b.dataset.q || "" });
      });
      $("es-t").onchange = (e) =>
        document.body.classList.toggle("es", e.target.checked);
      function bindQuiz() {
        document.querySelectorAll("[data-quiz]").forEach((box) => {
          const fb = box.querySelector(".fb");
          box.querySelectorAll(".opt").forEach(
            (b) =>
              (b.onclick = () => {
                if (box.dataset.answered) return;
                box.dataset.answered = 1;
                const ok = b.dataset.i === b.dataset.r;
                box.querySelectorAll(".opt").forEach((x) => {
                  if (x.dataset.i === x.dataset.r) x.classList.add("right");
                });
                if (!ok) b.classList.add("wrong");
                if (ok && !scored.has(box.dataset.quiz)) {
                  points++;
                  scored.add(box.dataset.quiz);
                }
                fb.className = "fb " + (ok ? "good" : "bad");
                fb.textContent =
                  (ok ? "Correct! " : "Not quite. ") + fb.dataset.exp;
              }),
          );
        });
      }
      // passwords
      function bindPw() {
        const upd = () => {
          const p = $("pw").value;
          const c = [
            [p.length >= 12, "At least 12 characters"],
            [
              /[a-z]/.test(p) && /[A-Z]/.test(p),
              "Uppercase and lowercase letters",
            ],
            [/\d/.test(p), "Numbers"],
            [/[^A-Za-z0-9]/.test(p), "Symbols (like - ! # @)"],
            [
              p.length > 0 && !COMMON.some((w) => p.toLowerCase().includes(w)),
              "No common words or names",
            ],
          ];
          let pool = 0;
          if (/[a-z]/.test(p)) pool += 26;
          if (/[A-Z]/.test(p)) pool += 26;
          if (/\d/.test(p)) pool += 10;
          if (/[^A-Za-z0-9]/.test(p)) pool += 33;
          let bits = p.length * Math.log2(pool || 1);
          if (!c[4][0]) bits = Math.min(bits, 10);
          const secs = Math.pow(2, bits) / 1e10;
          const t =
            secs < 1
              ? "less than a second"
              : secs < 3600
                ? Math.round(secs / 60) + " minutes"
                : secs < 86400 * 365
                  ? Math.round(secs / 86400) + " days"
                  : secs < 3.15e7 * 1e6
                    ? Math.round(secs / 3.15e7).toLocaleString("en") + " years"
                    : "millions of years";
          const lvl = !p
            ? 0
            : bits < 28
              ? 1
              : bits < 45
                ? 2
                : bits < 65
                  ? 3
                  : 4;
          const cols = [
            "var(--line)",
            "var(--flag)",
            "var(--warn)",
            "var(--accent)",
            "var(--good)",
          ];
          const names = [
            "Type a password",
            "Very weak",
            "Weak",
            "Good",
            "Strong",
          ];
          $("meter")
            .querySelectorAll("i")
            .forEach(
              (m, k) =>
                (m.style.background = k < lvl ? cols[lvl] : "var(--line)"),
            );
          $("verdict").style.color = cols[lvl];
          $("verdict").textContent = p
            ? `${names[lvl]}. A computer could crack it in about ${t}.`
            : names[0];
          $("checks").innerHTML = c
            .map(([ok, t]) => `<li class="${ok ? "ok" : ""}">${t}</li>`)
            .join("");
        };
        $("pw").oninput = upd;
        upd();
      }
      // phishing flags
      function bindFlags() {
        const found = new Set();
        const draw = () => {
          $("flag-n").textContent = `${found.size} / 6 found`;
          $("found-list").innerHTML =
            [...found]
              .sort()
              .map((k) => `<li><b>${FLAGS[k][0]}:</b> ${FLAGS[k][1]}</li>`)
              .join("") +
            (found.size === 6
              ? `<li style="list-style:none;margin-left:-1.2em;color:var(--good);font-weight:700">Great job! You found all the red flags.</li>`
              : "");
        };
        document.querySelectorAll(".flag").forEach(
          (f) =>
            (f.onclick = () => {
              found.add(+f.dataset.f);
              f.classList.add("found");
              draw();
            }),
        );
        $("flag-all").onclick = () => {
          document.querySelectorAll(".flag").forEach((f) => {
            found.add(+f.dataset.f);
            f.classList.add("found");
          });
          draw();
        };
        draw();
      }
      function bindSms() {
        let i = 0,
          score = 0;
        const draw = () => {
          if (i >= SMS.length) {
            $("sms-area").innerHTML =
              `<p class="fb ${score >= 4 ? "good" : ""}">You got ${score} of ${SMS.length} right. ${score === 5 ? "You're a scam detector!" : "Review the red flags and try again."}</p><button class="btn" id="sms-r">Try again</button>`;
            $("sms-r").onclick = () => {
              i = 0;
              score = 0;
              draw();
            };
            return;
          }
          const [from, msg] = SMS[i];
          $("sms-area").innerHTML =
            `<span class="pill">Message ${i + 1} of ${SMS.length}</span><div class="sms" style="margin-block:10px"><small>${from}</small>${msg}</div><div class="two"><button class="btn" data-a="1" style="border-color:var(--flag);color:var(--flag)">Scam</button><button class="btn" data-a="0" style="border-color:var(--good);color:var(--good)">Safe</button></div><p class="fb" id="sms-fb" style="margin-top:10px"></p>`;
          $("sms-area")
            .querySelectorAll("[data-a]")
            .forEach(
              (b) =>
                (b.onclick = () => {
                  if ($("sms-fb").textContent) return;
                  const ok = (b.dataset.a === "1") === SMS[i][2];
                  if (ok) score++;
                  $("sms-fb").className = "fb " + (ok ? "good" : "bad");
                  $("sms-fb").textContent =
                    (ok ? "Correct! " : "Not quite. ") + SMS[i][3];
                  const n = document.createElement("button");
                  n.className = "btn primary";
                  n.style.marginTop = "8px";
                  n.textContent =
                    i < SMS.length - 1 ? "Next message →" : "See result";
                  n.onclick = () => {
                    i++;
                    draw();
                  };
                  $("sms-area").appendChild(n);
                }),
            );
        };
        draw();
      }
      function bindPosts() {
        const ans = {};
        const draw = () => {
          $("posts").innerHTML = POSTS.map(
            ([t, ok, why], k) =>
              `<div class="post"><p>${t}</p><div class="act">${k in ans ? `<span class="tagline ${ans[k] === ok ? "good" : "bad"}">${ans[k] === ok ? "Correct" : "Wrong"}</span>` : `<button class="sm" data-k="${k}" data-v="1">OK</button><button class="sm" data-k="${k}" data-v="0">Not OK</button>`}</div>${k in ans ? `<p class="why">${why}</p>` : ""}</div>`,
          ).join("");
          const n = Object.keys(ans).length,
            r = Object.entries(ans).filter(
              ([k, a]) => POSTS[k][1] === a,
            ).length;
          $("post-fb").className = "fb " + (n === POSTS.length ? "good" : "");
          $("post-fb").textContent =
            n === POSTS.length ? `You got ${r} of ${POSTS.length} right.` : "";
          $("posts")
            .querySelectorAll("[data-k]")
            .forEach(
              (b) =>
                (b.onclick = () => {
                  ans[b.dataset.k] = b.dataset.v === "1";
                  draw();
                }),
            );
        };
        draw();
      }
      const habits = new Set();
      function bindHabits() {
        const draw = () => {
          $("habits").innerHTML = HAB.map(
            (h, k) =>
              `<label class="post" style="cursor:pointer"><p>${h}</p><input type="checkbox" data-h="${k}" ${habits.has(k) ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--accent)"></label>`,
          ).join("");
          const n = habits.size;
          $("habit-n").textContent =
            `You have ${n} of ${HAB.length} safe habits. ` +
            (n === 8
              ? "Excellent!"
              : n >= 5
                ? "Good! Choose one more habit to start this week."
                : "Pick two habits from the list and start today.");
          $("habits")
            .querySelectorAll("input")
            .forEach(
              (c) =>
                (c.onchange = () => {
                  c.checked
                    ? habits.add(+c.dataset.h)
                    : habits.delete(+c.dataset.h);
                  draw();
                }),
            );
        };
        draw();
      }
      function bindCert() {
        const set = () => {
          $("cert-name").textContent = $("cname").value.trim() || "Your name";
        };
        $("cname").oninput = set;
        set();
        $("cert-score").textContent =
          `Quick checks answered correctly: ${points} of 5 · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
      }
      // ===== malware timeline (Sophos Threatsaurus, pp. 92–98)
      const Y0 = 1949,
        Y1 = 2013,
        pos = (y) => (((y - Y0) / (Y1 - Y0)) * 100).toFixed(2) + "%";
      const ERA = (y) =>
        y < 1982
          ? ["Era 1 · Experiments", "var(--accent)"]
          : y < 2000
            ? ["Era 2 · Pranks and vandalism", "var(--warn)"]
            : ["Era 3 · Crime for money", "var(--flag)"];
      let tlTimer = null,
        tlI = 0,
        tlShown = Y0;
      function bindTimeline() {
        const tr = $("tl-track");
        tr.innerHTML =
          `<div class="tl-band e1" style="left:0;width:${pos(1981.5)}"></div><div class="tl-band e2" style="left:${pos(1981.5)};width:calc(${pos(1999.5)} - ${pos(1981.5)})"></div><div class="tl-band e3" style="left:${pos(1999.5)};right:0"></div>` +
          [1950, 1960, 1970, 1980, 1990, 2000, 2010]
            .map(
              (y) => `<span class="tl-axis" style="left:${pos(y)}">${y}</span>`,
            )
            .join("") +
          TL.map(
            (e, k) =>
              `<button class="tl-dot" type="button" data-k="${k}" style="left:${pos(e.y)}" aria-label="${e.y}: ${e.t}"></button>`,
          ).join("") +
          `<div class="tl-mark" id="tl-mark"></div>`;
        tr.querySelectorAll(".tl-dot").forEach(
          (d) =>
            (d.onclick = () => {
              show(+d.dataset.k);
              restart();
            }),
        );
        $("tl-prev").onclick = () => {
          show((tlI - 1 + TL.length) % TL.length);
          restart();
        };
        $("tl-next").onclick = () => {
          show((tlI + 1) % TL.length);
          restart();
        };
        const fig = $("tl");
        const restart = () => {
          clearInterval(tlTimer);
          tlTimer = setInterval(() => {
            if (!document.body.contains(fig)) {
              clearInterval(tlTimer);
              return;
            }
            if (fig.classList.contains("paused")) return;
            show((tlI + 1) % TL.length);
          }, 4200);
        };
        tlShown = Y0;
        show(0);
        restart();
      }
      function show(k) {
        tlI = k;
        const e = TL[k];
        const [era, col] = ERA(e.y);
        $("tl-mark").style.left = pos(e.y);
        document
          .querySelectorAll(".tl-dot")
          .forEach((d, j) => d.classList.toggle("on", j === k));
        $("tl-era").textContent = era;
        $("tl-era").style.color = col;
        $("tl-era").style.borderColor = col;
        $("tl-card-wrap").innerHTML =
          `<div class="tl-card" style="border-color:${col}"><span class="tl-tag">${e.tag}</span><h3>${e.y} · ${e.t}</h3><p>${e.d}</p><button class="linkbtn" type="button" data-go="glossary" data-q="${e.g}">Look up “${e.g}” in the A–Z →</button></div>`;
        // count the year up/down
        const from = tlShown,
          to = e.y,
          t0 = performance.now(),
          dur = RM ? 0 : 650;
        const step = (now) => {
          const p = dur ? Math.min(1, (now - t0) / dur) : 1;
          const yr = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
          const el = $("tl-year");
          if (!el) return;
          el.textContent = yr;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        tlShown = to;
      }
let glossaryEntries = [];
      let glossaryStatus = "loading";
      window.addEventListener("cyber-glossary:update", (event) => {
        const entries = event.detail;
        if (!Array.isArray(entries)) return;
        glossaryEntries = entries.map((entry) => ({
          t: entry.term,
          es: entry.translation_es,
          d: entry.definition_en,
          p: entry.sort_order,
          k: entry.category === "Threat" ? "t" : "d",
        }));
        glossaryStatus = "ready";
        if (cur === GLOSS && $("gq")) bindGlossary($("gq").value);
      });
      window.addEventListener("cyber-glossary:unavailable", () => {
        glossaryStatus = "unavailable";
        if (cur === GLOSS && $("gq")) bindGlossary($("gq").value);
      });

      function bindGlossary(q0) {
        let kind = "all";
        const norm = (s) =>
          s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
        const escapeHTML = (s) =>
          String(s).replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char]);
        const gid = (t) => "g-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const draw = () => {
          const q = norm($("gq").value.trim());
          const list = glossaryEntries.filter(
            (g) =>
              (kind === "all" || g.k === kind) &&
              (!q || norm(g.t + " " + g.es + " " + g.d).includes(q)),
          ).sort(
            (a, b) =>
              (q && norm(a.t).startsWith(q) ? 0 : 1) -
                (q && norm(b.t).startsWith(q) ? 0 : 1) ||
              a.t.localeCompare(b.t),
          );
          $("gcount").textContent =
            `${list.length} ${list.length === 1 ? "word" : "words"}` +
            (q ? ` for “${$("gq").value.trim()}”` : "");
          const emptyMessage = glossaryStatus === "loading"
            ? "Loading glossary…"
            : glossaryStatus === "unavailable"
              ? "The glossary is temporarily unavailable. Please try again later."
              : glossaryEntries.length === 0 && !q
                ? "No glossary entries are published yet."
                : "No words found. Try another word, in English or Spanish.";
          $("glist").innerHTML = list.length
            ? list
                .map(
                  (g) =>
                    `<article class="gi${q && norm(g.t).startsWith(q) ? " hit" : ""}" id="${gid(g.t)}"><div class="meta"><span class="kind ${g.k}">${g.k === "t" ? "Threat" : "Security tool"}</span><span class="pg">${Number.isFinite(Number(g.p)) && Number(g.p) > 0 ? `Threatsaurus p. ${Number(g.p)}` : ""}</span></div><h3>${escapeHTML(g.t)}</h3><span class="es">${escapeHTML(g.es)}</span><p>${escapeHTML(g.d)}</p></article>`,
                )
                .join("")
            : `<p class="note">${emptyMessage}</p>`;
          const letters = [...new Set(list.map((g) => g.t[0].toUpperCase()))];
          $("gl").innerHTML = letters
            .map((L) => `<button type="button" data-l="${L}">${L}</button>`)
            .join("");
          $("gl")
            .querySelectorAll("button")
            .forEach(
              (b) =>
                (b.onclick = () => {
                  const el = [...$("glist").children].find(
                    (a) =>
                      a.querySelector("h3").textContent[0].toUpperCase() ===
                      b.dataset.l,
                  );
                  if (el)
                    el.scrollIntoView({
                      behavior: RM ? "auto" : "smooth",
                      block: "start",
                    });
                }),
            );
        };
        $("gq").value = q0;
        $("gq").oninput = draw;
        document.querySelectorAll(".chip2").forEach(
          (c) =>
            (c.onclick = () => {
              kind = c.dataset.k;
              document
                .querySelectorAll(".chip2")
                .forEach((x) => x.setAttribute("aria-pressed", x === c));
              draw();
            }),
        );
        draw();
      }

      function confetti() {
        if (RM) return;
        const cv = document.createElement("canvas");
        cv.setAttribute("aria-hidden", "true");
        cv.style.cssText =
          "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50";
        document.body.appendChild(cv);
        const ctx = cv.getContext("2d"),
          dpr = window.devicePixelRatio || 1;
        const W = (cv.width = innerWidth * dpr),
          H = (cv.height = innerHeight * dpr);
        const cs = getComputedStyle(document.documentElement);
        const cols = ["--accent", "--flag", "--warn", "--good"].map((v) =>
          cs.getPropertyValue(v).trim(),
        );
        const P = Array.from({ length: 160 }, () => ({
          x: Math.random() * W,
          y: -Math.random() * H * 0.6,
          vx: (Math.random() - 0.5) * 3 * dpr,
          vy: (2 + Math.random() * 4) * dpr,
          r: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.3,
          s: (5 + Math.random() * 6) * dpr,
          c: cols[Math.floor(Math.random() * cols.length)],
        }));
        const t0 = performance.now();
        const step = (now) => {
          ctx.clearRect(0, 0, W, H);
          P.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05 * dpr;
            p.r += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r);
            ctx.fillStyle = p.c;
            ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
            ctx.restore();
          });
          if (now - t0 < 4000) requestAnimationFrame(step);
          else cv.remove();
        };
        requestAnimationFrame(step);
      }
      go(0);
