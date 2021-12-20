const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
    const { dishId } = req.params
    const foundDish = dishes.find((dish) => dish.id === dishId)
    if (foundDish) {
        res.locals.dish = foundDish
        return next()
    }
    next({
        status: 404,
        message: `Dish does not exist: ${id}.`
    })
}

function bodyHasNameProperty(req, res, next) {
    const { data: { name } = {} } = req.body
    if (name) {
        return next()
    }
    next({
        status: 400,
        message: "Dish must include a name",
    })
}

function bodyHasDescriptionProperty(req, res, next) {
    const { data: { description } = {} } = req.body
    if (description) {
        return next()
    }
    next({
        status: 400,
        message: "Dish must include a description",
    })
}

function bodyHasValidPrice(req, res, next) {
    const { data: { price } = {} } = req.body
    if (price === undefined) {
        next({
            status: 400,
            message: "Dish must inlcude a price"
        })
    } else if (price <= 0) {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        })
    } else if (!Number.isInteger(price)) {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
    return next()
}

function bodyHasValidImageUrl(req, res, next) {
    const { data: { image_url } = {} } = req.body
    if (image_url) {
        return next()
    }
    next({
        status: 400,
        message: "Dish must include a image_url",
    })
}







function list(req, res) {
    res.json({ data: dishes })
}

function create(req, res) {
    const { data: { ...body } = {} } = req.body
    const newDish = {
        id: nextId(),
        ...body,
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}

function update(req, res) {
    const { data: { ...newDish } = {} } = req.body
    res.json({ data: newDish })
}





module.exports = {
    list,
    create: [
        bodyHasNameProperty, 
        bodyHasDescriptionProperty,
        bodyHasValidPrice,
        bodyHasValidImageUrl,
        create,
    ],
    update: [dishExists, update]
}