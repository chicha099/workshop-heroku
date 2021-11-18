const { Router } = require("express");
const axios = require('axios');
// const Types = require("../models/Types");
const { Types } = require("../db.js");

const router = Router();

router.post("/", (req, res) => {
    const allTypes = [
        { name: "vegetarian" },
        { name: "vegan" },
        { name: "gluten free" },
        { name: "dairy free" },
        { name: "lacto ovo vegetarian" },
        { name: "paleolithic" },
        { name: "primal" },
        { name: "pescatarian" },
        { name: "fodmap friendly" },
        { name: "whole 30" },
        { name: "ketogenic" },
    ]

    Types.findAll()
        .then(resp => {
            if (!resp.length) {
                Types.bulkCreate(allTypes)
                    .then(respAdded => {
                        return res.json(allTypes)
                    })
            }
        })
});

router.get("/", (req, res) => {
    Types.findAll()
        .then(resp => {
            return res.json(resp)
        }
        )
});

module.exports = router;