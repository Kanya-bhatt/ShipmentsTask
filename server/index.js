const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Register = require('./models/Employee');
const ToDo = require('./models/ToDo')
const app = express();
const jwtSecret = "ThisIsMyFirstMernProject$$$$$$$$";

app.use(express.json());
app.use(cors());

const mongoURI = "mongodb+srv://kanyaBhatt:baba5000@clustera.9sqiopf.mongodb.net/?retryWrites=true&w=majority&appName=ClusterA";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch((error) => {
  console.error("MongoDB connection error:", error);
});
//------------------------------------- SIGNUP -----------------------------------------
app.post('/register', [
  body("email", "Incorrect Email").isEmail(),
  body("password", "Incorrect Password").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const salt = await bcrypt.genSalt(10);
  let securePassword = await bcrypt.hash(req.body.password, salt);

  try {
    await Register.create({
      email: req.body.email,
      password: securePassword
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/users', async (req, res) => {
    try {
      const users = await Register.find({}, 'email'); // fetch only email field
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
//------------------------------------- LOGIN -----------------------------------------
  app.post('/login', [
    body("email", "Incorrect Email").isEmail(),
    body("password", "Incorrect Password").isLength({ min : 5})
  ], 
  async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()){
        return res.status(400).json({ errors: errors });
    }

    let email = req.body.email;
    try{
        let emailData = await Register.findOne({email});

        if(!emailData){
            return res.status(400).json({ errors: "try logging with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(req.body.password, emailData.password)
        if(!passwordCompare){
            return res.status(400).json({ errors: "try logging with correct credentials" });
        }

        const data = {
            email: {
                id: emailData.id
            }
        }

        // const authToken = jwt.sign(data, jwtSecret)
        return res.json({ success: true});
    }

    catch(error){
        console.log(error);
        res.json({ success: false });
    }

  }
)
const isBeforeToday = (deadline)=>{
  const currentDate = new Date();

  const value = new Date(deadline);
  const year1 = currentDate.getFullYear();
  const month1 = currentDate.getMonth(); 
  const day1 = currentDate.getDate(); 

  const year2 = value.getFullYear();
  const month2 = value.getMonth();
  const day2 = value.getDate();


  if (year2 > year1) {
    return true;
  } else if (year2 === year1 && month2 > month1) {
    return true;
  } else if (year2 === year1 && month2 === month1 && day2 > day1) {
    return true;
  }

  return false; 

}
const validStatusValues = ['pending', 'completed']
//------------------------------------- TODO -----------------------------------------
app.post('/todo', [
  body("deadline").isDate().withMessage("incorrect Deadline").custom(isBeforeToday),
  body("task", "incorrect Task").notEmpty(),
  body("status").isIn(validStatusValues).withMessage("Invalid Status")
], 
async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
  }

  try {
    
    await ToDo.create({
      task: req.body.task,
      status: req.body.status,
      deadline: req.body.deadline
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });
  }



}

)


app.get('/fetch', async (req, res)=>{
try{
  const myData = await ToDo.find({'status': 'pending'})
  loadedTasks = []

  
  res.json(myData);
}

catch(error){
  console.log("server error")
  res.status(500).json({ error: 'Internal server error' });

}

  

})

app.post('/getData', async(req, res) => {
  try{
    let id = req.body.id;

   const data = await ToDo.updateOne({'_id': id}, {$set: {'status': 'completed'}})

    console.log("hello: ", data);

    res.status(200).json({success: true})


    
    
  }
  catch(error){
    console.log("error:123 ", error)
    res.status(500).json({ error: 'Internal server error' });
  }

})


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
