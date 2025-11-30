# Relief Connect - Local Testing Guide

## 🚀 Server Status
✅ **Development server is running on http://localhost:3000**

## 🧪 Testing Checklist

### 1. **Homepage & Navigation**
- [ ] Visit http://localhost:3000
- [ ] Check responsive design (mobile/desktop)
- [ ] Test navigation menu
- [ ] Verify hero section and features display

### 2. **Authentication**
- [ ] Test sign-in page: http://localhost:3000/auth/signin
- [ ] Try Google OAuth (if configured)
- [ ] Test email/password authentication
- [ ] Check user session persistence

### 3. **Effort Management**
- [ ] Create new effort: http://localhost:3000/efforts/create
- [ ] Test 5-step creation wizard
- [ ] View efforts list: http://localhost:3000/efforts
- [ ] Test effort search and filtering

### 4. **Volunteer System**
- [ ] Volunteer registration: http://localhost:3000/volunteers/register
- [ ] Test multi-step registration form
- [ ] Check skills selection and availability
- [ ] Test volunteer dashboard (after registration)

### 5. **Resource Management**
- [ ] Test resource inventory (after creating effort)
- [ ] Check donation tracking
- [ ] Test low-stock alerts
- [ ] Verify resource filtering

### 6. **Communication System**
- [ ] Test message composer
- [ ] Check template management
- [ ] Test communication analytics
- [ ] Verify message scheduling

### 7. **Mobile Features**
- [ ] Test on mobile device or browser dev tools
- [ ] Check PWA installation prompt
- [ ] Test offline functionality
- [ ] Verify touch interactions

### 8. **Accessibility**
- [ ] Test keyboard navigation
- [ ] Check screen reader compatibility
- [ ] Test high contrast mode
- [ ] Run accessibility tests

### 9. **Security & Privacy**
- [ ] Test rate limiting
- [ ] Check security headers
- [ ] Test privacy controls: http://localhost:3000/privacy
- [ ] Verify data export functionality

## 🔧 Common Issues & Solutions

### Database Connection
If you see database errors:
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in .env.local
3. Run: `npx prisma db push`

### Authentication Issues
If Google OAuth doesn't work:
1. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
2. Verify redirect URLs in Google Console

### Build Errors
If you see TypeScript errors:
1. Run: `npm run build` to see detailed errors
2. Check for missing dependencies: `npm install`

## 📱 Mobile Testing
1. Open Chrome DevTools (F12)
2. Click device toggle icon
3. Select mobile device (iPhone/Android)
4. Test touch interactions and responsive design

## 🌐 PWA Testing
1. Open http://localhost:3000 in Chrome
2. Look for "Install" button in address bar
3. Install as PWA
4. Test offline functionality

## 🎯 Key URLs to Test
- **Homepage**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth/signin
- **Create Effort**: http://localhost:3000/efforts/create
- **Browse Efforts**: http://localhost:3000/efforts
- **Volunteer Registration**: http://localhost:3000/volunteers/register
- **Privacy Controls**: http://localhost:3000/privacy
- **Security Dashboard**: http://localhost:3000/admin/security

## 🚨 Emergency Features
- Test emergency alert system
- Check crisis-optimized UI
- Verify rapid response workflows
- Test offline data sync

## 📊 Performance Testing
- Check page load times
- Test with slow network (DevTools)
- Verify image optimization
- Check bundle size

## 🔍 Debugging
- Open browser DevTools Console
- Check for JavaScript errors
- Monitor network requests
- Test API endpoints directly

---

**Happy Testing! 🎉**

The Relief Connect platform is now running locally and ready for comprehensive testing of all disaster relief coordination features.
