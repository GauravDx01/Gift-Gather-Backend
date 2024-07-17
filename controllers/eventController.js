const users = require('../model/eventSchema')

exports.addEvent = async(req , res)=>{
    const {eventType ,eventName,date , time , location , wishlist ,description , parentId , wishlistId} = req.body
    try {
        const result = await users.create({eventType ,eventName,date , time , location , wishlist , description , parentId, wishlistId})
        await result.save()
        res.status(200).send({
            sucess : true , 
            data : result
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            // Extract validation errors
            const errors = Object.keys(error.errors).map(key => ({
              field: key,
              message: error.errors[key].message
            }));
            res.status(400).json({ success: false, errors });
          }
        res.status(500).send({
            sucess : false ,
            msg : "Internal server error"
            
        })
        
    }
}

exports.getEvents = async(req , res)=>{
    try {
        const result = await users.find()
        res.status(200).send({
            sucess : true , 
            data : result
        })
    } catch (error) {
        res.status(500).send({
            sucess : false ,
            msg : "Internal server error"
            
            
        })
        
    }
    
}

exports.deleteEvent = async(req , res) => {
    const id = req.params.id

    try {
        const result = await users.findByIdAndDelete(id)
        res.status(200).send({
            sucess : true , 
            data : result
        })
    } catch (error) {
        res.status(500).send({
            sucess : false , 
            msg : "Internal server error"
        })
    }

}

exports.editEvent = async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    try {
        const updatedEvent = await users.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }
        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            }));
            return res.status(400).json({ success: false, errors });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};