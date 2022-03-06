module.exports={
    HOST:"localhost",
    USER:"root",
    PASSWORD:"nani@6",
    // schema name
    DB:"newtest",
    dialect:"mysql",
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    }
}