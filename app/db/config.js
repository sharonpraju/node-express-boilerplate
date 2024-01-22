const mongoose = require("mongoose");

function connect() {
    return new Promise(async (resolve, reject) => {
        var options = {
            keepAlive: true,
            connectTimeoutMS: 30000,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        try {
            await mongoose.connect(process.env.MONGODB_URI, options);
            console.log("Database Connection Established");
        }
        catch(error){
            console.log(error)
        }

    })
}

function close() {
    mongoose.disconnect();
}

module.exports = {
    connect,
    close
};