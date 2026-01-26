# IT MANAGER SECURITY GUIDE
## Navigatio Geo Mapper - School Network Compatibility

**Version:** 2.7.0  
**Last Updated:** January 26, 2026  
**Application URL:** https://navigatio.earth/map/

---

## EXECUTIVE SUMMARY

**Navigatio Geo Mapper** is a web-based geographic data visualization tool designed for educational use. This document provides IT managers with the information needed to assess and configure network access for optimal functionality in school environments.

**Key Security Features:**
- ✅ Client-side processing only (no data uploaded to external servers)
- ✅ All resources loaded via HTTPS
- ✅ No executable code downloaded from untrusted sources
- ✅ Open source (code publicly auditable)
- ✅ No user tracking or analytics
- ✅ GDPR/COPPA compliant (no personal data collected)

---

## REQUIRED EXTERNAL DOMAINS

### **TIER 1: Critical for Basic Functionality**

These domains are required for the core mapping features:

| Domain | Purpose | Protocol | Safe for Schools? |
|--------|---------|----------|-------------------|
| `navigatio.earth` | Application hosting | HTTPS | ✅ YES - Your domain |
| `unpkg.com` | Leaflet mapping library | HTTPS | ✅ YES - Major CDN |
| `cdnjs.cloudflare.com` | CSV parsing library | HTTPS | ✅ YES - Cloudflare CDN |
| `tile.openstreetmap.org` | Default map tiles | HTTPS | ✅ YES - OpenStreetMap |

**Without these 4 domains, the application will not function.**

---

### **TIER 2: Enhanced Features (Optional)**

These domains enable additional features but are not required for basic operation:

| Domain | Purpose | Can Fail Gracefully? |
|--------|---------|----------------------|
| `cdn.jsdelivr.net` | Additional libraries | ✅ YES - Fallbacks exist |
| `basemaps.cartocdn.com` | Alternative map styles | ✅ YES - OSM fallback |
| `server.arcgisonline.com` | Esri basemaps | ✅ YES - OSM fallback |
| `tile.opentopomap.org` | Topographic maps | ✅ YES - OSM fallback |

**These can be blocked without breaking core functionality.**

---

### **TIER 3: Advanced Overlays (Optional)**

For tectonic plate overlays and advanced features:

| Domain | Purpose | Fallback Available? |
|--------|---------|---------------------|
| `navigatio.earth/PB2002_boundaries.json` | Local tectonic data | ✅ PRIMARY SOURCE |
| `raw.githubusercontent.com` | Tectonic plates (fallback) | ✅ Secondary fallback only |
| `api.github.com` | Sharing feature (optional) | ✅ YES - Can be disabled |

**Important:** If `raw.githubusercontent.com` is blocked (common in schools), tectonic plate overlays will still work via the local file at `navigatio.earth`.

---

## COMMON FIREWALL BLOCKS & SOLUTIONS

### **Issue 1: Tectonic Plate Overlays Don't Load**

**Symptoms:**
- Map loads fine
- Basic features work
- Tectonic plate overlay fails with error message

**Cause:** School firewall blocking `raw.githubusercontent.com`

**Solution:**
App now tries local file first (`navigatio.earth/PB2002_boundaries.json`), then falls back to GitHub. **This issue is resolved in v2.7.0+** as long as the local file is present.

**Verification:**
Test URL: https://navigatio.earth/PB2002_boundaries.json
- Should return JSON data (not 404)

---

### **Issue 2: Alternative Map Styles Don't Load**

**Symptoms:**
- Default OpenStreetMap works
- Other basemaps (Satellite, Dark, etc.) show blank tiles

**Cause:** Firewall blocking tile servers (CartoDB, Esri, etc.)

**Solution:** 
This is by design - OpenStreetMap is sufficient for educational use. Students can continue using the default map.

**Optional Fix:**
Whitelist additional domains from Tier 2 if variety is desired.

---

### **Issue 3: "Share via GitHub Gist" Feature Fails**

**Symptoms:**
- Error when clicking "Share via GitHub Gist" button

**Cause:** Firewall blocking `api.github.com`

**Solution:**
Use alternative sharing methods:
- "Share URL (Compressed)" button (works without GitHub)
- Export to HTML file (works offline)
- Students can manually save configurations

**Not Critical:** Sharing is optional convenience feature.

---

## RECOMMENDED FIREWALL CONFIGURATION

### **Minimum Whitelist (Core Functionality):**

```
navigatio.earth/* (HTTPS)
unpkg.com/* (HTTPS)
cdnjs.cloudflare.com/* (HTTPS)
tile.openstreetmap.org/* (HTTPS)
```

**With this configuration:**
- ✅ Map loads
- ✅ CSV upload works
- ✅ Data visualization works
- ✅ Export features work
- ❌ Advanced overlays may fail
- ❌ Alternative basemaps unavailable

---

### **Enhanced Whitelist (All Features):**

Add these to the minimum list:

```
cdn.jsdelivr.net/* (HTTPS)
basemaps.cartocdn.com/* (HTTPS)
server.arcgisonline.com/* (HTTPS)
tile.opentopomap.org/* (HTTPS)
raw.githubusercontent.com/* (HTTPS) [Optional - has local fallback]
api.github.com/* (HTTPS) [Optional - for sharing only]
```

**With this configuration:**
- ✅ All features work
- ✅ All basemaps available
- ✅ All overlays work
- ✅ Sharing features work

---

## SECURITY ASSESSMENT

### **Data Privacy:**

| Concern | Status | Details |
|---------|--------|---------|
| Student data uploaded to servers? | ❌ NO | All processing is client-side |
| User tracking/analytics? | ❌ NO | No tracking code present |
| Cookies/local storage? | ✅ LIMITED | Only for auto-save (optional) |
| Third-party accounts required? | ❌ NO | Anonymous use supported |
| Data retention? | ❌ NO | Data stays in browser only |

---

### **Content Safety:**

| Concern | Status | Details |
|---------|--------|---------|
| User-generated content? | ❌ NO | Only uploaded CSV files (processed locally) |
| External links to unverified sites? | ❌ NO | All resources from CDNs/verified sources |
| Malware risk? | ✅ LOW | Read-only operations, no file execution |
| Inappropriate content possible? | ❌ NO | Educational tool with no social features |

---

### **Compliance:**

- ✅ **GDPR Compliant** - No personal data collected
- ✅ **COPPA Compliant** - No registration or data collection
- ✅ **FERPA Compatible** - Student work stays in browser
- ✅ **Accessibility** - WCAG 2.1 AA guidelines followed

---

## TESTING CHECKLIST

Use this checklist to verify functionality in your network:

### **Basic Functionality Test:**
- [ ] Navigate to https://navigatio.earth/
- [ ] Click "Launch Geo Mapper"
- [ ] Map tiles load correctly
- [ ] Upload test CSV file
- [ ] Points appear on map
- [ ] Click point to see popup

**If all checked:** ✅ Core functionality working

---

### **Feature Compatibility Test:**
- [ ] Try changing basemap (Basemap selector)
- [ ] Enable tectonic plate overlay
- [ ] Test chart features (if using numeric data)
- [ ] Try "Share URL" button
- [ ] Export to HTML

**Note which features fail, if any. Provide this to application maintainer.**

---

## TROUBLESHOOTING

### **"Failed to load tectonic plates data" Error**

**Check:**
1. Can browser access: https://navigatio.earth/PB2002_boundaries.json?
2. If YES but still fails → Contact app developer
3. If NO → Whitelist navigatio.earth for JSON files

**Workaround:**
Students can use the app without tectonic overlays.

---

### **Map Tiles Show "Tile Load Error"**

**Check:**
1. Network allows HTTPS connections to tile servers?
2. DPI/SSL inspection interfering?

**Solution:**
- Whitelist tile.openstreetmap.org in SSL inspection bypass list
- Verify HTTPS not being downgraded to HTTP

---

### **Application Loads Slowly**

**Possible Causes:**
- CDN resources being scanned/proxied
- SSL inspection adding latency
- Bandwidth throttling

**Solutions:**
- Add CDN domains to SSL inspection bypass
- Increase bandwidth allocation for educational tools
- Consider caching CDN resources locally (advanced)

---

## SUPPORT CONTACT

**For School IT Managers:**

**Technical Questions:**
- GitHub Issues: https://github.com/navigatio1/geo-mapper/issues
- Email: [Your contact email]

**Security Concerns:**
- Please report security issues privately
- Response time: 24-48 hours

**Feature Requests:**
- Submit via GitHub Issues
- Prioritized for educational use cases

---

## VERSION HISTORY

**v2.7.0 (January 2026):**
- ✅ Added local tectonic plates file (resolves GitHub blocking)
- ✅ Improved error messages for blocked resources
- ✅ Better fallback handling for missing resources

**v2.6.1 (January 2026):**
- Chart customization features

**v2.5.0 (January 2026):**
- Chart comparison features

---

## APPENDIX: TECHNICAL DETAILS

### **Libraries Used:**

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| Leaflet | 1.9.4 | Mapping engine | unpkg.com |
| PapaParse | 5.4.1 | CSV parsing | cdnjs.cloudflare.com |
| LZ-String | 1.5.0 | URL compression | cdnjs.cloudflare.com |
| Chart.js | 4.4.1 | Data visualization | cdn.jsdelivr.net |

**All libraries are:**
- ✅ Open source
- ✅ Widely used in education
- ✅ Regularly updated
- ✅ Security audited

---

### **Browser Compatibility:**

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Requirements:**
- JavaScript enabled
- LocalStorage enabled (for auto-save only)
- Cookies not required

---

### **Performance:**

**Typical Resource Usage:**
- Initial load: ~500KB
- Per CSV upload: Varies (processed client-side)
- Memory: ~50-200MB (depends on dataset size)
- CPU: Minimal (map rendering only)

**Recommended:**
- Modern browser (last 2 years)
- 4GB RAM minimum
- Broadband internet connection

---

## APPROVAL RECOMMENDATION

**For IT Decision Makers:**

This application is **recommended for approval** in educational environments with the following considerations:

✅ **Low Risk:**
- No server-side data processing
- No user accounts or personal data
- All processing happens in browser
- Resources from trusted CDNs

✅ **Educational Value:**
- Geography and data visualization
- STEM curriculum support
- Student data analysis skills

⚠️ **Minor Considerations:**
- Requires external resources (CDNs)
- Some features need firewall whitelist
- Students need internet connection

**Suggested Deployment:**
1. Test with minimum whitelist first
2. Monitor for any issues
3. Expand whitelist if advanced features needed
4. Provide student guidance document

---

**End of IT Manager Security Guide**

For questions or concerns, please contact the application maintainer.

**Document Version:** 1.0  
**Application Version:** 2.7.0  
**Last Review:** January 26, 2026
