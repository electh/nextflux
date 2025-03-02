# Nextflux

A modern RSS reader client for [Miniflux](https://github.com/miniflux/v2) built with React + Vite.

![preview](images/preview.png)

## ✨ Features

- 🚀 Fast and responsive UI built with HeroUI (Previously NextUI)
- 🌐 Connect to your Miniflux server
- 🔄 Automatic background sync with configurable intervals
- 📱 Mobile-friendly with PWA support
- 🌙 Light/Dark mode with multiple theme options
- 🌍 i18n support (English & Chinese & Turkish & French)
- 👀 Mark as read on scroll
- 🎯 Rich reading experience
    - Custom font settings
    - Image gallery with touch gestures support
    - Podcast support
    - Video player support
- ⌨️ Keyboard shortcuts
- 📊 Feed management
    - OPML import
    - Category organization
    - Feed hiding

## 📸 Screenshot Galleries

<table>
    <tr>
        <td>Podcast
        </td>
        <td>YouTube
        </td>
    </tr>
    <tr>
        <td><img src=images/podcast.png width=600/></td>
        <td><img src=images/youtube.png width=600/></td>
    </tr>
    <tr>
        <td>Code Highlight
        </td>
        <td>Image Gallery
        </td>
    </tr>
    <tr>
        <td><img src=images/code.png width=600/></td>
        <td><img src=images/images.png width=600/></td>
    </tr>
     <tr>
        <td>Feed Management
        </td>
        <td>Settings
        </td>
    </tr>
    <tr>
        <td><img src=images/feed.png width=600/></td>
        <td><img src=images/settings.png width=600/></td>
    </tr>
    <tr>
        <td>Stone theme
        </td>
        <td>Responsive
        </td>
    </tr>
    <tr>
        <td><img src=images/stone.png width=600/></td>
        <td><img src=images/responsive.png width=600/></td>
    </tr>
    <tr>
        <td>Search
        </td>
        <td>Dark Mode
        </td>
    </tr>
    <tr>
        <td><img src=images/search.png width=600/></td>
        <td><img src=images/dark.png width=600/></td>
    </tr>
    <tr>
        <td>Mobile
        </td>
        <td>Windows
        </td>
    </tr>
    <tr>
        <td><img src=images/mobile.png width=600/></td>
        <td><img src=images/windows.png width=600/></td>
    </tr>
</table>

## 🛠️ Tech Stack

- React 18
- Vite
- TailwindCSS
- HeroUI (Previously NextUI)
- i18next
- IndexedDB
- Nanostores
- DayJS

## 🚀 Deployment

### Docker Deployment (standalone)

Run with Docker using the following command:

```bash
docker run -d --name nextflux -p 3000:3000 --restart unless-stopped electh/nextflux:latest
```

You can use the following environment variables to fine-tune your default configuration:

- `NEXTFLUX_DEFAULT_SERVER_URL`
  - Set a default value for the `Server URL` field on the login page. 
  - Defaults to `<empty>`.
- `NEXTFLUX_SINGLE_SERVER_MODE`
  - `true` or `false` to hide or show the `Server URL` field from the login page.
  - Defaults to `false`.

### Cloudflare Pages Deployment (standalone)

1. Fork this repository to your GitHub account
2. Create a new project in Cloudflare Pages
3. Select your forked repository
4. Select Framework preset: `React(Vite)`
5. Set build command: `npm run build`
6. Set build output directory: `dist`
7. Deploy and access through the Cloudflare-assigned domain

### Docker Compose Deployment (with Miniflux)

To deploy with Miniflux, copy [docker compose file](./compose.yml) and replace the passwords, then run:

```bash
docker compose up -d
```

## 📝 Configuration

The app requires a Miniflux server to function. You'll need to provide:

- Server URL
- Username
- Password

## 🌍 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📱 Mobile Support

The app is fully responsive and works well on mobile devices. It can also be installed as a PWA for a native app-like
experience.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Do whatever the heck you want with it—just don’t come crying to me if it messes up your stuff. Just kidding (or not),
but seriously, it’s all yours.

## 📚 FAQ

### 1. My scrollbar looks like shit in Windows—how do I fix this?

If you’re using Microsoft Edge, head over to the `edge://flags` page and enable the `Fluent overlay scrollbars` option.
Chrome might have something similar lurking around.

### 2. Are there any plans to support Fever or Google Reader APIs?

Nope, sorry folks. For now, I’m all in on the Miniflux API—gotta pick my battles.

### 3. Why does it resemble Reeder so much?

Reeder is a fantastic RSS reader. Since my design skills are about as good as a potato's, I took some "inspiration" from
its UI style, slapped it on, and called it a day.

### 4. Any plans to add AI features like article summarization and translation?

There are so many chrome extensions that can do this. I'm not sure if I want to build this into the app. Tell me what you think by opening an issue.

## 🌍 Translation

### Contributor

- 🇹🇷 Turkish: [@TaylanTatli](https://github.com/TaylanTatli)

- 🇫🇷 French: [@quent1-fr](https://github.com/quent1-fr)






