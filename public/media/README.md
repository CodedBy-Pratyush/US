# Your personal media goes here ❤️

Drop your real files into this folder (`public/media/`) with these names:

| File | What it is |
|---|---|
| `our-song.mp3` | Your background song (plays through the whole journey) |
| `our-video.mp4` | Your personal video for the big screen on the final wall |
| `photo-01.jpg` … `photo-11.jpg` | Your photographs for the left & right memory walls (11 photos) |

Notes:

- These exact filenames are the defaults in `src/config/anniversary.js`.
  If your files have different names, either rename them to match, or
  edit the paths in that config file — whichever is easier.
- Photos: JPG or PNG work. Portrait photos suit the tall frames,
  landscape photos the wide frames (set `aspect` per photo in the config).
- Video: MP4 (H.264) plays in every browser. Keep it under ~50 MB if you can.
- Song: MP3 works everywhere.
- Until a file is added, the site shows an elegant placeholder telling
  you exactly which file is missing — nothing crashes.
- Do NOT put these files anywhere else. Files in `public/` are served
  at the root, so `public/media/photo-01.jpg` is `/media/photo-01.jpg`.
