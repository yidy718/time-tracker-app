# 🚀 Time Tracker Cloud - Deployment Checklist

## Step 1: Copy Files to Your Repository

Copy these files from the current directory to your `time-tracker-cloud` repository:

### 📁 Root Files
```bash
# Copy to root directory
package.json
next.config.js
tailwind.config.js
.env.local.example → .env.local (and fill in your values)
database-schema.sql
```

### 📁 Folder Structure to Create
```bash
# Create these folders and copy files:
lib/
  └── supabase.js (copy from lib-supabase.js)

pages/
  └── _app.js (copy from pages-_app.js)

styles/
  └── globals.css (copy from styles-globals.css)

components/  (create empty for now)
public/     (create empty for now)
```

## Step 2: Set Up Supabase Database

### A) Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and name: `time-tracker-cloud`
4. Choose a strong password
5. Choose region closest to you
6. Wait 2-3 minutes for setup

### B) Run Database Schema
1. Go to Supabase Dashboard
2. Click "SQL Editor" in sidebar
3. Copy entire content from `database-schema.sql`
4. Paste and click "RUN"
5. Verify all tables created (should see green success message)

### C) Get Your API Keys
1. Go to Project Settings → API
2. Copy these values:
   - Project URL
   - `anon` public key

### D) Configure Environment
1. Rename `.env.local.example` to `.env.local`
2. Fill in your values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Install and Test Locally

```bash
cd time-tracker-cloud
npm install
npm run dev
```

Visit http://localhost:3000 - you should see the app!

## Step 4: Deploy to Vercel

### A) Connect GitHub
1. Go to https://vercel.com
2. Import your `time-tracker-cloud` repository
3. Vercel will detect Next.js automatically

### B) Add Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add your Supabase variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### C) Deploy
- Click "Deploy"
- Your app will be live at `your-project.vercel.app`

## Step 5: Create First Admin User

1. Visit your deployed app
2. Sign up with your email
3. Check Supabase Dashboard → Authentication → Users
4. Manually set role to 'admin' in Database → employees table

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Local development working
- [ ] Deployed to Vercel
- [ ] First admin user created
- [ ] Can sign in/out successfully

## 🔧 Troubleshooting

### Common Issues:

**"Missing Supabase environment variables"**
- Check .env.local file exists and has correct values
- Restart dev server after adding environment variables

**Database connection errors**
- Verify Supabase URL and key are correct
- Check if database schema was run successfully

**Build failures on Vercel**
- Make sure all files are pushed to GitHub
- Check environment variables are set in Vercel dashboard

**Authentication not working**
- Check Supabase Authentication settings
- Verify RLS policies are enabled

## 📞 Next Steps After Deployment

1. **Create sample data**: Add locations and test employees
2. **Customize branding**: Update colors and company name
3. **Add features**: Build admin dashboard and reporting
4. **Monitor usage**: Check Supabase dashboard for activity

Need help? Check the setup instructions or create an issue on GitHub!