





const express = require("express")
const app = express()
const PORT = 3000




app.listen(PORT, function(error) {
    if (error) console.log(error);

    console.log("Server listening on port ", PORT)
})
