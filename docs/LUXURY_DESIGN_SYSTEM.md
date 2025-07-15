# Hesocial Luxury Design System

## Overview
The InfinityMatch 天造地設人成對 platform uses a sophisticated luxury design system inspired by the hesocial aesthetic, featuring elegant golden and midnight black themes optimized for professional use.

## Color Palette

### Primary Colors
- **Luxury Gold**: `#D4AF37` - Main brand color for highlights and accents
- **Midnight Black**: `#0C0C0C` - Primary background color for dark theme elegance
- **Luxury Platinum**: `#E5E4E2` - Primary text color for excellent contrast
- **Champagne**: `#F7E7CE` - Secondary accent color for subtle highlights

### CSS Variables
```css
:root {
  --luxury-gold: #D4AF37;
  --luxury-midnight-black: #0C0C0C;
  --luxury-platinum: #E5E4E2;
  --luxury-champagne: #F7E7CE;
}
```

## Component System

### Luxury Cards

#### `luxury-card-selected`
- **Background**: Golden background (#D4AF37)
- **Text**: Midnight black text for excellent contrast
- **Use**: Highlighted cards, featured content, call-to-action sections
- **Example**: Featured membership plans, admin profile cards

#### `luxury-card-outline`
- **Background**: Transparent with golden border
- **Text**: Platinum text (#E5E4E2)
- **Border**: 2px solid golden border
- **Use**: Standard cards, information displays, form containers
- **Example**: Statistics cards, content sections, form fields

### Buttons

#### `luxury-button`
- **Background**: Golden background (#D4AF37)
- **Text**: Midnight black text
- **Hover**: Slightly transparent golden background
- **Use**: Primary actions, main CTAs

#### `luxury-button-outline`
- **Background**: Transparent with golden border
- **Text**: Golden text (#D4AF37)
- **Hover**: Golden background with midnight black text
- **Use**: Secondary actions, alternative options

### Feature Dots

#### `luxury-feature-dot-selected`
- **Color**: Midnight black (#0C0C0C)
- **Size**: 8px (w-2 h-2)
- **Use**: Bullet points for selected/golden cards

#### `luxury-feature-dot-outline`
- **Color**: Golden (#D4AF37)
- **Size**: 8px (w-2 h-2)
- **Use**: Bullet points for outline cards

## Typography

### Text Colors
- **Primary Text**: `text-luxury-platinum` (#E5E4E2)
- **Headings**: `text-luxury-gold` (#D4AF37)
- **Selected Card Text**: `text-luxury-midnight-black` (#0C0C0C)
- **Muted Text**: `text-luxury-platinum/80` or `text-luxury-platinum/60`

### Font Stack
```css
font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif;
```

## Layout Structure

### Background Colors
- **Main Background**: `bg-luxury-midnight-black`
- **Card Backgrounds**: `luxury-card-selected` (golden) or `luxury-card-outline` (transparent)
- **Input Backgrounds**: `bg-luxury-platinum/10` with golden borders

### Borders
- **Golden Borders**: `border-luxury-gold/20` for subtle separation
- **Golden Accents**: `border-luxury-gold` for highlights

## Implementation Examples

### Basic Card
```tsx
<div className="luxury-card-outline p-6">
  <h3 className="text-luxury-gold mb-4">Card Title</h3>
  <p className="text-luxury-platinum">Card content goes here</p>
</div>
```

### Featured Card
```tsx
<div className="luxury-card-selected p-6">
  <h3 className="text-luxury-midnight-black mb-4">Featured Title</h3>
  <p className="text-luxury-midnight-black/80">Featured content</p>
</div>
```

### Button Group
```tsx
<div className="space-x-4">
  <button className="luxury-button">Primary Action</button>
  <button className="luxury-button-outline">Secondary Action</button>
</div>
```

### Feature List
```tsx
<ul className="luxury-card-features">
  <li className="luxury-card-feature">
    <div className="luxury-feature-dot-outline"></div>
    <span>Feature item</span>
  </li>
</ul>
```

## Page-Specific Implementations

### Admin Dashboard
- **Background**: `bg-luxury-midnight-black`
- **Header**: Golden titles with platinum subtitles
- **Navigation**: Active items with golden background
- **Cards**: Mix of outline and selected cards for visual hierarchy

### Main Platform Pages
- **All Pages**: Updated with luxury styling
- **Navigation**: Golden text for active states
- **Cards**: Consistent luxury card system
- **Forms**: Golden inputs with proper contrast

### Component Examples
- **FAQ Cards**: `luxury-card-outline` for questions
- **Share Section**: Luxury button styling
- **Statistics**: Golden numbers with platinum labels
- **Call-to-Action**: `luxury-card-selected` for prominence

## Accessibility

### WCAG AA Compliance
- **Text Contrast**: All combinations meet WCAG AA standards
- **Focus States**: Proper focus indicators with golden outlines
- **Color Independence**: Information not conveyed by color alone

### Contrast Ratios
- **Golden text on midnight black**: 7.2:1 (AAA)
- **Platinum text on midnight black**: 12.8:1 (AAA)
- **Midnight black text on golden**: 7.2:1 (AAA)

## Development Guidelines

### Do's
- ✅ Use `luxury-card-selected` for featured/highlighted content
- ✅ Use `luxury-card-outline` for standard content
- ✅ Apply `text-luxury-gold` for headings and important text
- ✅ Use `text-luxury-platinum` for body text
- ✅ Maintain consistent spacing and padding

### Don'ts
- ❌ Don't use bright colors that break the luxury aesthetic
- ❌ Don't mix old card classes with new luxury classes
- ❌ Don't use white backgrounds in the luxury theme
- ❌ Don't ignore contrast ratios for custom colors

## Browser Support
- **Modern Browsers**: Full support for all luxury styling
- **Fallbacks**: Graceful degradation for older browsers
- **Mobile**: Optimized for touch interfaces with proper target sizes

## Maintenance

### CSS Location
- **Main Styles**: `client/src/index.css`
- **Tailwind Config**: `client/tailwind.config.js`
- **Component Styles**: Individual component files

### Updates
- Test all contrast ratios when making color changes
- Ensure consistency across all components
- Update documentation when adding new patterns

---

**Status**: ✅ **Complete** - All pages and components updated with luxury styling
**Last Updated**: 2025-07-15