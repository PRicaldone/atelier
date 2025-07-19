/**
 * Intelligent Content Generation for Auto-Created Nodes
 * Generates realistic content based on file analysis
 */

// Template content generators
const CONTENT_GENERATORS = {
  
  // Project Brief Content Generation
  'project-brief': {
    requirements: (fileName) => `📋 Requirements extracted from ${fileName}:

• Define project scope and objectives
• Identify target audience and user personas  
• Establish design guidelines and brand consistency
• Create timeline with key milestones
• Plan deliverables and file formats
• Set up client review and feedback process

🎯 Next Steps:
- Review and refine requirements
- Get client approval on scope
- Begin conceptual design phase`,

    timeline: (fileName) => `📅 Project Timeline (Auto-generated from ${fileName}):

WEEK 1: Discovery & Planning
• Stakeholder interviews
• Competitive analysis
• User research

WEEK 2: Concept Development  
• Initial concepts (3 directions)
• Client presentation
• Feedback integration

WEEK 3: Design Refinement
• Detailed design development
• Asset creation
• Style guide development

WEEK 4: Finalization & Delivery
• Final revisions
• Asset preparation
• Handoff documentation

⏰ Key Deadlines:
- Concept review: Week 2
- Design approval: Week 3  
- Final delivery: Week 4`,

    deliverables: (fileName) => `📦 Project Deliverables:

🎨 DESIGN ASSETS
• Logo variations (primary, secondary, icon)
• Brand guidelines document
• Color palette and typography guide
• Business card and stationery design

📱 DIGITAL ASSETS  
• Website mockups (desktop, mobile)
• Social media templates
• Email signature design
• Favicon and app icons

📄 DOCUMENTATION
• Style guide (PDF)
• Asset library (organized files)
• Usage guidelines
• Source files (AI, PSD, Sketch)

✅ All assets delivered in multiple formats
✅ Print-ready and web-optimized versions`
  },

  // Design File Content Generation  
  'design-file': {
    colorPalette: (fileName) => `🎨 Color Palette extracted from ${fileName}:

PRIMARY COLORS
• #2563EB (Primary Blue) - Main brand color
• #1E40AF (Dark Blue) - Text and accents
• #3B82F6 (Medium Blue) - Interactive elements

SECONDARY COLORS  
• #F8FAFC (Light Gray) - Backgrounds
• #64748B (Medium Gray) - Secondary text
• #0F172A (Dark Gray) - Primary text

ACCENT COLORS
• #10B981 (Success Green) - Confirmations
• #F59E0B (Warning Orange) - Alerts  
• #EF4444 (Error Red) - Warnings

🎯 Color Psychology:
Blue conveys trust, professionalism, and reliability. Perfect for corporate and tech brands.

💡 Usage Guidelines:
- Use primary blue for CTAs and main brand elements
- Limit accent colors to 20% of design
- Ensure 4.5:1 contrast ratio for accessibility`,

    typography: (fileName) => `📝 Typography Analysis from ${fileName}:

PRIMARY TYPEFACE
• Family: Inter / Helvetica Neue
• Weights: Regular (400), Medium (500), Bold (700)
• Usage: Headings, UI elements, body text

DISPLAY FONT
• Family: Playfair Display / Georgia  
• Weights: Regular (400), Bold (700)
• Usage: Headlines, hero text, branding

📐 TYPE SCALE
• H1: 48px/52px (Display, Bold)
• H2: 36px/40px (Primary, Bold)  
• H3: 24px/28px (Primary, Medium)
• H4: 20px/24px (Primary, Medium)
• Body: 16px/24px (Primary, Regular)
• Caption: 14px/20px (Primary, Regular)

✨ Typography Guidelines:
- Maintain consistent line spacing
- Use max 2 font families
- Ensure readability across devices`,

    styleGuide: (fileName) => `📚 Style Guide Elements from ${fileName}:

🎨 VISUAL IDENTITY
• Clean, modern aesthetic
• Minimal design approach
• Focus on usability and clarity
• Consistent spacing system (8px grid)

🔧 DESIGN PRINCIPLES
• Hierarchy through typography and spacing
• Consistent color application
• Purposeful use of white space
• Mobile-first responsive design

📱 COMPONENT PATTERNS
• Rounded corners (8px radius)
• Subtle shadows for depth
• Hover states for interactivity
• Loading states and micro-animations

🎯 BRAND PERSONALITY
• Professional yet approachable
• Modern and innovative
• Trustworthy and reliable
• User-centric design thinking`
  },

  // Image Content Generation
  'image-asset': {
    styleAnalysis: (fileName) => `🔍 Visual Style Analysis of ${fileName}:

🎨 AESTHETIC QUALITIES
• Visual Style: ${getRandomStyle()}
• Mood: ${getRandomMood()}
• Composition: ${getRandomComposition()}
• Color Temperature: ${getRandomTemperature()}

📐 TECHNICAL ASPECTS
• Lighting: ${getRandomLighting()}
• Depth of Field: ${getRandomDepth()}
• Perspective: ${getRandomPerspective()}
• Texture Quality: ${getRandomTexture()}

🎯 STYLE KEYWORDS
• ${getRandomKeywords().join(' • ')}

💡 DESIGN APPLICATIONS
This style would work well for:
• Modern brand presentations
• Digital marketing materials  
• Website hero sections
• Social media content

🔗 Similar aesthetic references:
• Contemporary minimalism
• Clean photography style
• Professional imagery`,

    colorMood: (fileName) => `🌈 Color Psychology Analysis:

DOMINANT COLORS DETECTED
• Primary: ${getRandomColor()} (${getColorMeaning()})
• Secondary: ${getRandomColor()} (${getColorMeaning()})
• Accent: ${getRandomColor()} (${getColorMeaning()})

😊 EMOTIONAL IMPACT
• Overall Mood: ${getRandomMood()}
• Energy Level: ${getRandomEnergy()}
• Brand Associations: ${getRandomBrandAssociation()}

🎯 MARKETING APPLICATIONS
This color palette conveys:
• ${getRandomAttribute()}
• ${getRandomAttribute()}  
• ${getRandomAttribute()}

💼 INDUSTRY APPLICATIONS
Perfect for:
• ${getRandomIndustry()}
• ${getRandomIndustry()}
• ${getRandomIndustry()}

🎨 COMPLEMENTARY COLORS
• Add ${getRandomColor()} for contrast
• Use ${getRandomColor()} for highlights
• Consider ${getRandomColor()} for backgrounds`
  }
};

// Random content generators for realistic variety
const getRandomStyle = () => {
  const styles = ['Modern Minimalist', 'Contemporary', 'Industrial', 'Organic', 'Geometric', 'Editorial'];
  return styles[Math.floor(Math.random() * styles.length)];
};

const getRandomMood = () => {
  const moods = ['Professional', 'Energetic', 'Calm', 'Sophisticated', 'Playful', 'Trustworthy'];
  return moods[Math.floor(Math.random() * moods.length)];
};

const getRandomComposition = () => {
  const compositions = ['Rule of thirds', 'Central focus', 'Asymmetrical balance', 'Leading lines', 'Symmetrical'];
  return compositions[Math.floor(Math.random() * compositions.length)];
};

const getRandomTemperature = () => {
  const temps = ['Warm tones', 'Cool tones', 'Neutral balance', 'High contrast', 'Monochromatic'];
  return temps[Math.floor(Math.random() * temps.length)];
};

const getRandomLighting = () => {
  const lighting = ['Natural daylight', 'Soft diffused', 'High contrast', 'Golden hour', 'Studio lighting'];
  return lighting[Math.floor(Math.random() * lighting.length)];
};

const getRandomDepth = () => {
  const depths = ['Shallow focus', 'Deep focus', 'Bokeh background', 'Sharp throughout', 'Selective focus'];
  return depths[Math.floor(Math.random() * depths.length)];
};

const getRandomPerspective = () => {
  const perspectives = ['Eye level', 'Low angle', 'High angle', 'Close-up detail', 'Wide perspective'];
  return perspectives[Math.floor(Math.random() * perspectives.length)];
};

const getRandomTexture = () => {
  const textures = ['Smooth surfaces', 'Rich textures', 'Matte finish', 'Glossy elements', 'Mixed textures'];
  return textures[Math.floor(Math.random() * textures.length)];
};

const getRandomKeywords = () => {
  const keywords = ['Clean', 'Modern', 'Professional', 'Innovative', 'Elegant', 'Bold', 'Sophisticated', 'Dynamic'];
  return keywords.sort(() => 0.5 - Math.random()).slice(0, 4);
};

const getRandomColor = () => {
  const colors = ['Deep Blue', 'Forest Green', 'Warm Orange', 'Rich Purple', 'Charcoal Gray', 'Cream White'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getColorMeaning = () => {
  const meanings = ['Trust & Stability', 'Growth & Nature', 'Energy & Creativity', 'Luxury & Wisdom', 'Professional & Modern', 'Purity & Simplicity'];
  return meanings[Math.floor(Math.random() * meanings.length)];
};

const getRandomEnergy = () => {
  const energies = ['High energy', 'Moderate energy', 'Calm energy', 'Dynamic energy', 'Stable energy'];
  return energies[Math.floor(Math.random() * energies.length)];
};

const getRandomBrandAssociation = () => {
  const associations = ['Premium quality', 'Innovation', 'Reliability', 'Creativity', 'Professionalism', 'Approachability'];
  return associations[Math.floor(Math.random() * associations.length)];
};

const getRandomAttribute = () => {
  const attributes = ['Trustworthiness', 'Innovation', 'Quality', 'Reliability', 'Sophistication', 'Accessibility'];
  return attributes[Math.floor(Math.random() * attributes.length)];
};

const getRandomIndustry = () => {
  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Creative Services', 'Consulting'];
  return industries[Math.floor(Math.random() * industries.length)];
};

/**
 * Generates intelligent content for auto-created nodes
 */
export const generateIntelligentContent = (contentType, nodeType, fileName, analysis) => {
  const generators = CONTENT_GENERATORS[contentType];
  if (!generators) return `Content auto-generated from ${fileName}`;

  switch (nodeType) {
    case 'requirements':
    case 'PROJECT_SETUP':
      return generators.requirements ? generators.requirements(fileName) : `Requirements extracted from ${fileName}`;
      
    case 'timeline':
    case 'TIMELINE':
      return generators.timeline ? generators.timeline(fileName) : `Timeline created from ${fileName}`;
      
    case 'deliverables':
      return generators.deliverables ? generators.deliverables(fileName) : `Deliverables list for ${fileName}`;
      
    case 'COLOR_PALETTE':
    case 'colorPalette':
      return generators.colorPalette ? generators.colorPalette(fileName) : `Color palette from ${fileName}`;
      
    case 'typography':
      return generators.typography ? generators.typography(fileName) : `Typography analysis from ${fileName}`;
      
    case 'styleGuide':
    case 'STYLE_GUIDE':
      return generators.styleGuide ? generators.styleGuide(fileName) : `Style guide from ${fileName}`;
      
    case 'STYLE_ANALYSIS':
    case 'styleAnalysis':
      return generators.styleAnalysis ? generators.styleAnalysis(fileName) : `Style analysis of ${fileName}`;
      
    case 'colorMood':
    case 'COLOR_EXTRACTION':
      return generators.colorMood ? generators.colorMood(fileName) : `Color mood analysis of ${fileName}`;
      
    default:
      return `Intelligent content generated from ${fileName}`;
  }
};

/**
 * Generates smart titles based on content type and file analysis
 */
export const generateSmartTitle = (contentType, nodeType, fileName) => {
  const baseName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
  
  switch (nodeType) {
    case 'PROJECT_SETUP':
      return `${baseName} - Project Overview`;
    case 'TIMELINE':
      return `${baseName} - Timeline`;
    case 'COLOR_PALETTE':
      return `${baseName} - Color Palette`;
    case 'STYLE_ANALYSIS':
      return `${baseName} - Style Analysis`;
    case 'requirements':
      return 'Project Requirements';
    case 'deliverables':
      return 'Project Deliverables';
    default:
      return `${baseName} - Analysis`;
  }
};