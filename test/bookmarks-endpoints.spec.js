const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarkArray } = require('./bookmarks.fixtures');

describe.only('Bookmark Endpoints', () => {
    let db;

    before('Make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('bookmarks_store').truncate());

    afterEach('clean up', () => db('bookmarks_store').truncate());

    describe('GET /bookmarks', () => {
        context('There is nothing in the database', () => {
            it('returns an empty list', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, []);
            });
        });
        context('If there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarkArray();

            beforeEach('insert articles', () => {
                return db
                    .into('bookmarks_store')
                    .insert(testBookmarks);
            });

            it('responds with a 200 and the list of all bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks);
            });
        });
    });

    describe('GET /bookmars/:bookmark_id', () => {
        context('There is nothing in the database', () => {
            const fakeId = 123456789;
            it('returns an error', () => {
                return supertest(app)
                    .get(`/bookmarks/${fakeId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } });
            });
        });

        context('If there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarkArray();

            beforeEach('insert articles', () => {
                return db
                    .into('bookmarks_store')
                    .insert(testBookmarks);
            });

            it('responds with a 200 and the expected bookmark', () => {
                const target_id = 3;
                const target_bookmark = testBookmarks[target_id - 1];

                return supertest(app)
                    .get(`/bookmarks/${target_id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, target_bookmark);
            });
        });
    });
});