[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=vynex-self)](https://vynex-self.vercel.app)

# Vynex | The Modern Video & Streaming Platform
##### Created : 17/11/2025

A YouTube-style app built with React. Search, browse trending and music videos, save stuff to your library, and watch with related recommendations — all powered by the YouTube API.

### Preview

![Vynex Preview](./public/Preview.png)

## Tech Stack

<div align="center">
  <img alt="HTML5" title="HTML5" width="45px" src="https://raw.githubusercontent.com/github/explore/master/topics/html/html.png" />
  <img alt="CSS3" title="CSS3" width="45px" src="https://raw.githubusercontent.com/github/explore/master/topics/css/css.png" />
  <img alt="JavaScript" title="JavaScript" width="45px" src="https://raw.githubusercontent.com/github/explore/master/topics/javascript/javascript.png" />
  <img alt="React" title="React" width="45px" src="https://raw.githubusercontent.com/github/explore/master/topics/react/react.png" />
  <img alt="Node.js" title="Node.js" width="45px" src="https://raw.githubusercontent.com/github/explore/master/topics/nodejs/nodejs.png" />
</div>

## Features

- Search and channel pages
- Trending home feed and music section
- Video player with related videos
- Library saved in localStorage
- Responsive layout

## Getting started

```bash
git clone https://github.com/beoipisilon/vynex.git
cd vynex
npm install
```

Create a `.env` in the project root:

```
REACT_APP_YT_API=your_youtube_api_key
```

Then:

```bash
npm start
```

For Vercel, set `YT_API_KEY` (or `REACT_APP_YT_API`) in the project environment variables.
