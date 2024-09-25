/**
 * Xavier Teo Zai Ken (p2104261)
 * DIT/1B/02
 */
//Import required modules
const app = require("./controller/app");

//Bind the app to a open port
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
