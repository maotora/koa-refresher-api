const knex = require('../connections')

function getAllMovies() {
    return knex('movies').select()
}

function getSingleMovie(id) {
    return knex('movies').select()
        .where('id', id)
}

function addMovie(movie) {
    return knex('movies').insert(movie)
        .returning('*')
}

function editMovie(movieID, movie) {
    return knex('movies').update(movie)
        .where('id', movieID)
}

function deleteMovie(movieID) {
    return knex('movies').del()
        .where('id', parseInt(movieID))
        .returning('*')
}

module.exports = {
    getAllMovies,
    getSingleMovie,
    addMovie,
    editMovie,
    deleteMovie
}
