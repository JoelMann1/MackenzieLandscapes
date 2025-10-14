
# Mackenzie Landscapes â€” static site starter

Test change: This line was added to verify repository updates.

A clean, modern, **HTML + CSS + JavaScript** template for a small landscaping business. Itâ€™s built to host on **GitHub Pages** with optional **custom domain**, and uses an external service (Formspree) to handle the contact form.

---

## 1) Open in VS Code and run locally
1. Unzip the project.
2. Open the folder in **Visual Studio Code** (`File â†’ Open Folder...`).  
3. Install the â€œLive Serverâ€ extension (optional) to preview, or just open `index.html` in your browser.

> Tip: You already have great design instincts â€” all the copy, images, and colours are in one place: `assets/css/styles.css` and the four `.html` files.

---

## 2) Put it on GitHub
**No need for a new GitHub account.** Use an existing one unless you want a separate profile for your friend.

**GUI (quickest):**
1. In VS Code, open the **Source Control** panel. Click **â€œPublish to GitHubâ€** and follow the prompts to create a new repo.  
2. Commit your changes and **Push**.

**CLI (optional):**
```bash
git init
git add -A
git commit -m "Initial site"
gh repo create mackenzie-landscapes-site --public --source=. --remote=origin --push
```

**Docs:** Working with GitHub in VS Code and basic Git help are here:  
- VS Code Ã— Git intro: https://code.visualstudio.com/docs/sourcecontrol/intro-to-git  
- Working with GitHub in VS Code: https://code.visualstudio.com/docs/sourcecontrol/github

---

## 3) Turn on GitHub Pages (hosting)
1. On GitHub, go to your new repo â†’ **Settings â†’ Pages**.  
2. Under **Build and deployment â†’ Source**, choose **â€œDeploy from a branchâ€**.  
3. Set **Branch** to `main` and folder to `/ (root)`. Save.  
4. After a minute, GitHub will give you a public URL like `https://<username>.github.io/<repo>/`.

**Docs:** https://docs.github.com/pages

---

## 4) Use your own domain (optional but recommended)
1. Buy a domain from a registrar (Cloudflare Registrar, Namecheap, Porkbun are all solid).  
2. In your repository, go to **Settings â†’ Pages â†’ Custom domain** and enter your domain (e.g., `mackenzie-landscapes.co.uk`). This writes a `CNAME` entry for you.
3. At your registrar, create **DNS** records:

- **Apex/root** (`example.co.uk`): A/AAAA records to GitHub Pages  
  - A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`  
  - AAAA: `2606:50c0:8000::153`, `::8001::153`, `::8002::153`, `::8003::153`
- **www**: CNAME to `<your-username>.github.io`

Cloudflare users can set an **ALIAS/ANAME** for the apex instead of A/AAAA.

> It can take up to a day for DNS to update. Make sure **â€œEnforce HTTPSâ€** is checked in the Pages section once it resolves.

Docs: GitHubâ€™s custom domain guide.

---

## 5) Make the contact form work
This starter points the form to **Formspree**. Replace the placeholder in `contact.html`:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Then create a free Formspree form to get your **form ID** and verify your email. Their guide: https://help.formspree.io/

> Alternatives: Netlify Forms, Basin, Getform, Formspark, Google Forms. On GitHub Pages youâ€™ll need a thirdâ€‘party form service or a serverless function.

---

## 6) Swap the images & copy quickly
- All images are hotâ€‘linked from **Unsplash** and can be replaced with your own or other Unsplash URLs.
- Colours and spacing live in `assets/css/styles.css` under the `:root` CSS variables.
- Navigation labels and links are in each `.html` file. JS autoâ€‘highlights the current page.

---

## 7) Costs (ballpark)
- **Hosting on GitHub Pages:** $0 (free)  
- **Domain:** typically **US$10â€“25/year** for common TLDs like .com, .co.uk or .nz. Exact price varies by registrar and TLD.  
- **Form handling:** Formspree has a free tier (low volume) with paid tiers if needed.  
- **Optional hosts:** Vercel / Netlify have generous free tiers for static sites.

Check your registrar for exact domain pricing and renewals.

---

## 8) UK (friend) vs NZ (you): what to consider
- **Domain choice:** If the business is UKâ€‘focused, prefer `.co.uk` or `.uk`. NZâ€‘focused: `.co.nz` or `.nz`. A `.com` works globally.
- **Privacy:** If the site collects personal data (the contact form does), add a brief **privacy notice** and link near the form that states what you collect and why, and how to contact you. See ICO guidance.
- **Time zone & contact:** Show local business hours and a UK phone number if serving the UK.

---

## 9) Use AI to go faster (you already have the right tools)
- **ChatGPT 5 Pro:** generate page copy, meta tags, alt text, and â€œvoiceâ€ options. Paste your HTML and ask for improvements.  
- **GitHub Copilot (in VS Code):** inline suggestions and Copilot Chat for edits (â€œConvert this section to a 3â€‘column gridâ€, â€œAdd darkâ€‘modeâ€) and even small refactors.  
- **Image help:** swap Unsplash links or use an image model to generate hero images, then export and add to `assets/img/`.

---

## 10) Where to edit
- Structure: `index.html`, `about.html`, `pricing.html`, `contact.html`
- Styles: `assets/css/styles.css`
- Interactions: `assets/js/main.js`

Happy shipping!



