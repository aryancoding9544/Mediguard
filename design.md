# MEDIGUARD — UI/UX Design Specification & Design System

> **Reference Source:** Mobile UI Mockup (`design/a6fe55b52412f9b17a10eef776718f2d.webp`)  
> **Platform Target:** iOS & Android Native via **React Native + Expo** (Expo Router, NativeWind / StyleSheet)  
> **Design Vibe:** Modern Consumer HealthTech, Minimalist, Pastel & Dark Contrast, Premium Wellness Aesthetic

---

## 1. Executive Summary & Design Philosophy

The MEDIGUARD mobile interface adopts a clean, approachable, and premium consumer health design language (reminiscent of modern healthtech leaders like Hera, PillPack, and Ritual). Rather than feeling cold or clinical, the interface utilizes:

- **Soft Pastel Canvas Colors:** Mint turquoise (`#D5F5F6`) and blush rose (`#FED4DD`) containers that reduce medical anxiety and highlight key cards.
- **High-Contrast Dark Accents:** Deep charcoal/black (`#111827`) buttons and squircle navigation elements that anchor the user's attention.
- **Generous Rounded Geometry:** High border-radii (`24px` to `36px` and full pills `9999px`) creating an organic, friendly physical card feel.
- **Card-Based Modularity:** Distinct rounded surfaces grouping information (quick actions, carousel products, viewfinder, bottom docks).
- **Clear Information Hierarchy:** Dual-weight typography, prominent pricing/dosage badges, and progress indicators.

---

## 2. Design Tokens & Styling Guide

### 2.1 Color Palette

| Token Name | Hex Code | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#F8F9FA` | `bg-neutral-50` / `bg-slate-50` | Default screen background behind cards |
| **Card Surface (White)**| `#FFFFFF` | `bg-white` | Quick action pills, navigation dock, card backgrounds |
| **Primary Charcoal** | `#111827` / `#0D0F12` | `bg-gray-900` / `bg-black` | Search button, Scan nav squircle, CTA buttons, active text |
| **Pastel Mint / Turquoise** | `#D5F5F6` | `bg-teal-100/60` | Featured medicine hero card, scanner viewfinder accents |
| **Pastel Blush / Pink** | `#FED4DD` | `bg-pink-100/70` | Secondary product card hero background |
| **Accent Cyan / Teal** | `#2DD4BF` / `#0D9488`| `bg-teal-500` / `text-teal-600` | Floating add-to-cart button, scanner highlight box |
| **Text Primary** | `#0F172A` | `text-slate-900` | Bold titles, section headlines, prices |
| **Text Secondary** | `#64748B` | `text-slate-500` | Subtitles, location tags, helper captions |
| **Text Tertiary / Muted**| `#94A3B8` | `text-slate-400` | Unfocused icons, placeholder text |
| **Notification Alert** | `#EF4444` / `#FF5A5F`| `bg-red-500` | Notification unread badge dot |
| **Border / Subtle Divider**| `#E2E8F0` | `border-slate-200` | Quick action card borders, stepper container |

### 2.2 Typography

- **Primary Font Family:** `Inter`, `Plus Jakarta Sans`, or `SF Pro Display` (sans-serif)
- **Prescription / Script Handwriting Font:** `Caveat`, `Cedarville Cursive`, or `Kalam` (for realistic doctor's handwriting simulation)
- **Type Scale:**
  - **Large Heading (Hero):** `28px - 32px` / Semibold & Normal (e.g., *"Find Your"* light, *"Medicines Fast"* bold)
  - **Screen Titles (App Bar):** `18px - 20px` / Medium
  - **Card Titles:** `18px - 22px` / Bold
  - **Price / Hero Metric:** `22px - 26px` / Extra Bold
  - **Body / Descriptions:** `13px - 14px` / Regular (Leading `1.5`)
  - **Badges / Tags / Counts:** `12px - 14px` / Bold uppercase (`30X`)
  - **Navigation & Pill Labels:** `11px - 13px` / Medium

### 2.3 Component Geometry & Shadows

- **Pill Buttons & Steppers:** `rounded-full` (`9999px`)
- **Action / Feature Cards:** `rounded-[28px]` or `rounded-[32px]`
- **Viewfinder / Media Boxes:** `rounded-[24px]`
- **Squircle Icons (Nav Scan Button):** `rounded-[20px]`
- **Shadows:** Soft diffuse shadows (e.g., `shadow-[0_8px_30px_rgb(0,0,0,0.06)]`), avoiding harsh dark drop shadows.

---

## 3. Screen-by-Screen Breakdown

### Screen 1: Dashboard / Home Screen

```
+-----------------------------------------------------+
| 9:41                      [---]            📶 📶 🔋  |
|                                                     |
| (👤) Michael Johnson                             🔔  |
|      📍 New York, NY                                |
|                                                     |
| Find Your                                   ( 🔍 )  |
| Medicines Fast                                      |
|                                                     |
| [ 📷 Upload    ]        [ 🛍️ Order     ]            |
| [ 📍 Pharmacy  ]        [ ⏱️ Reminder  ]            |
|                                                     |
| +-------------------------+ +---------------------+ |
| |                    ( ♡ )| |                ( ♡ )| |
| |        [Product]        | |      [Product]      | |
| |     (Mint Carousel)     | |    (Pink Carousel)  | |
| |                         | |                     | |
| | Women Multivitamin      | | Women...            | |
| | $29.00           ( 🛍️ )| | $2...               | |
| +-------------------------+ +---------------------+ |
|                                                     |
| +-------------------------------------------------+ |
| |  🏠 Home   📄 Orders   [ ⛶ ]   💬 AI Chat  👤 Me | |
| +-------------------------------------------------+ |
+-----------------------------------------------------+
```

#### Detailed Elements:
1. **Status Bar & Dynamic Island:**
   - Standard iOS status bar (9:41 time, dynamic island pill cutout, cellular signal, Wi-Fi, battery level).
2. **User Profile & Header Bar:**
   - **Left:** Circular profile avatar (photo of user), username `"Michael Johnson"` (Medium weight, 14px), location subtitle `"📍 New York, NY"` (Slate-500, 12px with map marker icon).
   - **Right:** White circular icon button with a bell icon and a small reddish/coral badge indicating unread notifications.
3. **Hero Heading & Search Trigger:**
   - Heading text split into two lines:
     - Top line: `"Find Your"` (Light/Regular, 28px, slate-400)
     - Bottom line: `"Medicines Fast"` (Bold, 28px, slate-900)
   - **Search Button:** Aligned to the right, a high-contrast black circular button (`w-12 h-12`) with a white magnifying glass icon (`🔍`).
4. **Quick Action Grid (2x2 Pill Cards):**
   - Four white rounded pill buttons (`rounded-2xl` / `rounded-full`, subtle border, 14px font, medium weight):
     - **Top Left:** `📷 Upload` — Quick camera/prescription upload trigger.
     - **Top Right:** `🛍️ Order` — Direct medicine ordering / prescription refilling.
     - **Bottom Left:** `📍 Pharmacy` — Nearby pharmacy locator and stock lookup.
     - **Bottom Right:** `⏱️ Reminder` — Medication schedule & dosage reminders.
5. **Featured Medicine Carousel / Product Showcase:**
   - Horizontal sliding card layout with cards peeking on the right:
   - **Card 1 (Teal Card):**
     - Background: Soft pastel turquoise (`#D5F5F6`).
     - Top right: Circular floating heart/favorite button (`♡` outlined).
     - Product imagery: Teal medicine bottle ("Calcium Core" / "hera.") with sliced fresh oranges and white capsules.
     - Product Title: `"Women Multivitamin"` (bold, 18px).
     - Price & Action: `"$29.00"` (bold, 20px) paired with a circular cyan button (`bg-teal-400`) holding a white shopping bag icon.
   - **Card 2 (Pink Card - Peeking):**
     - Background: Soft pastel pink (`#FED4DD`).
     - Product imagery: Pink bottle with citrus accents, partially visible to prompt horizontal scrolling.
6. **Bottom Navigation Bar (Floating Dock):**
   - Floating white dock with rounded corners and 5 navigation anchors:
     1. **Home:** House icon + "Home" label (Active state).
     2. **Orders:** Receipt / document icon + "Orders" label.
     3. **Scan Button (Center Hero CTA):** Prominent black squircle (`rounded-2xl`, `bg-black`, `p-3`) with white viewfinder scan icon (`[ - ]`). Triggers the core prescription OCR & comparison flow.
     4. **AI Chat:** Speech bubble icon enclosing the text `"AI"` + "AI Chat" label (Direct link to MediGuard AI Pharmacist assistant).
     5. **Profile:** User silhouette avatar icon + "Profile" label.

---

### Screen 2: Prescription Scan Screen

```
+-----------------------------------------------------+
| 9:41                      [---]            📶 📶 🔋  |
|                                                     |
| ( < )                     Hera                ( ··· )|
|                                                     |
|     + - - - - - - - - - - - - - - - - - - - - +     |
|     |  PRESCRIPTION:                          |     |
|     |                                         |     |
|     |  Patient's concern:                     |     |
|     |    Headache                             |     |
|     |  +-----------------------------------+  |     |
|     |  | Recommendation:                   |  |     |
|     |  |   Yakapsule!                      |  |     |
|     |  |   3x a day!                       |  |     |
|     |  +-----------------------------------+  |     |
|     + - - - - - - - - - - - - - - - - - - - - +     |
|                                                     |
|        Please wait a few seconds. We are            |
|           analyzing your prescription...            |
|                                                     |
|        ( 🖼️ )            (( 75% ))           ( ⚡ )  |
|                                                     |
|                      ___________                    |
+-----------------------------------------------------+
```

#### Detailed Elements:
1. **Top App Bar:**
   - **Left:** Circular back button (`<`) in a white rounded circle.
   - **Center:** Screen / Brand header `"Hera"` (or `"MediGuard"`).
   - **Right:** Circular three-dots button (`···`) for scan settings, guidelines, or help.
2. **Prescription Scanner Viewfinder:**
   - Large rounded rectangular scanning frame with teal/cyan corner brackets (`border-teal-400`).
   - Represents either live camera viewfinder feed or newly captured paper preview.
   - **Prescription Content Display:**
     - Header: Uppercase sans-serif `"PRESCRIPTION:"`.
     - Patient Notes: Cursive handwriting text: *"Patient's concern: Headache"*.
     - Highlighted Recommendation Box: Light cyan card container with blue/teal script text:
       - Label: *"Recommendation:"*
       - Doctor's order: *"Yakapsule! 3x a day!"*
3. **Real-Time AI Processing Status:**
   - Centered helper text below viewfinder:
     - `"Please wait a few seconds. We are analyzing your prescription..."` (Slate-500, 13px, friendly and reassuring).
4. **Camera / Scan Control Toolbar:**
   - Balanced 3-control layout at the lower section:
     - **Left Button:** Photo gallery picker icon (`🖼️` squircle button) to upload an existing prescription photo from phone storage.
     - **Center Shutter / Progress Dial:** Circular dark ring with a circular loading progress stroke displaying `"75%"` in bold white typography. Demonstrates active AI OCR / handwriting recognition in progress.
     - **Right Button:** Flash / torch toggle button (`⚡` with cross/slash line) for low-light prescription capture.
5. **Home Bar:** Standard iOS home indicator line at the bottom.

---

### Screen 3: Product Page / Medicine Detail Screen

```
+-----------------------------------------------------+
| 9:41                      [---]            📶 📶 🔋  |
|                                                     |
| ( < )                     Hera                ( ♡ )  |
|                                                     |
|  +-----------------------------------------------+  |
|  |             +-------------------+             |  |
|  | [Teal Peek] |   [Pink Bottle]   | [Cyan Peek] |  |
|  |             |  Oranges & Pills  |             |  |
|  |             +-------------------+             |  |
|  +-----------------------------------------------+  |
|                                                     |
|  Women                                         30X  |
|  Multivitamin                                       |
|                                                     |
|  Women Multivitamin supports daily nutrition,       |
|  boosts energy, strengthens immunity, improves hair,|
|  skin, and nail health, and helps...more            |
|                                                     |
|  $29.99                                 [ -  2  + ] |
|                                                     |
|  +-----------------------------------------------+  |
|  |                🛍️ Buy Now                      |  |
|  +-----------------------------------------------+  |
|                      ___________                    |
+-----------------------------------------------------+
```

#### Detailed Elements:
1. **Top App Bar:**
   - **Left:** Circular back button (`<`).
   - **Center:** Brand / Category title `"Hera"` (or `"Medicine Details"`).
   - **Right:** Circular favorite heart button (`♡`).
2. **Hero Product Gallery Carousel:**
   - Centered large rounded square card (`rounded-[32px]`, `bg-[#FED4DD]` pastel blush pink).
   - Showcases the high-resolution product shot:
     - Pink multivitamin bottle labeled `"Women Multivitamin - hera."`.
     - Scattered vitamin capsules and sliced fresh oranges emphasizing natural ingredients and vitality.
   - **Multi-image Peek Indicators:** Left edge displays a curved peek of the previous teal card; right edge displays a peek of the next light cyan card, signaling an interactive swipeable carousel.
3. **Product Title & Dosage Badge:**
   - **Title (Left):** Prominent two-line bold black title:
     - `"Women"`
     - `"Multivitamin"` (24px, Font weight 700).
   - **Dosage / Unit Count Badge (Right):** `"30X"` (indicating 30 capsules / 30-day supply) in bold dark gray (16px).
4. **Description & Expandable Read More:**
   - Structured typography: *"Women Multivitamin supports daily nutrition, boosts energy, strengthens immunity, improves hair, skin, and nail health, and helps maintain overall wellness for women...more"*.
   - Includes bold/interactive `...more` affordance to expand dosage instructions, contraindications, and active ingredients.
5. **Pricing & Quantity Stepper:**
   - **Price (Left):** `"$29.99"` (Bold, 24px, slate-950).
   - **Quantity Selector (Right):** Horizontal pill container (`bg-gray-100` / `border border-gray-200`, `rounded-full`, `px-3 py-1.5`):
     - Minus button: `–`
     - Current quantity: `2` (Bold, 15px)
     - Plus button: `+` inside a small dark circular button.
6. **Primary Sticky Bottom CTA:**
   - Full-width black rounded pill button (`bg-black text-white rounded-full py-4`):
     - Centered shopping bag icon + text `"Buy Now"` (or in MediGuard context: `"Verify Medicine"` / `"Add to Verification"`).
   - Positioned above the iOS bottom gesture bar for effortless thumb reach.

---

## 4. Alignment with MediGuard Functional Requirements

According to the project specifications (`project-readme.md`), the 3 screens map directly into the core MediGuard demonstration workflows:

| Screen Design | MediGuard Core Module | Functional Integration |
| :--- | :--- | :--- |
| **Dashboard (Screen 1)** | **Main Dashboard & Hub** | - Quick actions trigger **Upload Prescription**, **Verify Purchased Medicine**, **Pharmacy Finder**, and **Dosage Reminders**.<br>- Bottom navigation provides instantaneous access to **AI Chat** (pharmacist consultation) and **Center Scan** button.<br>- Featured cards show recent or verified medications. |
| **Scan Screen (Screen 2)** | **AI Prescription Reader & Comparison** | - Serves as the primary camera/upload OCR viewfinder.<br>- The teal highlighted recommendation simulates the AI extracting medicine names and dosage (`"Yakapsule! 3x a day!"`).<br>- Circular `"75%"` progress indicator communicates real-time handwriting extraction and safety registry queries without latency confusion. |
| **Product Screen (Screen 3)** | **Medicine Information & Batch Verification** | - Displays detailed pharmacological profile, uses, precautions, and ingredients.<br>- The `"30X"` badge aligns with package count & strength checking.<br>- The bottom CTA and stepper allow users to confirm medicine batch verification or initiate the **Prescription vs. Purchased Medicine Comparison**. |

---

## 5. Micro-Interactions & Animation Guidelines

1. **Card Peeking & Carousel Transitions:**
   - Horizontal snap scrolling (`scroll-snap-type: x mandatory`).
   - Smooth scale interpolation: focused center card is `scale-100`, while peeking adjacent cards scale down to `scale-95` with `opacity-80`.
2. **Scanner Progress Animation:**
   - The circular `75%` progress ring uses an SVG stroke dash-offset animation with easing (`cubic-bezier(0.4, 0, 0.2, 1)`).
   - Pulsing viewfinder border corners while analysis is underway.
3. **Bottom Navigation & Squircle Elevation:**
   - The central black scan squircle scales down slightly on press (`active:scale-95`) with haptic feedback simulation.
4. **Quantity Stepper & CTA:**
   - Stepper provides instant numeric increments with subtle bounce animation.
   - Bottom CTA button has a full-width dark sheen on click with smooth navigation to verification/checkout screens.

---

## 6. UI Component Inventory & Design Specs

A high-level index of the UI components specified in this design system. For complete TypeScript definitions, Expo Router file architecture, NativeWind configuration, and camera hardware integrations, refer to **[technical-architecture.md](file:///c:/Users/User/Desktop/coding%20files/mediguard/technical-architecture.md)**.

### 6.1 Dashboard Components
- **`HeaderProfile`**: User avatar (circle), name label, location pin tag, and notification bell button with red unread status dot.
- **`HeroSearch`**: Dual-weight headline (`"Find Your"` light / `"Medicines Fast"` bold) with high-contrast black circular search button.
- **`QuickActionGrid`**: 2x2 grid of white rounded pill buttons (`rounded-2xl` / `rounded-full`) with outline icons (Upload, Order, Pharmacy, Reminder).
- **`MedicineCarousel`**: Horizontal snap-scroll card container featuring soft pastel mint/pink backgrounds, product photography, dosage titles, and circular action buttons.
- **`BottomNavbar`**: Floating white dock (`rounded-[36px]`, elevated drop shadow) with 5 destinations and an elevated black squircle (`rounded-[18px]`) scan button.

### 6.2 Scanner Components
- **`ScannerFrame`**: Camera viewfinder container with rounded cyan/teal bracket borders framing the prescription or packaging.
- **`HandwritingDisplay`**: Realistic cursive script formatting using handwritten fonts (Caveat/Kalam) to display extracted patient concerns and doctor recommendations.
- **`StatusIndicator`**: Reassuring helper text showing live AI OCR analysis feedback.
- **`ProgressDial`**: Centered circular 75% loading ring with high-contrast background and turquoise stroke progress arc.
- **`CameraToolbar`**: Balanced 3-control bottom bar: photo gallery picker (left), progress/shutter dial (center), and flash toggle (right).

### 6.3 Product & Medicine Details Components
- **`ProductGallery`**: Hero card with pastel blush background (`#FED4DD`), centered medicine bottle, citrus props, and peeking adjacent cards.
- **`DosageBadge`**: High-emphasis unit badge (`30X`) positioned alongside the product name.
- **`ExpandableDescription`**: Truncated clinical/nutritional copy with an interactive `...more` affordance.
- **`QuantityStepper`**: Pill-shaped counter (`[- 2 +]`) with haptic feedback.
- **`StickyCTA`**: Full-width black rounded pill button (`Buy Now` / `Verify Medicine`) positioned at the bottom safe-area margin.

---
*Document maintained as the visual UI/UX & Design System specification for MEDIGUARD.*
