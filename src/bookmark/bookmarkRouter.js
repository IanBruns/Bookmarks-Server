const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const BookmarksService = require('./bookmark-service');

const bookmarkRouter = express.Router();

bookmarkRouter.use(express.json());

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
    .post((req, res) => {
        const { title, url, description, rating } = req.body;
        if (!title || !url || !description || !rating) {
            logger.error('Missing data = title/url/description/rating');
            return res
                .status(400)
                .send('Invalid Data');
        }

        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        };

        bookmarks.push(bookmark);

        logger.info(`Created Bookmark with and id of ${id}`);
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark);
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