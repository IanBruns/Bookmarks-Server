const express = require('express');
const xss = require('xss');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const BookmarksService = require('./bookmark-service');

const bookmarkRouter = express.Router();
const jsonParser = express.json();

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
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
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmark_id
        )
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    });
                }
                res.bookmark = bookmark; // save the article for the next middleware
                next(); // don't forget to call next so the next middleware happens!
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark));
    })
    .delete((req, res, next) => {
        BookmarksService.deleteArticle(req.app.get('db'), req.params.bookmark_id)
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = bookmarkRouter;