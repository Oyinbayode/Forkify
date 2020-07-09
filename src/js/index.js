import Search from './models/Search';

import Recipe from './models/Recipe';

import List from './models/List';

import Like from './models/Like';

import * as searchView from './views/searchView';

import * as recipeView from './views/recipeView';

import * as listView from './views/listView';

import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Like';
/** Global State of the App
 * Search Object
 * Current recipe object
 * shopping list object
 * liked recipes
 */
const state = {};


/* 
    Global Search Code
*/

const controlSearch = async () => {
    // 1. get query from view
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
         searchView.clearInput();
         searchView.clearResult();
         renderLoader(elements.searchRes);

       // 4.  Search for recipes
       await state.search.getResults();

       // 5. Render results in UI
        clearLoader();
        searchView.renderResults(state.search.recipes)
       

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.recipes, goToPage)

    }
})


/*
* Global Recipe Code
 */
const controlRecipe = async () => {
    // get ID from URL
    const id = window.location.hash.replace('#', '');

    if(id) {
    // Prepare UI for changes
    recipeView.clearUI();
    renderLoader(elements.recipe);
    

    // Highlight selected search item
    if(state.search) {searchView.highlightSelected(id)};

     // Create new recipe Object
     state.recipe = new Recipe(id);

    try {
   
    // Get recipe data and parse Ingredients
    await state.recipe.getRecipe();
    state.recipe.parseIngredients();

    // Calculate servings and time
    state.recipe.calcTime();
    state.recipe.calcServings();

    // Render Recipe
    clearLoader();
    recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        )        
        } catch {
            alert('Error 101 Baby (:')
        }
        
    }
}


/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list If There is none yet
    if (!state.list) {
        state.list = new List();
    }

    // Add Each Ingredient to the List and the UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

// window.addEventListener('hashchange', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handle delete and Update List Item Events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the Delete Button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete From State
        state.list.deleteItem(id);

        // Delete From UI
        listView.deleteItem(id);

        // Handle The Count Update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        while(val > 0) {
            state.list.updateCount(id, val);
        }
        
    }
});

/**
 * LIKE CONTROLLER
 */
// TESTING


const controlLike = () => {
    if (!state.likes) {
        state.likes = new Likes()
    };
    const currentID = state.recipe.id;
    
    // User has NOT yet liked current recipe
    if(!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        // Toggle the like button
            likesView.toggleLikeBtn(true);
        // Add Like to the UI
        likesView.renderLikes(newLike)
    // User HAS liked current recipe    
    } else {
        // Remove like from the state
        state.likes.deleteLike(state.recipe.id)
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Remove like from the UI
        likesView.deleteLike(state.recipe.id);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore Liked Recipe on Page Load
 window.addEventListener('load', () => {
     state.likes = new Likes();

//     // Restore Likes
     state.likes.readStorage();

//     // Toggle Like menu button
     likesView.toggleLikeMenu(state.likes.getNumLikes());

//     // REnder the existing likes
     state.likes.likes.forEach(like => likesView.renderLikes(like));
    })



// Handling recipe button clicks

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if(state.recipe.servings > 1) {
        state.recipe.updateServings('dec')
        recipeView.updateServingsIngredients(state.recipe)
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe)
    } else if (e.target.matches('.recipe__btn--add, recipe__btn--add *')) {
        // Add Ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like Controller
        controlLike();
    }
   
})
