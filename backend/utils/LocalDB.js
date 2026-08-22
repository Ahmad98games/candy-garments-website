const fs = require('fs');
const path = require('path');
const logger = require('../services/logger');

class LocalDB {
    constructor(collectionName, schema = {}) {
        this.collectionName = collectionName;
        this.schema = schema;
        this.filePath = path.join(__dirname, `../data/${collectionName}.json`);
        this.data = [];
        this.hooks = { pre: {} };

        // Ensure data directory exists
        const dataDir = path.dirname(this.filePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Load data
        this._load();
    }

    _load() {
        try {
            if (fs.existsSync(this.filePath)) {
                this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
                // Convert date strings back to Date objects if needed
                this.data = this.data.map(item => this._deserialize(item));
            }
        } catch (error) {
            logger.error(`Failed to load local DB: ${this.collectionName}`, { error: error.message });
            this.data = [];
        }
    }

    _save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            logger.error(`Failed to save local DB: ${this.collectionName}`, { error: error.message });
        }
    }

    _deserialize(item) {
        // Basic date restoration for common fields
        ['createdAt', 'updatedAt', 'deliveredAt', 'cancelledAt', 'whatsappSentAt'].forEach(field => {
            if (item[field]) item[field] = new Date(item[field]);
        });
        return item;
    }

    // --- Mongoose-like API ---

    async create(doc) {
        // Run pre-save hooks
        const context = { ...doc, constructor: this };
        if (this.hooks.pre['save']) {
            await this.hooks.pre['save'].call(context, () => { });
        }

        // Remove constructor from document to be saved
        const { constructor, ...docData } = context;

        // Apply Schema Defaults
        if (this.schema) {
            for (const [key, config] of Object.entries(this.schema)) {
                if (docData[key] === undefined && config.default !== undefined) {
                    docData[key] = config.default;
                }
            }
        }

        const newDoc = {
            _id: docData._id || Math.random().toString(36).substr(2, 9), // Use provided ID or generate one
            ...docData,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        };

        this.data.push(newDoc);
        this._save();
        return this._wrapDocument(newDoc);
    }

    // Helper to create Mongoose-like query chain
    _chain(resultOrPromise) {
        const chain = {
            // If it's already a promise/result, we hold it
            promise: Promise.resolve(resultOrPromise),

            // Chainable methods
            populate: () => chain,
            select: () => chain,
            lean: () => chain,
            sort: () => chain, // For single docs, sort is no-op

            // Promise interface
            then: (resolve, reject) => chain.promise.then(resolve, reject),
            catch: (reject) => chain.promise.catch(reject),
            finally: (cb) => chain.promise.finally(cb)
        };
        return chain;
    }

    // Return chain for find (array)
    find(query = {}) {
        let results = this.data.filter(item => this._matches(item, query));

        const chain = {
            results,
            sort: (criteria) => {
                const [field, order] = Object.entries(criteria)[0];
                chain.results.sort((a, b) => {
                    const valA = a[field];
                    const valB = b[field];
                    if (valA < valB) return order === 1 ? -1 : 1;
                    if (valA > valB) return order === 1 ? 1 : -1;
                    return 0;
                });
                return chain;
            },
            skip: (count) => {
                chain.skipCount = count;
                return chain;
            },
            limit: (count) => {
                chain.limitCount = count;
                return chain;
            },
            populate: () => chain,
            select: () => chain,
            lean: () => chain,
            then: (resolve, reject) => {
                let finalResults = chain.results;
                if (chain.skipCount) finalResults = finalResults.slice(chain.skipCount);
                if (chain.limitCount) finalResults = finalResults.slice(0, chain.limitCount);
                resolve(finalResults);
            }
        };
        return chain;
    }

    findById(id) {
        const doc = this.data.find(item => item._id === id);
        return this._chain(doc ? this._wrapDocument(doc) : null);
    }

    findOne(query) {
        const doc = this.data.find(item => this._matches(item, query));
        return this._chain(doc ? this._wrapDocument(doc) : null);
    }

    updateOne(query, update) {
        const doc = this.data.find(item => this._matches(item, query));
        if (!doc) return this._chain({ n: 0, nModified: 0 });

        this._applyUpdate(doc, update);
        this._save();
        return this._chain({ n: 1, nModified: 1 });
    }

    findOneAndUpdate(query, update, options = {}) {
        let doc = this.data.find(item => this._matches(item, query));
        if (!doc) return this._chain(null);

        this._applyUpdate(doc, update);
        this._save();
        return this._chain(this._wrapDocument(doc));
    }

    findByIdAndUpdate(id, update, options = {}) {
        return this.findOneAndUpdate({ _id: id }, update, options);
    }

    findByIdAndDelete(id) {
        const index = this.data.findIndex(item => item._id === id);
        if (index === -1) return this._chain(null);

        const [deletedDoc] = this.data.splice(index, 1);
        this._save();
        return this._chain(deletedDoc);
    }

    countDocuments(query = {}) {
        return Promise.resolve(this.data.filter(item => this._matches(item, query)).length);
    }

    // --- Helpers ---

    _matches(item, query) {
        for (const [key, value] of Object.entries(query)) {
            if (item[key] !== value) return false;
        }
        return true;
    }

    _applyUpdate(doc, update) {
        // Check for MongoDB atomic operators
        const hasOperators = Object.keys(update).some(k => k.startsWith('$'));

        if (hasOperators) {
            if (update.$set) Object.assign(doc, update.$set);
            if (update.$inc) {
                for (const [key, val] of Object.entries(update.$inc)) {
                    doc[key] = (doc[key] || 0) + val;
                }
            }
            if (update.$unset) {
                for (const key of Object.keys(update.$unset)) {
                    delete doc[key];
                }
            }
        } else {
            // Mongoose behavior: if no operators, treat top-level keys as updates
            Object.assign(doc, update);
        }

        doc.updatedAt = new Date();
    }

    _wrapDocument(doc) {
        // Add .save() method to document
        const self = this;
        return {
            ...doc,
            save: async function () {
                // Find and update in array
                const index = self.data.findIndex(i => i._id === this._id);
                if (index !== -1) {
                    self.data[index] = { ...this, updatedAt: new Date() };
                    self._save();
                }
                return this;
            },
            toObject: () => ({ ...doc })
        };
    }

    // --- Hooks ---
    pre(event, fn) {
        this.hooks.pre[event] = fn;
    }
}

module.exports = LocalDB;
