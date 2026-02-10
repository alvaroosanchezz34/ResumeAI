const service = require('./document.service');

const create = async (req, res, next) => {
    try {
        const doc = await service.createDocument(req.user.userId, req.body);
        res.status(201).json({ success: true, document: doc });
    } catch (err) {
        next(err);
    }
};

const list = async (req, res, next) => {
    try {
        const docs = await service.getUserDocuments(req.user.userId);
        res.json({ success: true, documents: docs });
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const doc = await service.getDocumentById(
            req.params.id,
            req.user.userId
        );
        if (!doc) return res.status(404).json({ message: 'Not found' });

        res.json({ success: true, document: doc });
    } catch (err) {
        next(err);
    }
};

module.exports = { create, list, getById };
