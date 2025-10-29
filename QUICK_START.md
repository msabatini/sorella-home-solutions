# 🚀 Quick Start Guide - Admin System

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 20+
- MongoDB running locally
- npm or yarn

### Step 1: Start MongoDB (macOS)
```bash
# If installed via Homebrew
brew services start mongodb-community

# Verify it's running
mongo
# Then type: exit
```

### Step 2: Start Backend (Terminal 1)
```bash
cd /Users/michaelsabatini/Documents/sorella-home-solutions/server
npm install
npm start
```

Expected output:
```
✅ MongoDB connected successfully
🚀 Sorella Contact API running on port 3002
📧 Email configured for: contact@sorellahomesolutions.com
```

### Step 3: Initialize Admin User (Terminal 2)
```bash
cd /Users/michaelsabatini/Documents/sorella-home-solutions/server
node scripts/init-admin.js
```

Expected output:
```
✅ Admin user created successfully
Username: admin
Email: admin@sorellahomesolutions.com
Role: admin
```

### Step 4: Start Frontend (Terminal 3)
```bash
cd /Users/michaelsabatini/Documents/sorella-home-solutions
npm install
npm start
```

Expected output:
```
✔ Compiled successfully.

Application bundle generation complete. [X.XXX seconds]

Watch mode enabled. Watching for file changes...
  ▼ Local:   http://localhost:4200/
```

### Step 5: Access Admin Panel
1. Open browser: `http://localhost:4200`
2. Go to: `http://localhost:4200/admin-login`
3. Login with:
   - **Username**: `admin`
   - **Password**: `sorella123`

---

## 📍 Main Pages

| URL | Purpose | Auth Required |
|-----|---------|---|
| `http://localhost:4200` | Home page | ❌ |
| `http://localhost:4200/blog` | Public blog | ❌ |
| `http://localhost:4200/admin-login` | Login page | ❌ |
| `http://localhost:4200/admin` | Dashboard | ✅ |
| `http://localhost:4200/admin/blog` | Manage posts | ✅ |
| `http://localhost:4200/admin/blog/new` | Create post | ✅ |
| `http://localhost:4200/admin/comments` | Moderate comments | ✅ |

---

## 🧪 Test the System

### Test 1: Create a Blog Post
1. Login to `/admin-login`
2. Click "Blog Management" → "Manage Posts"
3. Click "New Post" button
4. Fill in form:
   - **Title**: "My First Blog Post"
   - **Subtitle**: "Testing the admin system"
   - **Author**: "Test Author"
   - **Category**: "Tips & Advice"
   - **Featured Image**: Upload a JPG (max 5MB)
   - **Intro Text**: "This is a test blog post"
   - **Content**: Add at least one section
   - **Tags**: Add some tags (comma-separated in input)
5. Click "Save Post"
6. Verify post appears in the list

### Test 2: Publish/Draft Toggle
1. Go to Blog Management
2. Find your test post
3. Click the status badge (Published/Draft)
4. Status should toggle immediately
5. Refresh page to verify change persists

### Test 3: Edit a Post
1. Go to Blog Management
2. Click the edit icon on any post
3. Modify the title or content
4. Click "Save Post"
5. Verify changes appear in list

### Test 4: Delete a Post
1. Go to Blog Management
2. Click delete icon on a post
3. Confirm deletion
4. Post should disappear from list

### Test 5: Add a Comment (Public)
1. Go to `/blog` (public blog page)
2. Click on a blog post
3. Scroll to comments section
4. Fill comment form:
   - **Name**: "Test User"
   - **Email**: "test@example.com"
   - **Comment**: "Great post!"
5. Submit form
6. Comment should appear as "Pending" (needs approval)

### Test 6: Moderate Comments
1. Login to admin
2. Go to "Comments" management
3. You should see your test comment
4. Click "Approve" → Comment status changes
5. Test "Reject" on another comment
6. Test "Delete" on a comment

### Test 7: Search & Filter
1. Go to Comments management
2. Type in search box (searches author, email, content)
3. Click filter buttons: All / Pending / Approved
4. Results should update dynamically

---

## 🐛 Common Issues & Fixes

### "Cannot GET /admin" after login
**Problem**: Not authenticated
**Fix**:
```bash
# Check browser console (F12 → Console)
# Should see token in localStorage
localStorage.getItem('sorella_admin_token')

# If empty, try login again
```

### "MongoDB connection error"
**Problem**: MongoDB not running
**Fix**:
```bash
# Start MongoDB
brew services start mongodb-community

# Or verify it's running
ps aux | grep mongod
```

### "Cannot read property 'data'"
**Problem**: API response format issue
**Fix**:
```bash
# Check backend is running
curl http://localhost:3002/api/health

# Should return: { "status": "OK", ... }
```

### "CORS error in console"
**Problem**: Frontend and backend domains don't match
**Fix**:
```
✅ Frontend: http://localhost:4200
✅ Backend: http://localhost:3002
Both running locally = CORS should work
```

### "Email validation failed"
**Problem**: Email field format issue
**Fix**:
- Use valid email format: `user@example.com`
- Don't include spaces
- Special characters not allowed

---

## 📊 Backend API Quick Test

### Test Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sorella123"}'

# Response should include "token"
```

### Get Token for Other Tests
```bash
# Save token from login response
TOKEN="your-token-here"

# Test token verification
curl http://localhost:3002/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### Get All Blog Posts (Authenticated)
```bash
TOKEN="your-token-here"
curl http://localhost:3002/api/blog/admin/all \
  -H "Authorization: Bearer $TOKEN"
```

### Get All Comments (Authenticated)
```bash
TOKEN="your-token-here"
curl http://localhost:3002/api/blog/admin/comments/all \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 What to Test First (Priority Order)

1. ✅ **Login Flow** - Can you login?
2. ✅ **View Posts** - Do posts load?
3. ✅ **Create Post** - Can you create one?
4. ✅ **Edit Post** - Can you modify it?
5. ✅ **Toggle Status** - Publish/draft toggle?
6. ✅ **Delete Post** - Can you delete?
7. ✅ **Comments List** - Do comments show?
8. ✅ **Moderate** - Can you approve/reject?
9. ✅ **Search** - Does search work?
10. ✅ **Logout** - Does logout clear token?

---

## 🛑 Stop Everything

```bash
# Terminal 1: Stop backend
ctrl+c

# Terminal 2: (just close)

# Terminal 3: Stop frontend
ctrl+c

# Stop MongoDB
brew services stop mongodb-community
```

---

## 📞 Getting Help

### Check Logs
```bash
# Backend logs show in terminal while running
# Frontend logs in browser console (F12)
# MongoDB logs:
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Restart Everything Fresh
```bash
# Kill all processes
killall node mongod ng

# Start fresh
brew services stop mongodb-community
brew services start mongodb-community
sleep 2

# Terminal 1: Backend
cd server && npm start

# Terminal 2: Admin init
cd server && node scripts/init-admin.js

# Terminal 3: Frontend
npm start
```

### Clear Cache & Data
```bash
# Clear browser storage
# Open DevTools (F12) → Application → Storage → Clear All

# Or clear in code:
localStorage.clear()
sessionStorage.clear()
```

---

## ✅ System Checklist

- [ ] MongoDB running
- [ ] Backend starting on port 3002
- [ ] Frontend starting on port 4200
- [ ] Can access `http://localhost:4200`
- [ ] Can navigate to `/admin-login`
- [ ] Can login with admin credentials
- [ ] Can access `/admin` dashboard
- [ ] Can view blog posts in admin
- [ ] Can view comments in admin
- [ ] Can create a test blog post
- [ ] Can moderate a test comment

---

## 🎓 Next Steps

Once everything is working:

1. **Read full documentation**: See `ADMIN_SYSTEM_COMPLETE.md`
2. **Understand the code**: Review component structure
3. **Try production build**: Run `npm run build`
4. **Plan deployment**: Follow deployment guide
5. **Add sample data**: Create some test posts
6. **Test on mobile**: Check responsive design

---

## 🎉 Success!

If you completed all 5 steps above, your admin system is:
- ✅ Fully functional
- ✅ Ready for development
- ✅ Ready for testing
- ✅ Ready for deployment

**Congratulations!** 🚀