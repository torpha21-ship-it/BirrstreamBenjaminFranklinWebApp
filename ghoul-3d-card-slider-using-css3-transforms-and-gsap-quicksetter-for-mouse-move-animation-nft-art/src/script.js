const cards = document.querySelectorAll(".card");
const next = document.querySelector(".arrow--next");
const prev = document.querySelector(".arrow--prev");
const close = document.querySelector(".close-modal");

const wW = window.innerWidth;
const wH = window.innerHeight;
const pos = { x: wW / 2, y: wH / 2 };
const mouse = { x: pos.x, y: pos.y };
const speed = 0.125;

let aC = 0;
let iAC = 1;
let currentGhoul = 0;

const xSet = gsap.utils.pipe(gsap.quickSetter(cards, "rotateY", "deg"));
const ySet = gsap.utils.pipe(gsap.quickSetter(cards, "rotateX", "deg"));

const moveMouse = (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
};

const setIncommingAttrs = (getter, setter) => {
  const getCardColor = getter.dataset.cardbg;
  const getCardRiser = getter.dataset.riserbg;
  const getGhoulPath = getter.querySelector(".ghoul-path").getAttribute("href");
  const getGhoulLogo = getter.dataset.logo;
  const getGhoulNumber = getter.dataset.number;
  const getGhoulQR = getter.dataset.qr;
  const getGhoulDescription = getter.dataset.description;
  const getGhoulLogoFill = getter.dataset.ghoullogofill;

  const setGhoulPasteHere = setter.querySelector(".card-ghoul-path");
  const setGhoulLogoPasteHere = setter.querySelector(".name");
  const setGhoulDescription = setter.querySelector(".description");
  const setGhoulQR = setter.querySelector(".qr");
  const setGhoulNumber = setter.querySelector(".number");
  const setRiserBG = setter.querySelectorAll(".riser");

  gsap.set(setGhoulLogoPasteHere, { attr: { href: getGhoulLogo } });
  gsap.set(setGhoulNumber, { attr: { href: getGhoulNumber } });
  gsap.set(setGhoulQR, { attr: { href: getGhoulQR } });
  gsap.set(setGhoulPasteHere, { attr: { href: getGhoulPath } });
  gsap.set(setter, {
    background: getCardColor,
    "--ghoul-logo-fill": getGhoulLogoFill
  });
  gsap.set([setRiserBG[0], setRiserBG[1], setRiserBG[2], setRiserBG[3]], {
    background: getCardRiser
  });

  setGhoulDescription.innerHTML = getGhoulDescription;
};

const tiltSetter = () => {
  const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());

  pos.x += (mouse.x - pos.x) * dt;
  pos.y += (mouse.y - pos.y) * dt;

  // if ((aC = 0)) {
  xSet((gsap.utils.normalize(0, wW, pos.x) - 0.5) * 40);
  ySet((gsap.utils.normalize(0, wH, pos.y) - 0.5) * -40);
};

const ghouls = document.querySelectorAll(".ghoul-grid-ghoul");
const prevAnimation = () => {
  unTilt();

  let prevGhoulIndex = currentGhoul - 1;

  if (prevGhoulIndex < 0) {
    prevGhoulIndex = ghouls.length - 1;
  }

  const prevGhoul = ghouls[prevGhoulIndex];

  setIncommingAttrs(prevGhoul, cards[iAC]);

  gsap
    .timeline({
      onComplete: () => {
        tilt();
      }
    })
    .set(cards[iAC], { autoAlpha: 1 })
    .to(
      cards[aC],
      {
        duration: 1,
        rotateY: -360,
        x: "50vw",
        xPercent: 100
      },
      "sync"
    )
    .fromTo(
      cards[iAC],
      {
        rotateY: 360,
        x: "-50vw",
        xPercent: -100
      },
      {
        duration: 1,
        rotateY: -18,
        x: 0,
        xPercent: 0
      },
      "sync"
    );

  aC--;
  iAC--;
  currentGhoul--;

  if (aC < 0) {
    aC = 1;
  }
  if (iAC < 0) {
    iAC = 1;
  }

  if (currentGhoul < 0) {
    currentGhoul = ghouls.length - 1;
  }
};

const nextAnimation = () => {
  unTilt();
  let nextGhoulIndex = currentGhoul + 1;

  if (nextGhoulIndex > ghouls.length - 1) {
    nextGhoulIndex = 0;
  }

  const nextGhoul = ghouls[nextGhoulIndex];

  setIncommingAttrs(nextGhoul, cards[iAC]);

  gsap
    .timeline({
      onComplete: () => {
        tilt();
      }
    })
    .set(cards[iAC], { autoAlpha: 1 })
    .to(
      cards[aC],
      {
        duration: 1,
        rotateY: 360,
        x: "-50vw",
        xPercent: -100
      },
      "sync"
    )
    .fromTo(
      cards[iAC],
      {
        rotateY: -360,
        x: "50vw",
        xPercent: 100
      },
      {
        duration: 1,
        rotateY: 18,
        x: 0,
        xPercent: 0
      },
      "sync"
    );

  aC++;
  iAC++;
  currentGhoul++;

  if (aC > 1) {
    aC = 0;
  }
  if (iAC > 1) {
    iAC = 0;
  }

  if (currentGhoul > ghouls.length - 1) {
    currentGhoul = 0;
  }
};

const tilt = () => {
  next.addEventListener("click", nextAnimation);
  prev.addEventListener("click", prevAnimation);
  window.addEventListener("mousemove", moveMouse);
  gsap.ticker.add(tiltSetter);
};

const unTilt = () => {
  gsap.ticker.remove(tiltSetter);
  window.removeEventListener("mousemove", moveMouse);
  next.removeEventListener("click", nextAnimation);
  prev.removeEventListener("click", prevAnimation);
};

const closeModal = () => {
  unTilt();
  close.removeEventListener("click", closeModal);

  gsap
    .timeline()
    .to(cards[aC], {
      y: "50vh",
      yPercent: 50,
      ease: "back.in"
    })
    .to(".modal", { autoAlpha: 0 })
    .set(cards[aC], { rotationY: 0 });
};

const openModel = (e, i) => {
  currentGhoul = i;

  gsap.set(".modal", { autoAlpha: 1 });
  close.addEventListener("click", closeModal);
  gsap.fromTo(
    ".modal",
    { backgroundColor: "rgba(255, 255, 255, 0)" },
    { backgroundColor: "rgba(255, 255, 255, 0.9)" }
  );

  gsap.set(cards[aC], { autoAlpha: 1 });

  const clickedGhoul = ghouls[i];

  setIncommingAttrs(clickedGhoul, cards[aC]);

  gsap
    .timeline({ onComplete: tilt })
    .set(cards[aC], { rotationY: 180 })
    .fromTo(
      cards[aC],
      {
        y: "50vh",
        yPercent: 50,
        rotateX: -130
      },
      {
        y: 0,
        yPercent: 0,
        rotateX: 0,
        ease: "back",
        duration: 1
      }
    )
    .to(
      cards[aC],
      { rotationY: 740, duration: 1.25, ease: "sine.inOut" },
      "-=0.5"
    )
    .set(cards[aC], { rotationY: 20 })
    .to(cards[aC], { rotationY: 0, duration: 0.5, ease: "sine.inOut" });
};

ghouls.forEach((ghoul, i) => {
  ghoul.onclick = (e) => {
    openModel(e, i);
  };
});
