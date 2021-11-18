const { Router } = require("express");
const axios = require('axios');
const { Recipe, Types } = require("../db.js");
const { Op } = require("sequelize");
const { YOUR_API_KEY } = process.env;
const router = Router();

router.get("/", (req, res) => {

    const name = req.query.query;
    var recipesApiName = [];
    var recipesDbName = [];
    var recipesApi = [];
    var recipesDb = [];

    if (name) {
        axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${YOUR_API_KEY}&addRecipeInformation=true&number=100&query=${name}`)
            .then(respApi => {
                recipesApiName = respApi.data.results.map(r => {
                    let diets;
                    r.vegetarian ? diets = r.diets.concat("vegetarian") : diets = r.diets;
                    return {
                        title: r.title,
                        summary: r.summary,
                        spoonacularScore: r.spoonacularScore,
                        healthScore: r.healthScore,
                        steps: r.analyzedInstructions[0],
                        image: r.image,
                        types: diets,
                        id: r.id
                    }
                });
                return (Recipe.findAll({
                    where: {
                        title: {
                            [Op.iLike]: `%${name}%`
                        }
                    },
                    include: {
                        model: Types,
                        attributes: ['name']
                    }
                }))
            })
            .then(respDb => {
                recipesDbName = respDb.map(r => {
                    return {
                        title: r.dataValues.title,
                        summary: r.dataValues.summary,
                        spoonacularScore: r.dataValues.spoonacularScore,
                        healthScore: r.dataValues.healthScore,
                        steps: r.dataValues.steps,
                        image: r.dataValues.image,
                        types: r.dataValues.types.map(t => { return t.name }),
                        id: r.dataValues.id
                    }
                });
                const allRecipesName = [...recipesApiName, ...recipesDbName];
                return res.json(allRecipesName)
            })
    }
    else {
        axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${YOUR_API_KEY}&addRecipeInformation=true&number=100`)
            .then(resp => {
                recipesApi = resp.data.results.map(r => {
                    let diets;
                    r.vegetarian ? diets = r.diets.concat("vegetarian") : diets = r.diets;
                    return {
                        title: r.title,
                        summary: r.summary,
                        spoonacularScore: r.spoonacularScore,
                        healthScore: r.healthScore,
                        steps: r.analyzedInstructions[0],
                        image: r.image,
                        types: diets,
                        id: r.id,
                        cuisines: r.cuisines
                    }
                });
                return (Recipe.findAll({
                    include: {
                        model: Types,
                        attributes: ['name']
                    }
                }));
            })
            .then(respDb => {
                recipesDb = respDb.map(r => {
                    return {
                        title: r.dataValues.title,
                        summary: r.dataValues.summary,
                        spoonacularScore: r.dataValues.spoonacularScore,
                        healthScore: r.dataValues.healthScore,
                        steps: r.dataValues.steps,
                        image: r.dataValues.image,
                        types: r.dataValues.types.map(t => { return t.name }),
                        id: r.dataValues.id
                    }
                });
                const allRecipes = [...recipesApi, ...recipesDb];
                return res.json(allRecipes)
            })
    }
})

router.get("/:id", (req, res) => {
    const { id } = req.params;
    if (id.length < 10) {
        axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${YOUR_API_KEY}`)
            .then(respId => {
                let diets;
                respId.data.vegetarian ? diets = respId.data.diets.concat("vegetarian") : diets = respId.data.diets;
                const infoId = {
                    title: respId.data.title,
                    summary: respId.data.summary,
                    spoonacularScore: respId.data.spoonacularScore,
                    healthScore: respId.data.healthScore,
                    steps: respId.data.analyzedInstructions.length !== 0 ? respId.data.analyzedInstructions[0].steps.map(s => {
                        return s.step
                    }) : [],
                    image: respId.data.image,
                    types: diets,
                    id: respId.data.id,
                    cuisines: respId.data.cuisines
                }
                return res.json(infoId)
            })
    }
    else {
        Recipe.findOne({
            where: { id: id },
            include: {
                model: Types,
                attributes: ['name']
            }
        })
            .then(respIdDb => {
                recipesDb = {
                    title: respIdDb.dataValues.title,
                    summary: respIdDb.dataValues.summary,
                    spoonacularScore: respIdDb.dataValues.spoonacularScore,
                    healthScore: respIdDb.dataValues.healthScore,
                    steps: respIdDb.dataValues.steps,
                    image: respIdDb.dataValues.image,
                    types: respIdDb.dataValues.types.map(t => { return t.name }),
                    id: respIdDb.dataValues.id
                };
                return res.json(recipesDb);
            })
    }

})

router.post('/', (req, res) => {
    const {
        title,
        summary,
        spoonacularScore,
        healthScore,
        steps,
        image,
        types
    } = req.body;

    Recipe.create({
        title,
        summary,
        spoonacularScore,
        healthScore,
        steps,
        image
    })
        .then(recipe => {
            recipe.addTypes(types)
                .then(() => {
                    return res.send("OK")
                });
        });
})

module.exports = router;