const users = require('../model/signUpSchema')

exports.getUsers = async(req , res)=>{
   
try {
    const result  = await users.find()
    res.status(200).send({
        msg : "resultUsers get successfully " , 
        data : result
    })
    
} catch (error) {
    res.status(500).send({
        msg : "Internal server error" , 
       
    })
}
}


// delete users 

exports.deleteUsers = async(req , res)=>{
    const id = req.params.id
    try {
        const result = await users.findByIdAndDelete(id)
        return res.status(201).json({
            success: true,
            msg: "Data deleted",
            details: result,
        });
        


    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
}