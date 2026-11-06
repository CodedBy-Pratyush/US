// ============================================================
//  ✏️  EDIT EVERYTHING PERSONAL HERE — this is the ONLY file
//  you need to touch to personalise the experience.
//
//  Media files live in:  public/media/
//  Put your photos, song and video there with the filenames
//  below, OR change the paths below to match your filenames.
//  Paths starting with "/" are relative to the public/ folder.
// ============================================================

export const anniversaryConfig = {
  recipient: 'Sonai',
  anniversaryDate: '7.11.2024',
  anniversaryDateLong: '7 November 2024',

  // Scene A — opening
  openingTitle: 'A Little World Made Just for You',
  openingSubtitle: 'Two years of memories. A million reasons to love you.',
  openingInstruction: 'Cut the ribbon to begin our story.',

  // Scene B — welcome
  welcomeTitle: 'Welcome to Our Journey',
  welcomeSubtitle: 'Two Years of Us ❤️',
  welcomeMessage:
    'Somehow, every little moment became a memory I never want to lose.',
  enterButtonText: 'Enter Our Little World',

  // Final wall
  anniversaryTitle: 'Happy 2 Year Anniversary ♥️🧿',
  personalMessage: 'Love you Sonai ❤️🧿',

  // Proposal
  ringTeaserLine1: "There's one more little surprise...",
  ringTeaserLine2: 'Something I want to ask you...',
  ringPrompt: 'Discover the surprise',
  proposalQuestion: 'Will you marry me? ❤️',
  proposalYesButton: 'Yes ❤️',
  proposalNoButton: 'No 🙈',
  proposalYesMessage: 'Forever starts with us. ❤️🧿',
  proposalYesSubMessage: 'One love. One journey. A thousand tomorrows.',
  proposalNoMessage: "Okay, I'll keep loving you anyway. ❤️",

  // Media (files go in public/media/)
  // BACKGROUND SONG: drop your song at public/media/our-song.mp3 or change
  // this path. It is separate from the video (the video autoplays muted
  // on its own). Leave '' to disable music entirely.
  music: '/media/our-song.mp3',
  video: '/media/our-video.mp4',

  // Optional sound effects — leave as '' to disable. No files are
  // bundled, so only set these if you add your own files.
  sounds: {
    ribbonCut: '',
    celebration: ''
  },

  // Photos for the left & right memory walls.
  // They are placed alternately: photo 1 left, photo 2 right, etc.
  // Add or remove entries freely — the room rebuilds itself.
  // aspect: 'portrait' | 'landscape' — controls the frame shape.
  memories: [
    {
      image: '/media/photo-01.jpg',
      caption: 'The Beginning of Us',
      note: 'Replace this with your real memory.',
      aspect: 'portrait'
    },
    {
      image: '/media/photo-02.jpg',
      caption: 'My Favorite Person',
      note: 'Replace this with your real memory.',
      aspect: 'landscape'
    },
    {
      image: '/media/photo-03.jpg',
      caption: 'The Little Things',
      note: 'Replace this with your real memory.',
      aspect: 'portrait'
    },
    {
      image: '/media/photo-04.jpg',
      caption: 'My Favorite Memory',
      note: 'Replace this with your real memory.',
      aspect: 'landscape'
    },
    {
      image: '/media/photo-05.jpg',
      caption: 'Every Moment With You',
      note: 'Replace this with your real memory.',
      aspect: 'portrait'
    },
    {
      image: '/media/photo-06.jpg',
      caption: 'Our Kind of Happiness',
      note: 'Replace this with your real memory.',
      aspect: 'landscape'
    },
    {
      image: '/media/photo-07.jpg',
      caption: 'That Smile of Yours',
      note: 'Replace this with your real memory.',
      aspect: 'portrait'
    },
    {
      image: '/media/photo-08.jpg',
      caption: 'Us, Always',
      note: 'Replace this with your real memory.',
      aspect: 'landscape'
    },
    {
      image: '/media/photo-09.jpg',
      caption: 'My Happy Place',
      note: 'Replace this with your real memory.',
      aspect: 'portrait'
    },
    {
      image: '/media/photo-10.jpg',
      caption: 'Adventures With You',
      note: 'Replace this with your real memory.',
      aspect: 'landscape'
    },
    {
      image: '/media/photo-11.jpg',
      caption: 'Two Years of Us',
      note: 'Replace this with your real memory.',
      aspect: 'portrait'
    }
  ],

  // The couple in the room — Babai waits for Sonai, holding her hand.
  // They cut the cake together when she taps the cake, and Babai goes
  // down on one knee when she taps the ring.
  characters: {
    babaiName: 'Babai❤️',
    sonaiName: 'Sonai❤️',
    coupleTitle: 'Babai❤️  &  Sonai❤️',
    cakePrompt: "Let's cut our anniversary cake 🎂",
    cakeCutMessage: 'Babai❤️ & Sonai❤️ cut the cake together! 🎂',
    cakeCutSubMessage: 'Make a wish together. ✨',
    cakeDoneMessage: 'Our sweetest memories deserve the sweetest celebration. ❤️',
    continueButton: 'Continue Our Journey',
    ringPromptTeaser: 'One last surprise awaits you... ❤️',
    ringMessage: 'Sonai, you are my favorite part of every day.',
    finalRevealTitle: 'She said YES ❤️🧿'
  },

  // Love notes placed between the photographs on both walls.
  quotes: [
    'You make ordinary days feel extraordinary.',
    'My favorite place will always be beside you.',
    'With you, even silence feels beautiful.',
    'You are my favorite part of every day.',
    'Two years down, a lifetime to go.',
    "If I could choose again, I'd still choose you.",
    'Every road feels right when it leads to you.',
    'You turned little moments into my favorite memories.'
  ]
}
