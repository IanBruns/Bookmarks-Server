const { expect } = require('chai');
const { contentSecurityPolicy } = require('helmet');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarkArray, makeMaliciousBookmark } = require('./bookmarks.fixtures');

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

    describe('POST /bookmarks', () => {
        it('creates a new bookmark responding with a 201 and new bookmark', () => {
            const newBookmark = {
                title: 'New Title',
                url: 'www.new-url.com',
                description: 'New Description',
                rating: 4
            };
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201);
        });

        it('creates a new bookmark responding with a 201 and a new bookmark w/o a description', () => {
            const newBookmark = {
                title: 'New Title',
                url: 'www.new-url.com',
                rating: 4
            };

            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201);
        });

        context('rejection cases', () => {
            it('Returns a 400 when the rating is over 5', () => {
                const newBookmark = {
                    title: 'New Title',
                    url: 'www.new-url.com',
                    description: 'New Description',
                    rating: 6
                };

                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400, { error: { message: 'rating must be between 1 and 5' } });
            });
        });

        context('Given an XSS attack', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

            it('Removes XSS content', () => {
                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(maliciousBookmark)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedBookmark.title);
                        expect(res.body.url).to.eql(expectedBookmark.url);
                    });
            });
        });
    });

    describe('GET /bookmarks/:bookmark_id', () => {
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

    describe.only('DELETE /bookmarks/:bookmark_id', () => {
        context('When there are no bookmarks in the database', () => {
            const bookmarkId = 1234;
            it('returns rejected due to no bookmark', () => {
                return supertest(app)
                    .delete(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } });
            });
        });

        // context('When there are bookmarks in the database', () => {
        //     const testBookmarks = makeBookmarkArray();

        //     beforeEach('Add Bookmarks into database', () => {
        //         return db
        //             .into('bookmarks_store')
        //             .insert(testBookmarks);
        //     });

        //     it('responds with a 204 and removes the bookmark', () => {
        //         const idToRemove = 1;
        //         const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove);

        //         return supertest(app)
        //             .delete(`/bookmarks/${idToRemove}`)
        //             .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        //             .expect(204)
        //             .expect(res =>
        //                 supertest(app)
        //                     .get('/bookmarks')
        //                     .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        //                     .expect(expectedBookmarks)
        //             );
        //     });
        // });
    });
});