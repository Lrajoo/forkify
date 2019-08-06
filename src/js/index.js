import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

//Global state of the app
//Search object
//Current recipe object
//Shopping list object
//Liked recipes
const state = {};
window.state = state;

//Search Controller
const controlSearch = async() => {
    //1. Get the query from the view
    const query = searchView.getInput();

    if(query){
        //2. New search object and add to state
        state.search = new Search(query);
        //3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResult);
        //4. Search for recipes
        try{
            await state.search.getResults();
            //5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(err){
            alert('Something went wrong with the search');
            clearLoader();
        }
    }
};
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResultPage.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }

});

//Recipe Controller
const controlRecipe = async () => {
    //Get id from URL
    const id = window.location.hash.replace('#','');
    console.log(id);

    if(id){
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        //Highlight selected recipe
        if (state.search){
            searchView.highlightSelected(id);
        };
        //Create new recipe object
        state.recipe = new Recipe(id);
        //Get recipe data and parse ingredients
        try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calculate servings
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch(err){
            alert('Error processing recipe');
        }
    }
};
['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));

//LIST CONTROLLER

const controlList = () => {
    //create a list if there is none
    if(!state.list) state.list = new List();

    //add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
    
};

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid; 
    //delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from state
        state.list.deleteItem(id);
        //delete from UI
        listView.deleteItem(id);
    }else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

//LIKE CONTROLLER

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const currID = state.recipe.id;

    if(!state.likes.isLiked(currID)){
        const newLike = state.likes.addLike(currID,state.recipe.title,state.recipe.author,state.recipe.image);
        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);
    }else{
        state.likes.deleteLike(currID);
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currID);
    }   
    //likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//restore liked recipes
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    //likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //decrase button is clicked
        console.log(state.recipe);
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingIngredients(state.recipe);
        }
    }else if (e.target.matches('.btn-increase, .btn-increase *')){
        console.log(state.recipe);
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingIngredients(state.recipe);
    }else if (e.target.matches('.recipe__btn-add, .recipe__btn--add *')){
        //add ingredients to list
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }
    
});

window.l = new List();