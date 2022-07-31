const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI, {});
client.connect()

exports.createEntry = async (collection, data) => {
    client.connect()
    return client.db(process.env.MONGO_DB).collection(collection).insertMany(data).then(data => {
        return data
    }).catch(err =>{
        console.log(err);
    })
} 

exports.findAndUpdate = async (collection, filter, data) => {
    client.connect()
    return client.db(process.env.MONGO_DB).collection(collection).findOneAndUpdate(filter, data).then(data => {
        return data
    }).catch(err =>{
        console.log(err);
    })
} 

exports.aggregator = async (collection, agg) => {
    client.connect()
    return client.db(process.env.MONGO_DB).collection(collection).aggregate([...agg]).toArray().then(res => {
        return res
    }).catch(err => {
        console.log(err)
    })
}

exports.findRecord = async (collection, data, sort, projection, limit) => {
    client.connect()
    return client.db(process.env.MONGO_DB).collection(collection).find({...data}, projection).sort(sort).limit(limit).toArray().then(res => {
        return res
    }).catch(err => {
        console.log(err)
    })
}

exports.findAndDelete = async (collection, findBy) => {
    client.connect()
    return client.db(process.env.MONGO_DB).collection(collection).deleteMany(findBy).then(data => {
        return data
    }).catch(err =>{
        console.log(err);
    })
}
