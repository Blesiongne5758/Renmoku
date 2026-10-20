# 🚀 Deployment Guide - InfinityFree + Supabase + Cloudinary

Panduan lengkap untuk deploy aplikasi Renmoku menggunakan stack gratis:
- **Frontend**: InfinityFree (static hosting)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **File Storage**: Cloudinary (image/video optimization)

---

## 📋 Prerequisites

### 1. Accounts Required
- ✅ [InfinityFree](https://www.infinityfree.net/) - Free web hosting
- ✅ [Supabase](https://supabase.com/) - Free database & auth
- ✅ [Cloudinary](https://cloudinary.com/) - Free media storage
- ✅ [GitHub](https://github.com/) - Code repository (optional)

### 2. Tools Required
- ✅ Node.js 18+
- ✅ npm or yarn
- ✅ Git
- ✅ FTP Client (FileZilla) or InfinityFree File Manager

---

## 🗄️ Step 1: Setup Supabase

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `renmoku`
   - **Database Password**: (save this securely!)
   - **Region**: Singapore (ap-southeast-1)
   - **Pricing Plan**: Free
4. Click "Create new project"
5. Wait for project to be ready (~2 minutes)

### 1.2 Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep secret!)

### 1.3 Setup Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New query"
3. Copy contents from `supabase/schema.sql`
4. Paste and click "Run"
5. Verify tables are created in **Table Editor**

### 1.4 Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Site URL**: `https://your-domain.infinityfreeapp.com`
5. Set **Redirect URLs**: 
   - `https://your-domain.infinityfreeapp.com/auth/callback`
   - `http://localhost:5173/auth/callback` (for development)

### 1.5 Setup Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   - **renmoku-public** (public access)
     - Policy: Allow public read
   - **renmoku-private** (private access)
     - Policy: Allow authenticated users only

### 1.6 Get Environment Variables

Save these for later:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🖼️ Step 2: Setup Cloudinary

### 2.1 Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Verify email

### 2.2 Get Credentials

1. Go to **Dashboard**
2. Copy these values:
   - **Cloud Name**: `your-cloud-name`
   - **API Key**: `123456789012345`
   - **API Secret**: `your-api-secret` (keep secret!)

### 2.3 Create Upload Preset

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click "Add upload preset"
4. Configure:
   - **Preset name**: `renmoku_preset`
   - **Signing Mode**: Unsigned
   - **Folder**: `renmoku`
5. Click "Save"

### 2.4 Get Environment Variables

Save these for later:
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_UPLOAD_PRESET=renmoku_preset
```

---

## 🌐 Step 3: Setup InfinityFree

### 3.1 Create Hosting Account

1. Go to [InfinityFree](https://www.infinityfree.net/)
2. Click "Free Account"
3. Choose subdomain:
   - `renmoku.infinityfreeapp.com` OR
   - `yourname.infinityfreeapp.com`
4. Fill in account details
5. Verify email
6. Wait for account activation (~5 minutes)

### 3.2 Get FTP Credentials

1. Login to **Control Panel**
2. Go to **Account Details** → **FTP Details**
3. Copy these values:
   - **FTP Host**: `ftpupload.net` or `epizy.com`
   - **FTP Username**: `epiz_XXXXXXX`
   - **FTP Password**: (from email)
   - **FTP Port**: `21`

### 3.3 Note Document Root

- **htdocs path**: `/htdocs/`
- This is where you'll upload your built files

---

## 🔧 Step 4: Configure Frontend

### 4.1 Create .env File

```bash
cd renmoku
cp .env.example .env
```

### 4.2 Fill Environment Variables

Edit `.env`:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=123456789012345
VITE_CLOUDINARY_UPLOAD_PRESET=renmoku_preset

# App URL
VITE_APP_URL=https://renmoku.infinityfreeapp.com

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_I18N=true
VITE_ENABLE_ANALYTICS=false
```

### 4.3 Update Vite Config

Edit `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Important for InfinityFree
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
});
```

### 4.4 Build for Production

```bash
npm run build
```

This creates `dist/` folder with optimized files.

---

## 📤 Step 5: Deploy to InfinityFree

### Method 1: FTP Upload (Recommended)

#### 5.1 Using FileZilla

1. Download [FileZilla](https://filezilla-project.org/)
2. Open FileZilla
3. Enter FTP credentials:
   - **Host**: `ftpupload.net` (from InfinityFree)
   - **Username**: `epiz_XXXXXXX`
   - **Password**: (from email)
   - **Port**: `21`
4. Click "Quickconnect"
5. Navigate to `/htdocs/` on remote server
6. Drag all files from `dist/` folder to `/htdocs/`
7. Wait for upload to complete

#### 5.2 Using InfinityFree File Manager

1. Login to InfinityFree Control Panel
2. Go to **File Manager**
3. Navigate to `htdocs/`
4. Click "Upload"
5. Upload all files from `dist/` folder
6. Wait for upload to complete

### Method 2: Git Deployment (Advanced)

If you have GitHub integration:

1. Push code to GitHub
2. Connect InfinityFree to GitHub (if available)
3. Auto-deploy on push

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Website

1. Open browser
2. Go to `https://renmoku.infinityfreeapp.com`
3. Verify:
   - ✅ Homepage loads
   - ✅ Images display correctly
   - ✅ Navigation works
   - ✅ Login/Register works

### 6.2 Test Authentication

1. Click "Login"
2. Try demo credentials:
   - Email: `renter@renmoku.id`
   - Password: `demo123`
3. Verify login works

### 6.3 Test Database Connection

1. Open browser console (F12)
2. Check for Supabase connection errors
3. Verify data loads from database

### 6.4 Test File Upload

1. Go to vehicle management
2. Try uploading an image
3. Verify image appears in Cloudinary
4. Verify image displays correctly

---

## 🔍 Step 7: Troubleshooting

### Issue: Website shows 404

**Solution:**
- Check if `index.html` is in `/htdocs/`
- Verify file structure is correct
- Check `.htaccess` file exists

### Issue: Images not loading

**Solution:**
- Check Cloudinary credentials in `.env`
- Verify upload preset is correct
- Check browser console for errors

### Issue: Database connection failed

**Solution:**
- Verify Supabase URL and key in `.env`
- Check Supabase project is active
- Verify RLS policies are configured

### Issue: Login not working

**Solution:**
- Check Supabase Auth is enabled
- Verify redirect URLs are correct
- Check browser console for errors

### Issue: CSS/JS not loading

**Solution:**
- Check `base` in `vite.config.js` is `/`
- Verify build was successful
- Check file paths in `dist/` folder

---

## 🔒 Step 8: Security Checklist

### Supabase Security
- [ ] Enable RLS on all tables
- [ ] Use strong database password
- [ ] Rotate API keys regularly
- [ ] Enable 2FA on Supabase account

### Cloudinary Security
- [ ] Use unsigned upload preset for public uploads
- [ ] Use signed uploads for private files
- [ ] Set upload transformations
- [ ] Enable suspicious activity tracking

### InfinityFree Security
- [ ] Use strong FTP password
- [ ] Enable .htaccess protection
- [ ] Regular backups
- [ ] Monitor for suspicious activity

### Frontend Security
- [ ] Never expose service_role key
- [ ] Use environment variables
- [ ] Validate all user inputs
- [ ] Implement CSRF protection

---

## 📊 Step 9: Monitoring

### Supabase Monitoring
1. Go to **Reports** in Supabase Dashboard
2. Monitor:
   - Database connections
   - API requests
   - Auth events
   - Storage usage

### Cloudinary Monitoring
1. Go to **Dashboard** in Cloudinary
2. Monitor:
   - Storage usage
   - Bandwidth usage
   - Transformations
   - Uploads/downloads

### InfinityFree Monitoring
1. Go to **Statistics** in Control Panel
2. Monitor:
   - Bandwidth usage
   - Disk space
   - Visitor statistics
   - Error logs

---

## 🚀 Step 10: Optimization

### Frontend Optimization
```bash
# Analyze bundle size
npm run build -- --report

# Enable compression
# Already done by Vite

# Optimize images
# Use Cloudinary transformations
```

### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_vehicles_owner_id ON vehicles(owner_id);

-- Use views for complex queries
CREATE VIEW active_bookings AS
SELECT * FROM bookings WHERE status = 'ACTIVE';
```

### Cloudinary Optimization
```javascript
// Use automatic format selection
cloudinary.url('image.jpg', {
  format: 'auto',
  quality: 'auto',
  width: 800,
  crop: 'fill'
});
```

---

## 🔄 Updating Deployment

### Update Frontend
```bash
# Make changes
npm run dev

# Test locally
npm run build

# Upload to InfinityFree
# Use FTP to replace files in /htdocs/
```

### Update Database Schema
```bash
# Edit supabase/schema.sql
# Run in Supabase SQL Editor
# Verify changes
```

### Update Cloudinary Settings
```bash
# Go to Cloudinary Dashboard
# Update upload presets
# Update transformations
```

---

## 📚 Additional Resources

### Supabase Documentation
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Auth Guide](https://supabase.com/docs/guides/auth)

### Cloudinary Documentation
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [React SDK](https://cloudinary.com/documentation/react_integration)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)

### InfinityFree Documentation
- [InfinityFree FAQ](https://www.infinityfree.net/faq)
- [FTP Guide](https://www.infinityfree.net/knowledgebase/10/How-to-Upload-Files-via-FTP.html)
- [File Manager](https://www.infinityfree.net/knowledgebase/11/How-to-Use-the-File-Manager.html)

### Vite Documentation
- [Vite Docs](https://vitejs.dev/)
- [Build Optimization](https://vitejs.dev/guide/build.html)
- [Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies configured
- [ ] Cloudinary account created
- [ ] Upload preset configured
- [ ] InfinityFree account created
- [ ] FTP credentials obtained
- [ ] Environment variables configured
- [ ] Local testing completed
- [ ] Build successful

### Post-Deployment
- [ ] Website accessible
- [ ] Authentication working
- [ ] Database connected
- [ ] File uploads working
- [ ] Images loading correctly
- [ ] Navigation working
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Monitoring setup

---

## 💡 Tips & Best Practices

### 1. Use Environment Variables
Never hardcode sensitive data. Always use `.env` files.

### 2. Enable RLS
Always enable Row Level Security on Supabase tables.

### 3. Optimize Images
Use Cloudinary transformations to optimize images on-the-fly.

### 4. Monitor Usage
Keep track of Supabase and Cloudinary usage to stay within free tiers.

### 5. Regular Backups
Backup your Supabase database regularly.

### 6. Test Thoroughly
Test all features before deploying to production.

### 7. Use HTTPS
InfinityFree provides free SSL. Always use HTTPS.

### 8. Keep Dependencies Updated
Regularly update npm packages for security patches.

---

## 🆘 Support

### InfinityFree Support
- [Knowledge Base](https://www.infinityfree.net/knowledgebase)
- [Forum](https://forum.infinityfree.net/)
- [Ticket System](https://www.infinityfree.net/support)

### Supabase Support
- [Documentation](https://supabase.com/docs)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Discord](https://discord.supabase.com/)

### Cloudinary Support
- [Documentation](https://cloudinary.com/documentation)
- [Support Center](https://support.cloudinary.com/)

---

## 📊 Cost Breakdown (Free Tier)

### Supabase Free Tier
- ✅ 500 MB database
- ✅ 5 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ 1 GB file storage
- ✅ Unlimited API requests

### Cloudinary Free Tier
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited users

### InfinityFree Free Tier
- ✅ Unlimited disk space
- ✅ Unlimited bandwidth
- ✅ Free subdomain
- ✅ Free SSL certificate
- ✅ No ads

**Total Cost**: $0/month 🎉

---

**Status**: ✅ Deployment Guide Complete  
**Last Updated**: 2026-10-15  
**Version**: 1.0.0
