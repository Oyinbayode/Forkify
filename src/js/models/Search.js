import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults(query) {
    
    const proxy = 'https://cors-anywhere.herokuapp.com/'
    //const Key = '4296c5d8fb4e18633972940b02920252'
    //const ID = 'fa625bcf'
    try {
        const Res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
        this.recipes = Res.data.recipes
    } catch (error) {
        alert(error)
    };
}
}