import { usePatternStore } from '@/store/usePatternStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { useYarnStore } from '@/store/useYarnStore';
import { ProjectInput } from '@/types/project';
import { Pattern } from '@/types/pattern';
import { YarnInput } from '@/types/yarn';

const DEMO_PATTERNS: Partial<Pattern>[] = [
  {
    id: 'demo_pat_1',
    name: 'Classic Ribbed Beanie',
    designer: 'Sarah Knits',
    difficulty: 'beginner',
    description: 'A cozy, stretchy beanie perfect for cold weather. Uses basic knit and purl stitches.',
    tags: ['hat', 'winter', 'unisex', 'ribbed'],
    category: 'Accessory',
    imageUrl: 'https://images.unsplash.com/photo-1576036201258-c51b32add4dd?q=80&w=1000&auto=format&fit=crop',
    yarnWeight: 'Worsted',
    hookSize: '5.0mm',
    yardage: 200,
    originalText: `
Row 1: Ch 45.
Row 2: Hdc in 3rd ch from hook and each ch across. Turn. (43 sts)
Row 3: Ch 2, hdc in BLO of each st across. Turn.
Repeat Row 3 until piece measures 18 inches (or desired circumference).
Seam ends together and cinch top closed.
    `,
  },
  {
    id: 'demo_pat_2',
    name: 'Sunny Day Market Bag',
    designer: 'EcoCrochet',
    difficulty: 'intermediate',
    description: 'Reusable mesh market bag. Eco-friendly and durable.',
    tags: ['bag', 'mesh', 'cotton', 'summer'],
    category: 'Accessory',
    imageUrl: 'https://images.unsplash.com/photo-1619250907823-06b5d529d82a?q=80&w=1000&auto=format&fit=crop',
    yarnWeight: 'Cotton DK',
    hookSize: '4.0mm',
    yardage: 350,
    originalText: `
Round 1: Magic Ring, 12 dc in ring. Sl st to join.
Round 2: Ch 4 (counts as dc + ch 1), *dc, ch 1* around.
Round 3: Ch 5 (counts as dc + ch 2), *dc, ch 2* around.
...
    `,
  },
  {
    id: 'demo_pat_3',
    name: 'Amigurumi Whale',
    designer: 'TinyStitches',
    difficulty: 'advanced',
    description: 'Cute little whale plushie. Great scrap buster!',
    tags: ['amigurumi', 'toy', 'whale', 'cute'],
    category: 'Toy',
    imageUrl: 'https://images.unsplash.com/photo-1617053576092-f3b3e7f7c614?q=80&w=1000&auto=format&fit=crop',
    yarnWeight: 'Worsted',
    hookSize: '3.5mm',
    yardage: 50,
    originalText: `
Body:
R1: 6 sc in MR
R2: inc around (12)
R3: *sc, inc* around (18)
...
    `,
  }
];

const DEMO_YARNS: YarnInput[] = [
  {
    name: 'Wool of the Andes',
    brand: 'KnitPicks',
    color: 'Midnight Blue',
    colorHex: '#1e3a8a',
    weightCategory: 'Worsted',
    metersPerSkein: 100,
    skeinsOwned: 5,
    pricePerSkein: 4.99,
    purchasedFrom: 'Local Shop',
  },
  {
    name: 'Cotton Gold',
    brand: 'Alize',
    color: 'Mustard',
    colorHex: '#eab308',
    weightCategory: 'DK',
    metersPerSkein: 330,
    skeinsOwned: 2,
    pricePerSkein: 6.50,
    purchasedFrom: 'Online',
  },
  {
    name: 'Chenille Baby',
    brand: 'Hobbii',
    color: 'Soft Pink',
    colorHex: '#f472b6',
    weightCategory: 'Super Bulky',
    metersPerSkein: 120,
    skeinsOwned: 3,
    pricePerSkein: 8.99,
  }
];

const DEMO_PROJECTS: ProjectInput[] = [
  {
    name: 'Blue Winter Beanie',
    patternName: 'Classic Ribbed Beanie',
    status: 'active',
    totalRoundsEstimate: 60,
    thumbnail: 'https://images.unsplash.com/photo-1576036201258-c51b32add4dd?q=80&w=1000&auto=format&fit=crop',
    notes: 'Making this for dad. Using darker blue.',
    yarnWeight: 'Worsted',
    hookSizeMm: 5,
    timeSpentMinutes: 120,
    progressNotes: 'Finished ribbing, starting decrease section.',
  },
  {
    name: 'Market Bag Gift',
    patternName: 'Sunny Day Market Bag',
    status: 'paused',
    totalRoundsEstimate: 45,
    thumbnail: 'https://images.unsplash.com/photo-1619250907823-06b5d529d82a?q=80&w=1000&auto=format&fit=crop',
    notes: 'Need to buy more cotton yarn.',
    yarnWeight: 'DK',
    hookSizeMm: 4,
    timeSpentMinutes: 45,
  }
];

export async function loadDemoData() {
  const { addPattern } = usePatternStore.getState();
  const { addYarn } = useYarnStore.getState();
  const { addProject, addCounter, updateCounter } = useProjectsStore.getState();

  // Clear existing? No, just append for safety
  
  // Add Patterns
  DEMO_PATTERNS.forEach(p => {
    // Construct PatternInput from the partial pattern data
    const input: any = {
        name: p.name || 'Untitled',
        designer: p.designer,
        description: p.description || '',
        difficulty: p.difficulty || 'intermediate',
        tags: p.tags,
        yarnWeight: p.yarnWeight,
        hookSize: p.hookSize,
        snippet: p.originalText,
        notes: p.originalText, // Use original text as notes for now
        patternSourceType: 'external',
        palette: [], 
        stitches: [],
        moods: [],
    };
    
    // addPattern returns the created pattern
    addPattern(input);
  });

  // Add Yarns
  const yarnIds = DEMO_YARNS.map(y => addYarn(y).id);

  // Add Projects
  DEMO_PROJECTS.forEach((p, i) => {
    const proj = addProject(p);
    // Update counters to show progress
    if (proj.counters[0]) {
        const target = proj.counters[0].targetValue || 100;
        updateCounter(proj.id, proj.counters[0].id, Math.floor(target * (i === 0 ? 0.6 : 0.3)));
    }
  });

  console.log('Demo data loaded!');
}

