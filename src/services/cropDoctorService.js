// AI Crop Health & Disease Doctor Service
// Simulates neural visual diagnosis, disease classification, and treatment protocol

const PRESET_DISEASES = [
  {
    id: 'early-blight-tomato',
    crop: 'Tomato',
    cropHindi: 'टमाटर',
    diseaseName: 'Early Blight (Alternaria solani)',
    pathogenType: 'Fungal Pathogen',
    severity: 'Moderate',
    confidenceScore: 97.2,
    sampleImage: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=600&q=80',
    symptoms: [
      'Concentric dark rings with target-board appearance on older leaves',
      'Yellow chlorotic halo surrounding brown necrotic lesions',
      'Premature leaf defoliation starting from ground level',
      'Dark sunken leathery cankers on stems and collar region'
    ],
    organicTreatment: [
      'Spray Neem Seed Kernel Extract (NSKE 5%) or cold-pressed Neem Oil (3ml/L water) at 7-day intervals',
      'Foliar spray of Trichoderma viride or Bacillus subtilis (5g/L water) to outcompete fungal spores',
      'Mulch soil with dry straw to prevent soil-splash onto lower foliage'
    ],
    chemicalTreatment: [
      'Foliar application of Mancozeb 75% WP @ 2.5g/L water on symptom onset',
      'Alternate with Azoxystrobin 23% SC @ 1ml/L water for systemic protection',
      'Maintain minimum 3-day harvest withholding period after spray'
    ],
    preventiveTips: [
      'Adopt drip irrigation instead of overhead watering to keep canopy dry',
      'Follow 3-year crop rotation with non-solanaceous crops (avoid potato/eggplant)',
      'Prune lower 12 inches of suckers to boost airflow and reduce micro-humidity'
    ],
    urgencyLevel: 'Action Required within 48 Hours',
    estimatedYieldLossRisk: '20% - 35% if untreated'
  },
  {
    id: 'paddy-blast-rice',
    crop: 'Rice / Paddy',
    cropHindi: 'धान',
    diseaseName: 'Rice Blast (Magnaporthe oryzae)',
    pathogenType: 'Airborne Fungal',
    severity: 'Severe',
    confidenceScore: 95.8,
    sampleImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    symptoms: [
      'Spindle-shaped / diamond-shaped lesions with grey or whitish centers',
      'Dark brown or reddish-brown margins along leaf blades',
      'Neck rot causing empty whiteheads / chaffy grains during panicle emergence',
      'Rapid lesion enlargement during humid cloudy overcast weather'
    ],
    organicTreatment: [
      'Spray Pseudomonas fluorescens liquid formulation @ 10ml/L or seed treatment @ 10g/kg',
      'Apply silicon fertilizer or burnt rice-husk ash to strengthen plant epidermal cell walls',
      'Spray fermented cow urine (Jeevamrutha) diluted 1:10 with water'
    ],
    chemicalTreatment: [
      'Spray Tricyclazole 75% WP @ 0.6g/L water at early tillering / boot leaf stage',
      'Alternative: Isoprothiolane 40% EC @ 1.5ml/L water',
      'Avoid high doses of nitrogen fertilizer (Urea) during humid outbreaks'
    ],
    preventiveTips: [
      'Split nitrogen application into 3-4 split doses rather than single heavy dressing',
      'Maintain optimal standing water depth (2-3 cm) during vegetative stage',
      'Use blast-resistant certified cultivars (e.g. IR64, RNR-15048)'
    ],
    urgencyLevel: 'Critical Attention Needed',
    estimatedYieldLossRisk: '40% - 60% if panicle blast strikes'
  },
  {
    id: 'cotton-pink-bollworm',
    crop: 'Cotton',
    cropHindi: 'कपास',
    diseaseName: 'Pink Bollworm (Pectinophora gossypiella)',
    pathogenType: 'Insect Pest Larvae',
    severity: 'Severe',
    confidenceScore: 94.6,
    sampleImage: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
    symptoms: [
      'Rosetted flowers ("half-open rosette") due to webbing by caterpillar',
      'Premature drop of squares and small young bolls',
      'Bored holes on mature bolls plugged with larval excreta / frass',
      'Stained discolored lint and damaged developing seeds inside bolls'
    ],
    organicTreatment: [
      'Install Pheromone Traps with Gossyplure septa @ 5 traps/acre for monitoring, 12/acre for mass trapping',
      'Release Trichogramma bactrae egg parasitoids @ 60,000/acre at weekly intervals',
      'Spray Beauveria bassiana entomopathogenic fungus (5ml/L) in evening hours'
    ],
    chemicalTreatment: [
      'Spray Chlorantraniliprole 18.5% SC @ 0.3ml/L water at economic threshold (>10% rosette flowers)',
      'Alternate with Emamectin Benzoate 5% SG @ 0.5g/L water',
      'Strictly avoid synthetic pyrethroids early in the season to preserve natural predators'
    ],
    preventiveTips: [
      'Refrain from ratooning or extending crop season past 160 days',
      'Destroy crop residue and shredded stalks immediately post final harvest',
      'Deep summer plowing to expose overwintering diapausing larvae to solar heat'
    ],
    urgencyLevel: 'Immediate Trap Setup Required',
    estimatedYieldLossRisk: '30% - 50% lint degradation'
  },
  {
    id: 'potato-late-blight',
    crop: 'Potato',
    cropHindi: 'आलू',
    diseaseName: 'Late Blight (Phytophthora infestans)',
    pathogenType: 'Oomycete / Water Mold',
    severity: 'Critical',
    confidenceScore: 98.4,
    sampleImage: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    symptoms: [
      'Water-soaked dark lesions appearing near leaf tips and margins',
      'White fluffy downy mildew growth on underside of leaves in high humidity',
      'Rapid brown necrosis causing foul-smelling collapse of canopy in 4-6 days',
      'Brown granular dry rot progressing into the tuber flesh'
    ],
    organicTreatment: [
      'Prophylactic spray of Bordeaux mixture (1%) or Copper Hydroxide (2g/L)',
      'Foliar spray of Horsetail (Equisetum) decoction rich in bio-silica',
      'Earthing up soil to create a 10cm soil barrier preventing spore wash into tubers'
    ],
    chemicalTreatment: [
      'Preventive: Mancozeb 75% WP @ 2.5g/L or Chlorothalonil 75% WP @ 2g/L',
      'Curative (upon symptom sighting): Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L',
      'Do not apply single site fungicides repeatedly to prevent strain resistance'
    ],
    preventiveTips: [
      'Plant certified disease-free seed tubers with blue tag inspection',
      'Destroy all cull piles and volunteer potato sprouts near the field',
      'Ensure proper drainage to prevent waterlogging during rainy spells'
    ],
    urgencyLevel: 'Emergency Response (High Spread Velocity)',
    estimatedYieldLossRisk: 'Up to 80% if weather remains cool and damp'
  },
  {
    id: 'healthy-capsicum',
    crop: 'Bell Pepper / Capsicum',
    cropHindi: 'शिमला मिर्च',
    diseaseName: 'Healthy Crop (No Active Pathogen Detected)',
    pathogenType: 'None (Optimal Plant Health)',
    severity: 'None',
    confidenceScore: 99.1,
    sampleImage: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    symptoms: [
      'Vibrant deep green foliage with balanced interveinal chlorophyll distribution',
      'Sturdy erect stems with healthy turgor pressure',
      'Uniform fruit setting free from blossom end rot or sunscald',
      'Clean root-collar zone without vascular discoloration'
    ],
    organicTreatment: [
      'Maintain bi-weekly foliar nutrition with Seaweed Extract (2ml/L) or Panchagavya (3%)',
      'Apply Vermicompost (2 tons/acre) enriched with Azotobacter and PSB',
      'Routine probiotic foliar spray of compost tea to maintain beneficial phyllosphere flora'
    ],
    chemicalTreatment: [
      'No synthetic chemical pesticide required at this stage',
      'Balanced NPK 19:19:19 fertigation @ 3kg/acre weekly through drip system'
    ],
    preventiveTips: [
      'Install yellow and blue sticky traps (15 each/acre) to scout for thrips/whiteflies',
      'Maintain soil moisture at field capacity (approx. 60-70% saturation)',
      'Regular trellis training to keep branches off damp soil'
    ],
    urgencyLevel: 'All Good - Continue Preventive Maintenance',
    estimatedYieldLossRisk: '0% - Peak Yield Potential'
  }
];

export function getPresetDiseaseSamples() {
  return PRESET_DISEASES;
}

export function diagnoseCropImage(sampleIdOrCustom) {
  // If a preset was picked, return realistic high accuracy data
  const match = PRESET_DISEASES.find(d => d.id === sampleIdOrCustom);
  if (match) return match;

  // If a user uploaded a custom file, generate realistic AI diagnosis
  return {
    id: 'custom-' + Date.now(),
    crop: 'Field Crop / Vegetable',
    cropHindi: 'फसल',
    diseaseName: 'Foliar Leaf Spot & Nutrient Chlorosis',
    pathogenType: 'Mixed Fungal / Micronutrient Deficiency',
    severity: 'Moderate',
    confidenceScore: 92.5,
    sampleImage: sampleIdOrCustom || PRESET_DISEASES[0].sampleImage,
    symptoms: [
      'Early brown necrotic specks scattered across middle leaf tiers',
      'Interveinal yellowing indicating possible zinc or magnesium deficiency',
      'Slight leaf margin curling due to moisture or heat stress'
    ],
    organicTreatment: [
      'Apply cold pressed Neem oil (10,000 ppm) @ 2ml/L combined with bio-fungicide',
      'Foliar spray of micronutrient chelated combo (Zinc, Boron, Ferrous) @ 1.5g/L',
      'Spray vermiwash diluted 1:5 in clear morning sunshine'
    ],
    chemicalTreatment: [
      'Copper Oxychloride 50 WP @ 2.5g/L water',
      'Spray Carbendazim 12% + Mancozeb 63% WP @ 2g/L if spotting spreads'
    ],
    preventiveTips: [
      'Test soil pH (aim for 6.2 - 6.8 for optimal nutrient assimilation)',
      'Improve furrow drainage to avoid root hypoxia',
      'Prune diseased leaves and bag them away from active cultivation zone'
    ],
    urgencyLevel: 'Treat within 3-4 days',
    estimatedYieldLossRisk: '10% - 20%'
  };
}
