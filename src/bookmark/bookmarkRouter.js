const { json } = require('express');
const express = require('express');
const xss = require('xss');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const BookmarksService = require('./bookmark-service');

const bookmarkRouter = express.Router();
const jsonParser = express.json();

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    name: xss(bookmark.name),
    url: xss(bookmark.url),
    description: xss(bookmark.description),
    rating: bookmark.rating
});

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        return BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks);
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body;
        const newBookmark = { title, url, description, rating };

        if (newBookmark.rating > 5 || newBookmark.ratin < 0) {
            return res.status(400)
                .json({
                    error: { message: 'rating must be between 1 and 5' }
                });
        }
        for (const [key, value] of Object.entries(newBookmark)) {
            if (key != 'description' && value == null) {
                return res.status(400)
                    .json({
                        error: { message: `Missing '${key}' in request body` }
                    });
            }
        }

        BookmarksService.insertBookmark(req.app.get('db'), newBookmark)
            .then(bookmark =>
                res.status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(serializeBookmark(bookmark)))
            .catch(next);
    });

bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        const { bookmark_id } = req.params;

        BookmarksService.getById(knexInstance, bookmark_id)
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    });
                }
                res.json(bookmark);
            })
            .catch(next);
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark id ${id} does not exist`);
            return res
                .status(404)
                .send('Bookmark not found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Deleted bookmark with id of ${id}`);

        res
            .status(204)
            .end();
    });

module.exports = bookmarkRouter;