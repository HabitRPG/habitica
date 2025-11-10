# 🌓 Dark/Light Mode Toggle Implementation

## ✅ Implementation Complete!

This document describes the dark/light mode toggle feature added to Habitica's frontend.

---

## 📋 Files Modified

### 1. **Header Component** (`website/client/src/components/header/index.vue`)
   - **Added:** Theme toggle button (🌙/🌞 icon) in the header
   - **Added:** `isDarkMode` data property
   - **Added:** `toggleTheme()` and `applyTheme()` methods
   - **Added:** Theme persistence using `localStorage`
   - **Added:** CSS styles for the toggle button with hover effects

### 2. **Theme Styles** (`website/client/src/assets/scss/_theme.scss`) - **NEW FILE**
   - **Created:** CSS custom properties for light and dark themes
   - **Defined:** Color variables for both themes:
     - Background colors (primary, secondary, tertiary)
     - Text colors (primary, secondary, muted)
     - Border and shadow colors
     - Header, card, and input styling
   - **Applied:** Smooth transitions (0.3s ease) for theme changes

### 3. **Main Stylesheet** (`website/client/src/assets/scss/index.scss`)
   - **Added:** Import statement for `_theme.scss`

---

## 🎯 How It Works

### User Experience
1. **Toggle Button:** Located in the header next to the user profile
   - 🌙 Moon icon = Click to switch to **Dark Mode**
   - 🌞 Sun icon = Click to switch to **Light Mode**

2. **Instant Apply:** Theme changes immediately without page reload

3. **Persistence:** User's choice is saved to `localStorage` as `habitica-theme`
   - Reloading the page keeps the selected theme
   - Works across browser sessions

### Technical Implementation

#### Data Attribute System
```javascript
// The theme is stored as a data attribute on <html>
document.documentElement.setAttribute('data-theme', 'dark');
// or
document.documentElement.setAttribute('data-theme', 'light');
```

#### CSS Variables
```scss
// Light theme
:root[data-theme='light'] {
  --bg-primary: #FFFFFF;
  --text-primary: #1A181D;
  // ... more variables
}

// Dark theme
:root[data-theme='dark'] {
  --bg-primary: #34313A;
  --text-primary: #FFFFFF;
  // ... more variables
}
```

#### LocalStorage
```javascript
// Save theme
localStorage.setItem('habitica-theme', 'dark');

// Load theme on mount
this.isDarkMode = localStorage.getItem('habitica-theme') === 'dark';
```

---

## 🧪 Testing

### To Test Locally:
```powershell
cd C:\projects\habitica\website\client
npm run serve
```

Then open: **http://localhost:8080**

### What to Test:
1. ✅ Click the moon/sun icon in the header
2. ✅ Verify background and text colors change instantly
3. ✅ Refresh the page - theme should persist
4. ✅ Check that modals, cards, and inputs also change theme
5. ✅ Test hover effect on the toggle button

---

## 🎨 Theme Colors

### Light Theme (Default)
- Background: White (`#FFFFFF`)
- Text: Black (`#1A181D`)
- Header: Purple (`#36205D`)
- Cards: White with gray borders

### Dark Theme
- Background: Dark Gray (`#34313A`)
- Text: White (`#FFFFFF`)
- Header: Dark Purple (`#271B3D`)
- Cards: Gray (`#4E4A57`) with darker borders

---

## 🚀 Next Steps (Optional Enhancements)

### 1. **Backend Integration** (Save to User Preferences)
To make this a real user setting (like official Habitica features):

#### Step A: Add to User Schema
```javascript
// In website/server/models/user/schema.js
preferences: {
  // ... existing preferences
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  }
}
```

#### Step B: Create API Endpoint
```javascript
// In website/server/controllers/api-v3/user.js
api.put('/user/preferences/theme', async (req, res) => {
  req.context.user.preferences.theme = req.body.theme;
  await req.context.user.save();
  res.respond(200, req.context.user.preferences);
});
```

#### Step C: Update Header Component
```javascript
// In mounted(), fetch user preference from API
async mounted() {
  // ... existing code
  
  // Load theme from user preferences if logged in
  if (this.user && this.user.preferences && this.user.preferences.theme) {
    this.isDarkMode = this.user.preferences.theme === 'dark';
  } else {
    // Fallback to localStorage
    this.isDarkMode = localStorage.getItem('habitica-theme') === 'dark';
  }
  
  this.applyTheme();
}

// In toggleTheme(), save to API
async toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  const newTheme = this.isDarkMode ? 'dark' : 'light';
  
  // Save to localStorage
  localStorage.setItem('habitica-theme', newTheme);
  
  // Save to user preferences (API call)
  try {
    await this.$store.dispatch('user:set', {
      'preferences.theme': newTheme
    });
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
  
  this.applyTheme();
}
```

### 2. **Additional Theme Support**
- Add more themes (e.g., "Auto" that follows system preference)
- Use `prefers-color-scheme` media query for system detection
- Add theme-specific custom colors for tasks, badges, etc.

### 3. **Accessibility**
- Add `aria-label` to toggle button
- Ensure sufficient color contrast in both themes (WCAG AAA)
- Add keyboard shortcut (e.g., Ctrl+Shift+T)

---

## 📝 Code Summary

### Toggle Button HTML
```vue
<button
  class="theme-toggle"
  :title="isDarkMode ? $t('switchToLightMode') : $t('switchToDarkMode')"
  @click="toggleTheme"
>
  <span v-if="isDarkMode">🌞</span>
  <span v-else>🌙</span>
</button>
```

### Theme Logic
```javascript
data() {
  return {
    isDarkMode: localStorage.getItem('habitica-theme') === 'dark',
    // ... other data
  };
},

mounted() {
  this.applyTheme();
  // ... other mounted logic
},

methods: {
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const newTheme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('habitica-theme', newTheme);
    this.applyTheme();
  },
  
  applyTheme() {
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  },
}
```

---

## 🎓 Contributing to Habitica

If you want to submit this as a Pull Request to the official Habitica repo:

1. **Create a feature branch:**
   ```bash
   git checkout -b feat/dark-mode-toggle
   ```

2. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: Add dark/light mode toggle to header"
   ```

3. **Push to your fork:**
   ```bash
   git push origin feat/dark-mode-toggle
   ```

4. **Create Pull Request** on GitHub:
   - Title: `feat: Add dark/light mode toggle`
   - Description: Explain the feature, how to test it, and include screenshots
   - Reference any related issues

5. **Follow Habitica's contribution guidelines:**
   - https://habitica.fandom.com/wiki/Guidance_for_Comrades

---

## 📸 Screenshots

### Light Mode
- Clean white background
- Purple header
- Easy to read in bright environments

### Dark Mode
- Dark gray background (#34313A)
- Reduced eye strain in low-light
- Maintains Habitica's purple branding

---

## ✨ Features Implemented

- [x] Toggle button in header
- [x] Instant theme switching
- [x] LocalStorage persistence
- [x] Smooth transitions (0.3s)
- [x] Icon feedback (moon/sun)
- [x] Hover effects
- [x] Keyboard focus styling
- [x] CSS custom properties for scalability
- [x] Works across entire app (body, modals, cards, inputs)

---

## 🐛 Known Limitations

1. **Third-party Components:** Some external libraries (e.g., charts, date pickers) may not auto-adapt to the theme
2. **Images:** Sprite-based graphics won't change color automatically
3. **Inline Styles:** Any hard-coded colors in inline styles won't respect the theme

### Future Improvements
- Theme-aware image variants (e.g., dark mode sprites)
- Override third-party component styles
- Add theme-specific logo variants

---

## 🙏 Credits

Implemented by: **Rohithgowda** ([@rohithgowda18](https://github.com/rohithgowda18))  
Date: November 10, 2025  
Feature Branch: `feat/dark-mode-toggle`

---

## 📚 Resources

- [Habitica GitHub Repo](https://github.com/HabitRPG/habitica)
- [Habitica Wiki - Contributing](https://habitica.fandom.com/wiki/Guidance_for_Comrades)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [localStorage API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Enjoy your new Dark Mode! 🌙✨**
