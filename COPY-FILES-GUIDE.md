# 📁 File Copy Guide - Time Tracker Cloud

## Quick Copy Commands

After cloning your `time-tracker-cloud` repository, copy these files:

### 1. Root Directory Files
```bash
# Copy these to the root of time-tracker-cloud/
cp package.json /path/to/time-tracker-cloud/
cp next.config.js /path/to/time-tracker-cloud/
cp tailwind.config.js /path/to/time-tracker-cloud/
cp database-schema.sql /path/to/time-tracker-cloud/
cp .env.local.example /path/to/time-tracker-cloud/
```

### 2. Create Folder Structure and Copy Files
```bash
cd /path/to/time-tracker-cloud/

# Create directories
mkdir -p lib pages components styles public

# Copy library files
cp /path/to/current/lib-supabase.js lib/supabase.js

# Copy page files  
cp /path/to/current/pages-_app.js pages/_app.js
cp /path/to/current/pages-index.js pages/index.js

# Copy component files
cp /path/to/current/components-Auth.js components/Auth.js

# Copy styles
cp /path/to/current/styles-globals.css styles/globals.css

# Copy documentation
cp /path/to/current/SETUP-INSTRUCTIONS.md .
cp /path/to/current/DEPLOYMENT-CHECKLIST.md .
```

### 3. Manual File List (if copying manually)

**Root Files:**
- ✅ `package.json`
- ✅ `next.config.js` 
- ✅ `tailwind.config.js`
- ✅ `database-schema.sql`
- ✅ `.env.local.example` → rename to `.env.local`

**lib/supabase.js:** 
- Copy from `lib-supabase.js`

**pages/_app.js:**
- Copy from `pages-_app.js`

**pages/index.js:**
- Copy from `pages-index.js`

**components/Auth.js:**
- Copy from `components-Auth.js`

**styles/globals.css:**
- Copy from `styles-globals.css`

## 4. Final Structure Check

Your `time-tracker-cloud` should look like:
```
time-tracker-cloud/
├── README.md                    (from GitHub)
├── .gitignore                   (from GitHub)
├── package.json                 ✅ COPIED
├── next.config.js               ✅ COPIED  
├── tailwind.config.js           ✅ COPIED
├── database-schema.sql          ✅ COPIED
├── .env.local                   ✅ COPIED (and filled in)
├── lib/
│   └── supabase.js             ✅ COPIED
├── pages/
│   ├── _app.js                 ✅ COPIED
│   └── index.js                ✅ COPIED
├── components/
│   └── Auth.js                 ✅ COPIED
├── styles/
│   └── globals.css             ✅ COPIED
└── public/                     (empty for now)
```

## 5. Next Steps

After copying all files:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase** (follow DEPLOYMENT-CHECKLIST.md)

3. **Configure environment variables** in `.env.local`

4. **Test locally:**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel** when ready

## ✅ Success Indicators

- [ ] All files copied successfully
- [ ] `npm install` runs without errors  
- [ ] `npm run dev` starts the development server
- [ ] Can access http://localhost:3000
- [ ] See the authentication page

Ready to build your cloud time tracker! 🚀