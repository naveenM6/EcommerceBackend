const { response } = require('express');
const express = require('express');
const Sequelize=require('sequelize');
const dbConfig=require('./db.config');
const cors = require('cors');
const { INTEGER } = require('sequelize');

const app = express()

app.use(express.json())
app.use(cors());

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

sequelize.authenticate().then(()=>{
    console.log("---- successfully connected to the database ----");
}).catch((err)=>{
    console.log("---- Database not connected ----");
})

app.listen(8008,function(){
    console.log("server started at http://localhost:8009");
})

let Cart = sequelize.define('cart',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true
    },
    title : Sequelize.STRING,
    price: Sequelize.INTEGER,
    description : Sequelize.TEXT,
    category : Sequelize.STRING,
    image : Sequelize.STRING,       
    rate: Sequelize.INTEGER,
    count: Sequelize.INTEGER,
    numberOfItems : INTEGER
},{
    timestamps:false,
    freezeTableName:true
})

Products.sync().then((data)=>{
    console.log("CART :- ",data);
}).catch((err)=>{
    console.log("Table Not Created Due to Some Error :- "+err);
})