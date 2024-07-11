const users = require("../model/wishlistSchema")
const multer = require('multer') 
const path = require('path')
const storage = multer.diskStorage({
    destination : (req , file , cb)=>{
        cb(null , './public/wishlist')
    },
    filename : (req , file , cb)=>{
        cb(null , Date.now() + path.extname(file.originalname))
    }

})
const upload = multer({storage : storage})
const uploadMiddleware = upload.single('image');
exports.addWishlist  = [uploadMiddleware,  async (req,res)=>{
    const {productLink , giftName , price , desiredRate , description , parentId} = req.body
    const image = req.file ? req.file.path : null;
    try {
        const result = await users.create({productLink , giftName , price , desiredRate , parentId ,  description , image : image})
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        if (error.name === 'ValidationError') {
          // Extract validation errors
          const errors = Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }));
          res.status(400).json({ success: false, errors });
        } else {
          res.status(500).json({ success: false, message: 'Server Error', error });
        }
      }
    }];



    // get all the wishlists 

    exports.getWishlist = async(req , res)=>{
        try {
            const result = await users.find({})
            res.status(200).send({
                success : true ,
                data: result
            })
        } catch (error) {
            res.status(500).send({
               msg :  "Internal server error"
            })
        }
    }


    // delete the wishlist 

    exports.deleteWishlist = async(req , res)=>{
        const id = req.params.id
        try {
            const result = await users.findByIdAndDelete(id)
            res.status(200).send({
                success : true ,
                msg: "Entry deleted successfully !",
                data: result
            })
        } catch (error) {
            res.status(500).send({
               msg :  "Internal server error"
            })
        }
    }



    // edit the wishlist 

    exports.editWishlist =[uploadMiddleware , async(req , res)=>{
        const {productLink , giftName , price , desiredRate , description} = req.body
        const image = req.file ? req.file.path : null;
        const id = req.params.id
        try {
            const result = await users.findById(id)
            if(!result){
                return res.status(400).send({
                    msg: "Wishlist not found!"
                });
            }
            result.productLink = productLink
            result.giftName = giftName
            result.price = price
            result.desiredRate = desiredRate
            result.description = description
            if(image){
                result.image = image

            }
            await result.save()
            res.status(200).send({
                success : true ,
                msg: "Entry updated successfully !",
                data: result
            })

        } catch (error) {
            res.status(500).send({
                msg :  "Internal server error"
             })
        }
    }]