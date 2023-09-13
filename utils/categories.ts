export const fullCategories = {
    "Cuisine": [
        "Asian",
        "Chinese",
        "Fast Food",
        "Filipino",
        "French",
        "German",
        "Greek",
        "Indian",
        "Indonesian",
        "Italian",
        "Japanese",
        "Korean",
        "Malaysian",
        "Mexican",
        "Middle Eastern",
        "Spanish",
        "Sri Lanka",
        "Taiwanese",
        "Thai",
        "Vietnamese",
        "Western"
    ],
    "Meat": [
        "Beef",
        "Chicken",
        "Lamb",
        "Mutton",
        "Pork",
        "Steak"
    ],
    "Seafood": [
        "Clams",
        "Cod",
        "Crab",
        "Fish",
        "Salmon",
        "Scallops",
        "Shrimp"
    ],
    "Vegetables": [
        "Asparagus",
        "Bok Choy",
        "Broccoli",
        "Cabbage",
        "Cauliflower",
        "Carrot",
        "Corn",
        "Cucumber",
        "Lettuce",
        "Mushroom",
        "Onion",
        "Potato",
        "Spinach",
        "Squash",
        "Sweet Potato",
        "Tofu",
        "Tomato",
        "Zucchini"
    ],
    "Staples": [
        "Bread",
        "Noodles",
        "Pasta",
        "Pastry",
        "Rice",
        "Dumplings"
    ],
    "Spice": [
        "Chili",
        "Curry",
        "Garlic",
        "Ginger",
        "Jalapeno",
        "Pepper",
    ],
    "Dairy": [
        "Eggs",
        "Milk",
        "Cheese"
    ],
    "Seasoning": [] as string[],
    "Sauce": [] as string[],
    "Soup": [] as string[],
    "Drinks": [] as string[],
    "Snacks": [] as string[],
    "Desserts": [] as string[]
}
/**
stopped at 1200
 */
export const getCategoriesDropdown = () => {
    const { Cuisine, ...otherCat } = fullCategories;
    return Object.values(otherCat).flat().concat(Object.keys(otherCat));
}

export const getCategoriesChoice = () => {
    const tmp = JSON.parse(JSON.stringify(fullCategories));
    let arr = [];
    for (const [key, val] of Object.entries(tmp)) {
        let obj: { name: string, list?: string[] } = { name: key[0].toUpperCase() + key.substring(1) }
        if (['Cuisine', 'Meat'].includes(key)) {
            obj['list'] = val as string[];
        }
        if (key !== 'Staples') {
            arr.push(obj);
        }
    }
    return arr;
}

export const getParentCat = (cat: string) => {
    for (const [key, val] of Object.entries(fullCategories)) {
        if (val.includes(cat)) {
            return key;
        }
    }
}

export const findCategory = (cat: string, title: string) => {
    let list = [];
    for (const [key, val] of Object.entries(fullCategories)) {
        if (key === 'Cuisine') {
            continue;
        }
        if (val.includes(cat)) {
            ['Seafood', 'Vegetables', 'Meat'].includes(key) && list.push(key);
            list.push(cat);
        }
        for (let i = 0; i < val.length; i++) {
            if (title.toLowerCase().includes(val[i].toLowerCase())) {
                ['Seafood', 'Vegetables', 'Meat'].includes(key) && !list.includes(key) && list.push(key);
                !list.includes(val[i]) && list.push(val[i]);
            }
        }
    }
    return list;
}