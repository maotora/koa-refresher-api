const Router = require('koa-router')
const queries = require('../db/queries/movies')

const router = new Router()
const BASE_URL = `/api/v1/movies`

router.get(BASE_URL, async (ctx) => {
    try {
        const movies = await queries.getAllMovies()
        ctx.body = {
            status: 'success',
            data: movies
        }
    } catch(err) {
        console.error(err)
    }
})

router.get(`${BASE_URL}/:id`, async (ctx) => {
    try {
        const movieID = ctx.params.id
        const movie = await queries.getSingleMovie(movieID)
        if(movie.length) {
            ctx.body = {
                status: 'success',
                data: movie
            }
        } else {
            ctx.status = 404
            ctx.body = {
                status: 'error',
                message: 'Movie does not exist'
            }
        }
    } catch(err) {
        ctx.status = 404
        ctx.body = {
            status: 'error',
            message: err.message || 'Movie does not exist'
        }
    }
})

router.post(`${BASE_URL}`, async (ctx) => {
    try {
        const movieToAdd = ctx.request.body
        const addedMovie = await queries.addMovie(movieToAdd)

        if(addedMovie.length) {
            ctx.status = 201
            ctx.body = {
                status: 'success',
                data: addedMovie
            }
        } else {
            ctx.status = 400
            ctx.body = {
                status: 'error',
                message: 'Error adding movie'
            }
        }
    } catch(err) {
        ctx.status = 400
        ctx.body = {
            status: 'error',
            message: err.message || 'Error adding movie'
        }
    }
})

router.put(`${BASE_URL}/:id`, async (ctx) => {
    try {
        const editedMovieID = ctx.params.id
        const movieEdits = ctx.request.body
        const newMovie = await queries.editMovie(editedMovieID, movieEdits)

        ctx.body = {
            status: 'success',
            data: newMovie
        }
    } catch(err) {
        ctx.status = 404
        ctx.body = {
            status: 'error',
            data: err.message || 'There was an error updating a movie'
        }
    }
})

router.delete(`${BASE_URL}/:id`, async (ctx) => {
    try {
        const movieID = ctx.params.id
        const deletedMovie = await queries.deleteMovie(movieID)

        if(deletedMovie) {
            ctx.body = {
                status: 'success',
                data: deletedMovie
            }
        } else {
            throw Error('There was an error deleting this movie')
        }
    } catch(err) {
        ctx.status = 404
        ctx.body = {
            status: 'error',
            message: 'There was an error deleting this movie'
        }
    }
})

module.exports = router
