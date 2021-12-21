const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function deliverToPropertyIsValid(req, res, next) {
    const { data: { deliverTo } = {} } = req.body
    if (deliverTo) {
        return next()
    }
    next({
        status: 400,
        message: "Order smust include a deliverTo"
    })
}

function mobileNumberIsValid(req, res, next) {
    const { data: { mobileNumber} = {} } = req.body
    if (mobileNumber) {
        return next()
    }
    next({
        status: 400,
        message: "Order must include a mobileNumber",
    })
}

function dishesPropertyIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body
    if (!Array.isArray(dishes) || dishes === undefined || dishes === null) {
        next({
            status: 400,
            message: "Order must include at least one dish",
        })
    } else if (!dishes) {
        next({
            status: 400,
            message: "Order must include a dish",
        })
    } else if (dishes.length === 0) {
        next({
            status: 400,
            message: "Order must include at least one dish",
        })
    }
    for (let dish of dishes) {
        if (!Number.isInteger(dish.quantity) || dish.quantity <= 0 ) {
            next({
                status: 400,
                message: `dish ${dishes.indexOf(dish)} must have a quantity that is an integer greater than 0`
            })
        }
    }
    return next()
}

function orderExists(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order) => order.id === orderId)
    if (foundOrder) {
        res.locals.order = foundOrder
        res.locals.index = orders.indexOf(foundOrder)
        res.locals.status = foundOrder.status
        return next()
    }
    next({
        status: 404,
        message: `Order not found. Id: ${orderId}`,
    })
}

function statusPropertyIsValid(req, res, next) {
    const { data: { status } = {} } = req.body
    if (status === null || status === undefined || status === "") {
        next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    } else if (status === "delivered") {
        next({
            status: 400,
            message: "A delivered order cannot be changed"
        })
    }
    if (status !== "pending" && status !== "preparing" && status !== "out-for-delivery") {
        next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        })
    }

    return next()
}

function bodyIdMatchesOrderIdParam(req, res, next) {
    const { orderId } = req.params
    const { data: { id } = {} } = req.body
    if (id === undefined || id === null || id === "") {
        res.locals.orderId = orderId
        return next()
    } else if (orderId !== id) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
        })
    }
    res.locals.orderId = orderId
    return next()
}

function orderStatusIsPending(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order) => order.id === orderId)
    if (foundOrder.status !== "pending") {
        next({
            status: 400,
            message: "An order cannot be deleted unless it is pending"
        })
    }
    return next()
}

function list(req, res) {
    res.json({ data: orders })
}

function create(req, res) {
    const newOrder = {
        id: nextId(),
        ...req.body.data,
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}

function read(req, res) {
    const order = res.locals.order
    res.json({ data: order })
}

function update(req, res) {
    const { orderId } = res.locals
    const { data: { ...body } = {} } = req.body
    const updatedOrder = { 
        ...body
    }
    updatedOrder.id = res.locals.order.id
    orders[res.locals.index] = updatedOrder
    res.json({ data: updatedOrder })
}

function destroy(req, res) {
    orders.splice(res.locals.index, 1)
    res.sendStatus(204)
}


module.exports = {
    list,
    create: [
        deliverToPropertyIsValid, 
        mobileNumberIsValid,
        dishesPropertyIsValid,
        create,
    ],
    read: [
        orderExists,
        read,
    ],
    update: [
        orderExists,
        bodyIdMatchesOrderIdParam,
        deliverToPropertyIsValid,
        mobileNumberIsValid,
        dishesPropertyIsValid,
        statusPropertyIsValid,
        update,
    ],
    destroy: [
        orderExists,
        orderStatusIsPending,
        destroy,
    ]
}
