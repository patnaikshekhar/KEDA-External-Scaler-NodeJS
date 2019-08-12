const MongoClient = require('mongodb').MongoClient
const grpc = require('grpc')

const METRIC_NAME = 'MongoCollectionLength'

const scaledObjects = {}


function New(request, callback) {
    const requiredFields = ['connectionString', 'db', 'collectionName', 'length']
    const missingFields = requiredFields.filter(
        field => !(field in request.request.metadata))

    if (missingFields.length > 0) {
        const errorMessage = `Missing ${missingFields.join(', ')} in metadata`
        callback({
            code: 400,
            message: errorMessage,
            status: grpc.status.INVALID_ARGUMENT
        })
    } else {
        const name = getScaledObjectName(request.request.scaledObjectRef)    
        scaledObjects[name] = request.request.metadata
        callback(null, {})
    }
}

function IsActive(request, callback) {
    const name = getScaledObjectName(request.request)
    const so = scaledObjects[name] 
    getCollectionSize(so.connectionString, so.db, so.collectionName)
        .then(length => {
            callback(null, {
                result: length > 0
            })
        })
        .catch(e => {
            console.error(e)
            callback({
                code: 500,
                message: e.toString(),
                status: grpc.status.INTERNAL
            })
        })
}

function GetMetricSpec(request, callback) {
    const name = getScaledObjectName(request.request)
    const so = scaledObjects[name] 

    callback(null, {
        metricSpecs: [{
            metricName: METRIC_NAME,
            targetSize: so.length
        }]
    })
}

function GetMetrics(request, callback) {
    const name = getScaledObjectName(request.request.scaledObjectRef)
    const so = scaledObjects[name] 
    getCollectionSize(so.connectionString, so.db, so.collectionName)
        .then(length => {
            callback(null, {
                metricValues: [{
                    metricName: METRIC_NAME,
                    metricValue: length
                }]
            })
        })
        .catch(e => {
            console.error(e)
            callback({
                code: 500,
                message: e.toString(),
                status: grpc.status.INTERNAL
            })
        })
}

function Close(request, callback) {
    const name = getScaledObjectName(request.request)
    delete scaledObjects[name]
    callback(null, {})
}

function getScaledObjectName(scaledObjectRef) {
    const scaledObjectName = scaledObjectRef.name
    const scaledObjectNamespace = scaledObjectRef.namespace
    const scaledObject = `${scaledObjectNamespace}/${scaledObjectName}`

    return scaledObject
}

async function getCollectionSize(connectionString, dbName, collectionName) {
    const connection = await MongoClient.connect(connectionString)
    const count = await connection.db(dbName).collection(collectionName).count()
    await connection.close()
    return count
}

module.exports = {
    New,
    IsActive,
    GetMetricSpec,
    GetMetrics,
    Close
}