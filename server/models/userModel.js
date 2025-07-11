import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: 'Available',
    },
    profilePic: {
      type: String,
      default:
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});


userSchema.methods.generateAuthToken = function () {
  try {
    const token = jwt.sign(
      { id: this._id, email: this.email },
      process.env.SECRET,
      { expiresIn: '24h' }
    );
    return token;
  } catch (error) {
    console.error('Error while generating token:', error.message);
    throw new Error('Token generation failed');
  }
};







const userModel = mongoose.model('user', userSchema);
export default userModel;