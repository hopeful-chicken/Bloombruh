# Deploying to Vercel — a plain-English guide for Adam

This project is built with Next.js, and Vercel (the company that makes
Next.js) has a free tier that's basically built for exactly this kind of
project. You don't need to touch a server or pay for anything.

**Claude has not deployed this for you.** This step is deliberately left for
you to do yourself, both so you have an account you control and so you get a
feel for the process — it only takes about 10 minutes.

## 1. Push this project to GitHub

If it isn't already on GitHub:

1. Go to [github.com/new](https://github.com/new) and create a new repository
   (public or private, doesn't matter).
2. Follow GitHub's instructions under "…or push an existing repository from
   the command line" — it'll be a couple of `git remote add` / `git push`
   commands, using the exact URL GitHub gives you.

## 2. Create a Vercel account

1. Go to [vercel.com/signup](https://vercel.com/signup).
2. Sign up **using your GitHub account** (there's a "Continue with GitHub"
   button) — this is the easiest option because it lets Vercel see your
   repositories without you having to copy-paste anything.

## 3. Import the project

1. On your Vercel dashboard, click **"Add New…" → "Project"**.
2. Find this repository in the list and click **Import**.
3. Vercel will auto-detect it's a Next.js app. You shouldn't need to change
   any settings — leave the build command, output directory, etc. on their
   defaults.
4. Click **Deploy**.

That's it. Vercel will run `npm run build` on their servers and, if it
succeeds (it should — this was checked before every commit), give you a live
URL like `bloombruh.vercel.app`.

## 4. Every future push deploys automatically

Once connected, Vercel watches your GitHub repo. Every time you (or Claude,
on your instruction) push a commit to the `main` branch, Vercel automatically
rebuilds and redeploys the live site. You don't need to repeat any of the
steps above.

## 5. Optional: a custom domain

If you want something nicer than `*.vercel.app` (e.g. your own name), Vercel
has a "Domains" tab in the project settings where you can add one you've
bought elsewhere (Namecheap, Google Domains, etc.) and follow their DNS
instructions. Not necessary to get started — skip this for now.

## Things to double check once it's live

- The MOCK DATA banner still shows (it should, until real NBIM data is
  swapped in — see `/scripts/README.md`).
- The placeholder LinkedIn/GitHub links (footer, landing page "About"
  section) still say "Adam to swap these" — replace with your real profile
  URLs before sharing the link widely.
