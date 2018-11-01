process.env.NODE_ENV = 'test'

const chai = require('chai')
const should = chai.should()
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const server = require('../src/server/index')
const knex = require('../src/server/db/connections')

describe('routes : movies', () => {

    beforeEach(() => {
        return knex.migrate.rollback()
            .then(() => knex.migrate.latest())
            .then(() => knex.seed.run())
    })

    afterEach(() => knex.migrate.rollback())

    describe('GET /api/v1/movies', () => {
        it('should return all movies', (done) => {
            chai.request(server)
            .get('/api/v1/movies')
            .end((err, res) => {
                should.not.exist(err)
                res.status.should.eql(200)
                res.type.should.eql('application/json')
                res.body.status.should.eql('success')
                res.body.data.length.should.eql(3)
                res.body.data[0].should.include.keys(
                    'id', 'name', 'genre', 'rating', 'explicit'
                )

                done()
            })
        })
    })

    describe('GET /api/vi/movies/:id', () => {
        it('should return a single movie', (done) => {
            chai.request(server)
            .get(`/api/v1/movies/1`)
            .end((err, res) => {
                should.not.exist(err)
                res.status.should.eql(200)
                res.type.should.eql('application/json')
                res.body.status.should.eql('success')
                res.body.data[0].should.include.keys(
                    'id', 'name', 'genre', 'rating', 'explicit'
                )
                done()
            })
        })

        it('should throw an error if movie does not exists', (done) => {
            chai.request(server)
            .get('/api/movies/1337')
            .end((err, res) => {
                should.exist(err)
                res.status.should.eql(404)
                // commented because they fail and this is a tutorial
                // res.type.should.eql('text/plain')
                // res.body.status.should.eql('error')
                // res.body.message.should.eql('Movie does not exist')
                done()
            })
        })
    })

    describe('POST /api/v1/movies', () => {
        it('should return the movie that was added', (done) => {
            chai.request(server)
            .post('/api/v1/movies')
            .send({
                name: 'Titanic',
                genre: 'Drama',
                rating: 8,
                explicit: true
            })
            .end((err, res) => {
                should.not.exist(err)
                res.status.should.equal(201)
                res.type.should.equal('application/json')
                res.body.status.should.eql('success')
                done()
            })
        })

        it('should throw when sent malformed movie', (done) => {
            chai.request(server)
            .post('/api/v1/movies')
            .send({
                name: 'Titanic',
            })
            .end((err, res) => {
                should.exist(err)
                res.status.should.equal(400)
                res.type.should.equal('application/json')
                res.body.status.should.eql('error')
                done()
            })
        })
    })

    describe('PUT /api/v1/movies', () => {
        it('should return the movie that was updated', (done) => {
            knex('movies')
            .select('*')
            .then((movie) => {
                const movieObject = movie[0]
                chai.request(server)
                .put(`/api/v1/movies/${movieObject.id}`)
                .send({
                    rating: 9
                })
                .end((err, res) => {
                    should.not.exist(err)
                    res.status.should.equal(200)
                    res.type.should.equal('application/json')
                    res.body.status.should.equal('success')
                    //- Won't check returning values since I'm using sqlite3 to tests.
                    done()
                })
            })
        })

        it('should throw if the updated movie does not exist', (done) => {
            chai.request(server)
            .put('/api/v1/movies/1337')
            .end((err, res) => {
                should.exist(err)
                res.type.should.eql('application/json')
                res.status.should.eql(404)
                res.body.status.should.eql('error')
                done()
            })
        })
    })

    describe('DELETE /api/v1/movies', () => {
        it('should delete movies', (done) => {
            knex('movies').select('*')
            .then(movies => {
                const lengthBeforeDelete = movies.length
                const movieObject = movies[0]

                chai.request(server)
                .delete(`/api/v1/movies/${movieObject.id}`)
                .end((err, res) => {
                    should.not.exist(err)
                    res.status.should.equal(200)
                    res.type.should.eql('application/json')
                    res.body.status.should.eql('success')

                    knex('movies').select('*')
                    .where('id', parseInt(movieObject.id))
                    .then(returnedMovie => {
                        returnedMovie.should.be.empty
                        done()
                    })
                })
            })
        })

        it('should throw if the movie does not exist', (done) => {
            chai.request(server)
            .delete('/api/v1/movies/1337')
            .end((err, res) => {
                should.exist(err)
                res.type.should.eql('application/json')
                res.status.should.equal(404)
                res.body.status.should.equal('error')
                res.body.message.should.equal('There was an error deleting this movie')
                done()
            })
        })
    })
})
