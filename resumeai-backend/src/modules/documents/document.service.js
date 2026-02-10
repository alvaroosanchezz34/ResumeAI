const Document = require('./document.model');

const createDocument = async (userId, payload) => {
    return await Document.create({
        userId,
        ...payload
    });
};

const getUserDocuments = async (userId) => {
    return await Document.find({ userId }).sort({ createdAt: -1 });
};

const getDocumentById = async (id, userId) => {
    return await Document.findOne({ _id: id, userId });
};

module.exports = {
    createDocument,
    getUserDocuments,
    getDocumentById
};
