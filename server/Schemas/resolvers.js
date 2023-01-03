const {User, Book} = require('../models');
const {AuthentionError} = require('apollo-server-express');
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

            throw new AuthentionError('Not logged in');
        }
    },

    Mutation:{
        login:async(parent,{email,password})=>{
            const user=await User.findOne({email});

            if(!user){
                throw new AuthentionError('User not found');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw){
                throw new AuthentionError('User not found');
            }

            const token = signToken(user);
            return {token,user};
        },

        addUser:async(parent,args)=>{
            const user= await User.create(args);
            const token= signToken(user);

            return {token,user};
        },

        saveBook:async(parent,{input},context)=>{
            if(context.user){
                const updatedBookList = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet:{savedBooks:input}},
                    {new: true}
                );

                return updatedBookList;
            }
            throw new AuthentionError('Not logged in');
        },

        removeBook:async(parent,{bookId},context)=>{
            if(context.user){
                const updatedBookList = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull:{savedBooks: {bookId: bookId}}},
                    {new: true}
                );

                return updatedBookList;
            }
            throw new AuthentionError('Not logged in');
        }
    }
}

module.exports = resolvers;