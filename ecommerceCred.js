const { response, text } = require('express');
const express = require('express');
const Sequelize=require('sequelize');
const dbConfig=require('./db.config');
const cors = require('cors');
const nodemailer = require ("nodemailer");

const app = express()

app.use(express.json())
app.use(cors());

//Creating a reference to mail
const transporter = nodemailer.createTransport ({    
    service:'gmail', 
     auth: {
         user:'xyz@gmail.com', //Enter Your Email
         pass : 'xxxxxx' //Enter Your Password
     }
 });

//Establishing a Connection with db
let sequelize=new Sequelize(dbConfig.DB,dbConfig.USER,dbConfig.PASSWORD,{
    host:dbConfig.HOST,
    dialect:dbConfig.dialect,
    pool:{
        max:dbConfig.pool.max,
        min:dbConfig.pool.min,
        acquire:dbConfig.pool.acquire,
        idle:dbConfig.pool.idle  
    }
})

//Check connecting to db successfull or not
sequelize.authenticate().then(()=>{
    console.log("---- successfully connected to the database ----");
}).catch((err)=>{
    console.log("---- Database not connected ----");
})

app.listen(8001,function(){
    console.log("server started at http://localhost:8001");
})
x

//Creating Credentials - Works if there is no table with this name
let Credentials = sequelize.define('credentials',{
    empId:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    UserId : Sequelize.STRING,
    Email: Sequelize.STRING,
    PASSWORD : Sequelize.STRING,
},{
    timestamps:false,
    freezeTableName:true
})


//Creating Cart table - Works if there is no table with this name
let Cart = sequelize.define('cart',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },
    userId:{
        type:Sequelize.INTEGER,
    },
    pid: Sequelize.INTEGER,
    title : Sequelize.STRING,
    price: Sequelize.INTEGER,
    /* description : Sequelize.TEXT,
    category : Sequelize.STRING, */
    image : Sequelize.STRING,       
    /* rate: Sequelize.INTEGER,
    count: Sequelize.INTEGER, */
    numberOfItems : Sequelize.INTEGER
},{
    timestamps:false,
    freezeTableName:true
})


//Creating Orders table - Works if there is no table with this name
let Orders = sequelize.define('orders',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },
    userId:{
        type:Sequelize.INTEGER,
    },
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    Email: Sequelize.STRING,
    payment: Sequelize.STRING,
    address: Sequelize.STRING,
    orders: {
        type: Sequelize.JSON
    },
    orderedAt: Sequelize.DATE
},{
    timestamps:false,
    freezeTableName:true
})

//Setting a Foriegn KEY
Cart.belongsTo(Credentials, {foreignKey: 'userId', targetKey: 'empId'});
Orders.belongsTo(Credentials, {foreignKey:'userId', targetKey: 'empId'});

//Check Table Created or not
Cart.sync().then((data)=>{
    console.log("Cart :- ",data);
}).catch((err)=>{
    console.log("Table Not Created Due to Some Error :- "+err);
})

//Check Table Created or not
Credentials.sync().then((data)=>{
    console.log("Credentials",data);
}).catch((err)=>{
    console.log("Table Not Created Due to Some Error :"+err);
})

//Check Table Created or not
Orders.sync().then((data)=>{
    console.log("Orders",data);
}).catch((err)=>{
    console.log("Table Not Created Due to Some Error :"+err);
})

 
/* app.get('/getAllCredentials',(req,res) => {
    Credentials.findAll({raw:true}).then((data)=>{
        res.status(200).send(data);
    }).catch((err)=>{
        res.status(404).send("Got Some Error While Fetching Table :"+err);
    })
})
 */

// login Api
app.post("/login",(req,res) => {
    const Op = Sequelize.Op
    userId_param = req.body.userName
    password_param = req.body.password
    Credentials.findAll({where:{UserId:userId_param},raw:true}).then((data)=>{
        console.log(userId_param)
        if(data.length !== 0){
            Credentials.findAll({where:{
                [Op.and] : [{UserId: userId_param},{PASSWORD:password_param}]},raw:true}).then((data)=>{
                    if(data.length !== 0){
                        loggedUser = data[0].empId.toString()
                        res.status(200).send(loggedUser);
                    }
                    else{
                        throw "Please Enter Correct Password";
                    }
            }).catch((err) => {
                res.status(401).send(err)
            })
        }
        else{
            throw "Please Enter Correct User Id";
        }
    }).catch((err)=>{
        res.status(401).send(err);
    })
})

//Register Api
app.post("/register",(req,res) => {
    const Op = Sequelize.Op
    userId_param = req.body.userId
    email_param = req.body.Email
    password_param = req.body.password
    Credentials.findAll({where:{[Op.or]:[{UserId:userId_param},{Email: email_param}]}}).then((data)=>{
        if(data.length !== 0){
            throw "User Already Exist";
        }
        else{
            let registerObj = Credentials.build({
            UserId : userId_param,
            Email : email_param,
            PASSWORD : password_param,
            })
            
            registerObj.save().then(data => {
                const mailOptions = {
                    from : 'naveenmalineni7@gmail.com',
                    to : `${email_param}`,
                    subject : 'Thank you for registering In Nxt Trendz',
                    html : `<h2> Thank you ${userId_param} for choosing us and registering with us as a Valuable customer..</h2>
                        <p><b>We are hoping you to have a seamless Expereince and enjoy shopping</b></p>
                    `
                };
                
                transporter.sendMail (mailOptions, function (err, info){
                 if (err)
                   console.error(err);
                else 
                   console.log('Email sent :'+info.response); 
                })

                let strVal = "Registered SuccessFully"
                res.status(200).send(`${data.empId}`);
            }).catch(err => {
                res.status(401).send("Error Inserting Employee :"+err);
            })
        }
    }).catch(err => {
        res.status(400).send(err)
    })
})


//CART Related Queries

//Inserting product on addtocart
app.post("/insertProduct",(req,res) => {
    uid_param = req.body.uid
    pid_param = req.body.id
    title_param = req.body.title
    image_param = req.body.image
    price_param = req.body.price
    productCount_param = req.body.noOfItems
    /* console.log("Cart",uid_param,pid_param,title_param,image_param,price_param,productCount_param); */
    let cartObj = Cart.build({
        userId : uid_param, 
        pid : pid_param, 
        title : title_param,
        price : price_param,
        image:image_param,
        numberOfItems: productCount_param 
    })

    cartObj.save().then(data => {
        let strVal = "Record Updated SuccessFully"
        res.status(201).send(strVal);
    }).catch(err => {
        res.status(401).send("Error Inserting Employee :"+err);
    })
})

//Insert Into Orders
app.post("/insertOrders",(req,res) => {
    uid = req.body.uid
    userName = req.body.name
    phone = req.body.phone
    email = req.body.email
    payment = req.body.payment
    address = req.body.address
    orders = req.body.orders
    orderedAt = new Date()
    /* console.log("Orders",uid,userName,phone,email,address,orders); */
    let orderObj = Orders.build({
        userId : uid, 
        name : userName, 
        phone : phone,
        Email : email,
        payment : payment,
        address: address,
        orders: orders,
        orderedAt: orderedAt
    })

    orderObj.save().then(data => {
        let strVal = "Record Updated SuccessFully"
        const mailOptions = {
            from : 'naveenmalineni7@gmail.com',
            to : `${email}`,
            subject : 'Thank you for Shopping In Nxt Trendz',
            html : `<h2> Thank you ${userName} for choosing us 😍, and Shopping with us.</h2>
                <p><b>We are hoping that you had a good Expereince and enjoyed shopping</b></p>
                <p>We will be waiting for you come back again.😊</p>
                <div>
                <p> your Order is placed to <br> ${address} <br> and will be deliverd in 7 working days</p>
                <p>Payment Type :- ${payment}</p>
                </div>
            `
        };
        
        transporter.sendMail (mailOptions, function (err, info){
            if (err)
            console.error(err);
        else 
            console.log('Email sent :'+info.response); 
        })
        res.status(201).send(strVal);
    }).catch(err => {
        res.status(401).send("Error Inserting Employee :"+err);
    })
})

//get orders
app.get('/getOrders/:id',(req,res) => {
    activeId = req.params.id
    Orders.findAll({where:{userId:activeId},raw:true}).then((data)=>{
        res.status(200).send(data);
    }).catch((err)=>{
        res.status(404).send("Got Some Error While Fetching Table :"+err);
    })
})

//get All from Cart
app.get('/getCartItems/:uid',(req,res) => {
    let uid = req.params.uid
    uid = parseInt(uid);
    Cart.findAll({where :{userId: uid},raw:true}).then((data)=>{
        res.status(200).send(data);
    }).catch((err)=>{
        res.status(404).send("Got Some Error While Fetching Table :"+err);
    })
})

//deleting product on removing addtocart
app.delete("/deleteProduct",(req,res) => {
    const Op = Sequelize.Op
    const uid_param = req.query.uid
    const pid_param = req.query.pid
    console.log("delete",uid_param,pid_param);
    Cart.destroy({
        where : {[Op.and]:[{userId:parseInt(uid_param)},{pid: parseInt(pid_param)}] }
    }).then(data => {
        res.status(200).send("Deleted Record :- "+ data);
    }).catch(err=>{
        res.status(401).send("Error Occoured "+ err)
    })
})


//updating the cart product count
app.put("/updateCartItems",(req,res) => {
    const Op = Sequelize.Op
    productCount_param = parseInt(req.body.productCount);
    userId_param = parseInt(req.body.uid);
    pid_param = req.body.pid
    console.log("Updated",productCount_param,userId_param,pid_param);
    Cart.update(
        {numberOfItems: productCount_param},
        {where: {[Op.and]:[{userId:userId_param},{pid: pid_param}] }}
    ).then(data => {
        let strVal = "Record Updated SuccessFully"
        res.status(201).send(strVal);
    }).catch(err => {
        res.status(401).send("Error Updating Records :"+err);
    })
})
