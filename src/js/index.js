import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
//Global state of the app
//Search object
//Current recipe object
//Shopping list object
//Liked recipes
const state = {};

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
        //try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calculate servings
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        //} catch(err){
            alert('Error processing recipe');
        //}
    }
};
['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));

//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease', '.btn-decrease *')){
        //decrase button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingIngredients(state.recipe);
        }
    }
    if(e.target.matches('.btn-increase', '.btn-increase *')){
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingIngredients(state.recipe);
    }
});