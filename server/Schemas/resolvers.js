const {User, Book} = require('../models');
const {AuthenticalError} = require('apollo-server-express');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query:{
        me: async(parent,args,context)=>{
            if(context.user){
                const userData = await User.findOne({_id:context.user._id})
                    .select('__V -password')
                    .populate('savedBooks');

                return userData;
            }

            throw new AuthenticalError('Not logged in');
        }
    },

    Mutation:{
        login:async(parent,{email,password})=>{
            const user=await User.findOne({email});

            if(!user){
                throw new AuthenticalError('User not found');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw){
                throw new AuthenticalError('User not found');
            }

            const token = signToken(user);
            return {token,user};
        },

        addUser:async(parent,args)=>{
            const user= await User.create(args);
            const token= signToken(user);

            return {token,user};
        },

        saveBook:{

        }
    }
}

module.exports = resolvers;