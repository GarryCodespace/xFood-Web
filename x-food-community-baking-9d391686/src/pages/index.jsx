import Layout from "./Layout.jsx";

import Home from "./Home";

import AddBake from "./AddBake";

import Recipes from "./Recipes";

import Profile from "./Profile";

import BakeDetail from "./BakeDetail";

import RecipeDetail from "./RecipeDetail";

import AddRecipe from "./AddRecipe";

import Contact from "./Contact";

import EditProfile from "./EditProfile";

import Circles from "./Circles";

import CreateCircle from "./CreateCircle";

import CircleDetail from "./CircleDetail";

import Inbox from "./Inbox";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    AddBake: AddBake,
    
    Recipes: Recipes,
    
    Profile: Profile,
    
    BakeDetail: BakeDetail,
    
    RecipeDetail: RecipeDetail,
    
    AddRecipe: AddRecipe,
    
    Contact: Contact,
    
    EditProfile: EditProfile,
    
    Circles: Circles,
    
    CreateCircle: CreateCircle,
    
    CircleDetail: CircleDetail,
    
    Inbox: Inbox,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/AddBake" element={<AddBake />} />
                
                <Route path="/Recipes" element={<Recipes />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/BakeDetail" element={<BakeDetail />} />
                
                <Route path="/RecipeDetail" element={<RecipeDetail />} />
                
                <Route path="/AddRecipe" element={<AddRecipe />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/EditProfile" element={<EditProfile />} />
                
                <Route path="/Circles" element={<Circles />} />
                
                <Route path="/CreateCircle" element={<CreateCircle />} />
                
                <Route path="/CircleDetail" element={<CircleDetail />} />
                
                <Route path="/Inbox" element={<Inbox />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}