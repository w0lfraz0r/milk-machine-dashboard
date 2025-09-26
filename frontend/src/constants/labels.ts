export const LABELS = {
    assemblyLine1: 'Assembly Line 1',
    assemblyLine2: 'Assembly Line 2',
    packets: 'Packets',
    brands: 'Brands'
};

export const BRAND_CARDS_LABELS = {
    tonedMilk: 'Toned Milk',
    shubham: 'Shubham',
    nandiniSpecial: 'Nandini Special',
    homogenisedCow: 'Homogenised Cow Milk',
    smrudhi: 'Smrudhi',
    desiCow: 'Desi Cow',
}

export const BRAND_NAMES_KEYS = Object.values(BRAND_CARDS_LABELS);

export const BRAND_COLORS = {
    tonedMilk: '#1976d2', // blue
    shubham: '#ff9800', // orange
    nandiniSpecial: '#81c784', // light green
    homogenisedCow: '#388e3c', // dark green
    smrudhi: '#e91e63', // pink
    desiCow: '#8e24aa', // purple
}

export const BRAND_COLOR_TO_NAME = {
    green: 'nandiniSpecial',
    orange: 'shubham',
    darkGreen: 'homogenisedCow',
    purple: 'desiCow',
    pink: 'smrudhi',
    blue: 'tonedMilk',
};// actual color values are green, yellow, red, blue

export const BRAND_PACKET_SIZES = {
    tonedMilk: ['one', 'half', 'six', 'small'] as (keyof typeof PACKET_SIZE_LABELS)[],
    shubham: ['one', 'half'] as (keyof typeof PACKET_SIZE_LABELS)[],
    nandiniSpecial: ['one', 'half'] as (keyof typeof PACKET_SIZE_LABELS)[],
    homogenisedCow: ['half'] as (keyof typeof PACKET_SIZE_LABELS)[],
    smrudhi: ['half'] as (keyof typeof PACKET_SIZE_LABELS)[],
    desiCow: ['half'] as (keyof typeof PACKET_SIZE_LABELS)[],
}

export const PACKET_SIZES = ['one', 'half', 'six', 'small'];

export const PACKET_SIZE_LABELS = {
    one: '1L',
    half: '500ml',
    six: '6L',
    small: '200ml',
}