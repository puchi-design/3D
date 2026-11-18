import {
  CadParams,
  FaqItem,
  GeometryCheckItem,
  GuideArticle,
  PageSeoMeta,
  PartKind,
  ToolPageConfig,
  VerifiedCase,
} from '../types/cad';

export const IMAGES = {
  workshopHero: '/src/assets/images/cad_engineering_desk_1795029741447.jpg',
  enclosureCase: '/src/assets/images/enclosure_prototype_photo_1795029741301.jpg',
  phoneStandCase: '/src/assets/images/phone_stand_prototype_1795029741674.jpg',
  chassisCase: '/src/assets/images/robot_chassis_prototype_1795029746785.jpg',
};

export const PAGE_SEO: Record<string, PageSeoMeta> = {
  '/': {
    title: 'SolidCraft – AI Parametric CAD Generator for STEP & STL Parts',
    description:
      'Describe mechanical parts in plain English, inspect 3D dimensions, refine parametric constraints, and export STEP or STL files with SolidCraft.',
  },
  '/text-to-cad': {
    title: 'Text to CAD – Turn Part Descriptions into Parametric 3D Models | SolidCraft',
    description:
      'Learn how SolidCraft translates natural-language part specs, dimensions, and mounting requirements into editable parametric CAD assemblies.',
  },
  '/parametric-cad': {
    title: 'AI Parametric CAD – Editable Dimensions & Conversational Revisions | SolidCraft',
    description:
      'Adjust wall thickness, hole diameter, clearance, and geometry constraints directly or through follow-up prompts without losing design intent.',
  },
  '/tools': {
    title: 'CAD Generators – Part-Specific Parametric Tools | SolidCraft',
    description:
      'Browse dedicated SolidCraft CAD generators for electronics enclosures, storage boxes, phone stands, robot chassis, brackets, and Raspberry Pi cases.',
  },
  '/examples': {
    title: 'Verified AI CAD Examples – Real Prompts, Revisions & STEP/STL | SolidCraft',
    description:
      'Inspect verified repository CAD examples including an electronics enclosure, phone stand, and robot chassis with full parameters and revision logs.',
  },
  '/guides': {
    title: 'CAD & 3D Printing Guides – Tolerances, STEP vs STL & Wall Rules | SolidCraft',
    description:
      'Practical engineering guides on clearance selection, importing STEP files into Fusion 360 or FreeCAD, and preparing STL meshes for 3D printing.',
  },
};

export const VERIFIED_CASES: VerifiedCase[] = [
  {
    id: 'enclosure',
    slug: 'electronics-enclosure',
    title: 'Electronics Project Enclosure',
    provenance: 'Verified Repository Case · Reference Build',
    summary:
      'Two-piece rectangular housing with bottom tray, stepped alignment lip, four internal PCB mounting standoffs, and recessed M3 lid screw holes.',
    imagePath: IMAGES.enclosureCase,
    imageAlt:
      '3D printed matte slate electronics enclosure with removable top lid and four brass-ready standoffs',
    originalPrompt:
      'Create an electronics enclosure measuring 100 mm long, 66 mm wide, and 28 mm tall, with 3 mm wall thickness, a removable top lid, and four internal mounting standoffs.',
    followUpPrompt:
      'Change the top lid screw hole diameter to 3.6 mm, while keeping wall thickness and standoff positions unchanged.',
    followUpSummary:
      'Updated lid clearance bores from 3.2 mm to 3.6 mm for M3 slip fit. Bottom wall (3.0 mm), outer envelope (100 × 66 × 28 mm), and corner boss spacing stayed locked.',
    components: [
      'Bottom Housing Shell (3.0 mm wall)',
      'Stepped Top Lid with Alignment Lip',
      '4× Internal Corner Standoffs (12 mm height)',
      '4× Countersunk Lid Clearance Bores',
      'Side USB / I/O Cable Pass-Through Slot',
    ],
    params: {
      length: 100,
      width: 66,
      height: 28,
      wallThickness: 3.0,
      holeDiameter: 3.6,
      cornerRadius: 4.0,
      clearance: 0.25,
      angle: 0,
      standoffCount: 4,
      hasLid: true,
    },
    versions: [
      {
        version: 'v1.0',
        label: 'Initial Shell',
        originNote: 'Verified Baseline Snapshot',
        promptOrChange:
          'Generated 100 × 66 × 28 mm housing with 3.0 mm wall, 4 standoffs, and 3.2 mm lid holes.',
        params: {
          length: 100,
          width: 66,
          height: 28,
          wallThickness: 3.0,
          holeDiameter: 3.2,
          cornerRadius: 4.0,
          clearance: 0.2,
          angle: 0,
          standoffCount: 4,
          hasLid: true,
        },
      },
      {
        version: 'v1.1',
        label: 'Lid Fit & M3 Clearance',
        originNote: 'Verified Follow-up Snapshot',
        promptOrChange:
          'Increased lid screw bore to 3.6 mm and lid lip clearance to 0.25 mm for reliable FDM assembly.',
        params: {
          length: 100,
          width: 66,
          height: 28,
          wallThickness: 3.0,
          holeDiameter: 3.6,
          cornerRadius: 4.0,
          clearance: 0.25,
          angle: 0,
          standoffCount: 4,
          hasLid: true,
        },
      },
    ],
    files: {
      stepName: 'enclosure_100x66x28_v1_1.step',
      stlName: 'enclosure_100x66x28_v1_1.stl',
      stepSizeKb: 142,
      stlTriangles: 8420,
    },
  },
  {
    id: 'phoneStand',
    slug: 'desk-phone-stand',
    title: 'Angled Desktop Phone Stand',
    provenance: 'Verified Repository Case · Reference Build',
    summary:
      'Single-piece print-in-place phone cradle combining a flat weighted footprint, 64-degree inclined backrest, gusseted side ribs, and front retention lip.',
    imagePath: IMAGES.phoneStandCase,
    imageAlt:
      'Minimalist silver-gray 3D printed angled phone stand with front retention lip on a studio desk',
    originalPrompt:
      'Design a desktop phone stand with an 88 × 78 mm base, a 64-degree backrest tilted for desk viewing, a 14 mm front lip, and 4 mm thick structural walls.',
    followUpPrompt:
      'Raise the backrest height to 112 mm and soften the outer corners to a 5 mm radius without changing the 64-degree tilt.',
    followUpSummary:
      'Backrest vertical reach increased from 96 mm to 112 mm and edge fillets adjusted to 5.0 mm. Tilt angle (64°) and base footprint (88 × 78 mm) remained fixed.',
    components: [
      'Weighted Base Plate (88 × 78 mm)',
      '64° Angled Backrest Support',
      'Front Retention Lip (14 mm)',
      'Rear Triangular Reinforcement Ribs',
      'Lower Charging Cable Notch',
    ],
    params: {
      length: 88,
      width: 78,
      height: 112,
      wallThickness: 4.0,
      holeDiameter: 0,
      cornerRadius: 5.0,
      clearance: 0.3,
      angle: 64,
      standoffCount: 2,
      hasLid: false,
    },
    versions: [
      {
        version: 'v1.0',
        label: 'Compact Cradle',
        originNote: 'Verified Baseline Snapshot',
        promptOrChange:
          'Initial 88 × 78 × 96 mm stand at 64° tilt with 3 mm corner fillets.',
        params: {
          length: 88,
          width: 78,
          height: 96,
          wallThickness: 4.0,
          holeDiameter: 0,
          cornerRadius: 3.0,
          clearance: 0.3,
          angle: 64,
          standoffCount: 2,
          hasLid: false,
        },
      },
      {
        version: 'v1.1',
        label: 'Tall Backrest Revision',
        originNote: 'Verified Follow-up Snapshot',
        promptOrChange:
          'Extended backrest height to 112 mm for larger phones and increased fillet radius to 5.0 mm.',
        params: {
          length: 88,
          width: 78,
          height: 112,
          wallThickness: 4.0,
          holeDiameter: 0,
          cornerRadius: 5.0,
          clearance: 0.3,
          angle: 64,
          standoffCount: 2,
          hasLid: false,
        },
      },
    ],
    files: {
      stepName: 'phone_stand_64deg_v1_1.step',
      stlName: 'phone_stand_64deg_v1_1.stl',
      stepSizeKb: 94,
      stlTriangles: 5180,
    },
  },
  {
    id: 'chassis',
    slug: 'robot-car-chassis',
    title: 'Modular Robot Car Chassis',
    provenance: 'Verified Repository Case · Reference Build',
    summary:
      'Rigid 5 mm deck plate with slotted sensor mounting rails, twin upright axle support brackets, 8 mm shaft bores, and rear caster mount holes.',
    imagePath: IMAGES.chassisCase,
    imageAlt:
      'Custom 3D printed slate robotics car chassis deck plate with upright axle brackets and shaft bore',
    originalPrompt:
      'Build a small robot car chassis plate 160 mm long and 112 mm wide, 5 mm thick, with two upright axle brackets featuring 8 mm shaft bores 26 mm above the deck.',
    followUpPrompt:
      'Open the shaft bore diameter to 8.4 mm for bearing clearance and add M4 mounting slots along the front deck.',
    followUpSummary:
      'Axle bracket bores expanded from 8.0 mm to 8.4 mm for slip-fit bushings while preserving bracket spacing, deck thickness (5.0 mm), and 26 mm shaft height.',
    components: [
      'Main Deck Plate (160 × 112 × 5 mm)',
      'Left & Right Upright Axle Brackets',
      'Reinforced Shaft Bore Collars (8.4 mm)',
      'Controller & Battery Mounting Slots',
      'Front Sensor & Rear Caster Hole Array',
    ],
    params: {
      length: 160,
      width: 112,
      height: 36,
      wallThickness: 5.0,
      holeDiameter: 8.4,
      cornerRadius: 6.0,
      clearance: 0.4,
      angle: 90,
      standoffCount: 4,
      hasLid: false,
    },
    versions: [
      {
        version: 'v1.0',
        label: 'Nominal 8.0 mm Bore',
        originNote: 'Verified Baseline Snapshot',
        promptOrChange:
          'Generated 160 × 112 mm deck plate (5 mm thick) with 8.0 mm nominal shaft bores.',
        params: {
          length: 160,
          width: 112,
          height: 36,
          wallThickness: 5.0,
          holeDiameter: 8.0,
          cornerRadius: 6.0,
          clearance: 0.25,
          angle: 90,
          standoffCount: 4,
          hasLid: false,
        },
      },
      {
        version: 'v1.1',
        label: 'Bearing Clearance Update',
        originNote: 'Verified Follow-up Snapshot',
        promptOrChange:
          'Adjusted shaft bore to 8.4 mm and widened clearance tolerance to 0.4 mm.',
        params: {
          length: 160,
          width: 112,
          height: 36,
          wallThickness: 5.0,
          holeDiameter: 8.4,
          cornerRadius: 6.0,
          clearance: 0.4,
          angle: 90,
          standoffCount: 4,
          hasLid: false,
        },
      },
    ],
    files: {
      stepName: 'robot_chassis_160x112_v1_1.step',
      stlName: 'robot_chassis_160x112_v1_1.stl',
      stepSizeKb: 168,
      stlTriangles: 9640,
    },
  },
];

export const TOOL_PAGES: ToolPageConfig[] = [
  {
    id: 'enclosure',
    route: '/enclosure-generator',
    name: '3D Printed Enclosure Generator',
    shortName: 'Enclosure',
    seoTitle: '3D Printed Enclosure Generator – Custom Electronics Box CAD | SolidCraft',
    h1: '3D Printed Electronics Enclosure Generator',
    seoDescription:
      'Generate custom 3D printed electronics enclosures with removable lids, internal PCB standoffs, screw bores, and fit clearance. Export STEP and STL.',
    targetTopic: '3D printed enclosure generator',
    caseStatus: 'Verified Repository Case',
    summary:
      'Describe PCB dimensions, wall thickness, standoff layout, and lid screw sizes to generate a two-piece enclosure ready for 3D printing or downstream CAD edits.',
    useCases: [
      'Custom housings for ESP32, Arduino, STM32, and sensor carrier boards',
      'Benchtop instrument cases with removable top service lids',
      'Small-batch field test enclosures requiring M2.5 or M3 fasteners',
    ],
    supportedScope: [
      'Outer length, width, and height in millimeters',
      'Uniform perimeter wall and floor thickness (1.6 – 6.0 mm)',
      'Stepped alignment lip with configurable lid fit clearance',
      'Corner mounting standoffs with lid clearance screw holes',
    ],
    promptExample:
      'Generate an electronics enclosure 100 mm long, 66 mm wide, and 28 mm high with 3 mm walls, a removable top lid, and four internal mounting standoffs.',
    followUpExample: {
      prompt: 'Change the lid screw hole diameter to 3.6 mm while keeping wall thickness and standoff positions unchanged.',
      outcome: 'Lid screw bores updated to 3.6 mm (M3 loose clearance); walls remain 3.0 mm.',
      patch: { holeDiameter: 3.6, clearance: 0.25 },
    },
    defaultParams: {
      length: 100,
      width: 66,
      height: 28,
      wallThickness: 3.0,
      holeDiameter: 3.2,
      cornerRadius: 4.0,
      clearance: 0.2,
      angle: 0,
      standoffCount: 4,
      hasLid: true,
    },
    controls: [
      { key: 'length', label: 'Outer Length', unit: 'mm', min: 60, max: 180, step: 2, description: 'Overall X-axis housing length including side walls.' },
      { key: 'width', label: 'Outer Width', unit: 'mm', min: 45, max: 130, step: 2, description: 'Overall Z-axis housing width including side walls.' },
      { key: 'height', label: 'Total Height', unit: 'mm', min: 18, max: 65, step: 1, description: 'Combined height of bottom tray and fitted lid.' },
      { key: 'wallThickness', label: 'Wall Thickness', unit: 'mm', min: 1.6, max: 5.0, step: 0.2, description: 'Shell thickness for side walls and base floor.' },
      { key: 'holeDiameter', label: 'Lid Screw Hole Ø', unit: 'mm', min: 2.2, max: 5.5, step: 0.1, description: 'Clearance bore through the top lid for M2.5–M5 screws.' },
      { key: 'clearance', label: 'Lid Fit Clearance', unit: 'mm', min: 0.1, max: 0.6, step: 0.05, description: 'Radial gap between lid alignment lip and inner housing wall.' },
      { key: 'cornerRadius', label: 'Corner Fillet', unit: 'mm', min: 1, max: 10, step: 0.5, description: 'Outer vertical corner rounding radius.' },
    ],
    steps: [
      { title: '01. Measure PCB & Connectors', detail: 'Enter outer board clearance plus allowance for cables or heat-set inserts.' },
      { title: '02. Review Wall & Clearance Checks', detail: 'Verify lid gap (0.20–0.30 mm typical for FDM) and boss wall margin.' },
      { title: '03. Iterate via Follow-Up Prompt', detail: 'Adjust screw bore or height without resetting standoff coordinates.' },
      { title: '04. Export STEP or STL', detail: 'Download STL for direct slicing or STEP to cut custom port openings in Fusion or FreeCAD.' },
    ],
    faqs: [
      {
        question: 'Can I 3D print the generated enclosure directly?',
        answer: 'Yes. Exporting as STL gives you separate watertight bodies for the bottom tray and top lid positioned flat for support-free FDM printing.',
      },
      {
        question: 'What lid clearance and screw hole diameter should I pick?',
        answer: 'For standard 0.4 mm nozzle FDM printers, a 0.20–0.25 mm radial lid clearance provides a snug slip fit. Use 3.4–3.6 mm holes for M3 clearance or 2.8 mm for self-tapping.',
      },
      {
        question: 'Can I import the STEP file into Fusion 360 or Onshape?',
        answer: 'Yes. The STEP file delivers exact B-Rep solid bodies for the tray and lid so you can sketch and cut custom connector openings, though it does not preserve native parametric feature history.',
      },
    ],
    relatedRoutes: [
      { label: 'Box & Lid Generator', route: '/box-generator', note: 'Simpler storage enclosures without internal PCB bosses' },
      { label: 'Raspberry Pi Case Generator', route: '/raspberry-pi-case-generator', note: 'Board-specific port and ventilation presets' },
      { label: 'Tolerance & Clearance Guide', route: '/guides', note: 'Recommended FDM clearances for lids and fasteners' },
    ],
  },
  {
    id: 'box',
    route: '/box-generator',
    name: '3D Print Box & Lid Generator',
    shortName: 'Box & Lid',
    seoTitle: '3D Print Box Generator – Custom Parametric Box with Lid | SolidCraft',
    h1: 'Custom 3D Print Box & Lid Generator',
    seoDescription:
      'Design parametric 3D printable boxes and fitted lids with exact inner or outer dimensions, wall thickness, and mating clearance in STEP and STL.',
    targetTopic: '3D print box generator',
    caseStatus: 'Planned Parametric Template',
    summary:
      'Create utility boxes, organizer trays, and protective storage containers where exact internal cavity dimensions and lid mating clearance are controlled parametrically.',
    useCases: [
      'Component organizers sized to drawer dividers or hardware kits',
      'Protective travel boxes for lenses, SD cards, or calibration tools',
      'Modular workshop bins with chamfered stacking bases',
    ],
    supportedScope: [
      'Configurable outer envelope and inner usable cavity volume',
      'Independent wall thickness and reinforced floor thickness',
      'Snap-lip or inset lid fit clearance control',
      'Corner fillet radius for clean outer ergonomics',
    ],
    promptExample:
      'Generate a rectangular storage box 110 mm long, 72 mm wide, and 34 mm tall with 2.4 mm walls, a fitted inset lid, and 0.25 mm lid clearance.',
    followUpExample: {
      prompt: 'Increase wall thickness to 3.2 mm and round the outer corners to 6 mm while keeping the 110 × 72 mm footprint.',
      outcome: 'Walls thickened to 3.2 mm and outer fillet raised to 6.0 mm; outer envelope preserved.',
      patch: { wallThickness: 3.2, cornerRadius: 6.0 },
    },
    defaultParams: {
      length: 110,
      width: 72,
      height: 34,
      wallThickness: 2.4,
      holeDiameter: 0,
      cornerRadius: 4.0,
      clearance: 0.25,
      angle: 0,
      standoffCount: 0,
      hasLid: true,
    },
    controls: [
      { key: 'length', label: 'Box Length', unit: 'mm', min: 50, max: 200, step: 2, description: 'Outer X-axis length of the container.' },
      { key: 'width', label: 'Box Width', unit: 'mm', min: 40, max: 150, step: 2, description: 'Outer Z-axis width of the container.' },
      { key: 'height', label: 'Box Height', unit: 'mm', min: 16, max: 90, step: 2, description: 'Assembled height including fitted lid.' },
      { key: 'wallThickness', label: 'Wall Thickness', unit: 'mm', min: 1.6, max: 5.0, step: 0.2, description: 'Perimeter wall thickness; should be a multiple of nozzle line width.' },
      { key: 'clearance', label: 'Lid Fit Clearance', unit: 'mm', min: 0.1, max: 0.6, step: 0.05, description: 'Gap between lid skirt and box inner rim.' },
      { key: 'cornerRadius', label: 'Corner Radius', unit: 'mm', min: 1, max: 12, step: 0.5, description: 'Outer edge fillet radius.' },
    ],
    steps: [
      { title: '01. Define Target Cavity', detail: 'Specify outer length, width, and height based on what the box will hold.' },
      { title: '02. Tune Wall & Lid Clearance', detail: 'Set wall thickness to a clean multiple of your 0.4 mm nozzle (e.g., 2.4 mm).' },
      { title: '03. Inspect Exploded Fit', detail: 'Use the 3D Explode slider to verify the lid lip seats cleanly inside the rim.' },
      { title: '04. Download STEP or STL', detail: 'Export STL to print immediately or STEP for embossing labels in CAD.' },
    ],
    faqs: [
      {
        question: 'How is this different from the Electronics Enclosure Generator?',
        answer: 'The Box Generator omits internal PCB standoffs, screw bosses, and cable cutouts so you get an unobstructed internal storage cavity.',
      },
      {
        question: 'What lid clearance works best for PLA and PETG?',
        answer: 'Start at 0.20–0.25 mm for a snug friction fit in PLA, or 0.30 mm for PETG which tends to string slightly at mating edges.',
      },
      {
        question: 'What is the difference between STEP and STL here?',
        answer: 'STL is a triangle mesh ready for your slicer. STEP exports exact smooth analytical surfaces for importing into Fusion, SolidWorks, or Onshape.',
      },
    ],
    relatedRoutes: [
      { label: 'Electronics Enclosure Generator', route: '/enclosure-generator', note: 'Includes PCB standoffs and screw holes' },
      { label: 'STEP vs STL Guide', route: '/guides', note: 'When to slice STL vs edit STEP solids' },
    ],
  },
  {
    id: 'phoneStand',
    route: '/phone-stand-generator',
    name: 'Parametric Phone Stand Generator',
    shortName: 'Phone Stand',
    seoTitle: 'Parametric Phone Stand Generator – Custom Angle & Lip CAD | SolidCraft',
    h1: 'Parametric 3D Printable Phone Stand Generator',
    seoDescription:
      'Generate custom angled phone stands with adjustable backrest tilt, base footprint, front lip height, and wall thickness. Verified case + STEP & STL export.',
    targetTopic: 'phone stand generator',
    caseStatus: 'Verified Repository Case',
    summary:
      'Configure viewing angle, phone thickness ledge clearance, backrest height, and structural rib thickness to produce a stable, print-ready desk stand.',
    useCases: [
      'Ergonomic video call stands tuned to desk eye height',
      'Thick-case smartphone docks with front retention lip',
      'Compact travel stands printed in PETG or matte PLA',
    ],
    supportedScope: [
      'Base footprint length and width for anti-tip stability',
      'Backrest tilt angle (45° to 78°)',
      'Backrest vertical reach and front ledge clearance',
      'Reinforced triangular side gusset ribs',
    ],
    promptExample:
      'Design a desktop phone stand with an 88 × 78 mm base, a 64-degree backrest, a 14 mm front lip, and 4 mm thick structural walls.',
    followUpExample: {
      prompt: 'Raise the backrest height to 112 mm and increase corner radius to 5 mm without changing the 64-degree tilt.',
      outcome: 'Backrest extended to 112 mm for larger phones; tilt locked at 64°.',
      patch: { height: 112, cornerRadius: 5.0 },
    },
    defaultParams: {
      length: 88,
      width: 78,
      height: 112,
      wallThickness: 4.0,
      holeDiameter: 0,
      cornerRadius: 5.0,
      clearance: 0.3,
      angle: 64,
      standoffCount: 2,
      hasLid: false,
    },
    controls: [
      { key: 'width', label: 'Stand Width', unit: 'mm', min: 55, max: 110, step: 2, description: 'Lateral width supporting the device.' },
      { key: 'length', label: 'Base Depth', unit: 'mm', min: 65, max: 120, step: 2, description: 'Front-to-back footprint length preventing backward tipping.' },
      { key: 'height', label: 'Backrest Height', unit: 'mm', min: 75, max: 145, step: 2, description: 'Total support height behind the phone.' },
      { key: 'angle', label: 'Backrest Tilt Angle', unit: '°', min: 45, max: 78, step: 1, description: 'Recline angle measured from horizontal desk plane.' },
      { key: 'wallThickness', label: 'Plate Thickness', unit: 'mm', min: 2.8, max: 6.0, step: 0.2, description: 'Thickness of backrest, base, and gusset ribs.' },
      { key: 'cornerRadius', label: 'Edge Fillet', unit: 'mm', min: 1, max: 8, step: 0.5, description: 'Corner rounding for smooth desk contact.' },
    ],
    steps: [
      { title: '01. Set Viewing Angle', detail: 'Choose 60°–68° for typical desk viewing or 50° for lower desk setups.' },
      { title: '02. Check Base-to-Height Ratio', detail: 'SolidCraft flags shallow base footprints that could tip under heavy phones.' },
      { title: '03. Fine-Tune Thickness', detail: '3.6–4.4 mm plates provide crisp rigidity with 20% gyroid infill.' },
      { title: '04. Print on Side Profile', detail: 'Export STL and orient flat on its side face for zero overhangs.' },
    ],
    faqs: [
      {
        question: 'Does this phone stand require 3D printing supports?',
        answer: 'No. Printing the stand rotated onto its flat side profile eliminates overhangs on the backrest and front retention lip.',
      },
      {
        question: 'How do I make sure it fits a bulky protective phone case?',
        answer: 'Adjust the base depth and ledge allowance; our default front retention channel accommodates cases up to 14 mm thick.',
      },
      {
        question: 'Can I modify the stand in Fusion 360 afterward?',
        answer: 'Yes. Export the STEP file to add custom MagSafe puck pockets or embossed monograms cleanly on planar faces.',
      },
    ],
    relatedRoutes: [
      { label: 'Verified CAD Examples', route: '/examples', note: 'Inspect the reference phone stand revision log' },
      { label: 'Custom Bracket Generator', route: '/bracket-generator', note: 'Parametric angled mounting plates' },
    ],
  },
  {
    id: 'chassis',
    route: '/chassis-generator',
    name: 'Robot Car Chassis Generator',
    shortName: 'Robot Chassis',
    seoTitle: 'Robot Car Chassis Generator – Parametric Axle & Deck CAD | SolidCraft',
    h1: 'Parametric Robot Car Chassis Generator',
    seoDescription:
      'Generate custom robotics car chassis plates with upright axle brackets, shaft bore tolerances, and controller mounting slots. Verified build + STEP & STL.',
    targetTopic: 'robot car chassis generator',
    caseStatus: 'Verified Repository Case',
    summary:
      'Create rigid robotics platform decks with configurable length, width, deck thickness, dual axle support brackets, and precision bearing/shaft bore diameters.',
    useCases: [
      'Differential-drive Arduino and Raspberry Pi rover decks',
      'Custom wheelbase prototypes with press-fit bearing collars',
      'Classroom robotics kits tailored to specific battery packs',
    ],
    supportedScope: [
      'Deck length, width, and structural plate thickness',
      'Dual upright axle bracket towers with configurable bore diameter',
      'Bearing/shaft clearance allowance and axle center height',
      'Perimeter mounting holes for sensors and microcontrollers',
    ],
    promptExample:
      'Build a robot car chassis plate 160 mm long and 112 mm wide, 5 mm thick, with two upright axle brackets featuring 8 mm shaft bores 26 mm above the deck.',
    followUpExample: {
      prompt: 'Open the shaft bore diameter to 8.4 mm for bearing clearance while keeping deck thickness at 5 mm.',
      outcome: 'Axle bores adjusted to 8.4 mm slip fit; deck plate remains 5.0 mm thick.',
      patch: { holeDiameter: 8.4, clearance: 0.4 },
    },
    defaultParams: {
      length: 160,
      width: 112,
      height: 36,
      wallThickness: 5.0,
      holeDiameter: 8.4,
      cornerRadius: 6.0,
      clearance: 0.4,
      angle: 90,
      standoffCount: 4,
      hasLid: false,
    },
    controls: [
      { key: 'length', label: 'Chassis Length', unit: 'mm', min: 110, max: 240, step: 4, description: 'Front-to-back deck length.' },
      { key: 'width', label: 'Chassis Width', unit: 'mm', min: 80, max: 170, step: 4, description: 'Left-to-right track width across axle towers.' },
      { key: 'height', label: 'Bracket Height', unit: 'mm', min: 22, max: 60, step: 2, description: 'Height of upright axle support towers above base.' },
      { key: 'wallThickness', label: 'Deck Thickness', unit: 'mm', min: 3.0, max: 8.0, step: 0.5, description: 'Plate thickness controlling torsional stiffness.' },
      { key: 'holeDiameter', label: 'Shaft Bore Ø', unit: 'mm', min: 4.0, max: 16.0, step: 0.2, description: 'Axle or flanged bearing bore diameter in upright towers.' },
      { key: 'cornerRadius', label: 'Deck Corner Radius', unit: 'mm', min: 2, max: 14, step: 1, description: 'Rounding on deck perimeter corners.' },
    ],
    steps: [
      { title: '01. Match Motor & Bearing Size', detail: 'Enter your shaft or bearing outer diameter plus 0.2–0.4 mm print clearance.' },
      { title: '02. Verify Bracket Wall Margin', detail: 'Ensure upright towers have enough material around the bore to resist torque.' },
      { title: '03. Inspect Multi-Part Assembly', detail: 'Use Exploded View to inspect upright gusset alignment and mounting bores.' },
      { title: '04. Export STEP or STL', detail: 'Print directly in PETG/ABS or export STEP to add motor facebolt patterns.' },
    ],
    faqs: [
      {
        question: 'How should I size the shaft bore for a 608 or 8 mm shaft?',
        answer: 'For an 8 mm smooth shaft rotating directly or via a sleeve, 8.3–8.4 mm compensates for typical FDM inner-hole shrinkage. For a 22 mm 608 bearing, set bore to 22.15 mm or adjust in STEP.',
      },
      {
        question: 'Which filament is recommended for robot chassis plates?',
        answer: 'PETG or ABS with 4+ perimeters and 35% infill offers better impact toughness and motor heat resistance than standard PLA.',
      },
      {
        question: 'Can I modify the mounting holes in CAD after export?',
        answer: 'Yes. The STEP export provides clean analytical deck faces where you can drill custom controller or LiPo strap slots.',
      },
    ],
    relatedRoutes: [
      { label: 'Verified Chassis Case', route: '/examples', note: 'View original prompt and bore clearance revision' },
      { label: 'Custom Bracket Generator', route: '/bracket-generator', note: 'Design secondary sensor mounts' },
    ],
  },
  {
    id: 'bracket',
    route: '/bracket-generator',
    name: 'Custom Mounting Bracket Generator',
    shortName: 'Mounting Bracket',
    seoTitle: 'Custom Mounting Bracket Generator – Parametric L-Bracket CAD | SolidCraft',
    h1: 'Parametric Mounting Bracket Generator',
    seoDescription:
      'Generate custom L-brackets and angled mounting plates with configurable arm lengths, bend angle, gusset thickness, and fastener hole spacing in STEP and STL.',
    targetTopic: 'custom mounting bracket generator',
    caseStatus: 'Planned Parametric Template',
    summary:
      'Build structural L-brackets and angled sensor mounts with tunable flange lengths, plate thickness, reinforcement gussets, and metric fastener holes.',
    useCases: [
      'Aluminum extrusion 2020/4040 corner brackets and end-stop mounts',
      'Under-desk power supply and mini-PC mounting brackets',
      'Angled camera, LiDAR, or limit-switch mounting plates',
    ],
    supportedScope: [
      'Vertical and horizontal flange lengths',
      'Bracket width and plate thickness',
      'Bend angle (60° to 120°)',
      'Metric mounting hole diameter (M3–M8)',
    ],
    promptExample:
      'Create a reinforced 90-degree mounting bracket with 65 mm and 55 mm arms, 42 mm width, 4.5 mm plate thickness, and 5.4 mm M5 mounting holes.',
    followUpExample: {
      prompt: 'Change the bend angle to 75 degrees and thicken the plate to 5.5 mm while keeping the 5.4 mm mounting holes.',
      outcome: 'Flange angle tilted to 75° and plate thickened to 5.5 mm; hole bores stayed 5.4 mm.',
      patch: { angle: 75, wallThickness: 5.5 },
    },
    defaultParams: {
      length: 65,
      width: 42,
      height: 55,
      wallThickness: 4.5,
      holeDiameter: 5.4,
      cornerRadius: 4.0,
      clearance: 0.25,
      angle: 90,
      standoffCount: 2,
      hasLid: false,
    },
    controls: [
      { key: 'length', label: 'Base Flange Length', unit: 'mm', min: 30, max: 130, step: 2, description: 'Horizontal mounting arm length.' },
      { key: 'height', label: 'Vertical Arm Height', unit: 'mm', min: 30, max: 130, step: 2, description: 'Upright flange reach.' },
      { key: 'width', label: 'Bracket Width', unit: 'mm', min: 20, max: 100, step: 2, description: 'Extrusion width across the bend.' },
      { key: 'wallThickness', label: 'Plate Thickness', unit: 'mm', min: 2.5, max: 8.0, step: 0.5, description: 'Flange thickness for load stiffness.' },
      { key: 'angle', label: 'Flange Angle', unit: '°', min: 60, max: 120, step: 1, description: 'Included angle between base and upright arm.' },
      { key: 'holeDiameter', label: 'Mounting Hole Ø', unit: 'mm', min: 3.0, max: 8.5, step: 0.2, description: 'Clearance diameter for M3–M8 bolts.' },
    ],
    steps: [
      { title: '01. Set Arm Reach & Width', detail: 'Match the mounting footprint of your extrusion rail or surface.' },
      { title: '02. Select Fastener Clearance', detail: 'Use 3.4 mm for M3, 4.5 mm for M4, or 5.5 mm for M5 bolts.' },
      { title: '03. Verify Side-Print Orientation', detail: 'Print brackets on their side edge so continuous filament loops wrap the bend.' },
      { title: '04. Export STEP or STL', detail: 'Download STL for rapid shop jigs or STEP for CNC / sheet-metal adaptation.' },
    ],
    faqs: [
      {
        question: 'Which print orientation makes 3D printed brackets strongest?',
        answer: 'Always orient L-brackets on their side face on the build plate so layer lines run parallel to the load path around the corner bend rather than across it.',
      },
      {
        question: 'Can I generate non-90-degree sensor brackets?',
        answer: 'Yes. The flange angle slider adjusts continuously from 60° to 120° while maintaining clean side gusset geometry.',
      },
      {
        question: 'Are STEP files suitable for CNC machining or laser cutting?',
        answer: 'Yes, STEP solids represent exact planar flanges and circular bores cleanly for CAM setups.',
      },
    ],
    relatedRoutes: [
      { label: 'Robot Chassis Generator', route: '/chassis-generator', note: 'Larger platform plates with axle towers' },
      { label: 'Print Strength Guide', route: '/guides', note: 'Orientation and wall perimeter guidelines' },
    ],
  },
  {
    id: 'raspberryPi',
    route: '/raspberry-pi-case-generator',
    name: 'Raspberry Pi Case Generator',
    shortName: 'Raspberry Pi Case',
    seoTitle: 'Raspberry Pi Case Generator – Custom Vent & Port CAD | SolidCraft',
    h1: 'Parametric Raspberry Pi Case Generator',
    seoDescription:
      'Generate custom Raspberry Pi enclosures with board mounting standoffs, port access cutouts, heatsink height clearance, and vented lids in STEP and STL.',
    targetTopic: 'Raspberry Pi case generator',
    caseStatus: 'Planned Parametric Template',
    summary:
      'Tailor a ventilated single-board computer housing with internal 58 × 49 mm standoff pattern, adjustable headroom for PoE HATs or heatsinks, and port cutouts.',
    useCases: [
      'Home Assistant and Pi-hole appliance housings with tall heatsink headroom',
      'DIN-rail or VESA-mounted edge compute nodes',
      'Custom enclosures accommodating NVMe base boards or camera ribbons',
    ],
    supportedScope: [
      'Board-aligned internal standoff spacing and M2.5 screw bosses',
      'Adjustable internal height for low-profile or tower coolers',
      'Perimeter wall thickness and top ventilation slot lid',
      'Side port bay access cutouts and lid fit clearance',
    ],
    promptExample:
      'Generate a Raspberry Pi 4/5 case 94 mm long, 65 mm wide, and 32 mm tall with 2.4 mm walls, M2.5 corner standoffs, and a ventilated snap-fit lid.',
    followUpExample: {
      prompt: 'Increase total height to 40 mm to clear an active aluminum cooler while keeping the 94 × 65 mm footprint.',
      outcome: 'Internal ceiling raised by 8 mm (total height 40 mm); M2.5 boss spacing unchanged.',
      patch: { height: 40 },
    },
    defaultParams: {
      length: 94,
      width: 65,
      height: 32,
      wallThickness: 2.4,
      holeDiameter: 2.9,
      cornerRadius: 4.0,
      clearance: 0.25,
      angle: 0,
      standoffCount: 4,
      hasLid: true,
    },
    controls: [
      { key: 'length', label: 'Case Length', unit: 'mm', min: 88, max: 120, step: 1, description: 'Outer X length accommodating 85 mm Pi PCB plus walls.' },
      { key: 'width', label: 'Case Width', unit: 'mm', min: 60, max: 90, step: 1, description: 'Outer Z width accommodating 56 mm Pi PCB plus connectors.' },
      { key: 'height', label: 'Case Height', unit: 'mm', min: 22, max: 58, step: 1, description: 'Increase height for HATs, NVMe shields, or tower coolers.' },
      { key: 'wallThickness', label: 'Wall Thickness', unit: 'mm', min: 1.8, max: 4.0, step: 0.2, description: 'Housing shell thickness.' },
      { key: 'holeDiameter', label: 'Boss Screw Ø', unit: 'mm', min: 2.4, max: 3.6, step: 0.1, description: 'Lid and standoff fastener diameter (M2.5 default).' },
      { key: 'clearance', label: 'Lid Fit Clearance', unit: 'mm', min: 0.15, max: 0.5, step: 0.05, description: 'Alignment lip radial tolerance.' },
    ],
    steps: [
      { title: '01. Select Heatsink Headroom', detail: 'Use 28–32 mm height for passive heatsinks or 40+ mm for HAT boards.' },
      { title: '02. Inspect Port Bay Alignment', detail: 'Use Exploded View to verify internal PCB standoff clearance.' },
      { title: '03. Iterate via Follow-Up Prompt', detail: 'Ask to expand height or thicken walls without moving board standoffs.' },
      { title: '04. Export STEP or STL', detail: 'Print in PETG for thermal stability or edit STEP to add VESA tabs.' },
    ],
    faqs: [
      {
        question: 'Does this accommodate Raspberry Pi 4B and Pi 5?',
        answer: 'Yes, the outer envelope and 58 × 49 mm mounting pattern target standard full-size Raspberry Pi layouts; adjust height for active coolers or NVMe HATs.',
      },
      {
        question: 'Should I print a Raspberry Pi case in PLA or PETG?',
        answer: 'PETG handles sustained 50–65°C internal board temperatures much better than standard PLA without warping.',
      },
      {
        question: 'Can I add custom GPIO ribbon slots in CAD?',
        answer: 'Yes. Export the STEP solid and sketch a slot directly on the top lid surface in Fusion 360 or FreeCAD.',
      },
    ],
    relatedRoutes: [
      { label: 'Electronics Enclosure Generator', route: '/enclosure-generator', note: 'General-purpose PCB housing for custom boards' },
      { label: 'Tolerance & Thermal Guide', route: '/guides', note: 'Material selection and M2.5 standoff tolerances' },
    ],
  },
];

export const GUIDES: GuideArticle[] = [
  {
    id: 'tolerances-and-clearances',
    category: '3D Printing Tolerances',
    readTime: '5 min read',
    title: 'Choosing Hole Diameters and Lid Fit Clearances for FDM Printing',
    summary:
      'Nominal CAD dimensions shrink slightly on real 3D printers. Learn exact radial clearance values for snap lids, M3 hardware, and bearing shafts.',
    sections: [
      {
        heading: 'Why Nominal 3.0 mm Holes Print Tight',
        body: 'Molten filament contracts slightly as it cools around small arcs, and horizontal slicer expansion pushes inner perimeters inward by 0.10–0.20 mm. Designing a 3.0 mm hole for an M3 bolt usually forces you to drill it out after printing.',
        specRows: [
          { label: 'M3 Close Clearance', value: '3.2 – 3.4 mm', note: 'Snug alignment, minimal play' },
          { label: 'M3 Standard Slip Fit', value: '3.5 – 3.6 mm', note: 'Free pass-through without binding' },
          { label: 'M3 Self-Tapping (Plastic)', value: '2.7 – 2.8 mm', note: 'Threads cut directly into PETG/PLA boss' },
          { label: 'M3 Brass Heat-Set Insert', value: '4.0 – 4.2 mm', note: 'Standard knurled insert bore (verify vendor spec)' },
        ],
      },
      {
        heading: 'Lid Lip Clearance Guidelines',
        body: 'Two-piece enclosures rely on a stepped perimeter lip so the lid centers itself before fasteners tighten. Keep at least 0.20 mm radial clearance for PLA and 0.25–0.30 mm for PETG.',
      },
    ],
    relatedToolRoute: '/enclosure-generator',
    relatedToolLabel: 'Open Enclosure Generator',
  },
  {
    id: 'step-vs-stl-workflow',
    category: 'File Formats',
    readTime: '4 min read',
    title: 'STEP vs STL: What Each Export Delivers and How to Edit Downstream',
    summary:
      'Understand when to drop an STL straight into Bambu Studio or PrusaSlicer versus when to import a STEP B-Rep solid into Fusion 360 or FreeCAD.',
    sections: [
      {
        heading: 'STL for Slicing and 3D Printing',
        body: 'STL approximates curved surfaces and planar walls as a watertight triangle mesh. It is the universal input for slicers (PrusaSlicer, Bambu Studio, Cura, OrcaSlicer), though editing hole positions on an STL mesh later is tedious.',
      },
      {
        heading: 'STEP (ISO 10303-21) for CAD Editing',
        body: 'STEP exchanges exact analytical B-Rep geometry—true cylinders, planes, and fillets—between CAD systems such as Fusion 360, Onshape, SolidWorks, and FreeCAD. Important limitation: STEP delivers clean editable solid geometry, not the native timeline feature history of a proprietary CAD package.',
        specRows: [
          { label: 'STL (.stl)', value: 'Triangle Mesh', note: 'Direct 3D print slicing & rapid mesh preview' },
          { label: 'STEP (.step)', value: 'B-Rep Solid', note: 'Exact CAD faces/bores for Fusion, FreeCAD, CNC' },
          { label: 'Native Feature Tree', value: 'Not Included in STEP', note: 'Use SolidCraft parameters or prompts for global resizes' },
        ],
      },
    ],
    relatedToolRoute: '/parametric-cad',
    relatedToolLabel: 'Explore Parametric CAD',
  },
  {
    id: 'wall-thickness-and-orientation',
    category: 'Design for Printing',
    readTime: '4 min read',
    title: 'Wall Thickness, Nozzle Multiples, and Part Print Orientation',
    summary:
      'Match wall thickness to 0.4 mm nozzle perimeters and orient brackets or phone stands to avoid weak Z-axis layer delamination.',
    sections: [
      {
        heading: 'Design Walls in Nozzle Line Multiples',
        body: 'With a standard 0.4 mm nozzle (0.42–0.45 mm line width), walls between 2.4 mm and 3.2 mm slice cleanly into solid outer/inner perimeters without slow zig-zag gap fill.',
      },
      {
        heading: 'Orienting Load-Bearing Angles',
        body: 'For phone stands and L-brackets, printing upright puts bending tension across horizontal layer seams. Printing on the side profile wraps continuous extruded loops around the corner bend for dramatically higher strength.',
      },
    ],
    relatedToolRoute: '/bracket-generator',
    relatedToolLabel: 'Open Bracket Generator',
  },
  {
    id: 'conversational-iteration',
    category: 'SolidCraft Workflow',
    readTime: '3 min read',
    title: 'Iterating Designs via Prompt Without Breaking Mating Fits',
    summary:
      'How to phrase follow-up constraints so hole diameters or heights update cleanly while wall thicknesses and standoff coordinates stay locked.',
    sections: [
      {
        heading: 'Explicitly Anchor Unchanged Constraints',
        body: 'When requesting a conversational revision, state both the target change and the anchored relationships—for example: "Change lid screw hole diameter to 3.6 mm while keeping wall thickness and standoff positions unchanged."',
      },
      {
        heading: 'Use Version Snapshots Before Major Changes',
        body: 'Every revision creates a clear version snapshot with parameter deltas so you can compare v1.0 vs v1.1 before exporting production STEP or STL files.',
      },
    ],
    relatedToolRoute: '/examples',
    relatedToolLabel: 'Inspect Verified Examples',
  },
];

export const HOME_FAQS: FaqItem[] = [
  {
    question: 'Can I 3D print files generated by SolidCraft right away?',
    answer:
      'Yes. STL exports produce watertight geometry sized in millimeters for direct slicing in PrusaSlicer, Bambu Studio, Cura, or OrcaSlicer. Always verify printer-specific clearance (typically 0.20–0.25 mm for lids) using the built-in geometry checks.',
  },
  {
    question: 'Can I import SolidCraft STEP files into Fusion 360, Onshape, or FreeCAD?',
    answer:
      'Yes. STEP exports deliver exact B-Rep solid bodies with true analytical faces and cylindrical holes so you can add custom cutouts, fillets, or assemblies. Note that STEP is a neutral solid exchange format and does not carry a native CAD software feature tree.',
  },
  {
    question: 'How do conversational edits affect untouched dimensions?',
    answer:
      'Follow-up modifications target only the specified parameter—such as changing lid hole diameter from 3.2 mm to 3.6 mm—while locking existing wall thickness, envelope dimensions, and standoff coordinates.',
  },
  {
    question: 'Which parts have verified reference cases in this showcase?',
    answer:
      'The Electronics Enclosure, Desktop Phone Stand, and Robot Car Chassis are based on verified repository builds with real prompts, dimensions, and revision histories. Box & Lid, Mounting Bracket, and Raspberry Pi Case represent planned parametric templates.',
  },
];

export function evaluateGeometryChecks(kind: PartKind, p: CadParams): GeometryCheckItem[] {
  const checks: GeometryCheckItem[] = [];

  // Wall thickness check
  if (p.wallThickness < 1.8) {
    checks.push({
      id: 'wall',
      label: 'Thin Wall Warning',
      status: 'warning',
      detail: `${p.wallThickness.toFixed(1)} mm wall is below 1.8 mm; increase for rigid 0.4 mm nozzle perimeters.`,
    });
  } else {
    checks.push({
      id: 'wall',
      label: 'Wall Thickness Valid',
      status: 'pass',
      detail: `${p.wallThickness.toFixed(1)} mm wall supports clean multi-perimeter FDM extrusion.`,
    });
  }

  // Clearance / angle check depending on part
  if (p.hasLid || kind === 'enclosure' || kind === 'box' || kind === 'raspberryPi') {
    if (p.clearance < 0.15) {
      checks.push({
        id: 'clearance',
        label: 'Tight Lid Clearance',
        status: 'warning',
        detail: `${p.clearance.toFixed(2)} mm radial gap may bind on uncalibrated printers (0.20–0.30 mm recommended).`,
      });
    } else {
      checks.push({
        id: 'clearance',
        label: 'Lid Fit Clearance Verified',
        status: 'pass',
        detail: `${p.clearance.toFixed(2)} mm radial alignment gap provides reliable slip-fit assembly.`,
      });
    }
  } else if (kind === 'phoneStand') {
    const minBase = Math.round(p.height * 0.68);
    if (p.length < minBase) {
      checks.push({
        id: 'stability',
        label: 'Tipping Margin Warning',
        status: 'warning',
        detail: `Base depth (${p.length} mm) is narrow relative to ${p.height} mm backrest; ≥ ${minBase} mm improves stability.`,
      });
    } else {
      checks.push({
        id: 'stability',
        label: 'Center-of-Gravity Balanced',
        status: 'pass',
        detail: `${p.length} mm base supports ${p.height} mm backrest at ${p.angle}° without backward tipping.`,
      });
    }
  } else if (kind === 'chassis' || kind === 'bracket') {
    const boreEdgeMargin = (p.width - p.holeDiameter) / 2;
    if (p.holeDiameter > p.width * 0.45 || boreEdgeMargin < 5) {
      checks.push({
        id: 'bore',
        label: 'Bore Edge Margin Low',
        status: 'warning',
        detail: `${p.holeDiameter.toFixed(1)} mm bore leaves tight shoulder material; consider widening part or reducing bore.`,
      });
    } else {
      checks.push({
        id: 'bore',
        label: 'Bore & Fastener Margin Clear',
        status: 'pass',
        detail: `${p.holeDiameter.toFixed(1)} mm bore preserves adequate surrounding wall shoulder for hardware torque.`,
      });
    }
  }

  // Inner cavity / hole prompt check
  if (kind === 'enclosure' || kind === 'raspberryPi') {
    const innerL = (p.length - p.wallThickness * 2).toFixed(1);
    const innerW = (p.width - p.wallThickness * 2).toFixed(1);
    checks.push({
      id: 'cavity',
      label: 'Internal Cavity Envelope',
      status: 'pass',
      detail: `Usable internal footprint ${innerL} × ${innerW} mm with ${p.holeDiameter.toFixed(1)} mm lid bores.`,
    });
  } else if (kind === 'box') {
    const innerL = (p.length - p.wallThickness * 2).toFixed(1);
    const innerW = (p.width - p.wallThickness * 2).toFixed(1);
    checks.push({
      id: 'cavity',
      label: 'Usable Inner Volume',
      status: 'pass',
      detail: `Inner cavity measures ${innerL} × ${innerW} mm; confirm tallest item fits under lid lip.`,
    });
  } else {
    checks.push({
      id: 'clarification',
      label: 'Optional Spec Prompt',
      status: 'question',
      detail:
        kind === 'chassis'
          ? 'Specify motor bolt pattern (e.g., TT gearbox or N20) if direct face-mount holes are needed.'
          : kind === 'phoneStand'
          ? 'Confirm charging cable width if routing a right-angle USB-C plug through the base slot.'
          : 'Confirm washer outer diameter so counterbore clearance covers bolt heads.',
    });
  }

  return checks;
}

export function getToolByRoute(route: string): ToolPageConfig | undefined {
  return TOOL_PAGES.find((t) => t.route === route);
}

export function getToolById(id: PartKind): ToolPageConfig {
  return TOOL_PAGES.find((t) => t.id === id) ?? TOOL_PAGES[0];
}
