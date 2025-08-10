


export function createPageUrl(pageName: string) {
    // Return the exact route paths as defined in the Pages component
    const routeMap: { [key: string]: string } = {
        'Home': '/',
        'AddBake': '/AddBake',
        'Recipes': '/Recipes',
        'Profile': '/Profile',
        'BakeDetail': '/BakeDetail',
        'RecipeDetail': '/RecipeDetail',
        'AddRecipe': '/AddRecipe',
        'Contact': '/Contact',
        'EditProfile': '/EditProfile',
        'Circles': '/Circles',
        'CreateCircle': '/CreateCircle',
        'CircleDetail': '/CircleDetail',
        'Inbox': '/Inbox'
    };
    
    return routeMap[pageName] || '/';
}