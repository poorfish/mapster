// Theme configurations ported from JSON files
export const themes = {
    feature_based: {
        name: "Feature-Based Shading",
        description: "Different shades for different road types and features with clear hierarchy",
        bg: "#FFFFFF",
        text: "#000000",
        gradient_color: "#FFFFFF",
        water: "#C0C0C0",
        parks: "#F0F0F0",
        road_motorway: "#0A0A0A",
        road_primary: "#1A1A1A",
        road_secondary: "#2A2A2A",
        road_tertiary: "#3A3A3A",
        road_residential: "#4A4A4A",
        road_default: "#3A3A3A"
    },

    noir: {
        name: "Noir",
        description: "Pure black background with white roads - classic minimalism",
        bg: "#000000",
        text: "#FFFFFF",
        gradient_color: "#000000",
        water: "#0A0A0A",
        parks: "#050505",
        road_motorway: "#FFFFFF",
        road_primary: "#EEEEEE",
        road_secondary: "#DDDDDD",
        road_tertiary: "#CCCCCC",
        road_residential: "#BBBBBB",
        road_default: "#CCCCCC"
    },

    midnight_blue: {
        name: "Midnight Blue",
        description: "Navy background with gold roads - elegant and sophisticated",
        bg: "#0F1B2E",
        text: "#D4AF37",
        gradient_color: "#0F1B2E",
        water: "#0A1220",
        parks: "#121E32",
        road_motorway: "#D4AF37",
        road_primary: "#C9A961",
        road_secondary: "#BEA38B",
        road_tertiary: "#A89575",
        road_residential: "#8B7D5F",
        road_default: "#A89575"
    },

    neon_cyberpunk: {
        name: "Neon Cyberpunk",
        description: "Dark background with electric pink/cyan - bold night city vibes",
        bg: "#0D0D1A",
        text: "#00FFFF",
        gradient_color: "#0D0D1A",
        water: "#0A0A15",
        parks: "#151525",
        road_motorway: "#FF00FF",
        road_primary: "#00FFFF",
        road_secondary: "#00C8C8",
        road_tertiary: "#0098A0",
        road_residential: "#006870",
        road_default: "#0098A0"
    },

    blueprint: {
        name: "Blueprint",
        description: "Architectural blueprint aesthetic - technical and precise",
        bg: "#0C2D48",
        text: "#FFFFFF",
        gradient_color: "#0C2D48",
        water: "#082338",
        parks: "#0E3454",
        road_motorway: "#FFFFFF",
        road_primary: "#E8F4F8",
        road_secondary: "#D1E9F0",
        road_tertiary: "#BADEE8",
        road_residential: "#A3D3E0",
        road_default: "#BADEE8"
    },

    warm_beige: {
        name: "Warm Beige",
        description: "Vintage sepia tones - nostalgic and timeless",
        bg: "#F5E6D3",
        text: "#5C4033",
        gradient_color: "#F5E6D3",
        water: "#D4C4B0",
        parks: "#E8DCC8",
        road_motorway: "#3D2817",
        road_primary: "#5C4033",
        road_secondary: "#7B5C4F",
        road_tertiary: "#9A786B",
        road_residential: "#B99487",
        road_default: "#9A786B"
    },

    pastel_dream: {
        name: "Pastel Dream",
        description: "Soft muted pastels - gentle and calming",
        bg: "#FAF0E6",
        text: "#6B5B95",
        gradient_color: "#FAF0E6",
        water: "#B4D7E8",
        parks: "#D5E8D4",
        road_motorway: "#6B5B95",
        road_primary: "#8B7BA8",
        road_secondary: "#AB9BBB",
        road_tertiary: "#CBBBCE",
        road_residential: "#DBCBD8",
        road_default: "#CBBBCE"
    },

    japanese_ink: {
        name: "Japanese Ink",
        description: "Minimalist ink wash style - zen and artistic",
        bg: "#F8F5F0",
        text: "#2C2C2C",
        gradient_color: "#F8F5F0",
        water: "#D8D5D0",
        parks: "#E8E5E0",
        road_motorway: "#1A1A1A",
        road_primary: "#2C2C2C",
        road_secondary: "#3E3E3E",
        road_tertiary: "#505050",
        road_residential: "#626262",
        road_default: "#505050"
    },

    forest: {
        name: "Forest",
        description: "Deep greens and sage - natural and organic",
        bg: "#2D4A3E",
        text: "#E8F5E9",
        gradient_color: "#2D4A3E",
        water: "#1E3A2E",
        parks: "#3A5A4E",
        road_motorway: "#E8F5E9",
        road_primary: "#C8E6C9",
        road_secondary: "#A5D6A7",
        road_tertiary: "#81C784",
        road_residential: "#66BB6A",
        road_default: "#81C784"
    },

    ocean: {
        name: "Ocean",
        description: "Blues and teals for coastal cities - fresh and maritime",
        bg: "#0D3B66",
        text: "#F4F4F9",
        gradient_color: "#0D3B66",
        water: "#082744",
        parks: "#134F7A",
        road_motorway: "#F4F4F9",
        road_primary: "#BDE0FE",
        road_secondary: "#A2D2FF",
        road_tertiary: "#87CEEB",
        road_residential: "#6CB4EE",
        road_default: "#87CEEB"
    },

    terracotta: {
        name: "Terracotta",
        description: "Mediterranean warmth - earthy and inviting",
        bg: "#E07A5F",
        text: "#3D2C2E",
        gradient_color: "#E07A5F",
        water: "#C86A4F",
        parks: "#F0A58F",
        road_motorway: "#3D2C2E",
        road_primary: "#5D3C3E",
        road_secondary: "#7D4C4E",
        road_tertiary: "#9D6C6E",
        road_residential: "#BD8C8E",
        road_default: "#9D6C6E"
    },

    sunset: {
        name: "Sunset",
        description: "Warm oranges and pinks - romantic and vibrant",
        bg: "#FF6B6B",
        text: "#2C1810",
        gradient_color: "#FF6B6B",
        water: "#EF5B5B",
        parks: "#FF8B8B",
        road_motorway: "#2C1810",
        road_primary: "#4C2820",
        road_secondary: "#6C3830",
        road_tertiary: "#8C4840",
        road_residential: "#AC5850",
        road_default: "#8C4840"
    },

    autumn: {
        name: "Autumn",
        description: "Seasonal burnt oranges and reds - cozy and warm",
        bg: "#D4A574",
        text: "#3E2723",
        gradient_color: "#D4A574",
        water: "#B48B64",
        parks: "#E4B584",
        road_motorway: "#3E2723",
        road_primary: "#5E3733",
        road_secondary: "#7E4743",
        road_tertiary: "#9E5753",
        road_residential: "#BE6763",
        road_default: "#9E5753"
    },

    copper_patina: {
        name: "Copper Patina",
        description: "Oxidized copper aesthetic - aged and distinguished",
        bg: "#5C8A8A",
        text: "#F5E6D3",
        gradient_color: "#5C8A8A",
        water: "#4C7A7A",
        parks: "#6C9A9A",
        road_motorway: "#F5E6D3",
        road_primary: "#E5D6C3",
        road_secondary: "#D5C6B3",
        road_tertiary: "#C5B6A3",
        road_residential: "#B5A693",
        road_default: "#C5B6A3"
    },

    monochrome_blue: {
        name: "Monochrome Blue",
        description: "Single blue color family - cohesive and modern",
        bg: "#1E3A5F",
        text: "#E8F4F8",
        gradient_color: "#1E3A5F",
        water: "#0E2A4F",
        parks: "#2E4A6F",
        road_motorway: "#E8F4F8",
        road_primary: "#C8D4D8",
        road_secondary: "#A8B4B8",
        road_tertiary: "#889498",
        road_residential: "#687478",
        road_default: "#889498"
    },

    gradient_roads: {
        name: "Gradient Roads",
        description: "Smooth gradient shading - flowing and dynamic",
        bg: "#FAFAFA",
        text: "#212121",
        gradient_color: "#FAFAFA",
        water: "#E0E0E0",
        parks: "#F0F0F0",
        road_motorway: "#212121",
        road_primary: "#424242",
        road_secondary: "#616161",
        road_tertiary: "#757575",
        road_residential: "#9E9E9E",
        road_default: "#757575"
    },

    contrast_zones: {
        name: "Contrast Zones",
        description: "High contrast urban density - bold and striking",
        bg: "#FFFFFF",
        text: "#000000",
        gradient_color: "#FFFFFF",
        water: "#B0B0B0",
        parks: "#E0E0E0",
        road_motorway: "#000000",
        road_primary: "#1A1A1A",
        road_secondary: "#333333",
        road_tertiary: "#4D4D4D",
        road_residential: "#666666",
        road_default: "#4D4D4D"
    },

    midnight_gold: {
        name: "Midnight Gold",
        description: "Deep black background with brushed gold accents - ultimate luxury",
        bg: "#050505",
        text: "#D4AF37",
        gradient_color: "#050505",
        water: "#0A0A0A",
        parks: "#080808",
        road_motorway: "#D4AF37",
        road_primary: "#C5A028",
        road_secondary: "#B69119",
        road_tertiary: "#A7820A",
        road_residential: "#8E6F00",
        road_default: "#A7820A"
    },

    emerald_city: {
        name: "Emerald City",
        description: "Rich dark green with silver highlights - organic and premium",
        bg: "#061A14",
        text: "#D0D0D0",
        gradient_color: "#061A14",
        water: "#04120E",
        parks: "#08241B",
        road_motorway: "#00FF7F",
        road_primary: "#20B2AA",
        road_secondary: "#2E8B57",
        road_tertiary: "#3CB371",
        road_residential: "#66CDAA",
        road_default: "#3CB371"
    },

    nordic_light: {
        name: "Nordic Light",
        description: "Clean whites and soft grays - Scandinavian minimalism",
        bg: "#F9F9F9",
        text: "#2E3440",
        gradient_color: "#F9F9F9",
        water: "#E5E9F0",
        parks: "#ECEFF4",
        road_motorway: "#2E3440",
        road_primary: "#3B4252",
        road_secondary: "#434C5E",
        road_tertiary: "#4C566A",
        road_residential: "#D8DEE9",
        road_default: "#4C566A"
    }
};

export const getTheme = (themeName) => {
    return themes[themeName] || themes.feature_based;
};

export const getThemeNames = () => {
    return Object.keys(themes);
};
