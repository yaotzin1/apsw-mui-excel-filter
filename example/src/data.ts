/** One row of the table the filters narrow: a meal ordered somewhere in the world. */
export interface Order {
    id: string;
    dish: string;
    cuisine: string;
    city: string;
    status: string;
    placed: string;
}

export const ORDERS: Order[] = [
    { id: 'A-1041', dish: 'Margherita pizza', cuisine: 'italian', city: 'la', status: 'delivered', placed: '2026-07-14' },
    { id: 'A-1042', dish: 'Spaghetti carbonara', cuisine: 'italian', city: 'sydney', status: 'delivery', placed: '2026-08-02' },
    { id: 'A-1043', dish: 'Mushroom risotto', cuisine: 'italian', city: 'berlin', status: 'paid', placed: '2026-09-01' },
    { id: 'A-1044', dish: 'Tiramisu', cuisine: 'italian', city: 'tokyo', status: 'cancelled', placed: '2026-05-19' },
    { id: 'A-1045', dish: 'Tonkotsu ramen', cuisine: 'japanese', city: 'toronto', status: 'delivered', placed: '2026-02-03' },
    { id: 'A-1046', dish: 'Salmon nigiri, six pieces', cuisine: 'japanese', city: 'saopaulo', status: 'cooking', placed: '2026-08-27' },
    { id: 'A-1047', dish: 'Chicken katsu curry', cuisine: 'japanese', city: 'amsterdam', status: 'delivery', placed: '2026-06-11' },
    { id: 'A-1048', dish: 'Miso soup', cuisine: 'japanese', city: 'sydney', status: 'delivered', placed: '2026-04-09' },
    { id: 'A-1049', dish: 'Tacos al pastor', cuisine: 'mexican', city: 'seoul', status: 'delivery', placed: '2026-09-03' },
    { id: 'A-1050', dish: 'Chicken quesadilla', cuisine: 'mexican', city: 'la', status: 'paid', placed: '2026-09-05' },
    { id: 'A-1051', dish: 'Beef burrito', cuisine: 'mexican', city: 'lagos', status: 'delivered', placed: '2026-03-18' },
    { id: 'A-1052', dish: 'Guacamole and chips', cuisine: 'mexican', city: 'mumbai', status: 'cancelled', placed: '2026-01-21' },
    { id: 'A-1053', dish: 'Butter chicken', cuisine: 'indian', city: 'berlin', status: 'delivered', placed: '2026-05-30' },
    { id: 'A-1054', dish: 'Lamb rogan josh', cuisine: 'indian', city: 'paris', status: 'cooking', placed: '2026-08-22' },
    { id: 'A-1055', dish: 'Chana masala', cuisine: 'indian', city: 'toronto', status: 'delivery', placed: '2026-07-02' },
    { id: 'A-1056', dish: 'Garlic naan, two', cuisine: 'indian', city: 'mexico', status: 'paid', placed: '2026-09-04' },
    { id: 'A-1057', dish: 'Pad thai', cuisine: 'thai', city: 'amsterdam', status: 'delivered', placed: '2026-04-23' },
    { id: 'A-1058', dish: 'Green curry', cuisine: 'thai', city: 'mexico', status: 'delivery', placed: '2026-06-30' },
    { id: 'A-1059', dish: 'Tom yum soup', cuisine: 'thai', city: 'sydney', status: 'cancelled', placed: '2026-02-28' },
    { id: 'A-1060', dish: 'Mango sticky rice', cuisine: 'thai', city: 'lagos', status: 'paid', placed: '2026-08-14' },
    { id: 'A-1061', dish: 'Chicken gyros', cuisine: 'greek', city: 'tokyo', status: 'delivered', placed: '2026-03-05' },
    { id: 'A-1062', dish: 'Moussaka', cuisine: 'greek', city: 'paris', status: 'delivery', placed: '2026-07-25' },
    { id: 'A-1063', dish: 'Greek salad', cuisine: 'greek', city: 'la', status: 'cooking', placed: '2026-09-02' },
    { id: 'A-1064', dish: 'Spanakopita', cuisine: 'greek', city: 'saopaulo', status: 'delivered', placed: '2026-05-12' },
    { id: 'A-1065', dish: 'Falafel wrap', cuisine: 'lebanese', city: 'berlin', status: 'delivered', placed: '2026-06-19' },
    { id: 'A-1066', dish: 'Chicken shawarma', cuisine: 'lebanese', city: 'seoul', status: 'paid', placed: '2026-08-29' },
    { id: 'A-1067', dish: 'Hummus and pita', cuisine: 'lebanese', city: 'toronto', status: 'delivery', placed: '2026-01-08' },
    { id: 'A-1068', dish: 'Tabbouleh', cuisine: 'lebanese', city: 'mumbai', status: 'cancelled', placed: '2026-04-15' },
    { id: 'A-1069', dish: 'Bibimbap', cuisine: 'korean', city: 'sydney', status: 'delivered', placed: '2026-07-19' },
    { id: 'A-1070', dish: 'Kimchi stew', cuisine: 'korean', city: 'mexico', status: 'delivery', placed: '2026-06-06' },
    { id: 'A-1071', dish: 'Korean fried chicken', cuisine: 'korean', city: 'lagos', status: 'cooking', placed: '2026-02-11' },
    { id: 'A-1072', dish: 'Japchae', cuisine: 'korean', city: 'paris', status: 'delivered', placed: '2026-08-01' },
    { id: 'A-1073', dish: 'Croque monsieur', cuisine: 'french', city: 'tokyo', status: 'delivered', placed: '2026-05-17' },
    { id: 'A-1074', dish: 'Onion soup', cuisine: 'french', city: 'amsterdam', status: 'paid', placed: '2026-09-06' },
    { id: 'A-1075', dish: 'Steak frites', cuisine: 'french', city: 'seoul', status: 'delivery', placed: '2026-06-24' },
    { id: 'A-1076', dish: 'Crème brûlée', cuisine: 'french', city: 'mumbai', status: 'cancelled', placed: '2026-03-30' },
    { id: 'A-1077', dish: 'Pierogi ruskie', cuisine: 'polish', city: 'saopaulo', status: 'delivered', placed: '2026-07-08' },
    { id: 'A-1078', dish: 'Żurek', cuisine: 'polish', city: 'la', status: 'delivery', placed: '2026-08-18' },
    { id: 'A-1079', dish: 'Bigos', cuisine: 'polish', city: 'berlin', status: 'cooking', placed: '2026-09-07' },
    { id: 'A-1080', dish: 'Potato pancakes', cuisine: 'polish', city: 'mexico', status: 'delivered', placed: '2026-04-02' },
];

export const CUISINE_TITLES: Record<string, string> = {
    french: 'French',
    greek: 'Greek',
    indian: 'Indian',
    italian: 'Italian',
    japanese: 'Japanese',
    korean: 'Korean',
    lebanese: 'Lebanese',
    mexican: 'Mexican',
    polish: 'Polish',
    thai: 'Thai',
};

export const CITY_TITLES: Record<string, string> = {
    amsterdam: 'Amsterdam',
    berlin: 'Berlin',
    la: 'Los Angeles',
    lagos: 'Lagos',
    mexico: 'Mexico City',
    mumbai: 'Mumbai',
    paris: 'Paris',
    saopaulo: 'São Paulo',
    seoul: 'Seoul',
    sydney: 'Sydney',
    tokyo: 'Tokyo',
    toronto: 'Toronto',
};

export const STATUS_TITLES: Record<string, string> = {
    cancelled: 'Cancelled',
    cooking: 'Cooking',
    delivered: 'Delivered',
    delivery: 'Out for delivery',
    paid: 'Paid',
};

/**
 * The dropdown wants `{ value, label }` pairs. Deriving them from the rows keeps the two
 * lists from drifting: an option no row uses would filter the table down to nothing.
 */
export const optionsFor = (
    field: 'cuisine' | 'city' | 'status',
    titles: Record<string, string>,
): Array<{ value: string; label: string }> =>
    Array.from(new Set(ORDERS.map((order) => order[field])))
        .map((value) => ({ value, label: titles[value] ?? value }))
        .sort((a, b) => a.label.localeCompare(b.label));
